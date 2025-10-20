// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MedicalAchievementNFT
 * @dev ERC721 contract for minting medical diagnostic achievement certificates
 * @notice Issues verifiable NFTs for completed medical diagnoses on Monad testnet
 * @author X-RAY Medical Diagnostics Team
 */
contract MedicalAchievementNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Struct to store diagnostic metadata
    struct DiagnosticCertificate {
        string patientId;
        string diagnosis;
        string doctorAddress;
        uint256 timestamp;
        uint256 accuracy;
        string[] conditions;
    }

    // Mapping from tokenId to certificate data
    mapping(uint256 => DiagnosticCertificate) public certificates;

    // Event for certificate minting
    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        string diagnosis,
        uint256 accuracy
    );

    /**
     * @dev Constructor initializes the NFT contract
     */
    constructor() ERC721("Medical Achievement Certificate", "MAC") Ownable(msg.sender) {}

    /**
     * @dev Mint a new diagnostic certificate NFT
     * @param to Address to receive the NFT
     * @param patientId Unique patient identifier
     * @param diagnosis The medical diagnosis
     * @param accuracy Diagnostic accuracy percentage (0-100)
     * @param conditions Array of discovered medical conditions
     * @param certificateURI IPFS URI containing certificate metadata
     * @return tokenId The ID of the newly minted token
     */
    function mintCertificate(
        address to,
        string memory patientId,
        string memory diagnosis,
        uint256 accuracy,
        string[] memory conditions,
        string memory certificateURI
    ) external onlyOwner returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(accuracy <= 100, "Accuracy must be between 0-100");
        require(bytes(diagnosis).length > 0, "Diagnosis cannot be empty");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, certificateURI);

        // Store certificate metadata
        certificates[tokenId] = DiagnosticCertificate({
            patientId: patientId,
            diagnosis: diagnosis,
            doctorAddress: Strings.toHexString(uint256(uint160(msg.sender)), 20),
            timestamp: block.timestamp,
            accuracy: accuracy,
            conditions: conditions
        });

        emit CertificateMinted(tokenId, to, diagnosis, accuracy);

        return tokenId;
    }

    /**
     * @dev Get certificate details by token ID
     * @param tokenId The token ID to query
     * @return Certificate metadata
     */
    function getCertificate(uint256 tokenId) external view returns (DiagnosticCertificate memory) {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        return certificates[tokenId];
    }

    /**
     * @dev Check if a certificate exists
     * @param tokenId The token ID to check
     * @return True if certificate exists
     */
    function certificateExists(uint256 tokenId) external view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Get total number of certificates minted
     * @return Total supply of certificates
     */
    function totalCertificates() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Burn a certificate (admin only)
     * @param tokenId The token ID to burn
     */
    function burnCertificate(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        _burn(tokenId);
        delete certificates[tokenId];
    }

    // Override functions required by Solidity
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }


}
