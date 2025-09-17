# ZetaChain MCP Server

A Model Context Protocol (MCP) server that provides access to ZetaChain CLI functionality for AI assistants like Claude.

## Features

This MCP server wraps the ZetaChain CLI and provides the following tools:

- **create_contract**: Create new ZetaChain smart contract projects
- **deploy_contract**: Deploy smart contracts to ZetaChain
- **query_chain**: Query blockchain data (balances, transactions, blocks)
- **manage_accounts**: Create and manage ZetaChain accounts
- **get_balance**: Check account balances
- **send_transaction**: Prepare and send transactions
- **list_networks**: Display available networks
- **generate_wallet**: Create new wallets

## Installation

### Prerequisites

- Node.js 18+
- ZetaChain CLI installed globally (`npm install -g zetachain`)

### Local Installation

1. Clone this repository:
```bash
git clone <your-repo-url>
cd zetachain-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

### Via NPM (when published)

```bash
npm install -g zetachain-mcp-server
```

## Usage

### With Claude Desktop

Add this configuration to your Claude Desktop config file:

```json
{
  "mcpServers": {
    "zetachain": {
      "command": "node",
      "args": ["/path/to/zetachain-mcp/dist/index.js"],
      "env": {
        "ZETACHAIN_NETWORK": "testnet"
      }
    }
  }
}
```

### With Smithery

Deploy to Smithery marketplace:

```bash
npx @smithery/cli deploy .
```

## Configuration

The server accepts the following configuration options:

- `network`: Network to connect to (`testnet` | `mainnet`, default: `testnet`)
- `privateKey`: Private key for transactions (optional)
- `rpcUrl`: Custom RPC URL (optional)
- `enableAnalytics`: Enable analytics collection (default: `false`)

## Development

### Running locally

```bash
npm run dev
```

### Testing

```bash
node test-server.js
```

## Security Notes

- Never share private keys or expose them in configuration
- Use environment variables for sensitive data
- Test on testnets before mainnet operations
- The server provides transaction preparation but manual confirmation is recommended for sensitive operations

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

For issues and questions:
- GitHub Issues: [Repository Issues](https://github.com/your-username/zetachain-mcp-server/issues)
- ZetaChain Documentation: [https://docs.zetachain.com](https://docs.zetachain.com)