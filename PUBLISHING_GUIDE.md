# 🚀 Publishing Guide

## 1. GitHub Publishing

### Prepare for GitHub Release

```bash
# 1. Ensure everything is built and tested
npm run build
npm run test

# 2. Create main branch and push
git checkout -b main
git add .
git commit -m "feat: initial release of ZetaChain MCP Server"
git push origin main

# 3. Create a release tag
git tag v1.0.0
git push origin v1.0.0
```

### GitHub Repository Setup

1. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Repository name: `zetachain-mcp-server`
   - Description: "Model Context Protocol server for ZetaChain blockchain development"
   - Make it public
   - Don't initialize with README (we have one)

2. **Connect Local Repository**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/zetachain-mcp-server.git
   git branch -M main
   git push -u origin main
   ```

3. **Create GitHub Release**:
   - Go to your repository → Releases → Create a new release
   - Tag: `v1.0.0`
   - Title: `ZetaChain MCP Server v1.0.0`
   - Description: See release template below

---

## 2. npm Publishing

### Prerequisites

```bash
# 1. Create npm account (if you don't have one)
# Visit: https://www.npmjs.com/signup

# 2. Login to npm
npm login

# 3. Verify login
npm whoami
```

### Publishing Steps

```bash
# 1. Final build and test
npm run build
npm run test

# 2. Check package contents
npm pack --dry-run

# 3. Publish to npm
npm publish

# 4. Verify publication
npm view zetachain-mcp-server
```

### Version Updates (for future releases)

```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major

# Then publish
npm publish
```

---

## 3. Claude Desktop Integration

### User Installation Instructions

**Step 1: Install via npm**
```bash
npm install -g zetachain-mcp-server
```

**Step 2: Configure Claude Desktop**

Add to Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

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

**Step 3: Restart Claude Desktop**

**Step 4: Test Integration**
Ask Claude: "List the available ZetaChain networks"

---

## 4. Release Template

### GitHub Release Description Template

```markdown
# 🎉 ZetaChain MCP Server v1.0.0

A Model Context Protocol server that enables AI assistants to interact with ZetaChain blockchain development tools.

## ✨ Features

- **8 ZetaChain Development Tools**
  - Smart contract creation and deployment
  - Account management and wallet generation
  - Blockchain querying and transaction handling
  - Network information and balance checking

- **AI Assistant Integration**
  - Works seamlessly with Claude Desktop
  - MCP protocol compliant
  - Easy configuration and setup

- **Developer Friendly**
  - TypeScript implementation with full type safety
  - Comprehensive error handling
  - Local and global ZetaChain CLI support

## 📦 Installation

```bash
npm install -g zetachain-mcp-server
```

## 🔧 Claude Desktop Setup

Add to your Claude Desktop configuration:

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

## 🛠️ Available Tools

1. **create_contract** - Create smart contract projects
2. **deploy_contract** - Deploy contracts to networks
3. **query_chain** - Query blockchain data
4. **manage_accounts** - Account management
5. **get_balance** - Check address balances
6. **send_transaction** - Send transactions
7. **list_networks** - Network information
8. **generate_wallet** - Create new wallets

## 📚 Usage Examples

- "Create a new ZetaChain NFT contract called 'my-collection'"
- "Show me the available ZetaChain networks"
- "Check the balance for address 0x..."
- "List all my ZetaChain accounts"

## 🔗 Links

- **npm Package**: https://www.npmjs.com/package/zetachain-mcp-server
- **Documentation**: [README.md](./README.md)
- **Setup Guide**: [CLAUDE_SETUP.md](./CLAUDE_SETUP.md)

## 🤝 Contributing

Issues and pull requests are welcome! Please see our GitHub repository for contribution guidelines.

---

**Happy building with ZetaChain! 🚀**
```

---

## 5. Post-Publishing Checklist

### After GitHub Release
- [ ] Repository is public and accessible
- [ ] README displays correctly
- [ ] GitHub Actions CI/CD is working
- [ ] Release assets are available

### After npm Publishing
- [ ] Package appears on npmjs.com
- [ ] Installation works: `npm install -g zetachain-mcp-server`
- [ ] Command works: `zetachain-mcp-server --help`
- [ ] Package can be found: `npm search zetachain-mcp-server`

### After Claude Integration
- [ ] Configuration file syntax is valid
- [ ] Claude Desktop recognizes the server
- [ ] Tools are available in Claude
- [ ] Basic functionality works (list networks, etc.)

---

## 6. Troubleshooting

### npm Publishing Issues
- **Authentication**: Run `npm login` and verify with `npm whoami`
- **Package name**: Ensure name is available with `npm view zetachain-mcp-server`
- **Version**: Check version hasn't been published with `npm view zetachain-mcp-server versions`

### Claude Integration Issues
- **Config file location**: Verify correct path for your OS
- **JSON syntax**: Validate JSON with online tool
- **Command path**: Test command works in terminal
- **Restart required**: Always restart Claude Desktop after config changes

### GitHub Issues
- **Repository access**: Ensure repository is public
- **Branch protection**: Check if main branch has protection rules
- **Actions permissions**: Verify GitHub Actions are enabled

---

## 🎯 Ready to Publish!

Your ZetaChain MCP Server is ready for:
1. ✅ **GitHub Publishing** - Clean, tested, and documented
2. ✅ **npm Registry** - Properly configured package
3. ✅ **Claude Desktop** - Easy integration setup

Follow the steps above to make your MCP server available to the world! 🌟