// MedicalAchievementNFT Contract ABI
// Generated from MedicalAchievementNFT.sol
export const MedicalAchievementNFTABI = [
  // ERC721 Standard
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },

  // MedicalAchievementNFT Specific
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'patientId', type: 'string' },
      { name: 'diagnosis', type: 'string' },
      { name: 'accuracy', type: 'uint256' },
      { name: 'conditions', type: 'string[]' },
      { name: 'tokenURI', type: 'string' },
    ],
    name: 'mintCertificate',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getCertificate',
    outputs: [
      {
        components: [
          { name: 'patientId', type: 'string' },
          { name: 'diagnosis', type: 'string' },
          { name: 'doctorAddress', type: 'string' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'accuracy', type: 'uint256' },
          { name: 'conditions', type: 'string[]' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'certificateExists',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalCertificates',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'burnCertificate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'recipient', type: 'address' },
      { indexed: false, name: 'diagnosis', type: 'string' },
      { indexed: false, name: 'accuracy', type: 'uint256' },
    ],
    name: 'CertificateMinted',
    type: 'event',
  },
] as const;
