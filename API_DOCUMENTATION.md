# ZetaChain MCP Server API Documentation

## Overview
The ZetaChain MCP Server provides a Model Context Protocol interface for interacting with ZetaChain blockchain operations. This enhanced version includes comprehensive monitoring, logging, and performance optimization features.

## Server Information
- **Name**: zetachain-mcp-server
- **Version**: 1.0.0
- **Protocol Version**: 2024-11-05
- **License**: MIT

## Available Tools

### 🔧 Blockchain Operations

#### `create_contract`
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
    "name": "my-contract",
    "template": "hello",
    "directory": "./contracts"
  }
}
```

#### `deploy_contract`
Deploy a ZetaChain smart contract.

**Parameters:**
- `contractPath` (string, required): Path to the contract to deploy
- `network` (string, optional): Network to deploy to (`testnet`, `mainnet`)
- `args` (array, optional): Constructor arguments for the contract

#### `query_chain`
Query ZetaChain for information.

**Parameters:**
- `queryType` (string, required): Type of query (`balance`, `transaction`, `block`, `contract`)
- `address` (string): Address to query (for balance/contract queries)
- `txHash` (string): Transaction hash (for transaction queries)
- `blockHeight` (string): Block height (for block queries)

#### `manage_accounts`
Manage ZetaChain accounts.

**Parameters:**
- `action` (string, required): Action to perform (`list`, `create`, `import`, `export`)
- `name` (string): Account name (for create/import actions)
- `privateKey` (string): Private key (for import action)

#### `get_balance`
Get balance for a ZetaChain address.

**Parameters:**
- `address` (string, required): Address to check balance for
- `chainId` (string, optional): Chain ID to check balance on

**Validation:**
- Address format is validated using regex patterns
- Supports Ethereum (0x...), ZetaChain (zeta...), and Bitcoin formats

#### `send_transaction`
Send a transaction on ZetaChain.

**Parameters:**
- `to` (string, required): Recipient address
- `amount` (string, required): Amount to send
- `chainId` (string, optional): Target chain ID
- `data` (string, optional): Transaction data (for contract calls)

**Security Note:** This tool provides preparation only. Actual transaction sending requires manual confirmation.

#### `list_networks`
List available ZetaChain networks and their information.

**Caching:** Results are cached for 10 minutes to improve performance.

**Response includes:**
- Testnet information (Chain ID: 7001)
- Mainnet information (Chain ID: 7000)
- RPC endpoints and explorers
- Current network status

#### `generate_wallet`
Generate a new ZetaChain wallet.

**Parameters:**
- `name` (string, required): Name for the new wallet

### 📊 Monitoring & Diagnostics

#### `health_check`
Check the health status of the ZetaChain MCP server.

**Returns:**
- Overall health status (`healthy`, `degraded`, `unhealthy`)
- Component status (ZetaChain CLI, Configuration, Dependencies)
- Uptime and memory usage
- Response times for critical components

**Example Response:**
```
✅ **Health Status: HEALTHY**

🕒 **Uptime:** 1234s
📦 **Version:** 1.0.0
🧠 **Memory:** 45MB used

**Component Status:**
✅ **zetachainCli**: ZetaChain CLI is accessible and responsive
   Response time: 123ms
✅ **configuration**: Configuration is valid
✅ **dependencies**: All dependencies are available and memory usage is normal
```

#### `get_metrics`
Get performance metrics and statistics.

**Parameters:**
- `detailed` (boolean, optional): Include detailed metrics (default: false)

**Returns:**
- Tool call statistics (total, successful, failed, average response time)
- Cache performance (hits, misses, hit rate)
- Memory usage information
- Uptime
- Recent calls (when detailed=true)

#### `get_logs`
Retrieve recent log entries.

**Parameters:**
- `level` (string, optional): Filter logs by level (`DEBUG`, `INFO`, `WARN`, `ERROR`)
- `count` (number, optional): Number of log entries to retrieve (1-500, default: 50)

**Log Format:**
- Timestamp
- Log level with icon
- Message
- Context (if available)
- Error details (if applicable)

#### `clear_cache`
Clear the server cache to free memory.

**Parameters:**
- `confirm` (boolean, required): Confirmation flag (must be true)

**Returns:**
- Previous cache statistics
- Confirmation of cache clearing

## Configuration

### Environment Variables
- `LOG_LEVEL`: Set logging level (`DEBUG`, `INFO`, `WARN`, `ERROR`)

### Configuration Schema
```typescript
{
  network: 'testnet' | 'mainnet',
  privateKey?: string,
  rpcUrl?: string,
  enableAnalytics: boolean
}
```

### Default Configuration
```json
{
  "network": "testnet",
  "enableAnalytics": false
}
```

## Performance Features

### Caching System
- **TTL-based caching**: Configurable time-to-live for cached responses
- **Automatic cleanup**: Expired entries are automatically removed
- **Cache statistics**: Hit/miss ratios tracked for monitoring
- **Memory management**: Prevents cache bloat with size limits

### Performance Monitoring
- **Response time tracking**: All tool calls are timed
- **Success/failure rates**: Tool call statistics maintained
- **Memory usage monitoring**: Heap and RSS memory tracked
- **Slow call detection**: Calls >5s are flagged as warnings

### Logging System
- **Structured logging**: JSON-formatted log entries with context
- **Log levels**: DEBUG, INFO, WARN, ERROR with filtering
- **Log rotation**: Automatic cleanup of old log entries
- **Memory-safe**: Limited in-memory log storage with rotation

## Security Features

### Input Validation
- **Address validation**: Regex-based validation for blockchain addresses
- **Command injection prevention**: Input sanitization for all parameters
- **Type checking**: Runtime type validation for all inputs
- **Length limits**: Reasonable limits on input sizes

### Error Handling
- **Comprehensive error catching**: All operations wrapped in try-catch
- **Safe error messages**: No sensitive data exposed in error responses
- **Logging**: All errors logged with context for debugging
- **Timeout protection**: Operations have timeout limits

### Configuration Security
- **Schema validation**: All configuration validated against Zod schema
- **Default secure values**: Sensible defaults for all settings
- **Environment variable support**: Sensitive values via env vars

## Error Handling

### Error Response Format
```json
{
  "content": [{
    "type": "text",
    "text": "❌ Error executing tool_name: Error description"
  }],
  "isError": true
}
```

### Common Error Scenarios
1. **Invalid Address Format**: Address validation fails
2. **ZetaChain CLI Not Found**: CLI not installed or not in PATH
3. **Network Connectivity**: Unable to connect to ZetaChain network
4. **Invalid Parameters**: Missing or malformed request parameters
5. **Timeout**: Operation takes longer than 30 seconds

## Deployment

### Requirements
- Node.js 18+
- ZetaChain CLI (installed locally or globally)
- TypeScript (for building)

### Installation
```bash
npm install
npm run build
```

### Running
```bash
# Direct execution
node dist/index.js

# As MCP server (with client)
# Configure in your MCP client to use this server
```

### Health Monitoring
The server provides built-in health monitoring:
- Use `health_check` tool for status verification
- Monitor metrics with `get_metrics` tool
- Check logs with `get_logs` tool for troubleshooting

## Integration Examples

### Claude Desktop Configuration
```json
{
  "mcpServers": {
    "zetachain": {
      "command": "node",
      "args": ["/path/to/zetachain-mcp-server/dist/index.js"],
      "env": {
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

### Smithery Deployment
```bash
smithery deploy .
```

## Troubleshooting

### Common Issues
1. **Server won't start**: Check Node.js version and dependencies
2. **ZetaChain CLI errors**: Verify CLI installation and PATH
3. **High memory usage**: Use `clear_cache` tool or restart server
4. **Slow responses**: Check network connectivity and `get_metrics`

### Debug Mode
Set `LOG_LEVEL=DEBUG` to enable verbose logging for troubleshooting.

### Health Checks
Regular health checks can be automated:
```bash
# Example health check script
curl -X POST http://localhost:3000/health || echo "Server unhealthy"
```

## Version History

### v1.0.0 (Current)
- Initial release with full MCP protocol support
- 8 blockchain operation tools
- 4 monitoring and diagnostic tools
- Comprehensive logging and performance monitoring
- Security hardening and input validation
- Caching system for improved performance

---

For more information, see the project repository and security documentation.