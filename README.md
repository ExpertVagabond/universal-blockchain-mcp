# ZetaChain MCP Server

A comprehensive Model Context Protocol (MCP) server for ZetaChain blockchain development, providing full access to ZetaChain CLI functionality through AI assistants.

## Features

### 🔐 Account Management
- **create_account**: Create new ZetaChain accounts with mnemonic phrases
- **import_account**: Import existing accounts using private keys or mnemonics  
- **list_accounts**: List all available ZetaChain accounts
- **show_account**: Show detailed account information

### 💰 Balance & Token Operations
- **get_balances**: Fetch native and ZETA token balances across chains
- **list_tokens**: List all ZRC-20 tokens with addresses and chain info
- **request_faucet**: Request testnet ZETA tokens from the faucet

### 🌐 Cross-Chain Operations
- **query_cctx**: Query cross-chain transaction data in real-time
- **get_fees**: Fetch omnichain and cross-chain messaging fees
- **call_contract**: Call contracts on connected chains from ZetaChain
- **withdraw_tokens**: Withdraw tokens from ZetaChain to connected chains
- **withdraw_and_call**: Withdraw tokens and call contracts in one operation

### ⛓️ Network & Chain Information
- **list_chains**: List all supported chains with IDs and token counts
- **get_network_info**: Get current ZetaChain network status and information

### 🛠️ Development Tools  
- **create_project**: Create new universal contract projects with templates
- **check_foundry**: Verify Foundry (forge, cast, anvil) installation and versions

## Installation

### Method 1: Claude Code CLI (Recommended)

```bash
claude mcp add --transport http zetachain-mcp "https://server.smithery.ai/@ExpertVagabond/zetachain-mcp-server/mcp"
```

### Method 2: Deep Links

**HTTP Transport (Hosted):**
```
claude://mcp/install?name=ZetaChain%20MCP%20Server&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fserver.smithery.ai%2F%40ExpertVagabond%2Fzetachain-mcp-server%2Fmcp%22%7D
```

**stdio Transport (Local):**
```
claude://mcp/install?name=ZetaChain%20MCP%20Server&config=%7B%22type%22%3A%22stdio%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40smithery%2Fcli%40latest%22%2C%22run%22%2C%22%40ExpertVagabond%2Fzetachain-mcp-server%22%5D%7D
```

### Method 3: Manual Configuration

**HTTP Configuration:**
```json
{
  "type": "http",
  "url": "https://server.smithery.ai/@ExpertVagabond/zetachain-mcp-server/mcp"
}
```

**stdio Configuration:**
```json
{
  "type": "stdio", 
  "command": "npx",
  "args": ["-y", "@smithery/cli@latest", "run", "@ExpertVagabond/zetachain-mcp-server"]
}
```

### Manual Installation

#### Prerequisites
- Node.js 18+
- ZetaChain CLI (installed automatically)
- Foundry (for smart contract development - installed automatically)

#### Quick Setup
```bash
# Clone and setup everything
git clone https://github.com/ExpertVagabond/zetachain-mcp-server.git
cd zetachain-mcp-server
npm run setup  # Installs dependencies, CLI, and builds project
```

#### Manual Setup
```bash
# 1. Clone repository
git clone https://github.com/ExpertVagabond/zetachain-mcp-server.git
cd zetachain-mcp-server

# 2. Install dependencies (includes ZetaChain CLI via npm)
npm install

# 3. Install ZetaChain CLI globally (optional, recommended)
npm install -g zetachain@latest

# 4. Build the project
npm run build

# 5. Run the server
npm start
```

#### Using Local ZetaChain Installation
If you have ZetaChain CLI installed locally, you can specify the path:
```bash
export ZETACHAIN_CLI_PATH=/path/to/zetachain
npm start
```

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

## Usage Examples

Once added to Claude, you can use all ZetaChain functionality through natural language:

### Account Management
```
Create a new ZetaChain account called "my-wallet"
Import my existing account using this private key: 0x...
Show me all my ZetaChain accounts
```

### Cross-Chain Operations
```
Check ZETA balances for address 0x742d35Cc6634C0532925a3b8D5C20aE6f0f3FFaa
What are the current cross-chain fees from Ethereum to Polygon?
Query the status of cross-chain transaction 0xabc123...
Withdraw 100 ZETA from ZetaChain to Ethereum address 0x...
```

### Token & Chain Information  
```
List all supported chains on ZetaChain
Show me all ZRC-20 tokens
What tokens are available on BSC testnet?
```

### Development
```
Create a new ZetaChain project called "my-dapp" 
Get testnet ZETA tokens for address 0x...
What's the current ZetaChain testnet status?
```

## Supported Chains

ZetaChain MCP server supports all ZetaChain connected chains:

- **Ethereum** (Sepolia Testnet)
- **BSC** (Testnet) 
- **Polygon** (Amoy Testnet)
- **Avalanche** (Fuji Testnet)
- **Arbitrum** (Sepolia)
- **Base** (Sepolia)
- **Bitcoin** (Testnet/Signet)
- **Solana** (Devnet)
- **TON** (Testnet)
- **Sui** (Testnet)
- **Kaia** (Testnet)

## Requirements

- Node.js 18+
- ZetaChain CLI (installed automatically as dependency)
- Foundry (for smart contract development - installed automatically)

## Architecture

This MCP server provides a bridge between AI assistants and the ZetaChain CLI, enabling:

- **Direct CLI Integration**: All commands are executed through the official ZetaChain CLI
- **Real-time Data**: Live blockchain data from ZetaChain networks  
- **Cross-chain Functionality**: Full access to ZetaChain's omnichain capabilities
- **Developer Tools**: Project creation, account management, and testing utilities

## License

MIT