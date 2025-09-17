# ZetaChain MCP Server Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- **Node.js**: Version 18 or higher
- **npm**: Latest version
- **ZetaChain CLI**: Installed globally or locally
- **System Memory**: Minimum 512MB available RAM

### Installation Steps

#### 1. Clone and Setup
```bash
git clone <your-repository-url>
cd zetachain-mcp-server
npm install
npm run build
```

#### 2. Configuration
Create a configuration file (optional):
```json
{
  "network": "testnet",
  "enableAnalytics": false,
  "rpcUrl": "https://your-custom-rpc.com",
  "privateKey": "0x..."
}
```

#### 3. Environment Setup
```bash
export LOG_LEVEL=INFO
export NODE_ENV=production
```

### Deployment Options

#### Option 1: Direct Execution
```bash
node dist/index.js
```

#### Option 2: Process Manager (PM2)
```bash
npm install -g pm2
pm2 start dist/index.js --name "zetachain-mcp"
pm2 save
pm2 startup
```

#### Option 3: Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

#### Option 4: Smithery Platform
```bash
smithery deploy .
```

### Health Monitoring

#### Health Check Endpoint
Use the built-in health check tool:
```json
{
  "name": "health_check",
  "arguments": {}
}
```

#### Monitoring Script
```bash
#!/bin/bash
# health-check.sh
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"health_check","arguments":{}}}' | \
  timeout 10 node dist/index.js | \
  grep -q "HEALTHY" && echo "OK" || echo "FAIL"
```

### Performance Optimization

#### Memory Management
- Monitor memory usage with `get_metrics` tool
- Clear cache periodically with `clear_cache` tool
- Set appropriate Node.js memory limits:
  ```bash
  node --max-old-space-size=1024 dist/index.js
  ```

#### Caching Strategy
- Network information cached for 10 minutes
- Balance queries can be cached (implement as needed)
- Monitor cache hit rates via metrics

### Security Considerations

#### Production Security
1. **Never log private keys**: Ensure LOG_LEVEL is not DEBUG in production
2. **Use environment variables**: Store sensitive data in environment variables
3. **Network security**: Run behind a firewall if exposed to network
4. **Access control**: Implement proper access controls for MCP clients

#### Configuration Security
```bash
# Secure configuration file
chmod 600 config.json
chown app:app config.json
```

### Troubleshooting

#### Common Issues

**Server Won't Start**
```bash
# Check Node.js version
node --version

# Check dependencies
npm list --depth=0

# Check build output
ls -la dist/
```

**High Memory Usage**
```bash
# Monitor memory
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_metrics","arguments":{"detailed":true}}}' | node dist/index.js

# Clear cache
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"clear_cache","arguments":{"confirm":true}}}' | node dist/index.js
```

**ZetaChain CLI Issues**
```bash
# Check CLI installation
which zetachain
zetachain --version

# Test CLI functionality
zetachain --help
```

#### Log Analysis
```bash
# Monitor logs in real-time
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_logs","arguments":{"level":"ERROR","count":20}}}' | node dist/index.js

# Check recent activity
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_logs","arguments":{"count":50}}}' | node dist/index.js
```

### Performance Benchmarks

#### Expected Performance
- **Startup Time**: < 5 seconds
- **Memory Usage**: 30-100MB baseline
- **Response Time**: < 1 second for cached operations
- **Throughput**: 100+ requests per minute

#### Performance Testing
```bash
# Test response times
time echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_networks","arguments":{}}}' | node dist/index.js

# Memory usage test
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_metrics","arguments":{}}}' | node dist/index.js
```

### Scaling Considerations

#### Horizontal Scaling
- Each instance is stateless (except for in-memory cache)
- Can run multiple instances behind a load balancer
- Consider shared caching solution for multiple instances

#### Vertical Scaling
- Monitor memory usage and scale accordingly
- CPU usage is typically low except during ZetaChain CLI operations
- Network I/O is the primary bottleneck

### Maintenance

#### Regular Tasks
1. **Log Rotation**: Logs are automatically rotated in memory
2. **Cache Cleanup**: Automatic cleanup every hour
3. **Health Checks**: Monitor via built-in health check tool
4. **Updates**: Regular dependency updates for security

#### Backup and Recovery
- Configuration files should be backed up
- No persistent data stored by the server
- Recovery is simple: restart the service

### Integration Examples

#### Claude Desktop
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

#### Custom MCP Client
```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client({
  name: "my-client",
  version: "1.0.0"
});

// Connect to server
await client.connect(transport);

// Use tools
const result = await client.callTool({
  name: "list_networks",
  arguments: {}
});
```

### Support and Monitoring

#### Metrics to Monitor
- Health status (healthy/degraded/unhealthy)
- Memory usage trends
- Cache hit rates
- Error rates and types
- Response time percentiles

#### Alerting Thresholds
- Memory usage > 500MB
- Error rate > 5%
- Response time > 5 seconds
- Health status = unhealthy

### Version Management

#### Deployment Strategy
1. Test new versions in staging environment
2. Use blue-green deployment for zero-downtime updates
3. Keep rollback plan ready
4. Monitor metrics after deployment

#### Rollback Procedure
```bash
# Stop current version
pm2 stop zetachain-mcp

# Switch to previous version
cp dist-backup/* dist/

# Restart service
pm2 start zetachain-mcp
```

---

For additional support, refer to the API documentation and security guidelines.