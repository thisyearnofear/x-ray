'use client'

import React, { ReactNode, createContext, useContext, useState } from 'react'
import { Web3Facade } from '../../lib/web3/web3-facade'

const Web3Context = createContext<Web3Facade | null>(null)

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [web3Facade] = useState(() => new Web3Facade())

  return (
    <Web3Context.Provider value={web3Facade}>
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3Context() {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3Context must be used within a Web3Provider')
  }
  return context
}
