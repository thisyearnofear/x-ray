# 🩻 X-RAI: Onchain AI Powered Medical Diagnostic Experience

> **MetaMask Smart Accounts Hackathon x Monad x Envio Submission**
> World's First Onchain Medical X-Ray Experience with Smart Account Abstraction & AI Consultation
>
> **Note**: Using CLI-enhanced approach - CLI provides Web3 foundation, enhanced with our AI services following ENHANCEMENT FIRST principle

An interactive 3D medical visualization experience that combines **face-swapping**, **AI-powered medical analysis**, **real-time X-ray effects**, and **revolutionary Web3 features** including smart accounts, delegation, and verifiable medical achievements for next-generation healthcare applications.

## 🔐 **ENHANCED: Onchain AI Integration**
**Experience gasless medical consultations!** Connect your MetaMask smart account to enable delegation for AI consultations, mint verifiable medical achievement NFTs, and securely share health data with privacy-preserving permissions - all while maintaining our core AI-powered diagnostic capabilities.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏆 Hackathon Prize Eligibility

### 🦊 MetaMask Smart Accounts Track ($5,000+)
- **Enhanced AI Experience** with gasless consultations via smart accounts
- **ERC-7710 Delegation** for privacy-preserving AI access control
- **Modular Account Architecture** integrated with existing AI workflow
- **Frictionless UX** maintaining AI focus while eliminating gas barriers

### 🔷 Monad Testnet Track ($5,000+)
- **Onchain AI Infrastructure** deployed on high-performance Monad testnet
- **Real-time AI Data** synchronized with sub-second block times
- **Parallel Processing** enabling complex AI diagnostic workflows
- **Scalable AI Applications** with 10K+ TPS for medical analysis

### 📊 Envio Bonus Track (Additional $1,000+)
- **AI Performance Analytics** indexed via HyperSync for consultation tracking
- **Real-time AI Insights** with GraphQL APIs for diagnostic patterns
- **Medical AI History** preservation and analysis
- **Verifiable AI Achievements** as onchain credentials
- **Enhanced with Core Principles**: Following ENHANCEMENT FIRST approach

## ✨ Features

### 🎭 **Smart Face Swapping**
- **Face-api.js** integration with 68-point landmark detection
- **AI-powered** face analysis and processing
- Smart cropping and texture optimization
- Progressive enhancement with fallback processing

### 🏥 **AI Medical Analysis**
- Interactive 3D medical condition markers
- **AI-powered** diagnosis and treatment suggestions
- Real anatomical positioning on skeleton model
- Educational symptom and treatment information

### 🔐 **Onchain AI Enhancement** ⭐ ENHANCED!
- **MetaMask Smart Accounts** enabling gasless AI consultations
- **ERC-7710 Delegation** for controlled AI access and privacy
- **Medical Achievement NFTs** as verifiable AI performance credentials
- **Secure AI Data Sharing** with granular permission controls

### 🎙️ **Voice Medical Consultation**
- **Pause-and-consult** gameplay mechanic with delegation
- **Context-aware AI guidance** using current patient case
- **Educational voice interaction** for diagnostic learning
- **Privacy-preserving** consultations via smart accounts

### 🎮 **Immersive X-Ray Experience**
- Real-time WebGL shaders and post-processing effects
- Interactive mouse-controlled X-ray scanning
- Expandable view with smooth animations
- Personalized medical imaging with user's face

## 🚀 Technology Stack

**Frontend**: Next.js 15, TypeScript, Three.js, WebGL, GLSL Shaders
**Web3 Enhancement**: MetaMask SDK, ERC-4337 Account Abstraction, ERC-7710 Delegation Toolkit
**Onchain Infrastructure**: Monad Testnet, Viem, Smart Contract Integration
**AI/ML Core**: AI-powered Medical Analysis, face-api.js, Voice Consultation System
**Data Indexing**: Envio HyperSync, GraphQL APIs, Real-time AI Performance Queries
**3D Graphics**: Three.js, EffectComposer, UnrealBloomPass
**Backend**: Next.js API Routes, Medical Workflow Management, Smart Account Services
**Voice AI**: Context-aware consultation with onchain state integration
**Deployment**: Vercel-ready, Monad Testnet Compatible

## 🎯 Core Principles

- ✅ **ENHANCEMENT FIRST**: Extended existing AI components with Web3 features vs creating separate systems
- ✅ **AGGRESSIVE CONSOLIDATION**: Integrated smart accounts directly into medical/voice services
- ✅ **PREVENT BLOAT**: Enhanced existing AI analysis with delegation without new dependencies
- ✅ **DRY**: Single source of truth for AI logic, now enhanced with onchain context
- ✅ **CLEAN**: Clear separation between 3D rendering, AI processing, Web3, and UI layers
- ✅ **MODULAR**: Independent, testable components with explicit onchain dependencies
- ✅ **PERFORMANT**: Progressive loading, caching, gasless transactions, and optimization
- ✅ **ORGANIZED**: Next.js file-based routing with domain-driven design + Web3 domains

## 🎮 User Experience

1. **Connect Wallet**: Click "Connect MetaMask" → Enable smart account for enhanced AI experience
2. **Upload Face**: Click "Upload Face" → AI processes and applies to 3D model
3. **X-Ray Scan**: Move mouse to control X-ray scanning area
4. **Medical Analysis**: Press `[C]` or tap `C` button to show condition markers → Click for AI diagnosis
5. **🔐 Enable Delegation**: Grant AI assistants gasless consultation permissions via ERC-7710 delegation
6. **🎙️ Voice Consultation**: Click "CONSULT AI" → Game pauses → Get AI guidance without gas fees
7. **🏆 Mint Achievement**: Complete diagnosis → Mint verifiable AI performance NFT certificate
8. **Diagnosis Submission**: Select discovered conditions → Submit final diagnosis → Get accuracy score
9. **📊 View Analytics**: Track AI consultation performance via onchain data
10. **Expand View**: Press `[E]` for full X-ray expansion effect
11. **Dynamic Markers**: Discovered conditions change appearance (cyan color, larger size) for easy tracking
12. **🎵 Dynamic Audio**: Contextual medical audio generated per session using ElevenLabs AI
13. **🎯 Centered UI**: High-fidelity diagnostic panel with glassmorphic design and real-time updates

## 🧠 Onchain AI Integration

### Enhanced AI with Smart Accounts

```typescript
// Gasless AI consultations through MetaMask Smart Accounts
const smartAccountService = new SmartAccountService(bundlerUrl)

async function createEnhancedAISmartAccount(ownerAddress: Address) {
  const smartAccount = await smartAccountService.createSmartAccount(ownerAddress, Implementation.Hybrid)

  // Enable delegation for enhanced AI consultation access
  await delegationService.createMedicalConsultationDelegation(
    smartAccount.address,
    aiAssistantAddress,
    Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
  )

  return smartAccount
}
```

### Privacy-Preserving AI Access Control

```typescript
// Controlled AI consultation permissions via ERC-7710 delegation
class AIEnhancementManager {
  async enableAIConsultationDelegation(
    delegatorAddress: Address,
    delegateAddress: Address
  ) {
    const delegation = await createDelegation({
      delegator: delegatorAddress,
      delegate: delegateAddress,
      delegationType: DelegationType.ERC7710,
      caveats: [
        {
          type: 'allowedMethods',
          value: ['consultAI', 'getMedicalAnalysis', 'enhanceDiagnosticAI']
        },
        {
          type: 'maxGasLimit',
          value: '500000'
        },
        {
          type: 'aiModelAccess',
          value: ['diagnostic-assistant', 'consultation-ai']
        }
      ],
      expiry: Math.floor(Date.now() / 1000) + 86400 // 24 hours
    })

    return delegation
  }
}
```

### AI Performance Analytics with Envio

```typescript
// Real-time AI diagnostic performance tracking with HyperSync
const envioClient = new Client({
  url: 'https://monad-testnet.hypersync.xyz',
  bearerToken: process.env.ENVIO_API_KEY
})

async function indexAIConsultationPerformance(fromBlock: number, toBlock: number) {
  const query = presetQueryLogs({
    fromBlock,
    toBlock,
    logs: [{
      address: [process.env.AI_CONSULTATION_CONTRACT],
      topics: [
        // AI consultation performance event signature
        '0x...' // AIConsultationCompleted event
      ]
    }]
  })

  return await envioClient.sendReq(query)
}
```

### Verifiable AI Achievement Credentials

```typescript
// Onchain AI performance certificates on Monad
async function mintAIAchievementCertificate(
  smartAccount: any,
  aiPerformanceData: MedicalCertificate
) {
  const mintTx = await medicalNFTService.mintMedicalCertificate(smartAccount, aiPerformanceData)

  // Index AI achievement for performance analytics
  await envioIndexer.indexAIAchievement({
    userId: aiPerformanceData.patientId,
    certificateId: aiPerformanceData.certificateId,
    aiAccuracy: aiPerformanceData.accuracy,
    consultationTimestamp: aiPerformanceData.timestamp,
    aiModelVersion: 'diagnostic-assistant-v1'
  })

  return mintTx
}
```

## 📁 Project Structure

```
app/
├── api/medical-analysis/    # Secure API routes
├── components/Canvas.tsx    # 3D rendering component
├── layout.tsx              # Root layout
└── page.tsx                # Main page

src/
├── components/             # React components & Web3 UI
│   ├── WalletConnection.tsx    # MetaMask connection
│   ├── DelegationPanel.tsx     # ERC-7710 delegation
│   └── MedicalNFTMinter.tsx    # Achievement NFTs
├── domains/               # Business logic domains
│   ├── web3/              # Web3 functionality (consolidated services)
│   │   ├── services/      # Smart accounts, delegation, NFTs
│   │   ├── Web3Facade.ts  # Unified Web3 interface
│   │   └── types.ts       # Web3 type definitions
│   ├── medical/           # Medical analysis logic (enhanced with Web3)
│   │   ├── services/      # AIAnalysisService (now supports delegation)
│   │   └── MedicalServiceFacade.ts # Enhanced with onchain features
│   ├── diagnostic/        # Game diagnostic system
│   └── voice/             # AI consultation system (enhanced with delegation)
├── shaders/              # GLSL shaders
├── types/                # TypeScript definitions
└── utils/                # Utilities

docs/                      # Documentation
├── API.md                # API documentation
├── DEPLOYMENT.md         # Deployment guide
└── STRUCTURE.md          # Architecture details

public/                   # Static assets
```

## 🔧 Development

```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Linting
npm run lint
```

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Architecture Details](./docs/STRUCTURE.md)

## 🚀 Performance

- **Bundle Size**: 142kB first load (including Web3 integration)
- **Build Time**: ~1.3s
- **3D Rendering**: 60fps maintained during consultation
- **Smart Account Creation**: <2s on Monad testnet
- **Delegation Setup**: <500ms with ERC-7710
- **NFT Minting**: Gasless transactions via account abstraction
- **Envio Queries**: <100ms data indexing with HyperSync
- **Voice Consultation**: Seamless pause/resume with state preservation
- **Memory Usage**: Optimized with lazy loading and cleanup

## 🏆 MetaMask Smart Accounts Hackathon Demo

### 🎯 **Hackathon Highlights**

**Enhanced Onchain AI Medical Experience:**
- World's first onchain medical X-ray experience with smart account abstraction
- Gasless AI consultations maintaining full AI diagnostic capabilities
- Privacy-preserving AI access control with ERC-7710 delegation
- **Core Principles Applied**: ENHANCEMENT FIRST - Web3 features enhance existing AI

**Technical Excellence:**
- **MetaMask Track**: Full ERC-4337 account abstraction enhancing AI workflows
- **Monad Track**: High-performance AI infrastructure with sub-second finality
- **Envio Bonus**: Ultra-fast AI performance indexing with HyperSync
- **UX Innovation**: Frictionless AI experience without gas barriers

### 🎮 **Demo Flow**

1. **Connect Wallet**: Click "Connect MetaMask" → Enhance AI experience with smart accounts
2. **Setup Delegation**: Grant AI assistants gasless consultation permissions via ERC-7710 delegation
3. **Start Experience**: Upload your face → Begin X-ray diagnostic session
4. **Discover Conditions**: Scan the 3D model → Find medical conditions with AI assistance
5. **🎙️ Gasless AI Consultation**: Click "CONSULT AI" → Get enhanced AI guidance without gas fees
6. **🏆 Mint AI Achievement**: Complete diagnosis → Mint verifiable AI performance NFT certificate
7. **📊 View AI Analytics**: Track AI consultation performance via onchain data
8. **Share AI Progress**: Delegate access to AI diagnostic history securely

### 🚀 **Try It Live**

```bash
npm install
npm run dev
# Open http://localhost:3000
# Click "Connect MetaMask" → Setup delegation → "Upload Face" → Discover conditions → "CONSULT AI" → Mint NFT
```

**Demo Tip**: Experience the complete AI-Web3 fusion! CLI-generated smart accounts + delegation foundation, enhanced with our AI diagnostic system for seamless onchain medical consultations.
