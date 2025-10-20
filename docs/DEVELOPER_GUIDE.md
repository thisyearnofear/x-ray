# X-RAY Medical Diagnostics - Developer Guide & Testing

## 🧪 Testing Guide

### Prerequisites

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

#### 3. Development Environment
```bash
# Clone repository
git clone <repository-url>
cd x-ray-medical-diagnostics

# Install dependencies
npm install

# Start development server
npm run dev
```

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
6. Verify success message

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
6. Verify success message

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
5. Verify certificate details

**Expected Results**:
- Transaction is submitted through paymaster
- No gas fees are charged to user
- Certificate is minted successfully
- Transaction hash is displayed
- Certificate appears in UI

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

## 🛠️ Development Workflow

### Branch Strategy
- **main**: Production-ready code
- **develop**: Development branch for ongoing work
- **feature/**: Feature branches for new functionality
- **hotfix/**: Emergency fixes for production issues

### Commit Guidelines
- Use conventional commit messages
- Include issue numbers when applicable
- Keep commits focused and atomic
- Write clear, descriptive commit messages

### Code Review Process
1. Create pull request from feature branch to develop
2. Assign reviewers from the team
3. Address all review comments
4. Merge after approval and CI passes

### Continuous Integration
- Automated testing on every push
- Code quality checks and linting
- Security scanning for dependencies
- Deployment to staging environment

## 🔧 Development Tools

### Required Tools
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

### Development Scripts
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

## 🐛 Debugging Guide

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

## 📈 Performance Monitoring

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

## 🔒 Security Best Practices

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

## 🚀 Deployment Checklist

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