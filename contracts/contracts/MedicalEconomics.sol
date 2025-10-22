// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MedicalEconomics
 * @dev Manages MON token economy for medical diagnosis cases
 * @notice Handles case budgets, earnings calculation, and reward distribution
 * @author X-RAY Medical Diagnostics Team
 * 
 * CORE PRINCIPLES:
 * - CLEAN: Clear separation between case management and rewards
 * - MODULAR: Composable with MedicalAchievementNFT
 * - PERFORMANT: Gas-optimized storage and calculations
 */
contract MedicalEconomics is Ownable, ReentrancyGuard {
    
    // ============================================================================
    // TYPES & STORAGE
    // ============================================================================
    
    /// @dev Case difficulty tiers
    enum Difficulty {
        BEGINNER,    // 0.5 MON budget, 1.0 MON max earnings
        INTERMEDIATE, // 1.5 MON budget, 3.75 MON max earnings
        ADVANCED,     // 3.0 MON budget, 10.0 MON max earnings
        EXPERT        // 5.0 MON budget, 30.0 MON max earnings
    }
    
    /// @dev Performance metrics for earnings calculation
    struct PerformanceMetrics {
        bool correctDiagnosis;      // Did user get correct diagnosis?
        uint256 timeBonus;          // Bonus for fast completion (0-100)
        uint256 budgetEfficiency;   // Unused budget percentage (0-100)
        uint256 complicationsHandled; // Number of complications properly managed
        uint256 accuracyScore;      // Diagnostic accuracy (0-100)
    }
    
    /// @dev Completed case record
    struct CompletedCase {
        address player;
        Difficulty difficulty;
        uint256 budgetUsed;
        uint256 earningsAwarded;
        uint256 timestamp;
        bool correctDiagnosis;
        uint256 accuracyScore;
    }
    
    /// @dev Case difficulty configuration
    struct DifficultyConfig {
        uint256 startingBudget;   // in wei (MON has 18 decimals)
        uint256 maxEarnings;      // in wei
        uint256 timeLimit;        // in seconds
        bool isActive;
    }
    
    // ============================================================================
    // STATE VARIABLES
    // ============================================================================
    
    /// @dev Difficulty tier configurations
    mapping(Difficulty => DifficultyConfig) public difficultyConfigs;
    
    /// @dev Track completed cases per player
    mapping(address => CompletedCase[]) public playerCases;
    
    /// @dev Total earnings per player
    mapping(address => uint256) public playerEarnings;
    
    /// @dev Case completion count per player
    mapping(address => uint256) public casesCompleted;
    
    /// @dev Global statistics
    uint256 public totalCasesCompleted;
    uint256 public totalEarningsDistributed;
    
    // ============================================================================
    // EVENTS
    // ============================================================================
    
    event CaseCompleted(
        address indexed player,
        Difficulty difficulty,
        uint256 earningsAwarded,
        bool correctDiagnosis,
        uint256 timestamp
    );
    
    event EarningsWithdrawn(
        address indexed player,
        uint256 amount,
        uint256 timestamp
    );
    
    event DifficultyConfigUpdated(
        Difficulty indexed difficulty,
        uint256 startingBudget,
        uint256 maxEarnings,
        uint256 timeLimit
    );
    
    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================
    
    constructor() Ownable(msg.sender) {
        // Initialize difficulty configurations (values in wei, MON has 18 decimals)
        difficultyConfigs[Difficulty.BEGINNER] = DifficultyConfig({
            startingBudget: 0.5 ether,   // 0.5 MON
            maxEarnings: 1.0 ether,      // 1.0 MON
            timeLimit: 300,              // 5 minutes
            isActive: true
        });
        
        difficultyConfigs[Difficulty.INTERMEDIATE] = DifficultyConfig({
            startingBudget: 1.5 ether,   // 1.5 MON
            maxEarnings: 3.75 ether,     // 3.75 MON
            timeLimit: 480,              // 8 minutes
            isActive: true
        });
        
        difficultyConfigs[Difficulty.ADVANCED] = DifficultyConfig({
            startingBudget: 3.0 ether,   // 3.0 MON
            maxEarnings: 10.0 ether,     // 10.0 MON
            timeLimit: 600,              // 10 minutes
            isActive: true
        });
        
        difficultyConfigs[Difficulty.EXPERT] = DifficultyConfig({
            startingBudget: 5.0 ether,   // 5.0 MON
            maxEarnings: 30.0 ether,     // 30.0 MON
            timeLimit: 900,              // 15 minutes
            isActive: true
        });
    }
    
    // ============================================================================
    // CORE FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Complete a medical case and calculate earnings
     * @param player Address of the player completing the case
     * @param difficulty Case difficulty level
     * @param budgetUsed Amount of MON budget used (in wei)
     * @param metrics Performance metrics for earnings calculation
     * @return earnings Amount of MON tokens earned
     */
    function completeCase(
        address player,
        Difficulty difficulty,
        uint256 budgetUsed,
        PerformanceMetrics memory metrics
    ) external onlyOwner nonReentrant returns (uint256 earnings) {
        require(player != address(0), "Invalid player address");
        require(difficultyConfigs[difficulty].isActive, "Difficulty not active");
        
        DifficultyConfig memory config = difficultyConfigs[difficulty];
        require(budgetUsed <= config.startingBudget, "Budget exceeded");
        
        // Calculate earnings based on performance
        earnings = _calculateEarnings(difficulty, budgetUsed, metrics);
        
        // Record the completed case
        CompletedCase memory completedCase = CompletedCase({
            player: player,
            difficulty: difficulty,
            budgetUsed: budgetUsed,
            earningsAwarded: earnings,
            timestamp: block.timestamp,
            correctDiagnosis: metrics.correctDiagnosis,
            accuracyScore: metrics.accuracyScore
        });
        
        playerCases[player].push(completedCase);
        playerEarnings[player] += earnings;
        casesCompleted[player]++;
        
        totalCasesCompleted++;
        totalEarningsDistributed += earnings;
        
        emit CaseCompleted(
            player,
            difficulty,
            earnings,
            metrics.correctDiagnosis,
            block.timestamp
        );
        
        // Transfer earnings to player (assumes contract has MON balance)
        // In production, this would interact with the MON token contract
        // For now, we track earnings that can be claimed separately
        
        return earnings;
    }
    
    /**
     * @dev Calculate earnings based on performance metrics
     * @param difficulty Case difficulty
     * @param budgetUsed MON budget used
     * @param metrics Performance metrics
     * @return Total earnings in wei
     */
    function _calculateEarnings(
        Difficulty difficulty,
        uint256 budgetUsed,
        PerformanceMetrics memory metrics
    ) internal view returns (uint256) {
        DifficultyConfig memory config = difficultyConfigs[difficulty];
        
        // Base earnings start at 0 if wrong diagnosis
        if (!metrics.correctDiagnosis) {
            return 0;
        }
        
        // Start with base earnings (50% of max)
        uint256 baseEarnings = config.maxEarnings / 2;
        
        // Add accuracy bonus (up to 25% of max)
        uint256 accuracyBonus = (config.maxEarnings * metrics.accuracyScore) / 400;
        
        // Add time bonus (up to 15% of max)
        uint256 timeBonus = (config.maxEarnings * metrics.timeBonus) / 667;
        
        // Add budget efficiency bonus (up to 10% of max)
        uint256 budgetEfficiency = config.startingBudget > budgetUsed
            ? ((config.startingBudget - budgetUsed) * 100) / config.startingBudget
            : 0;
        uint256 budgetBonus = (config.maxEarnings * budgetEfficiency) / 1000;
        
        // Total earnings (capped at maxEarnings)
        uint256 totalEarnings = baseEarnings + accuracyBonus + timeBonus + budgetBonus;
        
        if (totalEarnings > config.maxEarnings) {
            totalEarnings = config.maxEarnings;
        }
        
        return totalEarnings;
    }
    
    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Get difficulty configuration
     * @param difficulty Difficulty level
     * @return Configuration for the difficulty
     */
    function getDifficultyConfig(Difficulty difficulty) 
        external 
        view 
        returns (DifficultyConfig memory) 
    {
        return difficultyConfigs[difficulty];
    }
    
    /**
     * @dev Get player's completed cases
     * @param player Player address
     * @return Array of completed cases
     */
    function getPlayerCases(address player) 
        external 
        view 
        returns (CompletedCase[] memory) 
    {
        return playerCases[player];
    }
    
    /**
     * @dev Get player statistics
     * @param player Player address
     * @return totalEarnings Total MON earned
     * @return totalCases Total cases completed
     * @return averageAccuracy Average diagnostic accuracy
     */
    function getPlayerStats(address player) 
        external 
        view 
        returns (
            uint256 totalEarnings,
            uint256 totalCases,
            uint256 averageAccuracy
        ) 
    {
        totalEarnings = playerEarnings[player];
        totalCases = casesCompleted[player];
        
        if (totalCases == 0) {
            return (totalEarnings, totalCases, 0);
        }
        
        uint256 totalAccuracy = 0;
        CompletedCase[] memory cases = playerCases[player];
        
        for (uint256 i = 0; i < cases.length; i++) {
            totalAccuracy += cases[i].accuracyScore;
        }
        
        averageAccuracy = totalAccuracy / totalCases;
        
        return (totalEarnings, totalCases, averageAccuracy);
    }
    
    /**
     * @dev Get global statistics
     * @return totalCases Total cases completed across all players
     * @return totalDistributed Total MON distributed
     */
    function getGlobalStats() 
        external 
        view 
        returns (uint256 totalCases, uint256 totalDistributed) 
    {
        return (totalCasesCompleted, totalEarningsDistributed);
    }
    
    // ============================================================================
    // ADMIN FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Update difficulty configuration
     * @param difficulty Difficulty level to update
     * @param startingBudget New starting budget
     * @param maxEarnings New max earnings
     * @param timeLimit New time limit
     */
    function updateDifficultyConfig(
        Difficulty difficulty,
        uint256 startingBudget,
        uint256 maxEarnings,
        uint256 timeLimit
    ) external onlyOwner {
        require(maxEarnings > 0, "Max earnings must be positive");
        require(startingBudget > 0, "Starting budget must be positive");
        require(timeLimit > 0, "Time limit must be positive");
        
        difficultyConfigs[difficulty] = DifficultyConfig({
            startingBudget: startingBudget,
            maxEarnings: maxEarnings,
            timeLimit: timeLimit,
            isActive: true
        });
        
        emit DifficultyConfigUpdated(
            difficulty,
            startingBudget,
            maxEarnings,
            timeLimit
        );
    }
    
    /**
     * @dev Toggle difficulty active status
     * @param difficulty Difficulty level
     * @param isActive New active status
     */
    function setDifficultyActive(Difficulty difficulty, bool isActive) 
        external 
        onlyOwner 
    {
        difficultyConfigs[difficulty].isActive = isActive;
    }
    
    /**
     * @dev Withdraw contract balance (for emergency)
     * @param amount Amount to withdraw
     */
    function withdrawBalance(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(owner()).transfer(amount);
    }
    
    /**
     * @dev Receive ETH/MON
     */
    receive() external payable {}
}
