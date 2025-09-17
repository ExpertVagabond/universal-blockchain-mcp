# ZetaChain MCP Server - Feature Overview

## 🚀 Core Features

### 1. Smart Contract Management
- **Create Contracts**: Generate new ZetaChain smart contract projects with various templates
  - Available templates: `hello`, `swap`, `nft`, `staking`, `counter`
  - Custom directory support
  - Analytics control (can be disabled)
  
- **Deploy Contracts**: Prepare contracts for deployment (with security notes)
  - Network selection (testnet/mainnet)
  - Constructor arguments support
  - Deployment guidance

### 2. Blockchain Querying
- **Balance Queries**: Check account balances across different chains
- **Transaction Queries**: Look up transaction details by hash
- **Block Queries**: Query block information (latest or specific height)
- **Contract Queries**: Query smart contract state

### 3. Account Management
- **Create Accounts**: Generate new ZetaChain accounts
- **Import Accounts**: Import existing accounts with private keys
- **List Accounts**: View all managed accounts
- **Export Accounts**: Export account information

### 4. Transaction Handling
- **Send Transactions**: Prepare transactions (with security warnings)
  - Address validation
  - Amount validation
  - Chain ID support
  - Data payload support
- **Security Features**: Manual confirmation required for actual sending

### 5. Network Management
- **List Networks**: Display available ZetaChain networks
  - Testnet (Chain ID: 7001)
  - Mainnet (Chain ID: 7000)
  - RPC endpoints and explorer links

### 6. Wallet Generation
- **Generate Wallets**: Create new wallets with secure key generation
- **Security Warnings**: Clear instructions for key storage

## 🔧 Technical Features

### MCP Protocol Support
- **Model Context Protocol**: Full MCP 2024-11-05 compliance
- **Tool Definitions**: Comprehensive tool schemas with validation
- **Error Handling**: Robust error handling with detailed messages
- **Configuration**: Flexible configuration system

### CLI Integration
- **ZetaChain CLI v6.3.1**: Latest version integration
- **Local/Global Fallback**: Automatic CLI detection
- **Command Execution**: Safe command execution with error reporting
- **Stderr Handling**: Proper error stream processing

### Security Features
- **Input Validation**: Comprehensive parameter validation
- **Address Validation**: Ethereum address format checking
- **Amount Validation**: Numeric validation for transactions
- **Template Validation**: Restricted template options
- **Security Warnings**: Clear warnings for sensitive operations

### Configuration Options
- **Network Selection**: testnet/mainnet support
- **Private Key**: Optional private key configuration
- **RPC URL**: Custom RPC endpoint support
- **Analytics**: Optional analytics collection control

## 🛠️ Development Features

### TypeScript Support
- **Full TypeScript**: Complete type safety
- **Source Maps**: Debug support
- **Declaration Files**: Type definitions included
- **Strict Mode**: Enhanced type checking

### Build System
- **ES2022 Target**: Modern JavaScript features
- **ES Modules**: Native ES module support
- **Tree Shaking**: Optimized bundle size
- **Development Mode**: Watch mode for development

### Testing
- **Integration Tests**: Comprehensive test suite
- **MCP Protocol Tests**: Protocol compliance testing
- **CLI Integration Tests**: ZetaChain CLI integration testing
- **Error Handling Tests**: Error scenario testing

## 📦 Deployment Features

### NPM Package
- **Global Installation**: `npm install -g zetachain-mcp-server`
- **Local Installation**: Project dependency support
- **Binary Support**: Executable binary included
- **Version Management**: Semantic versioning

### Smithery Integration
- **Smithery Deploy**: One-command deployment
- **Configuration Export**: Schema export for Smithery
- **Server Factory**: `createServer()` function for Smithery

### Claude Desktop Integration
- **Configuration**: Easy Claude Desktop setup
- **Environment Variables**: Flexible configuration
- **Stdio Transport**: Standard input/output communication

## 🔍 Error Handling & Logging

### Error Types
- **Validation Errors**: Input parameter validation
- **CLI Errors**: ZetaChain CLI execution errors
- **Network Errors**: Connection and RPC errors
- **Configuration Errors**: Invalid configuration handling

### Logging
- **Console Error**: Server status logging
- **Stderr Logging**: CLI error stream logging
- **Debug Information**: Detailed error messages
- **User-Friendly Messages**: Clear error descriptions

## 🚦 Status & Health

### Server Status
- **Startup**: Automatic server initialization
- **Health Checks**: Built-in health monitoring
- **Graceful Shutdown**: Proper cleanup on exit
- **Process Management**: PID tracking and management

### Dependencies
- **ZetaChain CLI**: v6.3.1 (latest)
- **MCP SDK**: v0.5.0
- **Zod**: v3.22.4 (validation)
- **Node.js**: >=18 requirement

## 📊 Performance Features

### Command Execution
- **Async/Await**: Non-blocking operations
- **Promise-based**: Modern async patterns
- **Timeout Handling**: Command execution timeouts
- **Resource Management**: Proper resource cleanup

### Memory Management
- **Stream Processing**: Efficient data streaming
- **Buffer Management**: Optimized memory usage
- **Garbage Collection**: Automatic cleanup
- **Memory Monitoring**: Built-in memory tracking

## 🔐 Security Considerations

### Data Protection
- **Private Key Handling**: Secure key management
- **No Key Storage**: Keys not persisted by default
- **Environment Variables**: Secure configuration
- **Input Sanitization**: All inputs validated

### Transaction Safety
- **Manual Confirmation**: No automatic transaction sending
- **Validation Layers**: Multiple validation checks
- **Error Prevention**: Comprehensive error checking
- **User Warnings**: Clear security warnings

## 🌐 Network Support

### Supported Networks
- **ZetaChain Testnet**: Development and testing
- **ZetaChain Mainnet**: Production deployment
- **Custom RPC**: Custom endpoint support
- **Chain ID Support**: Multi-chain operations

### RPC Endpoints
- **Default RPC**: `https://zetachain-evm.blockpi.network/v1/rpc/public`
- **Custom RPC**: User-configurable endpoints
- **Failover Support**: Automatic fallback handling
- **Connection Monitoring**: RPC health checks