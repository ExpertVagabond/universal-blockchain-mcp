# ZetaChain MCP Server

A Model Context Protocol (MCP) server for ZetaChain blockchain interactions, providing tools for balance checking, network information, and cross-chain fee estimation.

## Features

- **get_zetachain_balance**: Check ZetaChain token balance for any address
- **get_zetachain_network_info**: Get current ZetaChain network information
- **estimate_cross_chain_fee**: Estimate fees for cross-chain transactions

## Installation

### Using Claude Code

```bash
claude mcp add --transport http zetachain-mcp "https://server.smithery.ai/@ExpertVagabond/zetachain-mcp-server/mcp"
```

### Manual Installation

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run the server: `npm start`

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Usage

Once added to Claude, you can use the following tools:

### Check Balance
```
What's the ZETA balance for address 0x1234...?
```

### Get Network Info
```
Show me the current ZetaChain network status
```

### Estimate Cross-Chain Fees
```
What would it cost to send 100 ZETA from Ethereum to Bitcoin?
```

## API Reference

### get_zetachain_balance

Get the ZetaChain token balance for a specific address.

**Parameters:**
- `address` (string, required): The wallet address to check

### get_zetachain_network_info

Get current ZetaChain network information including chain ID, block height, and status.

**Parameters:** None

### estimate_cross_chain_fee

Estimate fees for cross-chain transactions between supported networks.

**Parameters:**
- `fromChain` (string, required): Source chain identifier
- `toChain` (string, required): Destination chain identifier  
- `amount` (string, required): Amount to transfer

## License

MIT