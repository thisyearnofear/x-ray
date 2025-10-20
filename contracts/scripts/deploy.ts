/**
 * Deployment Script for X-RAY Medical Contracts
 * @description Deploys MedicalAchievementNFT and MedicalPaymaster to Monad testnet
 * @author X-RAY Medical Diagnostics Team
 */

import { ethers } from 'hardhat';

// ERC-4337 EntryPoint addresses
const ENTRYPOINT_ADDRESSES = {
  v07: '0x0000000071727De22E5E9d8BAf0edAc6f37da032', // v0.7 (recommended)
} as const;

// Monad Testnet Configuration
const monadTestnet = {
  name: 'Monad Testnet',
  id: 41454,
} as const;

async function main() {
  console.log('🚀 Starting X-RAY Medical Contracts Deployment on Monad Testnet');
  console.log('📍 Network: Monad Testnet');
  console.log('🔗 RPC: https://testnet-rpc.monad.xyz');

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deploying from:', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('💰 Deployer balance:', ethers.formatEther(balance), 'MON');

  // Deploy MedicalAchievementNFT
  console.log('\n📝 Deploying MedicalAchievementNFT...');
  const MedicalNFT = await ethers.getContractFactory('MedicalAchievementNFT');
  const medicalNFT = await MedicalNFT.deploy();
  await medicalNFT.waitForDeployment();

  const nftAddress = await medicalNFT.getAddress();
  console.log('✅ MedicalAchievementNFT deployed to:', nftAddress);

  // Deploy MedicalPaymaster
  console.log('\n💰 Deploying MedicalPaymaster...');
  const MedicalPaymaster = await ethers.getContractFactory('MedicalPaymaster');
  const medicalPaymaster = await MedicalPaymaster.deploy(ENTRYPOINT_ADDRESSES.v07);
  await medicalPaymaster.waitForDeployment();

  const paymasterAddress = await medicalPaymaster.getAddress();
  console.log('✅ MedicalPaymaster deployed to:', paymasterAddress);

  // Fund the paymaster with some MON for gas sponsorship
  console.log('\n💸 Funding MedicalPaymaster with 1 MON...');
  const fundingTx = await deployer.sendTransaction({
    to: paymasterAddress,
    value: ethers.parseEther('1.0'), // 1 MON
  });
  await fundingTx.wait();
  console.log('✅ Paymaster funded with 1 MON');

  // Deposit to EntryPoint for paymaster stake
  console.log('\n🏦 Depositing paymaster stake to EntryPoint...');
  const depositTx = await medicalPaymaster.deposit({ value: ethers.parseEther('0.5') }); // 0.5 MON stake
  await depositTx.wait();
  console.log('✅ Paymaster stake deposited');

  // Authorize the NFT contract (example - add your medical contracts here)
  console.log('\n🔐 Authorizing MedicalAchievementNFT contract...');
  const authTx = await medicalPaymaster.authorizeContract(nftAddress);
  await authTx.wait();
  console.log('✅ NFT contract authorized for gas sponsorship');

  // Wait for confirmations
  console.log('\n⏳ Waiting for block confirmations...');
  await Promise.all([
    medicalNFT.deploymentTransaction()?.wait(3),
    medicalPaymaster.deploymentTransaction()?.wait(3),
  ]);

  // Deployment Summary
  console.log('\n🎉 Deployment Complete!');
  console.log('=' .repeat(50));
  console.log('📋 DEPLOYMENT SUMMARY:');
  console.log('MedicalAchievementNFT:', nftAddress);
  console.log('MedicalPaymaster:', paymasterAddress);
  console.log('EntryPoint:', ENTRYPOINT_ADDRESSES.v07);
  console.log('Network:', monadTestnet.name, `(Chain ID: ${monadTestnet.id})`);
  console.log('=' .repeat(50));

  // Update config suggestion
  console.log('\n📝 Update your MonadConfig.ts with these addresses:');
  console.log(`medicalNFT: '${nftAddress}',`);
  console.log(`paymaster: '${paymasterAddress}',`);

  // Verification commands
  console.log('\n🔍 Verification Commands:');
  console.log(`npx hardhat verify --network monadTestnet ${nftAddress}`);
  console.log(`npx hardhat verify --network monadTestnet ${paymasterAddress} ${ENTRYPOINT_ADDRESSES.v07}`);
}

// Handle errors
main().catch((error) => {
  console.error('❌ Deployment failed:', error);
  process.exitCode = 1;
});
