# Deploying ZetaChain MCP Server to Smithery

## Prerequisites

1. **Smithery Account**: Create an account at [smithery.ai](https://smithery.ai)
2. **GitHub Repository**: Push your code to a GitHub repository
3. **Smithery CLI**: Install the Smithery CLI tool

## Step 1: Install Smithery CLI

```bash
npm install -g @smithery/cli
```

## Step 2: Authenticate with Smithery

```bash
smithery auth login
```

## Step 3: Deploy the Server

From your project root directory:

```bash
smithery deploy .
```

This will:
- Upload your MCP server to Smithery
- Build it in their infrastructure
- Make it available in the marketplace

## Step 4: Configure for Production

1. **Set up GitHub Integration**:
   - Go to your Smithery dashboard
   - Connect your GitHub repository
   - Enable automatic deployments

2. **Configure Environment Variables**:
   - Set any required environment variables
   - Configure default network settings

## Step 5: Test the Deployment

1. Install your server from Smithery:
```bash
smithery install your-username/zetachain-mcp-server
```

2. Test with Claude Desktop by adding to your config:
```json
{
  "mcpServers": {
    "zetachain": {
      "command": "smithery",
      "args": ["run", "your-username/zetachain-mcp-server"]
    }
  }
}
```

## Step 6: Publish to Marketplace

1. Go to your Smithery dashboard
2. Navigate to your server
3. Click "Publish to Marketplace"
4. Add description, tags, and documentation
5. Submit for review

## Alternative: Direct NPM Publishing

If you prefer to publish to NPM first:

```bash
npm publish
```

Then users can install via:
```bash
npx zetachain-mcp-server
```

## Testing Commands

Test your deployed server:

```bash
# List available tools
smithery run your-username/zetachain-mcp-server --list-tools

# Test a specific tool
smithery run your-username/zetachain-mcp-server --call-tool list_networks
```

## Notes

- Ensure your `package.json` has correct entry points
- The `createServer` function must be the default export
- The `configSchema` should be exported for Smithery's configuration UI
- Test thoroughly on testnet before mainnet deployment