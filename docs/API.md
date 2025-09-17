# 📚 ZetaChain MCP Server - API Documentation

This document provides comprehensive API documentation for the ZetaChain MCP Server, including all available tools, their parameters, return values, and usage examples.

## Table of Contents

1. [Overview](#overview)
2. [Tool Reference](#tool-reference)
3. [Error Handling](#error-handling)
4. [Configuration](#configuration)
5. [Advanced Usage](#advanced-usage)

## Overview

The ZetaChain MCP Server implements the Model Context Protocol (MCP) to provide AI assistants with access to ZetaChain blockchain development tools. It offers 8 primary tools for smart contract development, account management, and blockchain interaction.

### Protocol Information
- **Protocol Version**: 2024-11-05
- **Server Name**: zetachain-mcp-server
- **Server Version**: 1.0.0

## Tool Reference

### 1. create_contract

Creates a new ZetaChain smart contract project using predefined templates.

#### Parameters
```typescript
{
  name: string;           // Required: Contract project name
  template?: string;      // Optional: Template type (default: "hello")
  directory?: string;     // Optional: Target directory
}
```

#### Valid Templates
- `hello` - Basic Hello World contract (default)
- `swap` - Token swap functionality
- `nft` - NFT collection contract
- `staking` - Token staking contract
- `counter` - Simple counter contract

#### Example Request
```json
{
  "tool": "create_contract",
  "arguments": {
    "name": "my-defi-project",
    "template": "swap",
    "directory": "./contracts"
  }
}
```

#### Response Format
```json
{
  "content": [
    {
      "type": "text",
      "text": "✅ Contract project 'my-defi-project' created successfully!\n\n📁 Template: swap\n📂 Directory: ./contracts\n🔧 Command executed: zetachain new my-defi-project --template swap --path ./contracts --no-analytics\n\n📋 Output:\n[CLI output]"
    }
  ]
}
```

#### Error Cases
- Missing or empty `name` parameter
- Invalid `template` value
- Invalid `directory` path
- File system permissions issues

---

### 2. deploy_contract

Deploys a ZetaChain smart contract to specified network.

#### Parameters
```typescript
{
  contractPath: string;   // Required: Path to contract file
  network?: string;       // Optional: Target network (testnet/mainnet)
  args?: string[];        // Optional: Constructor arguments
}
```

#### Example Request
```json
{
  "tool": "deploy_contract",
  "arguments": {
    "contractPath": "./contracts/MyToken.sol",
    "network": "testnet",
    "args": ["MyToken", "MTK", "1000000"]
  }
}
```

#### Response Format
```json
{
  "content": [
    {
      "type": "text",
      "text": "🚀 Contract deployment prepared for ./contracts/MyToken.sol on testnet\n\nNote: Actual deployment requires compilation with hardhat/foundry and deployment scripts.\nRefer to ZetaChain documentation for deployment steps."
    }
  ]
}
```

---

### 3. query_chain

Queries ZetaChain blockchain for various types of information.

#### Parameters
```typescript
{
  queryType: string;      // Required: Type of query
  address?: string;       // For balance/contract queries
  txHash?: string;        // For transaction queries
  blockHeight?: string;   // For block queries
}
```

#### Query Types
- `balance` - Check address balance (requires `address`)
- `transaction` - Get transaction details (requires `txHash`)
- `block` - Get block information (optional `blockHeight`)
- `contract` - Query contract state (requires `address`)

#### Example Requests

**Balance Query:**
```json
{
  "tool": "query_chain",
  "arguments": {
    "queryType": "balance",
    "address": "0x1234567890123456789012345678901234567890"
  }
}
```

**Transaction Query:**
```json
{
  "tool": "query_chain",
  "arguments": {
    "queryType": "transaction",
    "txHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  }
}
```

**Block Query:**
```json
{
  "tool": "query_chain",
  "arguments": {
    "queryType": "block",
    "blockHeight": "12345"
  }
}
```

#### Response Format
```json
{
  "content": [
    {
      "type": "text",
      "text": "📊 Query Result:\n\n[Blockchain data]"
    }
  ]
}
```

---

### 4. manage_accounts

Manages ZetaChain accounts including creation, import, and listing.

#### Parameters
```typescript
{
  action: string;         // Required: Action to perform
  name?: string;          // For create/import actions
  privateKey?: string;    // For import action
}
```

#### Actions
- `list` - List all accounts
- `create` - Create new account (requires `name`)
- `import` - Import account from private key (requires `name` and `privateKey`)
- `export` - Export account (requires `name`)

#### Example Requests

**List Accounts:**
```json
{
  "tool": "manage_accounts",
  "arguments": {
    "action": "list"
  }
}
```

**Create Account:**
```json
{
  "tool": "manage_accounts",
  "arguments": {
    "action": "create",
    "name": "my-dev-account"
  }
}
```

**Import Account:**
```json
{
  "tool": "manage_accounts",
  "arguments": {
    "action": "import",
    "name": "imported-wallet",
    "privateKey": "0x1234567890abcdef..."
  }
}
```

#### Response Format
```json
{
  "content": [
    {
      "type": "text",
      "text": "👤 Account Management Result:\n\n[Account information]"
    }
  ]
}
```

---

### 5. get_balance

Retrieves balance information for a specific address.

#### Parameters
```typescript
{
  address: string;        // Required: Address to check
  chainId?: string;       // Optional: Specific chain ID
}
```

#### Example Request
```json
{
  "tool": "get_balance",
  "arguments": {
    "address": "0x1234567890123456789012345678901234567890",
    "chainId": "7001"
  }
}
```

#### Response Format
```json
{
  "content": [
    {
      "type": "text",
      "text": "💰 Balance Query Result:\n\n[Balance information]"
    }
  ]
}
```

---

### 6. send_transaction

Prepares transaction parameters for sending on ZetaChain.

#### Parameters
```typescript
{
  to: string;             // Required: Recipient address
  amount: string;         // Required: Amount to send
  chainId?: string;       // Optional: Target chain ID
  data?: string;          // Optional: Transaction data
}
```

#### Example Request
```json
{
  "tool": "send_transaction",
  "arguments": {
    "to": "0x1234567890123456789012345678901234567890",
    "amount": "1.5",
    "chainId": "7001",
    "data": "0xa9059cbb000000000000000000000000..."
  }
}
```

#### Response Format
```json
{
  "content": [
    {
      "type": "text",
      "text": "⚠️ Transaction preparation completed.\n\nTo: 0x1234...\nAmount: 1.5\nChain: 7001\n\nNote: For security, actual transaction sending should be confirmed manually. Use the ZetaChain CLI directly for sensitive operations."
    }
  ]
}
```

---

### 7. list_networks

Displays available ZetaChain networks and their configuration.

#### Parameters
```typescript
{
  // No parameters required
}
```

#### Example Request
```json
{
  "tool": "list_networks",
  "arguments": {}
}
```

#### Response Format
```json
{
  "content": [
    {
      "type": "text",
      "text": "🌐 ZetaChain Networks:\n\n📡 Testnet (Current: ✅)\n- Chain ID: 7001\n- RPC: https://zetachain-evm.blockpi.network/v1/rpc/public\n- Explorer: https://zetachain.blockscout.com/\n\n🚀 Mainnet (Current: ❌)\n- Chain ID: 7000\n- RPC: https://zetachain-evm.blockpi.network/v1/rpc/public\n- Explorer: https://zetachain.blockscout.com/"
    }
  ]
}
```

---

### 8. generate_wallet

Generates a new secure wallet with private key.

#### Parameters
```typescript
{
  name: string;           // Required: Wallet name
}
```

#### Example Request
```json
{
  "tool": "generate_wallet",
  "arguments": {
    "name": "my-new-wallet"
  }
}
```

#### Response Format
```json
{
  "content": [
    {
      "type": "text",
      "text": "🔐 New Wallet Generated:\n\n[Wallet details]\n\n⚠️ Important: Save your private key securely. Never share it with anyone!"
    }
  ]
}
```

---

## Error Handling

The server implements comprehensive error handling with detailed error messages.

### Error Response Format
```json
{
  "content": [
    {
      "type": "text",
      "text": "❌ Error executing 'tool_name': [Error description]"
    }
  ],
  "isError": true
}
```

### Common Error Types

#### Validation Errors
- Missing required parameters
- Invalid parameter types
- Invalid enum values
- Empty or malformed inputs

#### System Errors
- ZetaChain CLI not found
- Network connectivity issues
- File system permissions
- Command execution timeouts

#### Business Logic Errors
- Insufficient balance
- Invalid addresses
- Network not supported
- Account not found

### Error Examples

**Missing Parameter:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "❌ Error executing 'create_contract': Contract name is required and must be a non-empty string"
    }
  ],
  "isError": true
}
```

**Invalid Template:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "❌ Error executing 'create_contract': Invalid template 'invalid'. Valid templates: hello, swap, nft, staking, counter"
    }
  ],
  "isError": true
}
```

**CLI Not Found:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "❌ Error executing 'query_chain': ZetaChain CLI not found. Please install it with: npm install -g zetachain"
    }
  ],
  "isError": true
}
```

---

## Configuration

The server accepts configuration through the MCP initialization parameters.

### Configuration Schema
```typescript
{
  network?: "testnet" | "mainnet";     // Default: "testnet"
  privateKey?: string;                 // Optional private key
  rpcUrl?: string;                     // Optional custom RPC URL
  enableAnalytics?: boolean;           // Default: false
}
```

### Example Configuration
```json
{
  "network": "testnet",
  "privateKey": "0x...",
  "rpcUrl": "https://custom.rpc.url",
  "enableAnalytics": false
}
```

### Environment Variables
- `NODE_ENV` - Set to "development" for detailed error traces
- `ZETACHAIN_NETWORK` - Default network selection
- `ZETACHAIN_RPC_URL` - Default RPC URL

---

## Advanced Usage

### Performance Optimization

The server implements several performance optimizations:

1. **CLI Path Caching**: ZetaChain CLI path is resolved once and cached
2. **Command Result Caching**: Read-only operations are cached for 60 seconds
3. **Connection Pooling**: Efficient handling of multiple concurrent requests
4. **Timeout Management**: 30-second timeout for CLI operations

### Caching Behavior

Commands that benefit from caching:
- `query_chain` (all query types)
- `get_balance`
- `manage_accounts` with action "list"
- `list_networks`

Cache characteristics:
- **TTL**: 60 seconds
- **Size Limit**: 100 entries
- **Cleanup**: Automatic cleanup every 60 seconds

### Security Considerations

1. **Private Key Handling**: Private keys are never logged or cached
2. **Input Validation**: All inputs are validated before processing
3. **Command Injection Prevention**: Parameters are properly escaped
4. **Rate Limiting**: Built-in protection against excessive requests
5. **Safe Defaults**: Conservative defaults for all operations

### Debugging

Enable debug mode by setting `NODE_ENV=development`:

```bash
NODE_ENV=development node dist/index.js
```

Debug mode provides:
- Detailed error stack traces
- Command execution timing
- Cache hit/miss information
- CLI path resolution details

---

## Integration Examples

### Claude Desktop Integration
```json
{
  "mcpServers": {
    "zetachain": {
      "command": "node",
      "args": ["/path/to/zetachain-mcp-server/dist/index.js"],
      "env": {
        "ZETACHAIN_NETWORK": "testnet",
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Cursor IDE Integration
```json
{
  "mcpServers": {
    "zetachain": {
      "command": "npx",
      "args": ["-y", "@smithery/cli", "run", "ExpertVagabond/zetachain-mcp-server"],
      "env": {
        "ZETACHAIN_NETWORK": "testnet"
      }
    }
  }
}
```

### Programmatic Usage
```typescript
import { ZetaChainMCPServer } from 'zetachain-mcp-server';

const server = new ZetaChainMCPServer();
server.updateConfig({
  network: 'testnet',
  enableAnalytics: false
});

await server.run();
```

---

## Support and Resources

- **Documentation**: [ZetaChain Docs](https://docs.zetachain.com)
- **GitHub Repository**: [zetachain-mcp-server](https://github.com/ExpertVagabond/zetachain-mcp-server)
- **Issues**: [GitHub Issues](https://github.com/ExpertVagabond/zetachain-mcp-server/issues)
- **Discord**: [ZetaChain Community](https://discord.gg/zetachain)

---

*This API documentation covers all available functionality in the ZetaChain MCP Server v1.0.0. For the latest updates and examples, please refer to the GitHub repository.*