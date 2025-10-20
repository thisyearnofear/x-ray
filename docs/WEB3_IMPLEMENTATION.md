# X-RAY Medical Diagnostics - Web3 Technical Implementation

## 🏗️ System Architecture

### Web3 Layer Structure
```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  (React Components + useWeb3 Hook)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      Web3 Facade                             │
│  - Orchestrates all Web3 services                           │
│  - Manages application state                                │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Web3 Services Layer                        │
├─────────────────────────────────────────────────────────────┤
│ • Smart Account Service - MetaMask toolkit integration      │
│ • Delegation Service - ERC-7710 delegation management       │
│ • Contract Client - Typed contract interactions             │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Blockchain Layer                         │
├─────────────────────────────────────────────────────────────┤
│ • MedicalAchievementNFT - Mint verifiable certificates       │
│ • MedicalPaymaster - Enable gasless transactions            │
│ • Monad Testnet - High-performance deployment               │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Smart Account Service Implementation

### Core Functionality
The SmartAccountService is responsible for creating and managing MetaMask smart accounts using the Delegation Toolkit.

```typescript
// lib/web3/smart-account.ts
import { toMetaMaskSmartAccount, Implementation } from '@metamask/delegation-toolkit'
import { createPublicClient, http } from 'viem'
import { createBundlerClient } from 'viem/account-abstraction'
import { monadTestnet, BUNDLER_URL } from './config'

export class SmartAccountService {
  private publicClient: any
  private bundlerClient: any

  constructor() {
    this.publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http()
    })

    this.bundlerClient = createBundlerClient({
      client: this.publicClient,
      transport: http(BUNDLER_URL)
    })
  }

  async createSmartAccount(ownerAddress: Address, implementation: Implementation = Implementation.Hybrid): Promise<any> {
    try {
      // Create actual MetaMask smart account using the delegation toolkit
      const account = await toMetaMaskSmartAccount({
        owner: ownerAddress,
        implementation,
        chain: monadTestnet,
        bundlerUrl: BUNDLER_URL
      })

      console.log('Created MetaMask smart account:', account)
      return account
    } catch (error) {
      console.error('Failed to create MetaMask smart account:', error)
      throw error
    }
  }

  async sendUserOperation(account: any, calls: any[]) {
    try {
      const userOpHash = await this.bundlerClient.sendUserOperation({
        account,
        calls
      })

      return userOpHash
    } catch (error) {
      console.error('Failed to send user operation:', error)
      throw error
    }
  }
}
```

### Key Integration Points
1. **MetaMask Delegation Toolkit** - Primary integration point for smart account creation
2. **ERC-4337 Bundler** - Handles user operation submission and execution
3. **Monad Testnet** - Target blockchain network for deployment
4. **Wallet Client** - Manages wallet connections and signing operations

## 📜 Delegation Service Implementation

### ERC-7710 Delegation
The DelegationService implements ERC-7710 standards for programmable permissions.

```typescript
// lib/web3/delegation.ts
import { createDelegation, getDeleGatorEnvironment } from '@metamask/delegation-toolkit'
import { monadTestnet } from './config'

export class DelegationService {
  private environment: any

  constructor() {
    this.environment = getDeleGatorEnvironment({
      chain: monadTestnet,
      version: '0.1.0'
    })
  }

  async createMedicalConsultationDelegation(options: DelegationOptions): Promise<Delegation> {
    const { delegator, delegate, permissions = ['consultAI', 'getMedicalAnalysis'], expiry } = options

    try {
      // Create actual ERC-7710 delegation using MetaMask toolkit
      const delegation = createDelegation({
        environment: this.environment,
        from: delegator,
        to: delegate,
        scope: {
          type: 'functionCall',
          targets: [delegator],
          selectors: [
            'consultAI(bytes)',
            'analyzeCase(uint256)',
            'submitDiagnosis(string)'
          ].map(sig => sig)
        },
        caveats: [
          {
            type: 'limitedCalls',
            limit: 100
          }
        ],
        salt: `0x${Date.now().toString(16).padStart(64, '0')}` as `0x${string}`
      })

      // Get delegation hash for off-chain tracking
      const delegationHash = getDelegationHashOffchain(delegation)
      
      const delegationData: Delegation = {
        id: `delegation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        delegator,
        delegate,
        permissions,
        type: 'medical-consultation',
        status: 'active',
        created: Date.now(),
        expiry,
        delegationHash,
      }

      return delegationData
    } catch (error) {
      console.error('Failed to create medical consultation delegation:', error)
      throw error
    }
  }
}
```

### Delegation Types
1. **Medical Consultation Delegation** - Grants AI assistants permission to provide consultations
2. **Data Sharing Delegation** - Enables secure medical data sharing with privacy controls

### Caveats Implementation
1. **Limited Calls** - Restricts number of delegated operations
2. **Function Selectors** - Constrains allowed contract functions
3. **Time-based Restrictions** - Sets expiration for delegations

## 📄 Contract Client Implementation

### Typed Contract Interactions
The ContractClient provides type-safe interfaces for all smart contract interactions.

```typescript
// lib/web3/contract-client.ts
import { MedicalAchievementNFTABI } from '../../contracts/abis/MedicalAchievementNFT'
import { MedicalPaymasterABI } from '../../contracts/abis/MedicalPaymaster'

export class ContractClient {
  private publicClient: any
  private walletClient: any
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 30000 // 30 seconds
  
  async mintMedicalCertificate(params: {
    to: Address
    patientId: string
    diagnosis: string
    accuracy: bigint
    conditions: string[]
    tokenURI: string
  }, account: Address) {
    if (!this.walletClient) {
      throw new Error('Wallet not connected')
    }
    
    const contract = this.getMedicalNFTContract(account)
    
    return await this.walletClient.writeContract({
      address: contract.address,
      abi: MedicalAchievementNFTABI,
      functionName: 'mintCertificate',
      args: [
        params.to,
        params.patientId,
        params.diagnosis,
        params.accuracy,
        params.conditions,
        params.tokenURI
      ]
    })
  }
  
  async getCertificate(tokenId: bigint) {
    const cacheKey = `certificate_${tokenId.toString()}`
    const cached = this.getCachedData(cacheKey)
    if (cached) {
      return cached
    }
    
    const contract = this.getMedicalNFTContract()
    
    const result = await this.publicClient.readContract({
      address: contract.address,
      abi: MedicalAchievementNFTABI,
      functionName: 'getCertificate',
      args: [tokenId]
    })
    
    this.setCachedData(cacheKey, result)
    return result
  }
}
```

### Caching Strategy
1. **Time-based Expiration** - 30-second TTL for cached data
2. **Selective Caching** - Only cache frequently accessed read operations
3. **Automatic Cleanup** - Remove expired entries to prevent memory bloat

## 🔌 Web3 Facade Integration

### Centralized Web3 Management
The Web3Facade orchestrates all Web3 services and manages application state.

```typescript
// lib/web3/web3-facade.ts
export class Web3Facade {
  private smartAccountService: SmartAccountService
  private delegationService: DelegationService
  private contractClient: ContractClient
  private state: Web3State

  constructor() {
    this.smartAccountService = new SmartAccountService()
    this.delegationService = new DelegationService()
    this.contractClient = new ContractClient()

    this.state = {
      isConnected: false,
      delegations: []
    }
  }

  async connectWallet(): Promise<Web3State> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found')
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const address = accounts[0] as Address

      // Create smart account
      const smartAccount = await this.smartAccountService.createSmartAccount(address)
      
      this.state = {
        ...this.state,
        isConnected: true,
        address,
        smartAccount,
        chainId: 10143 // Monad testnet
      }

      return this.state
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  }
}
```

## 🔄 React Hook Integration

### useWeb3 Hook
The useWeb3 hook provides a React-friendly interface for all Web3 functionality.

```typescript
// hooks/web3/useWeb3.ts
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
  }
}
```

## 🎯 Implementation Benefits

### 1. Type Safety
- Full TypeScript support for all Web3 interactions
- Compile-time error checking for contract calls
- IDE autocompletion for contract methods

### 2. Performance Optimization
- Caching layer for frequently accessed data
- Efficient contract interaction patterns
- Minimal re-renders through proper state management

### 3. Error Handling
- Comprehensive error handling at all levels
- User-friendly error messages
- Graceful fallbacks for failed operations

### 4. Modularity
- Independent service layers
- Easy testing and debugging
- Flexible extension points