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

    // Services
    web3Facade
  }
}
