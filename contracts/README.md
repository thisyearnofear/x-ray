# X-RAY Medical Smart Contracts

![Monad Testnet](https://img.shields.io/badge/Network-Monad%20Testnet-blue)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)
![License](https://img.shields.io/badge/License-MIT-green)

Real Web3 medical diagnostics contracts for Monad testnet deployment.

## 🏥 Contracts Overview

### MedicalAchievementNFT
- **Purpose**: Mint verifiable medical achievement certificates as NFTs
- **Features**:
  - ERC721 compliant with metadata storage
  - Stores diagnostic details (accuracy, conditions, timestamp)
  - Burn functionality for admin control
  - Gas-optimized for Monad's high throughput

### MedicalPaymaster
- **Purpose**: Enable gasless AI consultations via ERC-4337
- **Features**:
  - ERC-4337 Paymaster implementation
  - Authorized contract validation
  - Daily sponsorship limits to prevent abuse
  - Automatic gas refund on transaction failure

## 🚀 Quick Start

### Prerequisites
```bash
npm install -g hardhat
npm install
```

### Environment Setup
```bash
# Create .env file
cp .env.example .env

# Add your private key
echo "PRIVATE_KEY=your_private_key_here" >> .env
```

### Deploy to Monad Testnet
```bash
# Deploy contracts
npx hardhat run scripts/deploy.ts --network monadTestnet

# Verify contracts (when explorer supports it)
npx hardhat verify --network monadTestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 📋 Configuration

### Network Configuration
- **Chain ID**: 41454
- **RPC URL**: https://testnet-rpc.monad.xyz
- **Explorer**: https://testnet.monad.xyz
- **Native Token**: MON

### Contract Addresses
Update `config/MonadConfig.ts` with deployed addresses:

```typescript
export const DEPLOYED_CONTRACTS = {
  medicalNFT: '0x...',    // Your deployed NFT address
  paymaster: '0x...',     // Your deployed paymaster address
  entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
};
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test
npx hardhat test test/MedicalAchievementNFT.test.ts

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

## 🏗️ Architecture

### MedicalAchievementNFT Flow
1. User completes medical diagnosis
2. Frontend calls `mintCertificate()` with diagnostic data
3. NFT is minted with IPFS metadata
4. Certificate details stored on-chain
5. User receives verifiable medical credential

### MedicalPaymaster Flow
1. User initiates AI consultation
2. ERC-4337 UserOperation includes paymaster data
3. Paymaster validates call is to authorized medical contract
4. Gas fees sponsored if validation passes
5. Transaction executes gas-free for user

## 🔒 Security Features

- **Access Control**: Only owner can mint NFTs and authorize contracts
- **Gas Limits**: Maximum sponsorship amounts to prevent abuse
- **Validation**: Strict checks on transaction parameters
- **Emergency**: Admin can revoke authorizations and burn certificates

## 📊 Gas Optimization

- Uses Solidity 0.8.20 with optimizer enabled
- ERC721URIStorage for efficient metadata handling
- Minimal storage writes in hot paths
- Batch operations where possible

## 🎯 Monad Advantages

- **800ms Finality**: Instant certificate confirmation
- **10,000 TPS**: Handle multiple consultations simultaneously
- **Low Costs**: Efficient gas usage for medical operations
- **Real-time UX**: Immediate feedback for diagnostics

## 📝 API Reference

### MedicalAchievementNFT
```solidity
function mintCertificate(
    address to,
    string memory patientId,
    string memory diagnosis,
    uint256 accuracy,
    string[] memory conditions,
    string memory tokenURI
) external onlyOwner returns (uint256)
```

### MedicalPaymaster
```solidity
function validatePaymasterUserOp(
    UserOperation calldata userOp,
    bytes32 userOpHash,
    uint256 maxCost
) external returns (bytes memory context, uint256 validationData)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

## 🆘 Support

- **Discord**: [X-RAY Community](https://discord.gg/xray)
- **Docs**: [Medical Web3 Integration Guide](./docs/)
- **Issues**: [GitHub Issues](https://github.com/thisyearnofear/x-ray/issues)

---

*Built for the future of healthcare on Monad testnet* 🏥⚡
