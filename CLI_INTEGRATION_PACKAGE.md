# ZetaChain CLI Integration Package

## 📋 Ready for Integration into Main ZetaChain CLI Repository

This package provides everything needed to integrate the Universal Blockchain MCP into the main ZetaChain CLI repository.

## 📦 Integration Files

### Core MCP Server
```
src/mcp/
├── index.ts              # Main MCP server entry point
├── command-schema.ts     # TypeScript schema definitions  
├── tools.ts              # Tool implementations
├── handlers.ts           # Command handlers
└── config.ts             # Configuration schema
```

### Auto-Generation Schema (Denis's Vision)
```
zetachain-commands.json   # Auto-generated from CLI commands
src/mcp/command-schema.ts # TypeScript validation schema
```

### Distribution Configs
```
configs/
├── claude-desktop.json  # Claude Desktop integration
├── cursor.json          # Cursor IDE integration
└── smithery.yaml        # Smithery cloud deployment
```

## 🔧 CLI Integration Points

### 1. Package.json Integration
Add to main CLI package.json:
```json
{
  "bin": {
    "zetachain": "./dist/cli.js",
    "zetachain-mcp": "./dist/mcp/index.js"
  },
  "files": [
    "dist/",
    "configs/",
    "zetachain-commands.json"
  ]
}
```

### 2. Build Process Integration
Add to CLI build scripts:
```json
{
  "scripts": {
    "build": "tsc && npm run build:mcp",
    "build:mcp": "tsc --project src/mcp/tsconfig.json",
    "generate:mcp-commands": "node scripts/generate-mcp-commands.js"
  }
}
```

### 3. CLI Command Integration
Add MCP command to CLI:
```bash
zetachain mcp start    # Start local MCP server
zetachain mcp install  # Generate config files for AI clients
zetachain mcp status   # Check MCP server status
```

## 🚀 Auto-Generation Implementation (Denis's Vision)

### Command Extraction Script
```javascript
// scripts/generate-mcp-commands.js
const fs = require('fs');
const { program } = require('commander');

// Extract commands from commander.js configuration
function extractCommands() {
  const commands = [];
  
  // Parse CLI command definitions
  program.commands.forEach(cmd => {
    commands.push({
      name: cmd.name(),
      description: cmd.description(),
      category: getCategory(cmd.name()),
      cliCommand: `zetachain ${cmd.name()}`,
      parameters: extractParameters(cmd),
      examples: getExamples(cmd.name())
    });
  });
  
  return {
    version: "1.0.0",
    generated: new Date().toISOString(),
    source: "zetachain-cli",
    commands,
    categories: getCategories(),
    metadata: getMetadata()
  };
}

// Write to zetachain-commands.json
fs.writeFileSync('zetachain-commands.json', 
  JSON.stringify(extractCommands(), null, 2)
);
```

### CI/CD Integration
```yaml
# .github/workflows/mcp-commands.yml
name: Update MCP Commands
on:
  push:
    paths: ['src/commands/**']

jobs:
  update-mcp:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run generate:mcp-commands
      - run: |
          if [ -n "$(git diff --exit-code zetachain-commands.json)" ]; then
            echo "❌ MCP commands file is out of date!"
            echo "Run: npm run generate:mcp-commands"
            exit 1
          fi
```

## 📁 Directory Structure in CLI Repo

```
zetachain-cli/
├── src/
│   ├── commands/          # Existing CLI commands
│   ├── mcp/              # New MCP server code
│   │   ├── index.ts
│   │   ├── command-schema.ts
│   │   ├── tools.ts
│   │   ├── handlers.ts
│   │   └── config.ts
│   └── cli.ts            # Main CLI entry
├── configs/              # MCP client configurations
│   ├── claude-desktop.json
│   ├── cursor.json
│   └── smithery.yaml
├── scripts/
│   └── generate-mcp-commands.js
├── zetachain-commands.json  # Auto-generated
└── package.json          # Updated with MCP support
```

## 🎯 Installation Flow (Denis + Matthew Vision)

### Method 1: NPM Global (Denis's Vision)
```bash
npm install -g zetachain
# Automatically includes:
# - CLI at: /usr/local/lib/node_modules/zetachain/dist/cli.js  
# - MCP at: /usr/local/lib/node_modules/zetachain/dist/mcp/index.js
```

### Method 2: Smithery Cloud (Matthew's Vision)
```bash
# One-click install from:
https://smithery.ai/server/@zetachain/universal-blockchain-mcp
```

### Method 3: Local Development
```bash
git clone zetachain-cli
npm install && npm run build
# MCP available at: ./dist/mcp/index.js
```

## 🔄 Update Workflow

1. **Developer adds CLI command** → `src/commands/new-command.js`
2. **CI runs** → `npm run generate:mcp-commands`
3. **Auto-generates** → `zetachain-commands.json` updated
4. **MCP automatically includes** → New command available to AI
5. **Smithery auto-updates** → Cloud deployment stays current

## ✅ Ready for Integration Checklist

- [x] **Core MCP server functional** (8 tools working)
- [x] **JSON schema defined** (auto-generation ready) 
- [x] **TypeScript validation** (command-schema.ts)
- [x] **Distribution configs** (Claude, Cursor, Smithery)
- [x] **Clean package structure** (ready for CLI repo)
- [x] **Documentation complete** (integration guide)
- [ ] **Move to CLI repo** (waiting for team decision)
- [ ] **Implement auto-generation** (CI/CD integration)
- [ ] **Deploy to official Smithery** (@zetachain namespace)

## 🎯 Next Steps

1. **Team Decision**: Approve integration into main CLI repo
2. **Move Files**: Transfer MCP code to CLI repository  
3. **Implement Auto-Gen**: Add command extraction script
4. **CI Integration**: Ensure commands stay synchronized
5. **Official Deploy**: Deploy to @zetachain/universal-blockchain-mcp

---
*Ready for immediate integration into main ZetaChain CLI repository*