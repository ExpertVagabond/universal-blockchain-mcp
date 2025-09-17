# 🔌 ZetaChain MCP Server - Port Configuration Guide

## Important: No Port Conflicts by Default

**The ZetaChain MCP Server uses stdio transport by default, which means it does NOT bind to any network ports.** This completely avoids any port conflicts with macOS or other systems.

## Understanding the Numbers

### Chain IDs (NOT Server Ports)
- **7000**: ZetaChain Mainnet Chain ID
- **7001**: ZetaChain Testnet Chain ID

These are blockchain network identifiers, not server ports.

### Server Transport Options

#### Default: stdio Transport (Recommended)
```bash
node dist/index.js
# Output: ZetaChain MCP Server running on stdio (no network ports used)
```

**Benefits:**
- ✅ No port conflicts with macOS or other systems
- ✅ Secure - no network exposure
- ✅ Standard MCP protocol approach
- ✅ Works with all MCP clients (Claude Desktop, Cursor, etc.)

#### Optional: HTTP Transport
```bash
# Enable HTTP transport on port 8545 (Ethereum standard)
ENABLE_HTTP=true HTTP_PORT=8545 node dist/index.js
# Output: ZetaChain MCP Server running on HTTP port 8545
```

**Configuration:**
```json
{
  "enableHttp": true,
  "httpPort": 8545
}
```

**Why Port 8545?**
- Standard Ethereum JSON-RPC port
- Avoids macOS port conflicts
- Well-known in blockchain development
- Not used by system services

## macOS Port Conflict Resolution

### Ports to Avoid on macOS
- **7000**: Used by macOS Control Center
- **5000**: Used by macOS AirPlay Receiver
- **3000**: Often used by development servers

### Recommended Ports
- **8545**: Ethereum standard (our default)
- **8546**: Ethereum WebSocket standard
- **9545**: Ganache default
- **8080**: Common HTTP alternative
- **3001**: Common development alternative

## Configuration Examples

### Claude Desktop (stdio - default)
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

### Claude Desktop (HTTP mode)
```json
{
  "mcpServers": {
    "zetachain": {
      "command": "node",
      "args": ["/path/to/zetachain-mcp-server/dist/index.js"],
      "env": {
        "ZETACHAIN_NETWORK": "testnet",
        "ENABLE_HTTP": "true",
        "HTTP_PORT": "8545"
      }
    }
  }
}
```

### Environment Variables
```bash
# Default stdio mode (no ports)
export ZETACHAIN_NETWORK=testnet

# HTTP mode with custom port
export ENABLE_HTTP=true
export HTTP_PORT=8545
export ZETACHAIN_NETWORK=testnet
```

### Programmatic Configuration
```typescript
import createServer from 'zetachain-mcp-server';

// stdio mode (default)
const server = createServer({
  network: 'testnet'
});

// HTTP mode
const httpServer = createServer({
  network: 'testnet',
  enableHttp: true,
  httpPort: 8545
});
```

## Port Testing

### Check if Port is Available
```bash
# Check if port 8545 is available
lsof -i :8545

# If nothing returns, port is available
# If something returns, port is in use
```

### Find Alternative Ports
```bash
# Find available ports in range
for port in {8545..8555}; do
  if ! lsof -i :$port > /dev/null 2>&1; then
    echo "Port $port is available"
    break
  fi
done
```

## Troubleshooting

### Issue: "Port already in use"
**Solution 1**: Use stdio mode (default)
```bash
node dist/index.js  # No port needed
```

**Solution 2**: Change HTTP port
```bash
HTTP_PORT=8546 ENABLE_HTTP=true node dist/index.js
```

**Solution 3**: Find and stop conflicting process
```bash
lsof -i :8545  # Find process using port
kill -9 <PID>  # Stop the process
```

### Issue: "Cannot connect to server"
**Check 1**: Verify transport mode
```bash
# For stdio mode
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js

# For HTTP mode
curl -X POST http://localhost:8545/message \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

**Check 2**: Verify port accessibility
```bash
telnet localhost 8545  # Should connect if HTTP mode is running
```

## Security Considerations

### stdio Transport (Default)
- ✅ **Most Secure**: No network exposure
- ✅ **Process Isolation**: Only parent process can communicate
- ✅ **Standard Practice**: Recommended for MCP servers

### HTTP Transport (Optional)
- ⚠️ **Network Exposure**: Accessible over network
- ⚠️ **Authentication**: Consider adding authentication
- ⚠️ **Firewall**: Configure firewall rules appropriately

## Best Practices

1. **Use stdio by default** unless you specifically need HTTP access
2. **Choose non-conflicting ports** when using HTTP mode
3. **Document port usage** in your deployment
4. **Test port availability** before deployment
5. **Monitor port usage** in production

## Summary

- **Default**: stdio transport (no ports used) ✅
- **Optional**: HTTP transport on port 8545 (avoids macOS conflicts) ✅
- **Chain IDs 7000/7001**: ZetaChain network identifiers (not server ports) ✅
- **macOS Compatibility**: Fully compatible with no conflicts ✅

The ZetaChain MCP Server is designed to work seamlessly on macOS and all other platforms without any port conflicts!