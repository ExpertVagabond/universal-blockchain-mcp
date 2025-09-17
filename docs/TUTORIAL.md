# 🎓 ZetaChain MCP Server - Complete Tutorial

Welcome to the comprehensive tutorial for the ZetaChain MCP Server! This guide will walk you through everything from basic setup to advanced cross-chain development workflows.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Operations](#basic-operations)
3. [Smart Contract Development](#smart-contract-development)
4. [Cross-Chain Development](#cross-chain-development)
5. [Advanced Workflows](#advanced-workflows)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- An AI assistant that supports MCP (Claude Desktop, Cursor, etc.)
- Basic understanding of blockchain concepts
- ZetaChain CLI installed (optional, will be installed automatically)

### Installation Options

#### Option 1: Local Installation
```bash
git clone https://github.com/ExpertVagabond/zetachain-mcp-server.git
cd zetachain-mcp-server
npm install
npm run build
```

#### Option 2: Smithery Marketplace (Recommended)
```json
{
  "mcpServers": {
    "zetachain": {
      "command": "npx",
      "args": ["-y", "@smithery/cli", "run", "ExpertVagabond/zetachain-mcp-server"]
    }
  }
}
```

#### Option 3: Direct npm Installation
```bash
npm install -g zetachain-mcp-server
```

### Configuration

Configure your AI assistant to use the MCP server:

**Claude Desktop (`~/.claude_desktop_config.json`):**
```json
{
  "mcpServers": {
    "zetachain": {
      "command": "node",
      "args": ["/path/to/zetachain-mcp-server/dist/index.js"],
      "env": {
        "ZETACHAIN_NETWORK": "testnet"
      }
    }
  }
}
```

### Verification

Test your installation by asking your AI assistant:
> "List the available ZetaChain networks"

You should see network information for both testnet and mainnet.

---

## Basic Operations

### 1. Network Information

Start by exploring the available networks:

**Prompt:** "Show me information about ZetaChain networks"

This will display:
- Current network configuration
- Chain IDs
- RPC endpoints
- Block explorers

### 2. Account Management

**Create a new account:**
> "Create a new ZetaChain account called 'tutorial-account'"

**List existing accounts:**
> "List all my ZetaChain accounts"

**Import an existing account:**
> "Import a ZetaChain account named 'imported-wallet' with private key 0x..."

### 3. Checking Balances

**Check balance for an address:**
> "Check the balance for address 0x1234567890123456789012345678901234567890"

**Check balance on specific chain:**
> "Get the balance for address 0x... on chain 7001"

### 4. Generating Wallets

**Create a secure wallet:**
> "Generate a new ZetaChain wallet named 'my-secure-wallet'"

⚠️ **Important**: Always save the private key securely and never share it!

---

## Smart Contract Development

### Tutorial 1: Hello World Contract

Let's create your first ZetaChain smart contract:

**Step 1: Create the project**
> "Create a new ZetaChain contract project called 'my-first-contract' using the hello template"

**Step 2: Explore the generated files**
The tool will create a complete project structure with:
- Smart contract source code
- Deployment scripts
- Configuration files
- Documentation

**Step 3: Understanding the contract**
The hello template creates a basic contract that demonstrates:
- Cross-chain messaging
- State management
- Event emission
- Basic security patterns

### Tutorial 2: NFT Collection

Create a more complex NFT contract:

**Step 1: Create NFT project**
> "Create a ZetaChain contract called 'awesome-nfts' using the nft template in directory './nft-project'"

**Step 2: Customize the contract**
The NFT template provides:
- ERC721 compatibility
- Cross-chain minting
- Metadata management
- Royalty support

**Step 3: Deploy preparation**
> "Prepare to deploy the contract at ./nft-project/contracts/AwesomeNFTs.sol to testnet"

### Tutorial 3: DeFi Token Swap

Build a decentralized exchange:

**Step 1: Create swap project**
> "Create a ZetaChain contract named 'cross-chain-dex' using the swap template"

**Step 2: Understand swap mechanics**
The swap template demonstrates:
- Liquidity pools
- Cross-chain token swapping
- Price oracles
- Slippage protection

---

## Cross-Chain Development

### Understanding ZetaChain's Cross-Chain Model

ZetaChain enables true cross-chain smart contracts that can:
- Read state from multiple blockchains
- Execute transactions across chains
- Handle cross-chain messaging
- Manage assets on different networks

### Tutorial 4: Cross-Chain Greeting App

Let's build a cross-chain application:

**Step 1: Create the base contract**
> "Create a contract called 'cross-chain-greetings' using the hello template"

**Step 2: Understand cross-chain calls**
The generated contract includes:
```solidity
function onCrossChainCall(
    zContext calldata context,
    address zrc20,
    uint256 amount,
    bytes calldata message
) external override onlySystem(systemContract) {
    // Handle incoming cross-chain calls
}
```

**Step 3: Test cross-chain functionality**
> "Query the latest block to understand network state"

### Tutorial 5: Multi-Chain Token Bridge

**Step 1: Set up the environment**
> "List all available networks to see supported chains"

**Step 2: Create bridge contract**
> "Create a contract called 'token-bridge' using the swap template"

**Step 3: Configure for multiple chains**
The contract will handle:
- Token locking on source chain
- Minting on destination chain
- Cross-chain verification
- Security validations

---

## Advanced Workflows

### Workflow 1: Complete DApp Development

**Phase 1: Planning and Setup**
1. > "List ZetaChain networks to understand deployment targets"
2. > "Create a new account for development called 'dapp-deployer'"
3. > "Generate a wallet for the project called 'project-wallet'"

**Phase 2: Contract Development**
1. > "Create a contract project called 'my-dapp' using the staking template"
2. > "Create another contract called 'my-token' using the counter template for token logic"

**Phase 3: Testing and Validation**
1. > "Check balance for the deployer account"
2. > "Query the latest block for timing information"

**Phase 4: Deployment Preparation**
1. > "Prepare deployment for ./my-dapp/contracts/MyDApp.sol to testnet"
2. > "Prepare deployment for ./my-token/contracts/MyToken.sol to testnet"

### Workflow 2: Cross-Chain Analytics

**Step 1: Data Collection Setup**
> "Create a contract called 'analytics-collector' using the hello template for cross-chain data collection"

**Step 2: Query Historical Data**
> "Query block 12345 for historical analysis"
> "Query transaction 0xabc123... for transaction analysis"

**Step 3: Balance Monitoring**
> "Check balances for multiple addresses to monitor liquidity"

### Workflow 3: Multi-Chain Arbitrage Bot

**Step 1: Market Analysis Setup**
> "List networks to identify arbitrage opportunities across chains"

**Step 2: Contract Deployment**
> "Create an arbitrage contract called 'cross-chain-arb' using the swap template"

**Step 3: Monitoring Setup**
> "Set up balance monitoring for arbitrage wallet addresses"

---

## Best Practices

### Security Best Practices

1. **Private Key Management**
   - Never hardcode private keys
   - Use environment variables
   - Consider hardware wallets for production

2. **Input Validation**
   - Always validate addresses
   - Check transaction amounts
   - Verify contract parameters

3. **Testing Strategy**
   - Start with testnet
   - Test cross-chain functionality thoroughly
   - Validate edge cases

### Development Best Practices

1. **Project Structure**
   ```
   my-project/
   ├── contracts/
   ├── scripts/
   ├── test/
   └── docs/
   ```

2. **Version Control**
   - Use git for all projects
   - Tag releases
   - Document changes

3. **Documentation**
   - Comment your contracts
   - Document deployment procedures
   - Maintain API documentation

### Performance Best Practices

1. **Caching Strategy**
   - Use cached queries for read operations
   - Minimize redundant blockchain calls
   - Cache network information

2. **Error Handling**
   - Implement proper error handling
   - Provide meaningful error messages
   - Log important operations

3. **Resource Management**
   - Monitor gas usage
   - Optimize contract calls
   - Use batch operations when possible

---

## Real-World Examples

### Example 1: Cross-Chain NFT Marketplace

**Business Logic:**
- Users can list NFTs from any supported chain
- Buyers can purchase with tokens from any chain
- Automatic cross-chain settlement

**Implementation Steps:**
1. > "Create marketplace contract using nft template"
2. > "Create payment processor using swap template"
3. > "Set up cross-chain messaging between contracts"

### Example 2: Multi-Chain Yield Farming

**Business Logic:**
- Users stake tokens on multiple chains
- Rewards are distributed cross-chain
- Automatic compounding across chains

**Implementation Steps:**
1. > "Create staking contract using staking template"
2. > "Create reward distribution using swap template"
3. > "Implement cross-chain reward claiming"

### Example 3: Cross-Chain Governance

**Business Logic:**
- Token holders vote from any chain
- Votes are aggregated cross-chain
- Proposals execute on target chains

**Implementation Steps:**
1. > "Create governance contract using counter template for vote counting"
2. > "Implement cross-chain vote aggregation"
3. > "Set up cross-chain proposal execution"

---

## Troubleshooting

### Common Issues

#### Issue 1: "ZetaChain CLI not found"
**Solution:**
```bash
npm install -g zetachain
# or
npm install zetachain --save-dev
```

#### Issue 2: "Network connection failed"
**Symptoms:** Queries timeout or fail
**Solutions:**
1. Check internet connection
2. Verify RPC endpoints
3. Try different network configuration

#### Issue 3: "Invalid address format"
**Symptoms:** Address validation errors
**Solutions:**
1. Ensure addresses are checksummed
2. Verify address length (42 characters including 0x)
3. Use valid Ethereum address format

#### Issue 4: "Insufficient balance"
**Symptoms:** Transaction preparation fails
**Solutions:**
1. Check account balance
2. Use testnet faucet for test tokens
3. Verify gas fee calculations

### Debugging Tips

1. **Enable Debug Mode**
   ```bash
   NODE_ENV=development node dist/index.js
   ```

2. **Check Server Logs**
   Monitor server output for detailed error information

3. **Validate Inputs**
   Double-check all addresses, amounts, and parameters

4. **Test Incrementally**
   Start with simple operations and build complexity

### Getting Help

1. **Documentation**: Refer to the [API Documentation](./API.md)
2. **Examples**: Check the [examples directory](../examples/)
3. **Issues**: Report bugs on [GitHub Issues](https://github.com/ExpertVagabond/zetachain-mcp-server/issues)
4. **Community**: Join the [ZetaChain Discord](https://discord.gg/zetachain)

---

## Next Steps

After completing this tutorial, you should be able to:
- Set up and configure the ZetaChain MCP Server
- Create and deploy smart contracts
- Implement cross-chain functionality
- Build complex DeFi applications
- Debug and troubleshoot issues

### Advanced Topics to Explore

1. **Custom Tool Development**: Extend the server with custom tools
2. **Integration Patterns**: Advanced integration with other systems
3. **Production Deployment**: Deploy to mainnet with proper security
4. **Monitoring and Analytics**: Set up comprehensive monitoring

### Community Contributions

Consider contributing to the project:
- Submit bug reports and feature requests
- Contribute code improvements
- Write additional documentation
- Share your use cases and examples

---

**Happy building with ZetaChain! 🚀**

*This tutorial is part of the ZetaChain MCP Server documentation. For the latest updates and community discussions, visit our [GitHub repository](https://github.com/ExpertVagabond/zetachain-mcp-server).*