# Smithery Deployment Instructions

## Issue with CLI Login
The Smithery CLI login command has an interactive input issue in this environment. Here are the steps to complete the deployment:

## Manual Deployment Steps

### 1. Get Smithery API Key
1. Visit: https://smithery.ai/account/api-keys
2. Create a new API key (free account available)
3. Copy the API key

### 2. Login Methods

**Option A: Interactive Login (in your terminal)**
```bash
smithery login
# Enter your API key when prompted
```

**Option B: Environment Variable**
```bash
export SMITHERY_API_KEY="your-api-key-here"
smithery deploy .
```

### 3. Deploy to Smithery
```bash
# From your project directory
cd /Users/dev/zetachain-mcp
smithery deploy .
```

### 4. Verify Deployment
```bash
smithery search zetachain
# Should show your deployed server
```

## Current Status

✅ **Code Ready**: GitHub repository published
✅ **Server Built**: Smithery build test passed  
✅ **CLI Installed**: @smithery/cli installed globally
⏳ **Pending**: API key authentication

## Alternative: NPM Publication

If Smithery deployment has issues, you can also publish to NPM:

```bash
# Update package.json version if needed
npm version patch

# Publish to NPM
npm publish

# Users can then install with:
npx zetachain-mcp-server
```

## Usage After Deployment

### Via Smithery (Recommended)
```json
{
  "mcpServers": {
    "zetachain": {
      "command": "npx",
      "args": ["-y", "@smithery/cli", "run", "ExpertVagabond/zetachain-mcp-server"]
    }
  }
}
```

### Local Installation
```json
{
  "mcpServers": {
    "zetachain": {
      "command": "node",
      "args": ["/Users/dev/zetachain-mcp/dist/index.js"]
    }
  }
}
```

## Repository
**GitHub**: https://github.com/ExpertVagabond/zetachain-mcp-server

The server is fully functional and ready - just needs the Smithery authentication to complete marketplace deployment!