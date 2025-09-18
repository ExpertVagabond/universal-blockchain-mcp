# ZetaChain MCP Server

A Model Context Protocol server that provides AI assistants with access to ZetaChain blockchain development tools.

## Features

- **6 ZetaChain Tools**: Account management, balance queries, localnet control, faucet requests, chain info, and token listings
- **MCP Compatible**: Works with Claude Desktop, Cursor, and other MCP clients  
- **TypeScript**: Full type safety with Zod validation
- **Cross-Chain Support**: Multi-chain development with ZetaChain

## Installation

### Via NPM
```bash
npm install -g zetachain-mcp-server
```

### Via Smithery
```bash
npx @smithery/cli run @ExpertVagabond/zetachain-mcp-server
```

## Configuration

### Claude Desktop
```json
{
  "mcpServers": {
    "zetachain": {
      "command": "zetachain-mcp-server",
      "env": {
        "ZETACHAIN_NETWORK": "testnet"
      }
    }
  }
}
```

### Local Development
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

## Available Tools

1. **zetachain_accounts_list** - List all ZetaChain accounts
2. **zetachain_query_balances** - Check account balances  
3. **zetachain_localnet_check** - Check localnet status
4. **zetachain_faucet_request** - Request testnet tokens
5. **zetachain_query_chains** - List supported chains
6. **zetachain_query_tokens** - List ZRC-20 tokens

## Usage Examples

### Account Management
> "List all my ZetaChain accounts"

### Balance Queries  
> "Check the balance for my default account"

### Network Operations
> "Is the ZetaChain localnet running?"

### Faucet Requests
> "Get some testnet tokens for my account"

### Chain Information
> "Show me all supported chains"

### Token Listings
> "List all available ZRC-20 tokens"

## Requirements

- Node.js 18+
- ZetaChain CLI (installed automatically)

## Environment Variables

- `ZETACHAIN_NETWORK`: Network to use (testnet/mainnet, default: testnet)
- `ZETACHAIN_ENABLE_ANALYTICS`: Enable analytics (default: false)  
- `ZETACHAIN_DEBUG`: Enable debug logging (default: false)

## Security

- Never expose private keys in configuration
- Use environment variables for sensitive data
- Test on testnets before mainnet operations

## License

MIT

## Repository

https://github.com/ExpertVagabond/zetachain-mcp-server