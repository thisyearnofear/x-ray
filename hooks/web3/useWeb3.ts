'use client'

import { useState, useEffect, useCallback, useContext } from 'react'
import { Web3Facade, type Web3State } from '../../lib/web3/web3-facade'
import { Web3Context } from '../../components/web3/Web3Provider'

export function useWeb3() {
  const contextWeb3Facade = useContext(Web3Context);
  const [web3Facade, setWeb3Facade] = useState<Web3Facade | null>(null);
  const [state, setState] = useState<Web3State>({ isConnected: false, delegations: [] });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the facade from context or create a new one
  useEffect(() => {
    if (contextWeb3Facade) {
      // Use the facade from context
      setWeb3Facade(contextWeb3Facade);
      setState(contextWeb3Facade.getState());
    } else if (!web3Facade) {
      // Create a new facade if we don't have one and context is not available
      const facade = new Web3Facade();
      setWeb3Facade(facade);
      setState(facade.getState());
    }
  }, [contextWeb3Facade, web3Facade]);

  const connectWallet = useCallback(async () => {
    if (!web3Facade) return;
    try {
      setIsConnecting(true)
      setError(null)
      const newState = await web3Facade.connectWallet()
      setState(newState)
      
      // PERFORMANT: Expose wallet client on window for payment service
      if (typeof window !== 'undefined') {
        (window as any).walletClient = web3Facade.getWalletClient()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }, [web3Facade])

  const disconnectWallet = useCallback(async () => {
    if (!web3Facade) return;
    try {
      await web3Facade.disconnectWallet()
      setState(web3Facade.getState())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect wallet')
    }
  }, [web3Facade])

  const createMedicalConsultationDelegation = useCallback(async (delegateAddress: `0x${string}`) => {
    if (!web3Facade) throw new Error('Web3 not initialized');
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
    if (!web3Facade) throw new Error('Web3 not initialized');
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
    if (!web3Facade) throw new Error('Web3 not initialized');
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
    if (!web3Facade) throw new Error('Web3 not initialized');
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
    if (!web3Facade) throw new Error('Web3 not initialized');
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
    if (!web3Facade) throw new Error('Web3 not initialized');
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
    if (!web3Facade) throw new Error('Web3 not initialized');
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
    if (!web3Facade) throw new Error('Web3 not initialized');
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
    if (!web3Facade) throw new Error('Web3 not initialized');
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
    if (!web3Facade) throw new Error('Web3 not initialized');
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
    if (!web3Facade) throw new Error('Web3 not initialized');
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
    if (!web3Facade) throw new Error('Web3 not initialized');
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
    if (!web3Facade) throw new Error('Web3 not initialized');
    try {
      setError(null)
      const result = await web3Facade.checkGaslessQuota()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check gasless quota')
      throw err
    }
  }, [web3Facade])

  const getMonBalance = useCallback(async () => {
    if (!web3Facade) throw new Error('Web3 not initialized');
    try {
      if (!state.address) {
        throw new Error('Wallet not connected')
      }
      setError(null)
      const result = await web3Facade.getMonBalanceForAddress(state.address)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get MON balance')
      throw err
    }
  }, [web3Facade, state.address])

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (!web3Facade) return;
        if (accounts.length === 0) {
          // Don't immediately disconnect - wait a bit to see if accounts come back
          // This can happen during network switches or temporary MetaMask issues
          setTimeout(() => {
            // Check if accounts are still empty
            window.ethereum.request({ method: 'eth_accounts' }).then((currentAccounts: string[]) => {
              if (currentAccounts.length === 0 && state.isConnected) {
                disconnectWallet()
              }
            }).catch(() => {
              // If we can't get accounts, only disconnect if we were previously connected
              if (state.isConnected) {
                disconnectWallet()
              }
            });
          }, 1000); // Wait 1 second before disconnecting
        } else if (accounts[0] !== state.address) {
          connectWallet()
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [state.address, state.isConnected, connectWallet, disconnectWallet, web3Facade])

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

    // Balance methods
    getMonBalance,

    // Services
    web3Facade
  }
}
