// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Inline interfaces to avoid dependency issues
interface IEntryPoint {
    function depositTo(address account) external payable;
    function withdrawTo(address payable withdrawAddress, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
}

interface IPaymaster {
    enum PostOpMode {
        opSucceeded,
        opReverted,
        postOpReverted
    }

    function validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external returns (bytes memory context, uint256 validationData);

    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost,
        uint256 /*actualUserOpFeePerGas*/
    ) external;
}

struct PackedUserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    bytes32 accountGasLimits;
    uint256 preVerificationGas;
    bytes32 gasFees;
    bytes paymasterAndData;
    bytes signature;
}

// Simplified Ownable implementation
contract Ownable {
    address internal _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(owner() == msg.sender, "Ownable: caller is not the owner");
        _;
    }
}

// Simplified ECDSA implementation
library ECDSA {
    function recover(bytes32 /*hash*/, bytes memory /*signature*/) internal pure returns (address) {
        // Simplified implementation - in production, use the full OpenZeppelin implementation
        return address(0); // Placeholder
    }
}

/**
 * @title MedicalPaymaster
 * @dev ERC-4337 Paymaster for gasless medical consultations
 * @notice Sponsors gas fees for AI diagnostic consultations on Monad testnet
 * @author X-RAY Medical Diagnostics Team
 */
contract MedicalPaymaster is IPaymaster, Ownable {

    IEntryPoint public immutable entryPoint;

    // Paymaster data structure for validation
    struct PaymasterData {
        address medicalContract; // Authorized medical contract
        uint256 maxGasCost;      // Maximum gas cost to sponsor
        uint48 validUntil;       // Expiration timestamp
        bytes signature;         // Signature for verification
    }

    // Mapping of authorized medical contracts
    mapping(address => bool) public authorizedContracts;

    // Mapping to track sponsored gas per user (to prevent abuse)
    mapping(address => uint256) public sponsoredGas;

    // Maximum gas cost per transaction (to prevent excessive sponsorship)
    uint256 public constant MAX_GAS_COST = 1 ether; // ~10^18 wei

    // Maximum sponsored gas per user per day
    uint256 public constant MAX_DAILY_SPONSORSHIP = 0.1 ether; // ~10^17 wei

    // Events
    event ContractAuthorized(address indexed contractAddress);
    event ContractRevoked(address indexed contractAddress);
    event GasSponsored(address indexed user, uint256 amount, string reason);

    /**
     * @dev Constructor initializes the paymaster
     * @param _entryPoint The ERC-4337 EntryPoint contract address
     */
    constructor(IEntryPoint _entryPoint) {
        entryPoint = _entryPoint;
        _owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /**
     * @dev Validate that the paymaster will sponsor this user operation
     * @param userOp The user operation to validate
     * @param maxCost Maximum cost the paymaster is willing to sponsor
     * @return context Data to be passed to postOp
     * @return validationData 0 for success, or a validation error
     */
    function validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32 /*userOpHash*/,
        uint256 maxCost
    ) external override returns (bytes memory context, uint256 validationData) {
        // Only EntryPoint can call this
        require(msg.sender == address(entryPoint), "Only EntryPoint can call");

        // Check if the call is to an authorized medical contract
        bool isAuthorizedCall = _isAuthorizedMedicalCall(userOp);

        if (!isAuthorizedCall) {
            return ("", 1); // Reject: not authorized
        }

        // Check gas cost limits
        if (maxCost > MAX_GAS_COST) {
            return ("", 1); // Reject: too expensive
        }

        // Check daily sponsorship limits
        address user = userOp.sender;
        if (sponsoredGas[user] + maxCost > MAX_DAILY_SPONSORSHIP) {
            return ("", 1); // Reject: daily limit exceeded
        }

        // Update sponsored gas tracking
        sponsoredGas[user] += maxCost;

        // Return context for postOp (user address and sponsored amount)
        context = abi.encode(user, maxCost);

        // Return 0 for success (no time-based validation)
        validationData = 0;
    }

    /**
     * @dev Called after the user operation is executed
     * @param mode Indicates whether the operation succeeded or failed
     * @param context The context returned from validatePaymasterUserOp
     * @param actualGasCost The actual gas cost of the operation
     */
    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost,
        uint256 /*actualUserOpFeePerGas*/
    ) external {
        // Only EntryPoint can call this
        require(msg.sender == address(entryPoint), "Only EntryPoint can call");

        (address user, uint256 sponsoredAmount) = abi.decode(context, (address, uint256));

        if (mode == PostOpMode.postOpReverted) {
            // If the operation reverted, refund the sponsored gas
            sponsoredGas[user] -= sponsoredAmount;
            return;
        }

        // Log the sponsorship
        emit GasSponsored(user, actualGasCost, "Medical consultation");
    }

    /**
     * @dev Add an authorized medical contract
     * @param contractAddress Address of the medical contract to authorize
     */
    function authorizeContract(address contractAddress) external onlyOwner {
        require(contractAddress != address(0), "Invalid contract address");
        authorizedContracts[contractAddress] = true;
        emit ContractAuthorized(contractAddress);
    }

    /**
     * @dev Remove authorization from a medical contract
     * @param contractAddress Address of the medical contract to revoke
     */
    function revokeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = false;
        emit ContractRevoked(contractAddress);
    }

    /**
     * @dev Check if a contract is authorized
     * @param contractAddress Address to check
     * @return True if authorized
     */
    function isContractAuthorized(address contractAddress) external view returns (bool) {
        return authorizedContracts[contractAddress];
    }

    /**
     * @dev Reset daily sponsorship limits (call daily)
     * @param users Array of user addresses to reset
     */
    function resetSponsorshipLimits(address[] calldata users) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            sponsoredGas[users[i]] = 0;
        }
    }

    /**
     * @dev Get the amount of gas sponsored for a user today
     * @param user Address to query
     * @return Sponsored gas amount
     */
    function getSponsoredGas(address user) external view returns (uint256) {
        return sponsoredGas[user];
    }

    /**
     * @dev Deposit ETH to paymaster stake (required by ERC-4337)
     */
    function deposit() external payable {
        entryPoint.depositTo{value: msg.value}(address(this));
    }

    /**
     * @dev Withdraw ETH from paymaster stake
     * @param amount Amount to withdraw
     */
    function withdrawStake(uint256 amount) external onlyOwner {
        entryPoint.withdrawTo(payable(owner()), amount);
    }

    /**
     * @dev Get paymaster balance in EntryPoint
     * @return Balance in wei
     */
    function getDeposit() external view returns (uint256) {
        return entryPoint.balanceOf(address(this));
    }

    /**
     * @dev Internal function to check if a user operation is an authorized medical call
     * @param userOp The user operation to check
     * @return True if authorized
     */
    function _isAuthorizedMedicalCall(PackedUserOperation calldata userOp) internal pure returns (bool) {
        // Check if the call data contains medical function signatures
        // This is a simplified check - in production, you'd want more sophisticated validation
        if (userOp.callData.length >= 4) {
            bytes4 functionSig = bytes4(userOp.callData[:4]);

            // Example: authorize common medical functions
            if (functionSig == bytes4(keccak256("consultAI(bytes)")) ||
                functionSig == bytes4(keccak256("analyzeCase(uint256)")) ||
                functionSig == bytes4(keccak256("submitDiagnosis(string)"))) {
                return true;
            }
        }

        return false;
    }

    /**
     * @dev Fallback function to receive ETH
     */
    receive() external payable {}
}
