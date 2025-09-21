# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-01-21

### Added
- **6 New Useful Commands**:
  - `wallet_export`: Export wallet private key or mnemonic
  - `wallet_backup`: Create encrypted backup of wallet
  - `transaction_history`: Get transaction history for an address
  - `gas_optimizer`: Optimize gas usage for smart contract transactions
  - `multisig_create`: Create a multisig wallet
  - `bridge_status`: Check status of cross-chain bridge operations

- **40+ Advanced Tools with Placeholder Implementations**:
  - **Foundry Integration**: forge_build, forge_test, forge_create, forge_verify
  - **Cast Operations**: cast_call, cast_send, cast_balance, cast_nonce, cast_gas_price, cast_block, cast_tx
  - **Anvil Testing**: anvil_start, anvil_snapshot, anvil_revert
  - **ZetaChain Advanced**: validator_create, governance_vote, governance_proposals, staking_delegate, staking_rewards
  - **Cross-Chain**: cross_chain_send, cross_chain_status
  - **Smart Contracts**: contract_compile, contract_deploy, contract_interact
  - **DeFi Operations**: defi_swap, defi_liquidity_add, defi_yield_farm
  - **NFT Operations**: nft_mint, nft_transfer, nft_metadata
  - **Blockchain Tools**: block_explorer, gas_tracker, portfolio_tracker, security_audit

- **Enhanced Documentation**:
  - Updated README with comprehensive installation methods
  - Added information about multiple MCP registries (mcp.so, PulseMCP, Glama, Fleur)
  - Detailed feature descriptions for all 50+ tools
  - Clear guidance for local vs cloud functionality

- **Development Environment**:
  - ESLint configuration for code quality
  - Prettier for code formatting
  - Jest testing framework
  - TypeScript build optimization
  - EditorConfig for consistent coding styles
  - Comprehensive test coverage

### Changed
- **Tool Handler Architecture**: Advanced tools now provide helpful guidance and installation instructions instead of failing
- **Installation Experience**: Enhanced postinstall scripts with better error handling and user feedback
- **Documentation Structure**: Reorganized installation methods with clear recommendations

### Fixed
- **TypeScript Compilation**: Resolved all compilation errors
- **Module System**: Fixed ES module compatibility issues
- **Test Coverage**: Ensured all tests pass with 100% success rate

## [Unreleased]

### Added
- ESLint configuration for code quality
- Prettier configuration for code formatting
- Jest testing framework setup
- EditorConfig for editor consistency
- Development environment configuration
- Contributing guidelines
- Comprehensive documentation

### Changed
- Enhanced development workflow with automated quality checks
- Improved project structure and organization

## [1.0.0] - 2024-01-15

### Added
- Initial release of Universal Blockchain MCP server
- Full ZetaChain CLI integration
- Cross-chain operations support
- Account management functionality
- Balance and token operations
- Network and chain information queries
- Development tools integration (Foundry)
- Smithery cloud deployment support
- Comprehensive README documentation

### Features
- **Account Management**: Create, import, list, and show account details
- **Balance Operations**: Query native and ZETA token balances
- **Cross-Chain**: Query transactions, get fees, call contracts
- **Token Operations**: List ZRC-20 tokens across chains
- **Network Info**: Get network status and chain information
- **Development**: Project creation and Foundry integration
- **Dual Mode**: Remote demo mode and local full functionality

### Supported Chains
- Ethereum (Sepolia Testnet)
- BSC (Testnet)
- Polygon (Amoy Testnet)
- Avalanche (Fuji Testnet)
- Arbitrum (Sepolia)
- Base (Sepolia)
- Bitcoin (Testnet/Signet)
- Solana (Devnet)
- TON (Testnet)
- Sui (Testnet)
- Kaia (Testnet)

## [0.1.0] - 2024-01-01

### Added
- Initial project setup
- Basic MCP server structure
- TypeScript configuration
- Package.json setup