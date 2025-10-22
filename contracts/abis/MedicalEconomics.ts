/**
 * MedicalEconomics Contract ABI
 * CLEAN: TypeScript-ready ABI export
 * DRY: Single source of truth for contract interface
 */

export const MedicalEconomicsABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum MedicalEconomics.Difficulty",
        "name": "difficulty",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "earningsAwarded",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "correctDiagnosis",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "CaseCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "enum MedicalEconomics.Difficulty",
        "name": "difficulty",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "startingBudget",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "maxEarnings",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timeLimit",
        "type": "uint256"
      }
    ],
    "name": "DifficultyConfigUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "internalType": "enum MedicalEconomics.Difficulty",
        "name": "difficulty",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "budgetUsed",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "bool",
            "name": "correctDiagnosis",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "timeBonus",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "budgetEfficiency",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "complicationsHandled",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "accuracyScore",
            "type": "uint256"
          }
        ],
        "internalType": "struct MedicalEconomics.PerformanceMetrics",
        "name": "metrics",
        "type": "tuple"
      }
    ],
    "name": "completeCase",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "earnings",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "enum MedicalEconomics.Difficulty",
        "name": "difficulty",
        "type": "uint8"
      }
    ],
    "name": "getDifficultyConfig",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "startingBudget",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxEarnings",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timeLimit",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          }
        ],
        "internalType": "struct MedicalEconomics.DifficultyConfig",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGlobalStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalCases",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalDistributed",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getPlayerCases",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "internalType": "enum MedicalEconomics.Difficulty",
            "name": "difficulty",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "budgetUsed",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "earningsAwarded",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "correctDiagnosis",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "accuracyScore",
            "type": "uint256"
          }
        ],
        "internalType": "struct MedicalEconomics.CompletedCase[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getPlayerStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalEarnings",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalCases",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "averageAccuracy",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

/**
 * TypeScript types for contract interaction
 */
export enum Difficulty {
  BEGINNER = 0,
  INTERMEDIATE = 1,
  ADVANCED = 2,
  EXPERT = 3
}

export interface PerformanceMetrics {
  correctDiagnosis: boolean;
  timeBonus: bigint;
  budgetEfficiency: bigint;
  complicationsHandled: bigint;
  accuracyScore: bigint;
}

export interface DifficultyConfig {
  startingBudget: bigint;
  maxEarnings: bigint;
  timeLimit: bigint;
  isActive: boolean;
}

export interface CompletedCase {
  player: string;
  difficulty: Difficulty;
  budgetUsed: bigint;
  earningsAwarded: bigint;
  timestamp: bigint;
  correctDiagnosis: boolean;
  accuracyScore: bigint;
}
