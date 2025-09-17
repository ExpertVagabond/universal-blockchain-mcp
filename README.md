# ZetaChain MCP Server

A Model Context Protocol server that provides AI assistants with access to ZetaChain blockchain development tools.

## Features

- **8 ZetaChain Tools**: Smart contract creation, deployment, account management, and blockchain queries
- **MCP Compatible**: Works with Claude Desktop, Cursor, and other MCP clients
- **TypeScript**: Full type safety with Zod validation
- **Local & Global CLI**: Supports both local and global ZetaChain CLI installations

## Installation

```bash
npm install -g zetachain-mcp-server
```

Or clone and build locally:

```bash
git clone https://github.com/ExpertVagabond/zetachain-mcp-server.git
cd zetachain-mcp-server
npm install
npm run build
```

## Configuration

### Claude Desktop

Add to your Claude Desktop configuration file:

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

1. **create_contract** - Create new smart contract projects
2. **deploy_contract** - Deploy contracts to networks
3. **query_chain** - Query blockchain data
4. **manage_accounts** - Account management
5. **get_balance** - Check balances
6. **send_transaction** - Send transactions
7. **list_networks** - Network information
8. **generate_wallet** - Create wallets

## Usage Examples

### Create a Smart Contract

Ask your AI assistant:
> "Create a new ZetaChain contract called 'my-token' using the counter template"

### Check Network Information

> "Show me the available ZetaChain networks"

### Manage Accounts

> "List all my ZetaChain accounts"

### Query Blockchain

> "Check the balance for address 0x1234..."

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm run test

# Start development
npm run dev
```

## Requirements

- Node.js 18+
- ZetaChain CLI (installed automatically as dependency)

## License

MIT

## Repository

https://github.com/ExpertVagabond/zetachain-mcp-server