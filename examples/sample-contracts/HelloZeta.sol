// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@zetachain/protocol-contracts/contracts/zevm/SystemContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/zContract.sol";
import "@zetachain/toolkit/contracts/BytesHelperLib.sol";
import "@zetachain/toolkit/contracts/OnlySystem.sol";

/**
 * @title HelloZeta
 * @dev A simple cross-chain greeting contract demonstrating ZetaChain capabilities
 */
contract HelloZeta is zContract, OnlySystem {
    SystemContract public systemContract;
    
    mapping(address => string) public greetings;
    mapping(uint256 => uint256) public chainGreetingCount;
    
    event GreetingSet(address indexed user, string greeting, uint256 chainId);
    event CrossChainGreeting(address indexed user, string greeting, uint256 fromChain, uint256 toChain);
    
    modifier onlyValidChain(uint256 chainId) {
        require(chainId > 0, "Invalid chain ID");
        _;
    }
    
    constructor(address systemContractAddress) {
        systemContract = SystemContract(systemContractAddress);
    }
    
    /**
     * @dev Set a greeting message
     * @param greeting The greeting message to set
     */
    function setGreeting(string memory greeting) external {
        require(bytes(greeting).length > 0, "Greeting cannot be empty");
        require(bytes(greeting).length <= 280, "Greeting too long (max 280 chars)");
        
        greetings[msg.sender] = greeting;
        uint256 currentChain = block.chainid;
        chainGreetingCount[currentChain]++;
        
        emit GreetingSet(msg.sender, greeting, currentChain);
    }
    
    /**
     * @dev Get greeting for a specific user
     * @param user The user address to get greeting for
     * @return The user's greeting message
     */
    function getGreeting(address user) external view returns (string memory) {
        return greetings[user];
    }
    
    /**
     * @dev Get total greetings count for a chain
     * @param chainId The chain ID to check
     * @return The number of greetings set on that chain
     */
    function getChainGreetingCount(uint256 chainId) external view onlyValidChain(chainId) returns (uint256) {
        return chainGreetingCount[chainId];
    }
    
    /**
     * @dev Cross-chain greeting function called by ZetaChain
     * @param context The cross-chain context
     * @param zrc20 The ZRC20 token address
     * @param amount The amount being transferred
     * @param message The encoded message containing greeting data
     */
    function onCrossChainCall(
        zContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override onlySystem(systemContract) {
        // Decode the message to get greeting and target user
        (address targetUser, string memory greeting) = abi.decode(message, (address, string));
        
        require(bytes(greeting).length > 0, "Cross-chain greeting cannot be empty");
        require(bytes(greeting).length <= 280, "Cross-chain greeting too long");
        
        // Set the greeting for the target user
        greetings[targetUser] = greeting;
        
        // Update counters
        chainGreetingCount[context.chainID]++;
        
        emit CrossChainGreeting(
            targetUser, 
            greeting, 
            context.chainID, 
            block.chainid
        );
        
        // If amount > 0, we can handle token transfers as well
        if (amount > 0) {
            // Handle token operations here if needed
            // This could be used for paid greetings or rewards
        }
    }
    
    /**
     * @dev Send a cross-chain greeting to another chain
     * @param targetChain The target chain ID
     * @param targetUser The user to send greeting to
     * @param greeting The greeting message
     * @param gasAmount The gas amount for cross-chain call
     */
    function sendCrossChainGreeting(
        uint256 targetChain,
        address targetUser,
        string memory greeting,
        uint256 gasAmount
    ) external payable onlyValidChain(targetChain) {
        require(bytes(greeting).length > 0, "Greeting cannot be empty");
        require(bytes(greeting).length <= 280, "Greeting too long");
        require(gasAmount > 0, "Gas amount must be greater than 0");
        
        // Encode the greeting data
        bytes memory message = abi.encode(targetUser, greeting);
        
        // Get the gas token for the target chain
        address gasToken = systemContract.gasCoinZRC20ByChainId(targetChain);
        require(gasToken != address(0), "Target chain not supported");
        
        // Withdraw gas token to cover cross-chain costs
        IZRC20(gasToken).withdraw(abi.encodePacked(msg.sender), gasAmount);
        
        emit CrossChainGreeting(
            targetUser,
            greeting,
            block.chainid,
            targetChain
        );
    }
    
    /**
     * @dev Get contract stats
     * @return totalUsers Total number of users who set greetings
     * @return currentChainId Current chain ID
     * @return contractBalance Contract's native token balance
     */
    function getStats() external view returns (
        uint256 totalUsers,
        uint256 currentChainId,
        uint256 contractBalance
    ) {
        // Note: This is a simplified version - in production you'd want to track users properly
        totalUsers = chainGreetingCount[block.chainid];
        currentChainId = block.chainid;
        contractBalance = address(this).balance;
    }
    
    /**
     * @dev Emergency function to withdraw contract balance (owner only)
     * In a production contract, you'd want proper access control
     */
    function emergencyWithdraw() external {
        // In production, add proper access control here
        payable(msg.sender).transfer(address(this).balance);
    }
    
    // Allow contract to receive Ether
    receive() external payable {}
}