/**
 * MON Token Payment Service
 * CLEAN: Single responsibility - handle $MON token payments for AI cases
 * PERFORMANT: Uses smart account for gasless transactions
 * ENHANCEMENT: Creates virtuous flywheel - user payments fund paymaster for new users
 */

import { createPublicClient, createWalletClient, http, parseEther, type Address } from 'viem'
import { monadTestnet } from './chains'

// Monad testnet Wrapped MON (wMON) token address
const WMON_TOKEN_ADDRESS = '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701' as Address

// Paymaster contract address - creates virtuous flywheel
// User AI case payments fund gas for new users' gasless transactions
const PAYMASTER_ADDRESS = process.env.NEXT_PUBLIC_PAYMASTER_ADDRESS as Address || '0x2Aa0f72AEc34Ea007aeeD1c998f28278A1501423' as Address

// Minimal ERC20 ABI for transfer function
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

/**
 * Transfer wMON tokens for AI case generation to paymaster (virtuous flywheel)
 * @param amount Amount in wMON (e.g., 0.1)
 * @param walletClient Wallet client from web3Facade
 * @returns Transaction hash
 */
export async function payForAICase(
  amount: number,
  walletClient: any // WalletClient from viem
): Promise<string> {
  console.log(`💰 Paying ${amount} wMON to paymaster (funds gas for new users)...`)
  
  try {
    // Convert to wei (18 decimals)
    const amountWei = parseEther(amount.toString())
    
    // Execute ERC20 transfer to paymaster
    const txHash = await walletClient.writeContract({
      address: WMON_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [PAYMASTER_ADDRESS, amountWei],
      chain: monadTestnet
    })
    
    console.log(`✅ Payment successful! ${amount} wMON sent to paymaster`)
    console.log(`🔄 Virtuous flywheel: Your payment funds gas for new users`)
    console.log(`📝 Transaction hash: ${txHash}`)
    
    return txHash
  } catch (error: any) {
    console.error('❌ Payment failed:', error)
    throw new Error(`Payment failed: ${error.message || 'Unknown error'}`)
  }
}

/**
 * Check if user has enough wMON balance
 * @param address User's address
 * @param amount Required amount in wMON
 * @returns boolean
 */
export async function checkMONBalance(
  address: Address,
  amount: number
): Promise<boolean> {
  try {
    const publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL)
    })
    
    const balance = await publicClient.readContract({
      address: WMON_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address]
    })
    
    const requiredWei = parseEther(amount.toString())
    const hasEnough = balance >= requiredWei
    
    console.log(`🔍 wMON balance check: ${balance.toString()} wei (need ${requiredWei.toString()} wei) - ${hasEnough ? '✅' : '❌'}`)
    
    return hasEnough
  } catch (error) {
    console.error('Balance check failed:', error)
    return false
  }
}
