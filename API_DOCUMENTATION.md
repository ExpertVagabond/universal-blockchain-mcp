# ZetaChain MCP Server API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Available Tools](#available-tools)
5. [API Reference](#api-reference)
6. [Examples](#examples)
7. [Error Handling](#error-handling)
8. [Security](#security)

## Overview

The ZetaChain MCP Server provides a Model Context Protocol interface for interacting with ZetaChain blockchain development tools. It exposes 14 tools that enable AI assistants to perform blockchain operations, manage contracts, and handle cross-chain interactions.

### Protocol Version
- MCP Protocol: `2024-11-05`
- Server Version: `1.0.0`
- ZetaChain CLI: `6.3.1`

## Installation

### Via NPM
```bash
npm install -g zetachain-mcp-server
```

### Via Docker
```bash
docker pull ghcr.io/expertvagabond/zetachain-mcp-server:latest
```

### From Source
```bash
git clone https://github.com/ExpertVagabond/zetachain-mcp-server.git
cd zetachain-mcp-server
npm install
npm run build
```

## Configuration

### Environment Variables
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ZETACHAIN_NETWORK` | `string` | `testnet` | Network to connect to (`testnet` or `mainnet`) |
| `PRIVATE_KEY` | `string` | - | Private key for transactions (optional) |
| `RPC_URL` | `string` | - | Custom RPC endpoint URL (optional) |
| `ENABLE_ANALYTICS` | `boolean` | `false` | Enable analytics collection |

### Claude Desktop Configuration
```json
{
  "mcpServers": {
    "zetachain": {
      "command": "node",
      "args": ["/path/to/zetachain-mcp/dist/index.js"],
      "env": {
        "ZETACHAIN_NETWORK": "testnet",
        "ENABLE_ANALYTICS": "false"
      }
    }
  }
}
```

## Available Tools

### Core Contract Tools

#### 1. `create_contract`
Create a new ZetaChain smart contract project.

**Parameters:**
- `name` (string, required): Name of the contract project
- `template` (string, optional): Contract template (`hello`, `swap`, `nft`, `staking`, `counter`)
- `directory` (string, optional): Directory to create the project in

**Example:**
```json
{
  "name": "create_contract",
  "arguments": {
    "name": "my-defi-contract",
    "template": "swap",
    "directory": "./contracts"
  }
}
```

#### 2. `deploy_contract`
Deploy a smart contract to ZetaChain.

**Parameters:**
- `contractPath` (string, required): Path to the contract to deploy
- `network` (string, optional): Network to deploy to (`testnet`, `mainnet`)
- `args` (array, optional): Constructor arguments

**Example:**
```json
{
  "name": "deploy_contract",
  "arguments": {
    "contractPath": "./contracts/MyToken.sol",
    "network": "testnet",
    "args": ["1000000", "MyToken", "MTK"]
  }
}
```

### Blockchain Query Tools

#### 3. `query_chain`
Query ZetaChain for blockchain information.

**Parameters:**
- `queryType` (string, required): Type of query (`balance`, `transaction`, `block`, `contract`)
- `address` (string, conditional): Required for balance/contract queries
- `txHash` (string, conditional): Required for transaction queries
- `blockHeight` (string, optional): Block height for block queries

**Example:**
```json
{
  "name": "query_chain",
  "arguments": {
    "queryType": "balance",
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2"
  }
}
```

#### 4. `get_balance`
Get balance for a specific address.

**Parameters:**
- `address` (string, required): Address to check balance for
- `chainId` (string, optional): Chain ID to check balance on

**Example:**
```json
{
  "name": "get_balance",
  "arguments": {
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2",
    "chainId": "7001"
  }
}
```

### Account Management Tools

#### 5. `manage_accounts`
Manage ZetaChain accounts.

**Parameters:**
- `action` (string, required): Action to perform (`list`, `create`, `import`, `export`)
- `name` (string, conditional): Required for create/import/export
- `privateKey` (string, conditional): Required for import

**Example:**
```json
{
  "name": "manage_accounts",
  "arguments": {
    "action": "create",
    "name": "dev-account"
  }
}
```

#### 6. `generate_wallet`
Generate a new ZetaChain wallet.

**Parameters:**
- `name` (string, required): Name for the new wallet

**Example:**
```json
{
  "name": "generate_wallet",
  "arguments": {
    "name": "trading-wallet"
  }
}
```

### Transaction Tools

#### 7. `send_transaction`
Send a transaction on ZetaChain.

**Parameters:**
- `to` (string, required): Recipient address
- `amount` (string, required): Amount to send
- `chainId` (string, optional): Target chain ID
- `data` (string, optional): Transaction data for contract calls

**Example:**
```json
{
  "name": "send_transaction",
  "arguments": {
    "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2",
    "amount": "1.5",
    "chainId": "7001"
  }
}
```

#### 8. `request_faucet`
Request testnet ZETA tokens from the faucet.

**Parameters:**
- `address` (string, required): Address to send testnet tokens to
- `amount` (string, optional): Amount of tokens to request (default: "1.0")

**Example:**
```json
{
  "name": "request_faucet",
  "arguments": {
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2",
    "amount": "5.0"
  }
}
```

### Network Tools

#### 9. `list_networks`
List available ZetaChain networks and their information.

**Parameters:** None

**Example:**
```json
{
  "name": "list_networks",
  "arguments": {}
}
```

#### 10. `localnet_manage`
Manage local development environment for ZetaChain.

**Parameters:**
- `action` (string, required): Action to perform (`start`, `stop`, `status`, `reset`)
- `config` (object, optional): Configuration options
  - `port` (number): Port for localnet RPC
  - `verbose` (boolean): Enable verbose logging

**Example:**
```json
{
  "name": "localnet_manage",
  "arguments": {
    "action": "start",
    "config": {
      "port": 8545,
      "verbose": true
    }
  }
}
```

### Cross-Chain Tools

#### 11. `cross_chain_message`
Send cross-chain messages between different blockchains.

**Parameters:**
- `sourceChain` (string, required): Source blockchain (`ethereum`, `bsc`, `polygon`, `bitcoin`, `solana`)
- `targetChain` (string, required): Target blockchain
- `message` (string, required): Message or data to send
- `recipient` (string, required): Recipient address on target chain

**Example:**
```json
{
  "name": "cross_chain_message",
  "arguments": {
    "sourceChain": "ethereum",
    "targetChain": "polygon",
    "message": "0x1234...",
    "recipient": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2"
  }
}
```

### EVM Tools

#### 12. `evm_call`
Execute EVM-specific operations on ZetaChain.

**Parameters:**
- `operation` (string, required): Operation to perform (`deploy`, `call`, `query`, `estimate-gas`)
- `contract` (string, conditional): Contract address or bytecode
- `method` (string, conditional): Method to call
- `params` (array, optional): Parameters for the method call

**Example:**
```json
{
  "name": "evm_call",
  "arguments": {
    "operation": "call",
    "contract": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2",
    "method": "transfer",
    "params": ["0xRecipient...", "1000000"]
  }
}
```

### Bitcoin Tools

#### 13. `bitcoin_operations`
Perform Bitcoin-related operations through ZetaChain.

**Parameters:**
- `operation` (string, required): Operation (`deposit`, `withdraw`, `query-utxo`, `get-address`)
- `address` (string, conditional): Bitcoin address
- `amount` (string, conditional): Amount in BTC
- `txHash` (string, conditional): Transaction hash for queries

**Example:**
```json
{
  "name": "bitcoin_operations",
  "arguments": {
    "operation": "deposit",
    "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "amount": "0.001"
  }
}
```

### Solana Tools

#### 14. `solana_operations`
Perform Solana-related operations through ZetaChain.

**Parameters:**
- `operation` (string, required): Operation (`deposit`, `withdraw`, `query-account`, `get-balance`)
- `address` (string, conditional): Solana address
- `amount` (string, conditional): Amount in SOL
- `programId` (string, optional): Solana program ID for interactions

**Example:**
```json
{
  "name": "solana_operations",
  "arguments": {
    "operation": "get-balance",
    "address": "7VfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"
  }
}
```

## API Reference

### Initialize Request
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {
      "name": "your-client",
      "version": "1.0.0"
    },
    "meta": {
      "config": {
        "network": "testnet",
        "enableAnalytics": false
      }
    }
  }
}
```

### List Tools Request
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list",
  "params": {}
}
```

### Call Tool Request
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "tool_name",
    "arguments": {
      // tool-specific arguments
    }
  }
}
```

## Examples

### Complete Contract Deployment Flow
```javascript
// 1. Create a new contract project
await callTool("create_contract", {
  name: "my-token",
  template: "nft"
});

// 2. Deploy the contract
await callTool("deploy_contract", {
  contractPath: "./my-token/contracts/MyToken.sol",
  network: "testnet"
});

// 3. Query the deployed contract
await callTool("query_chain", {
  queryType: "contract",
  address: "0xDeployedContractAddress"
});
```

### Cross-Chain Transaction Flow
```javascript
// 1. Check balance on source chain
await callTool("get_balance", {
  address: "0xYourAddress",
  chainId: "1" // Ethereum
});

// 2. Send cross-chain message
await callTool("cross_chain_message", {
  sourceChain: "ethereum",
  targetChain: "polygon",
  message: "Transfer 100 USDC",
  recipient: "0xRecipientAddress"
});

// 3. Verify on target chain
await callTool("query_chain", {
  queryType: "transaction",
  txHash: "0xTransactionHash"
});
```

## Error Handling

The server returns structured error responses:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: Description of the error"
    }
  ],
  "isError": true
}
```

### Common Error Codes
- `INVALID_PARAMS`: Missing or invalid parameters
- `NETWORK_ERROR`: Network connection issues
- `CLI_ERROR`: ZetaChain CLI execution error
- `PERMISSION_DENIED`: Insufficient permissions
- `RATE_LIMIT`: Rate limit exceeded (faucet)

## Security

### Best Practices
1. **Never expose private keys** in configuration or logs
2. **Use environment variables** for sensitive data
3. **Test on testnet** before mainnet operations
4. **Implement rate limiting** for production deployments
5. **Use secure RPC endpoints** with authentication
6. **Enable TLS/SSL** for network communications
7. **Audit smart contracts** before deployment

### Sensitive Operations
The following operations require extra caution:
- `send_transaction`: Transfers funds
- `deploy_contract`: Deploys immutable code
- `manage_accounts` (import): Handles private keys
- `bitcoin_operations` (withdraw): Moves Bitcoin
- `solana_operations` (withdraw): Moves Solana

### Recommended Deployment
For production use:
1. Run in Docker container with resource limits
2. Use read-only filesystem where possible
3. Implement request validation and sanitization
4. Log all operations for audit trail
5. Use secrets management service for keys
6. Implement automatic backups
7. Monitor for suspicious activity

## Support

- **GitHub Issues**: [https://github.com/ExpertVagabond/zetachain-mcp-server/issues](https://github.com/ExpertVagabond/zetachain-mcp-server/issues)
- **ZetaChain Docs**: [https://docs.zetachain.com](https://docs.zetachain.com)
- **MCP Documentation**: [https://modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Discord Community**: [ZetaChain Discord](https://discord.gg/zetachain)

## License

MIT License - See LICENSE file for details