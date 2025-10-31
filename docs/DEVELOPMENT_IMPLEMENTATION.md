# Development & Implementation

## Overview

This document covers the development workflow, implementation details, testing procedures, and deployment processes for X-RAY Medical Diagnostics. It includes setup instructions, testing scenarios, debugging guides, and performance monitoring.

## Development Environment Setup

### Prerequisites
- **Node.js** v18.18.0 or higher
- **npm** v9.8.1 or higher
- **MetaMask** browser extension
- **Visual Studio Code** (recommended IDE)
- **Git** for version control

### Recommended VS Code Extensions
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Solidity** - Smart contract syntax highlighting
- **GitLens** - Enhanced Git capabilities
- **Bracket Pair Colorizer** - Visual bracket matching

### Installation
```bash
# Clone repository
git clone <repository-url>
cd x-ray-medical-diagnostics

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
Create a `.env.local` file:
```bash
# RPC Configuration
NEXT_PUBLIC_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_BLOCK_EXPLORER=https://testnet.monadexplorer.com
NEXT_PUBLIC_BUNDLER_URL=https://api.pimlico.io/v2/monad-testnet/rpc

# Contract Addresses (automatically configured)
# NEXT_PUBLIC_MEDICAL_NFT=0xA960B1692aa11a10Ff1c1595300301DfF1CDAcB4
# NEXT_PUBLIC_PAYMASTER=0x2Aa0f72AEc34Ea007aeeD1c998f28278A1501423
```

## Testing Guide

### Prerequisites Setup

#### 1. MetaMask Setup
- Install MetaMask browser extension
- Create or import a wallet
- Add Monad Testnet network:
  - **Network Name**: Monad Testnet
  - **RPC URL**: https://testnet-rpc.monad.xyz
  - **Chain ID**: 10143
  - **Currency Symbol**: MON
  - **Block Explorer**: https://testnet.monadexplorer.com

#### 2. Test Tokens
- Get MON test tokens from Monad testnet faucet
- Fund your wallet with at least 1 MON for testing
- Verify balance in MetaMask

### Testing Scenarios

#### 1. Wallet Connection
**Objective**: Verify MetaMask integration and smart account creation

**Steps**:
1. Navigate to http://localhost:3000
2. Click "Connect MetaMask" button
3. Approve connection in MetaMask popup
4. Verify smart account address is displayed

**Expected Results**:
- Wallet connects successfully
- Smart account is created using MetaMask Delegation Toolkit
- Account address is displayed in UI
- No errors in browser console

#### 2. Medical Consultation Delegation
**Objective**: Test ERC-7710 delegation for AI consultations

**Steps**:
1. Ensure wallet is connected
2. Open Delegation Panel
3. Enter a valid delegate address (e.g., `0x1234...abcd`)
4. Select "Enable Gasless AI" option
5. Approve transaction in MetaMask

**Expected Results**:
- Delegation is created successfully
- Success message is displayed
- Delegation appears in active delegations list
- No errors in browser console

#### 3. Data Sharing Delegation
**Objective**: Test ERC-7710 delegation for medical data sharing

**Steps**:
1. Ensure wallet is connected
2. Open Delegation Panel
3. Enter a valid delegate address
4. Select "Share Progress" option
5. Approve transaction in MetaMask

**Expected Results**:
- Data sharing delegation is created
- Success message is displayed
- Delegation includes specified data types
- No errors in browser console

#### 4. Medical Diagnosis Completion
**Objective**: Test complete medical diagnosis workflow

**Steps**:
1. Upload a patient face image or use camera
2. Complete the medical diagnosis process
3. Verify diagnostic results are displayed
4. Check accuracy percentage and identified conditions

**Expected Results**:
- Image is processed successfully
- Medical analysis completes without errors
- Diagnostic accuracy is displayed (60-100%)
- Identified conditions are listed
- "Diagnosis Complete" event is fired

#### 5. Gasless Certificate Minting
**Objective**: Test ERC-4337 paymaster integration

**Steps**:
1. Complete a medical diagnosis
2. Click "Save Achievement Certificate" button
3. Approve transaction in MetaMask
4. Wait for transaction confirmation

**Expected Results**:
- Transaction is submitted through paymaster
- No gas fees are charged to user
- Certificate is minted successfully
- Transaction hash is displayed

#### 6. Certificate Verification
**Objective**: Verify certificate data and ownership

**Steps**:
1. Mint a medical certificate
2. View certificate details in UI
3. Check certificate data (patient ID, diagnosis, accuracy)
4. Verify ownership in wallet

**Expected Results**:
- Certificate data is displayed correctly
- Patient ID includes wallet address
- Diagnosis and accuracy match original analysis
- Certificate is visible in wallet NFT portfolio

### Automated Testing

#### Unit Tests
```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage
```

#### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e
```

### Manual Testing Checklist

#### Web3 Integration
- [ ] Wallet connection and disconnection
- [ ] Smart account creation
- [ ] Contract interactions (read/write)
- [ ] Delegation creation and management
- [ ] Gasless transaction execution
- [ ] Error handling and user feedback

#### UI Components
- [ ] WalletConnection component
- [ ] DelegationPanel component
- [ ] MedicalNFTMinter component
- [ ] Responsive design on mobile
- [ ] Loading states and animations
- [ ] Error messages and notifications

#### Smart Contracts
- [ ] MedicalAchievementNFT deployment
- [ ] MedicalPaymaster deployment
- [ ] Certificate minting functionality
- [ ] Paymaster sponsorship
- [ ] Contract authorization
- [ ] Event emission and indexing

## Development Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run typecheck
```

## Debugging Guide

### Common Issues and Solutions

#### 1. Wallet Connection Issues
**Problem**: MetaMask connection fails or hangs
**Solution**:
- Check MetaMask is unlocked and active
- Verify Monad Testnet is selected
- Clear browser cache and reload
- Check browser console for errors

#### 2. Smart Account Creation Failures
**Problem**: toMetaMaskSmartAccount throws errors
**Solution**:
- Verify MetaMask Delegation Toolkit version
- Check network connectivity to bundler
- Ensure valid owner address is provided
- Review bundler URL configuration

#### 3. Delegation Signing Failures
**Problem**: signMessage fails during delegation creation
**Solution**:
- Verify user approves signature in MetaMask
- Check wallet is connected and unlocked
- Ensure sufficient network connectivity
- Review delegation parameters

#### 4. Gasless Transaction Issues
**Problem**: Paymaster rejects transactions
**Solution**:
- Verify contract is authorized in paymaster
- Check paymaster has sufficient deposit
- Confirm transaction is within gas limits
- Review paymaster contract configuration

#### 5. Contract Interaction Errors
**Problem**: Read/write operations fail
**Solution**:
- Verify contract addresses are correct
- Check ABI files are up to date
- Ensure wallet is connected
- Review function parameters and types

### Debugging Tools

#### Browser Developer Tools
- **Console**: Check for JavaScript errors
- **Network**: Monitor API calls and responses
- **Elements**: Inspect UI component states
- **Application**: View local storage and IndexedDB

#### Viem Debugging
```bash
# Enable debug logging
DEBUG=viem:* npm run dev
```

#### MetaMask Debugging
- Enable "Developer Mode" in MetaMask settings
- Use "Settings > Advanced > State Logs" for troubleshooting
- Check "Settings > Alerts" for network issues

## Performance Monitoring

### Key Performance Indicators
- **Page Load Time**: < 3 seconds
- **Smart Account Creation**: < 2 seconds
- **Delegation Creation**: < 1 second
- **Certificate Minting**: < 5 seconds
- **UI Responsiveness**: < 100ms for interactions

### Performance Optimization Techniques
- **Caching**: Contract data caching with TTL
- **Lazy Loading**: Code splitting for large components
- **Bundle Optimization**: Tree shaking and minification
- **Image Optimization**: Compressed assets and lazy loading
- **Network Optimization**: Efficient API calls and bundler usage

## Deployment Instructions

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

### Monad Testnet Deployment
The contracts are already deployed on Monad testnet:

- **MedicalAchievementNFT**: `0xA960B1692aa11a10Ff1c1595300301DfF1CDAcB4`
- **MedicalPaymaster**: `0x2Aa0f72AEc34Ea007aeeD1c998f28278A1501423`
- **EntryPoint**: `0x0000000071727De22E5E9d8BAf0edAc6f37da032`

### Remix Deployment Guide

#### Deployed Contract Addresses
- **MedicalAchievementNFT**: 0xA960B1692aa11a10Ff1c1595300301DfF1CDAcB4
- **MedicalPaymaster**: 0x2Aa0f72AEc34Ea007aeeD1c998f28278A1501423
- **EntryPoint (Monad Testnet)**: 0x0000000071727De22E5E9d8BAf0edAc6f37da032

#### Steps to Deploy MedicalPaymaster in Remix
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

## Demo Script

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

## Troubleshooting

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

## Success Metrics

- ✅ Wallet connects and creates smart account
- ✅ Delegation is successfully created
- ✅ Medical diagnosis completes
- ✅ Certificate is minted without gas fees
- ✅ Transaction is confirmed on Monad testnet
- ✅ Certificate is visible in wallet/portfolio

## Branch Strategy

- **main**: Production-ready code
- **develop**: Development branch for ongoing work
- **feature/**: Feature branches for new functionality
- **hotfix/**: Emergency fixes for production issues

## Commit Guidelines

- Use conventional commit messages
- Include issue numbers when applicable
- Keep commits focused and atomic
- Write clear, descriptive commit messages

## Code Review Process

1. Create pull request from feature branch to develop
2. Assign reviewers from the team
3. Address all review comments
4. Merge after approval and CI passes

## Continuous Integration

- Automated testing on every push
- Code quality checks and linting
- Security scanning for dependencies
- Deployment to staging environment

## Security Best Practices

### Code Security
- Regular dependency updates and security scanning
- Input validation and sanitization
- Secure error handling (no sensitive data in logs)
- Proper access control and authorization

### Smart Contract Security
- Audited contract code
- Proper access controls (onlyOwner modifiers)
- Gas limit enforcement
- Reentrancy protection
- Integer overflow/underflow protection

### Web3 Security
- Secure private key handling
- Transaction signing best practices
- Delegation scope limitation
- Time-based delegation expiration
- User approval for all sensitive operations

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Environment variables configured

### Deployment
- [ ] Staging deployment successful
- [ ] Production deployment
- [ ] Smoke tests on production
- [ ] Monitoring enabled
- [ ] Rollback plan ready

### Post-Deployment
- [ ] User acceptance testing
- [ ] Performance monitoring
- [ ] Error rate monitoring
- [ ] User feedback collection
- [ ] Incident response ready