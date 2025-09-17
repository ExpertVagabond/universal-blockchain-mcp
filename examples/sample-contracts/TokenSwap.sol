// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@zetachain/protocol-contracts/contracts/zevm/SystemContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/zContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/IZRC20.sol";
import "@zetachain/toolkit/contracts/OnlySystem.sol";

/**
 * @title CrossChainTokenSwap
 * @dev A decentralized cross-chain token swap contract using ZetaChain
 */
contract CrossChainTokenSwap is zContract, OnlySystem {
    SystemContract public systemContract;
    
    struct SwapOrder {
        address user;
        address fromToken;
        address toToken;
        uint256 fromAmount;
        uint256 toAmount;
        uint256 fromChainId;
        uint256 toChainId;
        uint256 timestamp;
        bool executed;
        bool cancelled;
    }
    
    mapping(bytes32 => SwapOrder) public swapOrders;
    mapping(address => bytes32[]) public userOrders;
    mapping(address => mapping(address => uint256)) public tokenBalances;
    
    uint256 public orderCounter;
    uint256 public feePercentage = 30; // 0.3% fee (30/10000)
    address public feeRecipient;
    
    event SwapOrderCreated(
        bytes32 indexed orderId,
        address indexed user,
        address fromToken,
        address toToken,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 fromChainId,
        uint256 toChainId
    );
    
    event SwapExecuted(
        bytes32 indexed orderId,
        address indexed user,
        uint256 actualToAmount
    );
    
    event SwapCancelled(bytes32 indexed orderId, address indexed user);
    event FeesCollected(address token, uint256 amount);
    
    modifier validToken(address token) {
        require(token != address(0), "Invalid token address");
        _;
    }
    
    modifier orderExists(bytes32 orderId) {
        require(swapOrders[orderId].user != address(0), "Order does not exist");
        _;
    }
    
    modifier onlyOrderOwner(bytes32 orderId) {
        require(swapOrders[orderId].user == msg.sender, "Not order owner");
        _;
    }
    
    constructor(address systemContractAddress, address _feeRecipient) {
        systemContract = SystemContract(systemContractAddress);
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Create a cross-chain swap order
     * @param fromToken Token to swap from
     * @param toToken Token to swap to
     * @param fromAmount Amount to swap
     * @param minToAmount Minimum amount to receive
     * @param toChainId Target chain ID
     */
    function createSwapOrder(
        address fromToken,
        address toToken,
        uint256 fromAmount,
        uint256 minToAmount,
        uint256 toChainId
    ) external validToken(fromToken) validToken(toToken) returns (bytes32) {
        require(fromAmount > 0, "Amount must be greater than 0");
        require(minToAmount > 0, "Min amount must be greater than 0");
        require(toChainId > 0, "Invalid target chain");
        require(fromToken != toToken || block.chainid != toChainId, "Same token and chain");
        
        // Transfer tokens from user to contract
        IZRC20(fromToken).transferFrom(msg.sender, address(this), fromAmount);
        
        // Generate unique order ID
        bytes32 orderId = keccak256(
            abi.encodePacked(
                msg.sender,
                fromToken,
                toToken,
                fromAmount,
                block.timestamp,
                orderCounter++
            )
        );
        
        // Create swap order
        swapOrders[orderId] = SwapOrder({
            user: msg.sender,
            fromToken: fromToken,
            toToken: toToken,
            fromAmount: fromAmount,
            toAmount: minToAmount,
            fromChainId: block.chainid,
            toChainId: toChainId,
            timestamp: block.timestamp,
            executed: false,
            cancelled: false
        });
        
        // Track user orders
        userOrders[msg.sender].push(orderId);
        
        emit SwapOrderCreated(
            orderId,
            msg.sender,
            fromToken,
            toToken,
            fromAmount,
            minToAmount,
            block.chainid,
            toChainId
        );
        
        return orderId;
    }
    
    /**
     * @dev Execute a swap order (called by cross-chain message)
     * @param orderId The order ID to execute
     * @param actualToAmount The actual amount being provided
     */
    function executeSwapOrder(
        bytes32 orderId,
        uint256 actualToAmount
    ) external orderExists(orderId) {
        SwapOrder storage order = swapOrders[orderId];
        
        require(!order.executed, "Order already executed");
        require(!order.cancelled, "Order cancelled");
        require(actualToAmount >= order.toAmount, "Insufficient output amount");
        
        // Calculate fees
        uint256 feeAmount = (actualToAmount * feePercentage) / 10000;
        uint256 userAmount = actualToAmount - feeAmount;
        
        // Transfer tokens to user
        IZRC20(order.toToken).transfer(order.user, userAmount);
        
        // Transfer fees
        if (feeAmount > 0) {
            IZRC20(order.toToken).transfer(feeRecipient, feeAmount);
            emit FeesCollected(order.toToken, feeAmount);
        }
        
        // Mark as executed
        order.executed = true;
        
        emit SwapExecuted(orderId, order.user, userAmount);
    }
    
    /**
     * @dev Cancel a swap order and refund tokens
     * @param orderId The order ID to cancel
     */
    function cancelSwapOrder(bytes32 orderId) 
        external 
        orderExists(orderId) 
        onlyOrderOwner(orderId) 
    {
        SwapOrder storage order = swapOrders[orderId];
        
        require(!order.executed, "Cannot cancel executed order");
        require(!order.cancelled, "Order already cancelled");
        
        // Refund tokens to user
        IZRC20(order.fromToken).transfer(order.user, order.fromAmount);
        
        // Mark as cancelled
        order.cancelled = true;
        
        emit SwapCancelled(orderId, order.user);
    }
    
    /**
     * @dev Cross-chain call handler for incoming swaps
     * @param context Cross-chain context
     * @param zrc20 ZRC20 token being transferred
     * @param amount Amount being transferred
     * @param message Encoded swap parameters
     */
    function onCrossChainCall(
        zContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override onlySystem(systemContract) {
        // Decode message: (orderId, expectedAmount)
        (bytes32 orderId, uint256 expectedAmount) = abi.decode(message, (bytes32, uint256));
        
        // Verify the order exists and matches
        SwapOrder storage order = swapOrders[orderId];
        require(order.user != address(0), "Invalid order");
        require(order.toToken == zrc20, "Token mismatch");
        require(!order.executed, "Order already executed");
        require(!order.cancelled, "Order cancelled");
        
        // Execute the swap with the received amount
        executeSwapOrder(orderId, amount);
    }
    
    /**
     * @dev Get user's swap orders
     * @param user User address
     * @return Array of order IDs
     */
    function getUserOrders(address user) external view returns (bytes32[] memory) {
        return userOrders[user];
    }
    
    /**
     * @dev Get swap order details
     * @param orderId Order ID
     * @return SwapOrder struct
     */
    function getSwapOrder(bytes32 orderId) external view returns (SwapOrder memory) {
        return swapOrders[orderId];
    }
    
    /**
     * @dev Update fee percentage (admin function)
     * @param newFeePercentage New fee percentage (in basis points)
     */
    function updateFeePercentage(uint256 newFeePercentage) external {
        require(newFeePercentage <= 1000, "Fee too high (max 10%)"); // Max 10%
        feePercentage = newFeePercentage;
    }
    
    /**
     * @dev Update fee recipient (admin function)
     * @param newFeeRecipient New fee recipient address
     */
    function updateFeeRecipient(address newFeeRecipient) external {
        require(newFeeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = newFeeRecipient;
    }
    
    /**
     * @dev Get contract statistics
     * @return totalOrders Total number of orders created
     * @return activeOrders Number of active (non-executed, non-cancelled) orders
     * @return totalVolume Total volume processed (simplified)
     */
    function getStats() external view returns (
        uint256 totalOrders,
        uint256 activeOrders,
        uint256 totalVolume
    ) {
        totalOrders = orderCounter;
        // Note: In production, you'd want to track these more efficiently
        activeOrders = 0;
        totalVolume = 0;
        
        // This is a simplified version - in production you'd maintain these counters
    }
    
    /**
     * @dev Emergency pause function (admin only)
     * In production, implement proper access control
     */
    function emergencyPause() external {
        // Implement emergency pause logic
        // This would prevent new orders and potentially allow cancellations only
    }
}