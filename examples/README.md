# 🚀 ZetaChain MCP Server - Usage Examples

This document provides comprehensive examples of how to use the ZetaChain MCP Server with AI assistants like Claude Desktop.

## 📋 Table of Contents

1. [Basic Setup](#basic-setup)
2. [Tool Examples](#tool-examples)
3. [Advanced Usage](#advanced-usage)
4. [Integration Examples](#integration-examples)
5. [Troubleshooting](#troubleshooting)

## Basic Setup

### Claude Desktop Configuration

Add this to your Claude Desktop configuration file:

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

### Cursor Configuration

For Cursor IDE with Smithery deployment:

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

## Tool Examples

### 1. 🌐 List Networks

Get information about available ZetaChain networks:

**Request:**
```json
{
  "tool": "list_networks",
  "arguments": {}
}
```

**Response:**
```
🌐 ZetaChain Networks:

📡 Testnet (Current: ✅)
- Chain ID: 7001
- RPC: https://zetachain-evm.blockpi.network/v1/rpc/public
- Explorer: https://zetachain.blockscout.com/

🚀 Mainnet (Current: ❌)
- Chain ID: 7000
- RPC: https://zetachain-evm.blockpi.network/v1/rpc/public
- Explorer: https://zetachain.blockscout.com/
```

### 2. 📝 Create Contract

Create a new smart contract project:

**Basic Hello World Contract:**
```json
{
  "tool": "create_contract",
  "arguments": {
    "name": "my-hello-contract"
  }
}
```

**NFT Contract with Custom Directory:**
```json
{
  "tool": "create_contract",
  "arguments": {
    "name": "my-nft-collection",
    "template": "nft",
    "directory": "./contracts/nfts"
  }
}
```

**Available Templates:**
- `hello` - Basic Hello World contract
- `swap` - Token swap functionality
- `nft` - NFT collection contract
- `staking` - Token staking contract
- `counter` - Simple counter contract

### 3. 👤 Account Management

**List Existing Accounts:**
```json
{
  "tool": "manage_accounts",
  "arguments": {
    "action": "list"
  }
}
```

**Create New Account:**
```json
{
  "tool": "manage_accounts",
  "arguments": {
    "action": "create",
    "name": "my-dev-account"
  }
}
```

**Import Account from Private Key:**
```json
{
  "tool": "manage_accounts",
  "arguments": {
    "action": "import",
    "name": "imported-account",
    "privateKey": "0x1234567890abcdef..."
  }
}
```

### 4. 💰 Check Balances

**Check Balance for Address:**
```json
{
  "tool": "get_balance",
  "arguments": {
    "address": "0x1234567890123456789012345678901234567890"
  }
}
```

**Check Balance on Specific Chain:**
```json
{
  "tool": "get_balance",
  "arguments": {
    "address": "0x1234567890123456789012345678901234567890",
    "chainId": "7001"
  }
}
```

### 5. 🔐 Generate Wallet

Create a new wallet with secure key generation:

```json
{
  "tool": "generate_wallet",
  "arguments": {
    "name": "my-new-wallet"
  }
}
```

### 6. 📊 Query Chain

**Query Transaction:**
```json
{
  "tool": "query_chain",
  "arguments": {
    "queryType": "transaction",
    "txHash": "0xabcdef1234567890..."
  }
}
```

**Query Latest Block:**
```json
{
  "tool": "query_chain",
  "arguments": {
    "queryType": "block"
  }
}
```

**Query Specific Block:**
```json
{
  "tool": "query_chain",
  "arguments": {
    "queryType": "block",
    "blockHeight": "12345"
  }
}
```

### 7. 💸 Send Transaction

**Basic Token Transfer:**
```json
{
  "tool": "send_transaction",
  "arguments": {
    "to": "0x1234567890123456789012345678901234567890",
    "amount": "1.5",
    "chainId": "7001"
  }
}
```

**Contract Interaction:**
```json
{
  "tool": "send_transaction",
  "arguments": {
    "to": "0xcontract123456789012345678901234567890",
    "amount": "0",
    "chainId": "7001",
    "data": "0xa9059cbb000000000000000000000000..."
  }
}
```

### 8. 🚀 Deploy Contract

**Deploy to Testnet:**
```json
{
  "tool": "deploy_contract",
  "arguments": {
    "contractPath": "./contracts/MyContract.sol",
    "network": "testnet",
    "args": ["Hello", "World", "123"]
  }
}
```

**Deploy to Mainnet:**
```json
{
  "tool": "deploy_contract",
  "arguments": {
    "contractPath": "./contracts/MyContract.sol",
    "network": "mainnet",
    "args": ["Production", "Ready"]
  }
}
```

## Advanced Usage

### Chaining Operations

You can chain multiple operations together for complex workflows:

1. **Create and Deploy Workflow:**
   ```
   1. create_contract -> Create new NFT project
   2. deploy_contract -> Deploy to testnet
   3. query_chain -> Verify deployment
   4. get_balance -> Check gas costs
   ```

2. **Account Setup Workflow:**
   ```
   1. generate_wallet -> Create new wallet
   2. manage_accounts -> List all accounts
   3. get_balance -> Check initial balance
   4. send_transaction -> Fund from faucet
   ```

### Configuration Options

The server supports various configuration options:

```json
{
  "network": "testnet",           // or "mainnet"
  "privateKey": "0x...",          // Optional private key
  "rpcUrl": "https://custom.rpc", // Optional custom RPC
  "enableAnalytics": false        // Analytics collection
}
```

## Integration Examples

### Example 1: NFT Collection Setup

```typescript
// 1. Create NFT contract
await callTool("create_contract", {
  name: "awesome-nfts",
  template: "nft",
  directory: "./my-nfts"
});

// 2. Generate wallet for deployment
await callTool("generate_wallet", {
  name: "nft-deployer"
});

// 3. Check network status
await callTool("list_networks", {});

// 4. Deploy contract
await callTool("deploy_contract", {
  contractPath: "./my-nfts/contracts/AwesomeNFTs.sol",
  network: "testnet"
});
```

### Example 2: DeFi Interaction

```typescript
// 1. Check current balance
await callTool("get_balance", {
  address: "0x1234...",
  chainId: "7001"
});

// 2. Query latest block for timing
await callTool("query_chain", {
  queryType: "block"
});

// 3. Execute swap transaction
await callTool("send_transaction", {
  to: "0xswap_contract...",
  amount: "0",
  chainId: "7001",
  data: "0xswap_data..."
});

// 4. Verify transaction
await callTool("query_chain", {
  queryType: "transaction",
  txHash: "0xtx_hash..."
});
```

## Troubleshooting

### Common Issues

1. **"ZetaChain CLI not found"**
   - Ensure ZetaChain CLI is installed: `npm install -g zetachain`
   - Or use local installation in node_modules

2. **"Invalid network"**
   - Check network configuration in server config
   - Valid networks: "testnet", "mainnet"

3. **"Account not found"**
   - Create account first using `manage_accounts`
   - Import existing account with private key

4. **"Insufficient balance"**
   - Check balance with `get_balance`
   - Use testnet faucet for test tokens

### Error Messages

The server provides detailed error messages:

- ❌ **Validation Errors**: Parameter validation failed
- 🚫 **Permission Errors**: Insufficient permissions or invalid keys
- 🌐 **Network Errors**: RPC connection or network issues
- 💰 **Balance Errors**: Insufficient funds for operations

### Debug Mode

Set `NODE_ENV=development` for detailed error traces and debug information.

## Support

For additional support:
- 📖 [ZetaChain Documentation](https://docs.zetachain.com)
- 💬 [ZetaChain Discord](https://discord.gg/zetachain)
- 🐛 [GitHub Issues](https://github.com/ExpertVagabond/zetachain-mcp-server/issues)

---

*This MCP server enables AI assistants to interact with ZetaChain blockchain development tools seamlessly. Happy building! 🚀*