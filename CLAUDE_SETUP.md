# Claude Desktop Setup

## Quick Setup

1. Install the ZetaChain MCP Server:
   ```bash
   npm install -g zetachain-mcp-server
   ```

2. Add to your Claude Desktop configuration file:

   **Location:**
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

   **Configuration:**
   ```json
   {
     "mcpServers": {
       "zetachain": {
         "command": "zetachain-mcp-server",
         "env": {
           "ZETACHAIN_NETWORK": "testnet"
         }
       }
     }
   }
   ```

3. Restart Claude Desktop

## Local Development Setup

If you want to use the development version:

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

## Usage

Once configured, you can ask Claude to:

- Create smart contracts: "Create a new ZetaChain NFT contract"
- Check balances: "What's the balance of address 0x..."
- List networks: "Show me ZetaChain network information"
- Manage accounts: "List my ZetaChain accounts"

## Troubleshooting

- Make sure Claude Desktop is restarted after configuration
- Check that the MCP server is installed globally: `which zetachain-mcp-server`
- Verify the configuration file syntax is valid JSON