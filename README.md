# Universal Blockchain MCP

A comprehensive Model Context Protocol (MCP) server for universal blockchain development, providing full access to ZetaChain CLI, Foundry, and cross-chain functionality through AI assistants.

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

### 🔧 **Advanced Tools (50+ Available)**
- **Foundry Integration**: forge_build, forge_test, forge_create, forge_verify
- **Cast Operations**: cast_call, cast_send, cast_balance, cast_nonce, cast_gas_price
- **Anvil Testing**: anvil_start, anvil_snapshot, anvil_revert
- **ZetaChain Advanced**: validator_create, governance_vote, staking_delegate, staking_rewards
- **Cross-Chain**: cross_chain_send, cross_chain_status, bridge_status
- **Smart Contracts**: contract_compile, contract_deploy, contract_interact
- **DeFi Operations**: defi_swap, defi_liquidity_add, defi_yield_farm
- **NFT Operations**: nft_mint, nft_transfer, nft_metadata
- **Wallet Management**: wallet_export, wallet_backup, transaction_history
- **Security & Analysis**: security_audit, gas_optimizer, multisig_create
- **Blockchain Tools**: block_explorer, gas_tracker, portfolio_tracker

> **Note**: Advanced tools provide full functionality when installed locally via NPM. Cloud versions provide helpful guidance and installation instructions.

## Installation

### 🚀 **Method 1: NPM Package (Recommended for Full Functionality)**

**One-Click Install with Auto-Setup:**
```bash
npm install -g @ExpertVagabond/universal-blockchain-mcp
```

This automatically installs:
- ✅ ZetaChain CLI globally
- ✅ Foundry toolkit (forge, cast, anvil)
- ✅ All 50+ MCP tools with full functionality
- ✅ Complete development environment

**Usage after installation:**
```bash
# Run the MCP server
universal-blockchain-mcp

# Or use with Claude Desktop
# Add to Claude Desktop config:
{
  "mcpServers": {
    "universal-blockchain": {
      "command": "universal-blockchain-mcp",
      "args": []
    }
  }
}
```

### 🌐 **Method 2: Smithery Cloud (Hosted)**

**Claude Code CLI:**
```bash
claude mcp add --transport http universal-blockchain "https://server.smithery.ai/@ExpertVagabond/universal-blockchain/mcp"
```

**Deep Link (HTTP):**
```
claude://mcp/install?name=Universal%20Blockchain%20MCP&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fserver.smithery.ai%2F%40ExpertVagabond%2Funiversal-blockchain%2Fmcp%22%7D
```

**Manual Configuration:**
```json
{
  "type": "http",
  "url": "https://server.smithery.ai/@ExpertVagabond/universal-blockchain/mcp"
}
```

### 📦 **Method 3: Other MCP Registries**

**mcp.so Registry:**
- Visit: https://mcp.so
- Search: "universal-blockchain-mcp"
- One-click install available

**PulseMCP Directory:**
- Visit: https://pulsemcp.com
- Browse: Blockchain & Web3 category
- Direct integration with Cursor, Claude, Cline

**Glama Registry:**
- Visit: https://glama.ai
- Search: "ZetaChain" or "blockchain"
- Multi-tool ecosystem integration

**Fleur (Mac + Claude):**
- Visit: https://fleur.ai
- Zero-code MCP installation
- Perfect for non-technical users

### 🔧 **Method 4: Manual Configuration**

**stdio Configuration (Local):**
```json
{
  "type": "stdio", 
  "command": "npx",
  "args": ["-y", "@ExpertVagabond/universal-blockchain-mcp"]
}
```

**Custom CLI Path:**
```json
{
  "type": "stdio",
  "command": "/path/to/universal-blockchain-mcp",
  "args": []
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