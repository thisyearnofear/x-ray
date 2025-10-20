# X-RAY Medical Diagnostics - Usage Guide & Deployment

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏥 Smart Contract Integration

This project includes deployed smart contracts for medical achievements and gasless transactions:

- **MedicalAchievementNFT**: Mint verifiable medical certificates as NFTs
- **MedicalPaymaster**: Enable gasless AI consultations via ERC-4337

## 📊 Envio Indexer Integration

For enhanced analytics and real-time data querying, this project includes an Envio indexer:

- **Real-time Event Tracking**: Indexes all MedicalAchievementNFT and MedicalPaymaster events
- **GraphQL API**: Provides performant data querying through GraphQL
- **Analytics Dashboard**: Enables rich data visualization and user insights

## 🎯 User Workflow

### 1. Wallet Connection
- Click "Connect MetaMask" button
- Approve connection in MetaMask popup
- Smart account is automatically created using MetaMask Delegation Toolkit

### 2. Delegation Setup
- Open Delegation Panel
- Enter AI assistant address
- Select delegation type (consultation or data sharing)
- Approve delegation in MetaMask

### 3. Medical Diagnosis
- Upload patient face image or use camera
- Complete medical diagnosis process
- View diagnostic accuracy and identified conditions

### 4. Certificate Minting
- Click "Save Achievement Certificate" button
- Approve transaction in MetaMask
- Certificate is minted gaslessly through MedicalPaymaster
- View transaction confirmation and certificate details

## 🛠️ Deployment Instructions

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Environment Variables
Create a `.env.local` file with the following variables:

```bash
# RPC Configuration
NEXT_PUBLIC_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_BLOCK_EXPLORER=https://testnet.monadexplorer.com
NEXT_PUBLIC_BUNDLER_URL=https://api.pimlico.io/v2/monad-testnet/rpc

# Contract Addresses (automatically configured)
# NEXT_PUBLIC_MEDICAL_NFT=0xA960B1692aa11a10Ff1c1595300301DfF1CDAcB4
# NEXT_PUBLIC_PAYMASTER=0x2Aa0f72AEc34Ea007aeeD1c998f28278A1501423
```

### Monad Testnet Deployment
The contracts are already deployed on Monad testnet:

- **MedicalAchievementNFT**: `0xA960B1692aa11a10Ff1c1595300301DfF1CDAcB4`
- **MedicalPaymaster**: `0x2Aa0f72AEc34Ea007aeeD1c998f28278A1501423`
- **EntryPoint**: `0x0000000071727De22E5E9d8BAf0edAc6f37da032`

## 🔧 Remix Deployment Guide

### Deployed Contract Addresses
- **MedicalAchievementNFT**: 0xA960B1692aa11a10Ff1c1595300301DfF1CDAcB4
- **MedicalPaymaster**: 0x2Aa0f72AEc34Ea007aeeD1c998f28278A1501423
- **EntryPoint (Monad Testnet)**: 0x0000000071727De22E5E9d8BAf0edAc6f37da032

### Steps to Deploy MedicalPaymaster in Remix

1. **Compile the Contract**
   - Set compiler version to 0.8.28 or higher
   - Enable optimization
   - Compile MedicalPaymaster.sol

2. **Get EntryPoint Address**
   - For Monad Testnet, use: 0x0000000071727De22E5E9d8BAf0edAc6f37da032

3. **Deploy the Contract**
   - Select "Injected Web3" or "Metamask" as environment
   - Enter the EntryPoint address as constructor parameter
   - Click "Deploy"

4. **Fund the Paymaster**
   - Call the `deposit()` function with some test ETH
   - This funds the paymaster's stake in the EntryPoint

5. **Authorize Medical Contracts**
   - Call `authorizeContract()` with your MedicalAchievementNFT address
   - Only authorized contracts can use the paymaster

## 🎮 Demo Script

### Prerequisites
1. MetaMask browser extension installed
2. Some test MON tokens on Monad testnet
3. Access to the deployed application

### Demo Flow

#### 1. Wallet Connection
- Click "Connect MetaMask" button
- Observe smart account creation using MetaMask Delegation Toolkit
- Show account address and connection status

#### 2. Delegation Setup
- Open Delegation Panel
- Enter AI assistant address (example: `0x1234...abcd`)
- Click "Enable Gasless AI"
- Show delegation creation with ERC-7710 standards
- Display success message with gasless consultation enabled

#### 3. Medical Diagnosis
- Upload patient face image or use camera
- Complete medical diagnosis process
- Show diagnostic accuracy and identified conditions

#### 4. Gasless Certificate Minting
- Click "Save Achievement Certificate" button
- Observe transaction being processed through MedicalPaymaster
- Show that no gas fees are charged to the user
- Display transaction hash and certificate details

#### 5. Certificate Verification
- Show minted certificate in wallet/portfolio
- Verify certificate details on blockchain explorer
- Demonstrate certificate ownership and authenticity

## 🛡️ Security Considerations

### Wallet Security
- All transactions require user approval in MetaMask
- Private keys never leave the user's wallet
- Delegations are time-limited and scope-restricted

### Contract Security
- MedicalPaymaster only sponsors authorized contracts
- Daily sponsorship limits prevent abuse
- Owner controls for contract management

### Data Privacy
- ERC-7710 delegations provide granular permission control
- Medical data sharing is opt-in and revocable
- No sensitive data is stored on-chain without encryption

## 🔧 Troubleshooting

### Common Issues

#### Wallet Connection Failed
- Ensure MetaMask is installed and unlocked
- Check that Monad Testnet is added to MetaMask
- Verify network connectivity

#### Delegation Not Working
- Check that contract is authorized in MedicalPaymaster
- Verify delegation has not expired
- Confirm sufficient funds in paymaster stake

#### Transaction Rejected
- Check that paymaster has sufficient deposit
- Verify user has enough funds for any required payments
- Confirm transaction parameters are valid

### Verification Steps
1. Check contract addresses in `contracts/config/MonadConfig.ts`
2. Verify paymaster has sufficient deposit via `getPaymasterDeposit()`
3. Confirm delegation is active via `isContractAuthorized()`

## ✅ Success Metrics

- ✅ Wallet connects and creates smart account
- ✅ Delegation is successfully created
- ✅ Medical diagnosis completes
- ✅ Certificate is minted without gas fees
- ✅ Transaction is confirmed on Monad testnet
- ✅ Certificate is visible in wallet/portfolio