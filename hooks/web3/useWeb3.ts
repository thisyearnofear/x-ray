'use client'

import { useState, useEffect, useCallback } from 'react'
import { Web3Facade, type Web3State } from '../../lib/web3/web3-facade'

export function useWeb3() {
  const [web3Facade] = useState(() => new Web3Facade())
  const [state, setState] = useState<Web3State>(web3Facade.getState())
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectWallet = useCallback(async () => {
    try {
      setIsConnecting(true)
      setError(null)
      const newState = await web3Facade.connectWallet()
      setState(newState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }, [web3Facade])

  const disconnectWallet = useCallback(async () => {
    try {
      await web3Facade.disconnectWallet()
      setState(web3Facade.getState())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect wallet')
    }
  }, [web3Facade])

  const createMedicalConsultationDelegation = useCallback(async (delegateAddress: `0x${string}`) => {
    try {
      setError(null)
      const delegation = await web3Facade.createMedicalConsultationDelegation(delegateAddress)
      setState(web3Facade.getState())
      return delegation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create delegation')
      throw err
    }
  }, [web3Facade])

  const createDataSharingDelegation = useCallback(async (delegateAddress: `0x${string}`, allowedData: string[]) => {
    try {
      setError(null)
      const delegation = await web3Facade.createDataSharingDelegation(delegateAddress, allowedData)
      setState(web3Facade.getState())
      return delegation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create data sharing delegation')
      throw err
    }
  }, [web3Facade])

  const executeDelegatedAction = useCallback(async (action: { to: `0x${string}`; data: string; value?: bigint }) => {
    try {
      setError(null)
      const result = await web3Facade.executeDelegatedAction(action)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute delegated action')
      throw err
    }
  }, [web3Facade])

  // Contract client methods
  const mintMedicalCertificate = useCallback(async (params: {
    to: `0x${string}`
    patientId: string
    diagnosis: string
    accuracy: bigint
    conditions: string[]
    tokenURI: string
  }) => {
    try {
      setError(null)
      if (!state.address) {
        throw new Error('Wallet not connected')
      }
      const result = await web3Facade.getContractClient().mintMedicalCertificate(params, state.address)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mint medical certificate')
      throw err
    }
  }, [web3Facade, state.address])

  const getCertificate = useCallback(async (tokenId: bigint) => {
    try {
      setError(null)
      const result = await web3Facade.getContractClient().getCertificate(tokenId)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get certificate')
      throw err
    }
  }, [web3Facade])

  const certificateExists = useCallback(async (tokenId: bigint) => {
    try {
      setError(null)
      const result = await web3Facade.getContractClient().certificateExists(tokenId)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check certificate existence')
      throw err
    }
  }, [web3Facade])

  const getTotalCertificates = useCallback(async () => {
    try {
      setError(null)
      const result = await web3Facade.getContractClient().getTotalCertificates()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get total certificates')
      throw err
    }
  }, [web3Facade])

  const authorizeContract = useCallback(async (contractAddress: `0x${string}`) => {
    try {
      setError(null)
      if (!state.address) {
        throw new Error('Wallet not connected')
      }
      const result = await web3Facade.getContractClient().authorizeContract(contractAddress, state.address)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to authorize contract')
      throw err
    }
  }, [web3Facade, state.address])

  const isContractAuthorized = useCallback(async (contractAddress: `0x${string}`) => {
    try {
      setError(null)
      const result = await web3Facade.getContractClient().isContractAuthorized(contractAddress)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check contract authorization')
      throw err
    }
  }, [web3Facade])

  const getPaymasterDeposit = useCallback(async () => {
    try {
      setError(null)
      const result = await web3Facade.getContractClient().getPaymasterDeposit()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get paymaster deposit')
      throw err
    }
  }, [web3Facade])

  // Gasless transaction methods
  const executeGaslessTransaction = useCallback(async (action: {
    targetContract: `0x${string}`
    functionData: `0x${string}`
    value?: bigint
  }) => {
    try {
      setError(null)
      const result = await web3Facade.executeGaslessTransaction(action)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute gasless transaction')
      throw err
    }
  }, [web3Facade])

  const mintCertificateGasless = useCallback(async (params: {
    to: `0x${string}`
    patientId: string
    diagnosis: string
    accuracy: bigint
    conditions: string[]
    tokenURI: string
  }) => {
    try {
      setError(null)
      const result = await web3Facade.mintCertificateGasless(params)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mint certificate gasless')
      throw err
    }
  }, [web3Facade])

  const checkGaslessQuota = useCallback(async () => {
    try {
      setError(null)
      const result = await web3Facade.checkGaslessQuota()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check gasless quota')
      throw err
    }
  }, [web3Facade])

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else if (accounts[0] !== state.address) {
          connectWallet()
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [state.address, connectWallet, disconnectWallet])

  return {
    // State
    ...state,
    isConnecting,
    error,

    // Actions
    connectWallet,
    disconnectWallet,
    createMedicalConsultationDelegation,
    createDataSharingDelegation,
    executeDelegatedAction,

    // Contract methods
    mintMedicalCertificate,
    getCertificate,
    certificateExists,
    getTotalCertificates,
    authorizeContract,
    isContractAuthorized,
    getPaymasterDeposit,

    // Gasless transaction methods
    executeGaslessTransaction,
    mintCertificateGasless,
    checkGaslessQuota,

    // Services
    web3Facade
  }
}
