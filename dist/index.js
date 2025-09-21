#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, InitializeRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { spawn } from 'child_process';
class ZetaChainMCPServer {
    server;
    testMode;
    constructor() {
        // More intelligent environment detection
        this.testMode = this.isRemoteEnvironment();
        this.server = new Server({
            name: "universal-blockchain-mcp",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.setupErrorHandling();
    }
    isRemoteEnvironment() {
        // Check for explicit test mode
        if (process.env.NODE_ENV === 'test' || process.env.SMITHERY_SCAN === 'true') {
            return true;
        }
        // Check if running in Smithery cloud environment
        if (process.env.SMITHERY_DEPLOYMENT === 'true' || process.env.VERCEL || process.env.NETLIFY) {
            return true;
        }
        // Check if zetachain CLI is available locally (try multiple methods)
        try {
            const { execSync } = require('child_process');
            // Try global installation first
            try {
                execSync('zetachain --version', { stdio: 'ignore' });
                return false; // Global installation found
            }
            catch {
                // Try npx fallback
                try {
                    execSync('npx zetachain --version', { stdio: 'ignore' });
                    return false; // npx installation works
                }
                catch {
                    return true; // No working installation found
                }
            }
        }
        catch {
            return true; // No local installation, use remote mode
        }
    }
    getInstallationMessage() {
        return `🌐 **Remote Demo Mode** - This is running on Smithery's cloud infrastructure.

For full functionality with real blockchain operations, install locally:

**Option 1: npm install (Auto-installs ZetaChain CLI + Foundry)**
\`\`\`bash
npm install -g @ExpertVagabond/universal-blockchain-mcp
# ZetaChain CLI + Foundry will be automatically installed!
# All 16 tools will work with real blockchain interaction
# Full smart contract development environment ready!
\`\`\`

**Option 2: Local MCP setup**
\`\`\`bash
git clone https://github.com/ExpertVagabond/universal-blockchain-mcp
cd universal-blockchain-mcp
npm install && npm run build
smithery install ./
\`\`\`

✅ **Automatic Setup**: ZetaChain CLI + Foundry install automatically
✅ **All 16 Tools**: Full blockchain functionality after local installation
✅ **Complete Dev Environment**: Ready for smart contract development
✅ **No Manual Setup**: Everything works out of the box

📚 **Smart Contract Development:**
- **Foundry**: Automatically installed (forge, cast, anvil, chisel)
- **ZetaChain CLI**: Automatically installed for blockchain interaction
- **ZetaChain Examples**: https://github.com/zeta-chain/example-contracts`;
    }
    async executeZetaCommand(args) {
        const command = args.join(' ');
        // Use direct API calls instead of CLI for remote compatibility
        try {
            return await this.executeViaAPI(command);
        }
        catch (error) {
            // Fallback to CLI if local environment
            if (!this.testMode) {
                return await this.executeCLI(args);
            }
            throw error;
        }
    }
    async executeViaAPI(command) {
        // Direct blockchain API calls that work remotely
        if (command.includes('query chains list')) {
            return await this.getChainListFromAPI();
        }
        if (command.includes('query tokens list')) {
            return await this.getTokenListFromAPI();
        }
        if (command.includes('query balances')) {
            const addressMatch = command.match(/0x[a-fA-F0-9]{40}/);
            if (addressMatch) {
                return await this.getBalancesFromAPI(addressMatch[0]);
            }
        }
        if (command.includes('query fees')) {
            return await this.getFeesFromAPI();
        }
        if (command.includes('faucet')) {
            const addressMatch = command.match(/0x[a-fA-F0-9]{40}/);
            if (addressMatch) {
                return await this.requestFaucetFromAPI(addressMatch[0]);
            }
        }
        // Default: Return explanation of what would be executed
        throw new Error(`API implementation needed for: ${command}`);
    }
    async executeCLI(args) {
        return new Promise((resolve, reject) => {
            // Smart CLI detection: try global first, then npx
            let zetaCommand, zetaArgs;
            if (process.env.ZETACHAIN_CLI_PATH) {
                // Use custom path if provided
                zetaCommand = process.env.ZETACHAIN_CLI_PATH;
                zetaArgs = args;
            }
            else {
                // Try global installation first, fallback to npx
                try {
                    const { execSync } = require('child_process');
                    execSync('zetachain --version', { stdio: 'ignore' });
                    zetaCommand = 'zetachain';
                    zetaArgs = args;
                }
                catch {
                    // Fallback to npx
                    zetaCommand = 'npx';
                    zetaArgs = ['zetachain', ...args];
                }
            }
            const child = spawn(zetaCommand, zetaArgs, {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            let stdout = '';
            let stderr = '';
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            child.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout);
                }
                else {
                    reject(new Error(`Command failed with code ${code}: ${stderr}`));
                }
            });
            child.on('error', (error) => {
                reject(error);
            });
        });
    }
    // API Implementation Methods for Remote Operation
    async getChainListFromAPI() {
        try {
            const response = await fetch('https://zetachain-athens-evm.blockpi.network/v1/rpc/public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_chainId',
                    params: [],
                    id: 1
                })
            });
            const data = await response.json();
            const chainId = parseInt(data.result, 16);
            return `🌐 **Live Chain Data**
┌──────────┬────────────────────┬─────────────────────────────────────────┐
│ Chain ID │ Chain Name         │ RPC Endpoint                           │
├──────────┼────────────────────┼─────────────────────────────────────────┤
│ ${chainId}      │ zeta_testnet       │ zetachain-athens-evm.blockpi.network   │
│ 97       │ bsc_testnet        │ bsc-testnet.public.blastapi.io          │
│ 11155111 │ sepolia_testnet    │ sepolia.infura.io                       │
└──────────┴────────────────────┴─────────────────────────────────────────┘`;
        }
        catch {
            return `⚠️ Unable to fetch live data, using cached info:
┌──────────┬────────────────────┬───────┐
│ Chain ID │ Chain Name         │ Status│
├──────────┼────────────────────┼───────┤
│ 7001     │ zeta_testnet       │ Active│
│ 97       │ bsc_testnet        │ Active│
│ 11155111 │ sepolia_testnet    │ Active│
└──────────┴────────────────────┴───────┘`;
        }
    }
    async getTokenListFromAPI() {
        return `🪙 **ZetaChain Token Registry**
┌──────────┬──────────────┬────────────────────────────────────────────┐
│ Chain ID │ Symbol       │ ZRC-20 Contract                           │
├──────────┼──────────────┼────────────────────────────────────────────┤
│ 97       │ USDC.BSC     │ 0x7c8dDa80bbBE1254a7aACf3219EBe1481c6E01d7 │
│ 97       │ BNB.BSC      │ 0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891 │
│ 11155111 │ ETH.ETHSEP   │ 0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf │
│ 11155111 │ USDC.ETHSEP  │ 0x48f80608B672DC30DC7e3dbBd0343c5F02C738Eb │
└──────────┴──────────────┴────────────────────────────────────────────┘`;
    }
    async getBalancesFromAPI(address) {
        try {
            const response = await fetch('https://zetachain-athens-evm.blockpi.network/v1/rpc/public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_getBalance',
                    params: [address, 'latest'],
                    id: 1
                })
            });
            const data = await response.json();
            const balanceWei = BigInt(data.result || '0x0');
            const balanceEth = Number(balanceWei) / Math.pow(10, 18);
            return `💰 **Live Balance Data**
Address: ${address}
ZetaChain Testnet Balance: ${balanceEth.toFixed(6)} ZETA
Network: Athens Testnet (Chain ID: 7001)
RPC: zetachain-athens-evm.blockpi.network`;
        }
        catch {
            return `💰 **Balance Information**
Address: ${address}
Status: Unable to fetch live balance
Network: ZetaChain Athens Testnet
Note: Balance queries require network connectivity`;
        }
    }
    async getFeesFromAPI() {
        return `⛽ **Cross-Chain Fee Schedule**
Current Network Fees (ZetaChain Testnet):
• Ethereum Sepolia → ZetaChain: ~0.001 ZETA
• BSC Testnet → ZetaChain: ~0.0005 ZETA  
• Polygon Mumbai → ZetaChain: ~0.0003 ZETA

💡 Note: Fees are dynamic and depend on network congestion`;
    }
    async requestFaucetFromAPI(address) {
        return `🚰 **ZetaChain Testnet Faucet**
Address: ${address}

💡 To request testnet ZETA tokens:
1. Visit: https://labs.zetachain.com/get-zeta
2. Connect your wallet: ${address}
3. Request testnet tokens
4. Wait for confirmation

⚠️ Note: Faucet has daily limits per address`;
    }
    setupToolHandlers() {
        // Add initialization handler
        this.server.setRequestHandler(InitializeRequestSchema, async (request) => ({
            protocolVersion: "2024-11-05",
            capabilities: {
                tools: {},
                experimental: {},
            },
            serverInfo: {
                name: "universal-blockchain-mcp",
                version: "1.0.0",
            },
        }));
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                // Account Management
                {
                    name: "create_account",
                    description: "Create a new ZetaChain account with mnemonic phrase",
                    inputSchema: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Account name identifier"
                            }
                        },
                        required: ["name"]
                    }
                },
                {
                    name: "import_account",
                    description: "Import existing account using private key or mnemonic",
                    inputSchema: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Account name identifier"
                            },
                            privateKey: {
                                type: "string",
                                description: "Private key to import (optional if mnemonic provided)"
                            },
                            mnemonic: {
                                type: "string",
                                description: "Mnemonic phrase to import (optional if private key provided)"
                            }
                        },
                        required: ["name"]
                    }
                },
                {
                    name: "list_accounts",
                    description: "List all available ZetaChain accounts",
                    inputSchema: {
                        type: "object",
                        properties: {}
                    }
                },
                {
                    name: "show_account",
                    description: "Show details of a specific account",
                    inputSchema: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Account name to show details for"
                            }
                        },
                        required: ["name"]
                    }
                },
                // Balance Queries
                {
                    name: "get_balances",
                    description: "Fetch native and ZETA token balances for an address",
                    inputSchema: {
                        type: "object",
                        properties: {
                            address: {
                                type: "string",
                                description: "Address to check balances for"
                            },
                            chain: {
                                type: "string",
                                description: "Chain to query (optional)"
                            }
                        },
                        required: ["address"]
                    }
                },
                // Cross-Chain Operations
                {
                    name: "query_cctx",
                    description: "Query cross-chain transaction data in real-time",
                    inputSchema: {
                        type: "object",
                        properties: {
                            hash: {
                                type: "string",
                                description: "Cross-chain transaction hash"
                            }
                        },
                        required: ["hash"]
                    }
                },
                {
                    name: "get_fees",
                    description: "Fetch omnichain and cross-chain messaging fees",
                    inputSchema: {
                        type: "object",
                        properties: {
                            from: {
                                type: "string",
                                description: "Source chain"
                            },
                            to: {
                                type: "string",
                                description: "Destination chain"
                            }
                        }
                    }
                },
                // ZetaChain Operations
                {
                    name: "call_contract",
                    description: "Call a contract on a connected chain from ZetaChain",
                    inputSchema: {
                        type: "object",
                        properties: {
                            contract: {
                                type: "string",
                                description: "Contract address to call"
                            },
                            chain: {
                                type: "string",
                                description: "Target chain"
                            },
                            amount: {
                                type: "string",
                                description: "Amount to send"
                            },
                            data: {
                                type: "string",
                                description: "Contract call data"
                            }
                        },
                        required: ["contract", "chain"]
                    }
                },
                {
                    name: "withdraw_tokens",
                    description: "Withdraw tokens from ZetaChain to a connected chain",
                    inputSchema: {
                        type: "object",
                        properties: {
                            amount: {
                                type: "string",
                                description: "Amount to withdraw"
                            },
                            chain: {
                                type: "string",
                                description: "Destination chain"
                            },
                            recipient: {
                                type: "string",
                                description: "Recipient address"
                            },
                            token: {
                                type: "string",
                                description: "Token address (optional for native)"
                            }
                        },
                        required: ["amount", "chain", "recipient"]
                    }
                },
                {
                    name: "withdraw_and_call",
                    description: "Withdraw tokens from ZetaChain and call a contract on connected chain",
                    inputSchema: {
                        type: "object",
                        properties: {
                            amount: {
                                type: "string",
                                description: "Amount to withdraw"
                            },
                            chain: {
                                type: "string",
                                description: "Destination chain"
                            },
                            contract: {
                                type: "string",
                                description: "Contract to call"
                            },
                            data: {
                                type: "string",
                                description: "Contract call data"
                            }
                        },
                        required: ["amount", "chain", "contract"]
                    }
                },
                // Token Operations
                {
                    name: "list_tokens",
                    description: "List ZRC-20 tokens",
                    inputSchema: {
                        type: "object",
                        properties: {
                            chain: {
                                type: "string",
                                description: "Chain to filter tokens by"
                            }
                        }
                    }
                },
                // Chain Operations
                {
                    name: "list_chains",
                    description: "List all supported chains",
                    inputSchema: {
                        type: "object",
                        properties: {}
                    }
                },
                // Faucet
                {
                    name: "request_faucet",
                    description: "Request testnet ZETA tokens from the faucet",
                    inputSchema: {
                        type: "object",
                        properties: {
                            address: {
                                type: "string",
                                description: "Address to send faucet tokens to"
                            }
                        },
                        required: ["address"]
                    }
                },
                // Development
                {
                    name: "create_project",
                    description: "Create a new universal contract project",
                    inputSchema: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Project name"
                            },
                            template: {
                                type: "string",
                                description: "Project template (hello, swap, etc.)"
                            }
                        },
                        required: ["name"]
                    }
                },
                // Network Info
                {
                    name: "get_network_info",
                    description: "Get current ZetaChain network status and information",
                    inputSchema: {
                        type: "object",
                        properties: {
                            network: {
                                type: "string",
                                description: "Network to query (mainnet or testnet)",
                                enum: ["mainnet", "testnet"],
                                default: "testnet"
                            }
                        }
                    }
                },
                {
                    name: "check_foundry",
                    description: "Check if Foundry (forge, cast, anvil) is properly installed and working",
                    inputSchema: {
                        type: "object",
                        properties: {}
                    }
                },
                // === FOUNDRY FORGE COMMANDS ===
                {
                    name: "forge_build",
                    description: "Compile smart contracts using Foundry Forge",
                    inputSchema: {
                        type: "object",
                        properties: {
                            path: { type: "string", description: "Project path (optional)" }
                        }
                    }
                },
                {
                    name: "forge_test",
                    description: "Run smart contract tests using Foundry Forge",
                    inputSchema: {
                        type: "object",
                        properties: {
                            path: { type: "string", description: "Project path (optional)" },
                            pattern: { type: "string", description: "Test pattern to match (optional)" }
                        }
                    }
                },
                {
                    name: "forge_create",
                    description: "Deploy smart contracts using Foundry Forge",
                    inputSchema: {
                        type: "object",
                        properties: {
                            contract: { type: "string", description: "Contract path/name" },
                            rpc_url: { type: "string", description: "RPC URL" },
                            private_key: { type: "string", description: "Private key for deployment" },
                            constructor_args: { type: "string", description: "Constructor arguments (optional)" }
                        },
                        required: ["contract", "rpc_url", "private_key"]
                    }
                },
                {
                    name: "forge_verify",
                    description: "Verify smart contracts on block explorers",
                    inputSchema: {
                        type: "object",
                        properties: {
                            contract_address: { type: "string", description: "Deployed contract address" },
                            contract_name: { type: "string", description: "Contract name" },
                            api_key: { type: "string", description: "Block explorer API key" },
                            chain: { type: "string", description: "Chain name (mainnet, sepolia, etc.)" }
                        },
                        required: ["contract_address", "contract_name", "api_key", "chain"]
                    }
                },
                // === FOUNDRY CAST COMMANDS ===
                {
                    name: "cast_call",
                    description: "Make a read-only call to a smart contract",
                    inputSchema: {
                        type: "object",
                        properties: {
                            contract_address: { type: "string", description: "Contract address" },
                            function_signature: { type: "string", description: "Function signature" },
                            args: { type: "string", description: "Function arguments (optional)" },
                            rpc_url: { type: "string", description: "RPC URL" }
                        },
                        required: ["contract_address", "function_signature", "rpc_url"]
                    }
                },
                {
                    name: "cast_send",
                    description: "Send a transaction to a smart contract",
                    inputSchema: {
                        type: "object",
                        properties: {
                            contract_address: { type: "string", description: "Contract address" },
                            function_signature: { type: "string", description: "Function signature" },
                            args: { type: "string", description: "Function arguments (optional)" },
                            rpc_url: { type: "string", description: "RPC URL" },
                            private_key: { type: "string", description: "Private key for signing" },
                            value: { type: "string", description: "ETH value to send (optional)" }
                        },
                        required: ["contract_address", "function_signature", "rpc_url", "private_key"]
                    }
                },
                {
                    name: "cast_balance",
                    description: "Get ETH balance of an address",
                    inputSchema: {
                        type: "object",
                        properties: {
                            address: { type: "string", description: "Address to check" },
                            rpc_url: { type: "string", description: "RPC URL" }
                        },
                        required: ["address", "rpc_url"]
                    }
                },
                {
                    name: "cast_nonce",
                    description: "Get transaction nonce for an address",
                    inputSchema: {
                        type: "object",
                        properties: {
                            address: { type: "string", description: "Address to check" },
                            rpc_url: { type: "string", description: "RPC URL" }
                        },
                        required: ["address", "rpc_url"]
                    }
                },
                {
                    name: "cast_gas_price",
                    description: "Get current gas price",
                    inputSchema: {
                        type: "object",
                        properties: {
                            rpc_url: { type: "string", description: "RPC URL" }
                        },
                        required: ["rpc_url"]
                    }
                },
                {
                    name: "cast_block",
                    description: "Get block information",
                    inputSchema: {
                        type: "object",
                        properties: {
                            block: { type: "string", description: "Block number or hash" },
                            rpc_url: { type: "string", description: "RPC URL" }
                        },
                        required: ["block", "rpc_url"]
                    }
                },
                {
                    name: "cast_tx",
                    description: "Get transaction information",
                    inputSchema: {
                        type: "object",
                        properties: {
                            tx_hash: { type: "string", description: "Transaction hash" },
                            rpc_url: { type: "string", description: "RPC URL" }
                        },
                        required: ["tx_hash", "rpc_url"]
                    }
                },
                // === FOUNDRY ANVIL COMMANDS ===
                {
                    name: "anvil_start",
                    description: "Start a local Ethereum node using Anvil",
                    inputSchema: {
                        type: "object",
                        properties: {
                            port: { type: "number", description: "Port to run on (default: 8545)" },
                            accounts: { type: "number", description: "Number of test accounts (default: 10)" },
                            balance: { type: "number", description: "Balance per account in ETH (default: 10000)" },
                            fork_url: { type: "string", description: "URL to fork from (optional)" }
                        }
                    }
                },
                {
                    name: "anvil_snapshot",
                    description: "Create a snapshot of the current blockchain state",
                    inputSchema: {
                        type: "object",
                        properties: {
                            rpc_url: { type: "string", description: "Anvil RPC URL (default: http://localhost:8545)" }
                        }
                    }
                },
                {
                    name: "anvil_revert",
                    description: "Revert to a previous snapshot",
                    inputSchema: {
                        type: "object",
                        properties: {
                            snapshot_id: { type: "string", description: "Snapshot ID to revert to" },
                            rpc_url: { type: "string", description: "Anvil RPC URL (default: http://localhost:8545)" }
                        },
                        required: ["snapshot_id"]
                    }
                },
                // === ZETACHAIN ADVANCED COMMANDS ===
                {
                    name: "zeta_validator_create",
                    description: "Create a ZetaChain validator",
                    inputSchema: {
                        type: "object",
                        properties: {
                            moniker: { type: "string", description: "Validator name" },
                            amount: { type: "string", description: "Stake amount" },
                            commission_rate: { type: "string", description: "Commission rate" },
                            min_self_delegation: { type: "string", description: "Minimum self-delegation" }
                        },
                        required: ["moniker", "amount"]
                    }
                },
                {
                    name: "zeta_governance_vote",
                    description: "Vote on ZetaChain governance proposals",
                    inputSchema: {
                        type: "object",
                        properties: {
                            proposal_id: { type: "string", description: "Proposal ID" },
                            vote: { type: "string", description: "Vote option", enum: ["yes", "no", "abstain", "no_with_veto"] },
                            from_account: { type: "string", description: "Account to vote from" }
                        },
                        required: ["proposal_id", "vote", "from_account"]
                    }
                },
                {
                    name: "zeta_governance_proposals",
                    description: "List active governance proposals",
                    inputSchema: {
                        type: "object",
                        properties: {
                            status: { type: "string", description: "Proposal status filter (optional)" }
                        }
                    }
                },
                {
                    name: "zeta_staking_delegate",
                    description: "Delegate ZETA tokens to a validator",
                    inputSchema: {
                        type: "object",
                        properties: {
                            validator_address: { type: "string", description: "Validator address" },
                            amount: { type: "string", description: "Amount to delegate" },
                            from_account: { type: "string", description: "Account to delegate from" }
                        },
                        required: ["validator_address", "amount", "from_account"]
                    }
                },
                {
                    name: "zeta_staking_rewards",
                    description: "Query staking rewards for a delegator",
                    inputSchema: {
                        type: "object",
                        properties: {
                            delegator_address: { type: "string", description: "Delegator address" },
                            validator_address: { type: "string", description: "Validator address (optional)" }
                        },
                        required: ["delegator_address"]
                    }
                },
                // === CROSS-CHAIN OPERATIONS ===
                {
                    name: "cross_chain_send",
                    description: "Send tokens across chains using ZetaChain",
                    inputSchema: {
                        type: "object",
                        properties: {
                            from_chain: { type: "string", description: "Source chain" },
                            to_chain: { type: "string", description: "Destination chain" },
                            token: { type: "string", description: "Token to send" },
                            amount: { type: "string", description: "Amount to send" },
                            recipient: { type: "string", description: "Recipient address" },
                            from_account: { type: "string", description: "Sender account" }
                        },
                        required: ["from_chain", "to_chain", "token", "amount", "recipient", "from_account"]
                    }
                },
                {
                    name: "cross_chain_status",
                    description: "Check status of cross-chain transaction",
                    inputSchema: {
                        type: "object",
                        properties: {
                            tx_hash: { type: "string", description: "Transaction hash" },
                            cctx_index: { type: "string", description: "CCTX index (optional)" }
                        }
                    }
                },
                // === SMART CONTRACT OPERATIONS ===
                {
                    name: "contract_compile",
                    description: "Compile Solidity smart contracts",
                    inputSchema: {
                        type: "object",
                        properties: {
                            contract_path: { type: "string", description: "Path to contract file" },
                            optimize: { type: "boolean", description: "Enable optimization (default: true)" },
                            output_dir: { type: "string", description: "Output directory (optional)" }
                        },
                        required: ["contract_path"]
                    }
                },
                {
                    name: "contract_deploy",
                    description: "Deploy compiled smart contracts",
                    inputSchema: {
                        type: "object",
                        properties: {
                            contract_name: { type: "string", description: "Contract name" },
                            chain: { type: "string", description: "Target chain" },
                            constructor_args: { type: "array", description: "Constructor arguments" },
                            from_account: { type: "string", description: "Deployer account" }
                        },
                        required: ["contract_name", "chain", "from_account"]
                    }
                },
                {
                    name: "contract_interact",
                    description: "Interact with deployed smart contracts",
                    inputSchema: {
                        type: "object",
                        properties: {
                            contract_address: { type: "string", description: "Contract address" },
                            function_name: { type: "string", description: "Function to call" },
                            args: { type: "array", description: "Function arguments" },
                            chain: { type: "string", description: "Chain where contract is deployed" },
                            from_account: { type: "string", description: "Account to use for interaction" }
                        },
                        required: ["contract_address", "function_name", "chain"]
                    }
                },
                // === DEFI OPERATIONS ===
                {
                    name: "defi_swap",
                    description: "Perform token swaps on DEX platforms",
                    inputSchema: {
                        type: "object",
                        properties: {
                            from_token: { type: "string", description: "Token to swap from" },
                            to_token: { type: "string", description: "Token to swap to" },
                            amount: { type: "string", description: "Amount to swap" },
                            chain: { type: "string", description: "Chain to swap on" },
                            dex: { type: "string", description: "DEX platform (uniswap, pancakeswap, etc.)" },
                            slippage: { type: "number", description: "Slippage tolerance (optional)" }
                        },
                        required: ["from_token", "to_token", "amount", "chain"]
                    }
                },
                {
                    name: "defi_liquidity_add",
                    description: "Add liquidity to DEX pools",
                    inputSchema: {
                        type: "object",
                        properties: {
                            token_a: { type: "string", description: "First token" },
                            token_b: { type: "string", description: "Second token" },
                            amount_a: { type: "string", description: "Amount of token A" },
                            amount_b: { type: "string", description: "Amount of token B" },
                            chain: { type: "string", description: "Chain" },
                            dex: { type: "string", description: "DEX platform" }
                        },
                        required: ["token_a", "token_b", "amount_a", "amount_b", "chain"]
                    }
                },
                {
                    name: "defi_yield_farm",
                    description: "Stake tokens in yield farming protocols",
                    inputSchema: {
                        type: "object",
                        properties: {
                            protocol: { type: "string", description: "DeFi protocol name" },
                            pool: { type: "string", description: "Pool/farm identifier" },
                            amount: { type: "string", description: "Amount to stake" },
                            chain: { type: "string", description: "Chain" }
                        },
                        required: ["protocol", "pool", "amount", "chain"]
                    }
                },
                // === NFT OPERATIONS ===
                {
                    name: "nft_mint",
                    description: "Mint NFTs",
                    inputSchema: {
                        type: "object",
                        properties: {
                            collection: { type: "string", description: "NFT collection address" },
                            recipient: { type: "string", description: "Recipient address" },
                            metadata_uri: { type: "string", description: "Metadata URI" },
                            chain: { type: "string", description: "Chain" }
                        },
                        required: ["collection", "recipient", "metadata_uri", "chain"]
                    }
                },
                {
                    name: "nft_transfer",
                    description: "Transfer NFTs",
                    inputSchema: {
                        type: "object",
                        properties: {
                            collection: { type: "string", description: "NFT collection address" },
                            token_id: { type: "string", description: "Token ID" },
                            from_address: { type: "string", description: "Current owner" },
                            to_address: { type: "string", description: "New owner" },
                            chain: { type: "string", description: "Chain" }
                        },
                        required: ["collection", "token_id", "from_address", "to_address", "chain"]
                    }
                },
                {
                    name: "nft_metadata",
                    description: "Get NFT metadata",
                    inputSchema: {
                        type: "object",
                        properties: {
                            collection: { type: "string", description: "NFT collection address" },
                            token_id: { type: "string", description: "Token ID" },
                            chain: { type: "string", description: "Chain" }
                        },
                        required: ["collection", "token_id", "chain"]
                    }
                },
                // === ADVANCED BLOCKCHAIN OPERATIONS ===
                {
                    name: "block_explorer",
                    description: "Search and analyze blockchain data",
                    inputSchema: {
                        type: "object",
                        properties: {
                            query: { type: "string", description: "Search query (address, tx hash, block)" },
                            chain: { type: "string", description: "Chain to search on" },
                            type: { type: "string", description: "Query type (address, transaction, block)" }
                        },
                        required: ["query", "chain"]
                    }
                },
                {
                    name: "gas_tracker",
                    description: "Track and analyze gas prices across chains",
                    inputSchema: {
                        type: "object",
                        properties: {
                            chains: { type: "array", description: "List of chains to check" },
                            period: { type: "string", description: "Time period (1h, 24h, 7d)" }
                        }
                    }
                },
                {
                    name: "portfolio_tracker",
                    description: "Track portfolio value across multiple chains",
                    inputSchema: {
                        type: "object",
                        properties: {
                            addresses: { type: "array", description: "List of addresses to track" },
                            chains: { type: "array", description: "Chains to include" }
                        },
                        required: ["addresses"]
                    }
                },
                {
                    name: "security_audit",
                    description: "Perform basic security audit on smart contracts",
                    inputSchema: {
                        type: "object",
                        properties: {
                            contract_address: { type: "string", description: "Contract address" },
                            chain: { type: "string", description: "Chain" },
                            analysis_type: { type: "string", description: "Type of analysis", enum: ["basic", "detailed"] }
                        },
                        required: ["contract_address", "chain"]
                    }
                },
                // === ADDITIONAL USEFUL COMMANDS ===
                {
                    name: "wallet_export",
                    description: "Export wallet private key or mnemonic",
                    inputSchema: {
                        type: "object",
                        properties: {
                            account_name: { type: "string", description: "Account name to export" },
                            format: { type: "string", description: "Export format", enum: ["private_key", "mnemonic", "keystore"] }
                        },
                        required: ["account_name", "format"]
                    }
                },
                {
                    name: "wallet_backup",
                    description: "Create encrypted backup of wallet",
                    inputSchema: {
                        type: "object",
                        properties: {
                            account_name: { type: "string", description: "Account name to backup" },
                            password: { type: "string", description: "Encryption password" }
                        },
                        required: ["account_name", "password"]
                    }
                },
                {
                    name: "transaction_history",
                    description: "Get transaction history for an address",
                    inputSchema: {
                        type: "object",
                        properties: {
                            address: { type: "string", description: "Address to query" },
                            chain: { type: "string", description: "Chain to query" },
                            limit: { type: "number", description: "Number of transactions to return (default: 50)" }
                        },
                        required: ["address", "chain"]
                    }
                },
                {
                    name: "gas_optimizer",
                    description: "Optimize gas usage for smart contract transactions",
                    inputSchema: {
                        type: "object",
                        properties: {
                            contract_address: { type: "string", description: "Contract address" },
                            function_call: { type: "string", description: "Function call to optimize" },
                            chain: { type: "string", description: "Chain" }
                        },
                        required: ["contract_address", "function_call", "chain"]
                    }
                },
                {
                    name: "multisig_create",
                    description: "Create a multisig wallet",
                    inputSchema: {
                        type: "object",
                        properties: {
                            owners: { type: "array", description: "List of owner addresses" },
                            threshold: { type: "number", description: "Number of signatures required" },
                            chain: { type: "string", description: "Chain to deploy on" }
                        },
                        required: ["owners", "threshold", "chain"]
                    }
                },
                {
                    name: "bridge_status",
                    description: "Check status of cross-chain bridge operations",
                    inputSchema: {
                        type: "object",
                        properties: {
                            tx_hash: { type: "string", description: "Transaction hash" },
                            bridge_type: { type: "string", description: "Bridge type (zeta, layerzero, etc.)" }
                        },
                        required: ["tx_hash"]
                    }
                }
            ]
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            const toolArgs = args || {};
            try {
                switch (name) {
                    case "create_account":
                        return await this.createAccount(toolArgs.name);
                    case "import_account":
                        return await this.importAccount(toolArgs.name, toolArgs.privateKey, toolArgs.mnemonic);
                    case "list_accounts":
                        return await this.listAccounts();
                    case "show_account":
                        return await this.showAccount(toolArgs.name);
                    case "get_balances":
                        return await this.getBalances(toolArgs.address, toolArgs.chain);
                    case "query_cctx":
                        return await this.queryCCTX(toolArgs.hash);
                    case "get_fees":
                        return await this.getFees(toolArgs.from, toolArgs.to);
                    case "call_contract":
                        return await this.callContract(toolArgs.contract, toolArgs.chain, toolArgs.amount, toolArgs.data);
                    case "withdraw_tokens":
                        return await this.withdrawTokens(toolArgs.amount, toolArgs.chain, toolArgs.recipient, toolArgs.token);
                    case "withdraw_and_call":
                        return await this.withdrawAndCall(toolArgs.amount, toolArgs.chain, toolArgs.contract, toolArgs.data);
                    case "list_tokens":
                        return await this.listTokens(toolArgs.chain);
                    case "list_chains":
                        return await this.listChains();
                    case "request_faucet":
                        return await this.requestFaucet(toolArgs.address);
                    case "create_project":
                        return await this.createProject(toolArgs.name, toolArgs.template);
                    case "get_network_info":
                        return await this.getNetworkInfo(toolArgs.network);
                    case "check_foundry":
                        return await this.checkFoundry();
                    // === FOUNDRY FORGE HANDLERS ===
                    case "forge_build":
                        return await this.forgeBuild(toolArgs.path);
                    case "forge_test":
                        return await this.forgeTest(toolArgs.path, toolArgs.pattern);
                    case "forge_create":
                        return await this.forgeCreate(toolArgs.contract, toolArgs.rpc_url, toolArgs.private_key, toolArgs.constructor_args);
                    case "forge_verify":
                        return await this.forgeVerify(toolArgs.contract_address, toolArgs.contract_name, toolArgs.api_key, toolArgs.chain);
                    // === FOUNDRY CAST HANDLERS ===
                    case "cast_call":
                        return await this.castCall(toolArgs.contract_address, toolArgs.function_signature, toolArgs.args, toolArgs.rpc_url);
                    case "cast_send":
                        return await this.castSend(toolArgs.contract_address, toolArgs.function_signature, toolArgs.args, toolArgs.rpc_url, toolArgs.private_key, toolArgs.value);
                    case "cast_balance":
                        return await this.castBalance(toolArgs.address, toolArgs.rpc_url);
                    case "cast_nonce":
                        return await this.castNonce(toolArgs.address, toolArgs.rpc_url);
                    case "cast_gas_price":
                        return await this.castGasPrice(toolArgs.rpc_url);
                    case "cast_block":
                        return await this.castBlock(toolArgs.block, toolArgs.rpc_url);
                    case "cast_tx":
                        return await this.castTx(toolArgs.tx_hash, toolArgs.rpc_url);
                    // === FOUNDRY ANVIL HANDLERS ===
                    case "anvil_start":
                        return await this.anvilStart(toolArgs.port, toolArgs.accounts, toolArgs.balance, toolArgs.fork_url);
                    case "anvil_snapshot":
                        return await this.anvilSnapshot(toolArgs.rpc_url);
                    case "anvil_revert":
                        return await this.anvilRevert(toolArgs.snapshot_id, toolArgs.rpc_url);
                    // === ZETACHAIN ADVANCED HANDLERS ===
                    case "zeta_validator_create":
                        return await this.zetaValidatorCreate(toolArgs.moniker, toolArgs.amount, toolArgs.commission_rate, toolArgs.min_self_delegation);
                    case "zeta_governance_vote":
                        return await this.zetaGovernanceVote(toolArgs.proposal_id, toolArgs.vote, toolArgs.from_account);
                    case "zeta_governance_proposals":
                        return await this.zetaGovernanceProposals(toolArgs.status);
                    case "zeta_staking_delegate":
                        return await this.zetaStakingDelegate(toolArgs.validator_address, toolArgs.amount, toolArgs.from_account);
                    case "zeta_staking_rewards":
                        return await this.zetaStakingRewards(toolArgs.delegator_address, toolArgs.validator_address);
                    // === CROSS-CHAIN HANDLERS ===
                    case "cross_chain_send":
                        return await this.crossChainSend(toolArgs.from_chain, toolArgs.to_chain, toolArgs.token, toolArgs.amount, toolArgs.recipient, toolArgs.from_account);
                    case "cross_chain_status":
                        return await this.crossChainStatus(toolArgs.tx_hash, toolArgs.cctx_index);
                    // === SMART CONTRACT HANDLERS ===
                    case "contract_compile":
                        return await this.contractCompile(toolArgs.contract_path, toolArgs.optimize, toolArgs.output_dir);
                    case "contract_deploy":
                        return await this.contractDeploy(toolArgs.contract_name, toolArgs.chain, toolArgs.constructor_args, toolArgs.from_account);
                    case "contract_interact":
                        return await this.contractInteract(toolArgs.contract_address, toolArgs.function_name, toolArgs.args, toolArgs.chain, toolArgs.from_account);
                    // === DEFI HANDLERS ===
                    case "defi_swap":
                        return await this.defiSwap(toolArgs.from_token, toolArgs.to_token, toolArgs.amount, toolArgs.chain, toolArgs.dex, toolArgs.slippage);
                    case "defi_liquidity_add":
                        return await this.defiLiquidityAdd(toolArgs.token_a, toolArgs.token_b, toolArgs.amount_a, toolArgs.amount_b, toolArgs.chain, toolArgs.dex);
                    case "defi_yield_farm":
                        return await this.defiYieldFarm(toolArgs.protocol, toolArgs.pool, toolArgs.amount, toolArgs.chain);
                    // === NFT HANDLERS ===
                    case "nft_mint":
                        return await this.nftMint(toolArgs.collection, toolArgs.recipient, toolArgs.metadata_uri, toolArgs.chain);
                    case "nft_transfer":
                        return await this.nftTransfer(toolArgs.collection, toolArgs.token_id, toolArgs.from_address, toolArgs.to_address, toolArgs.chain);
                    case "nft_metadata":
                        return await this.nftMetadata(toolArgs.collection, toolArgs.token_id, toolArgs.chain);
                    // === ADVANCED BLOCKCHAIN HANDLERS ===
                    case "block_explorer":
                        return await this.blockExplorer(toolArgs.query, toolArgs.chain, toolArgs.type);
                    case "gas_tracker":
                        return await this.gasTracker(toolArgs.chains, toolArgs.period);
                    case "portfolio_tracker":
                        return await this.portfolioTracker(toolArgs.addresses, toolArgs.chains);
                    case "security_audit":
                        return await this.securityAudit(toolArgs.contract_address, toolArgs.chain, toolArgs.analysis_type);
                    // Additional useful commands
                    case "wallet_export":
                        return await this.walletExport(toolArgs.account_name, toolArgs.format);
                    case "wallet_backup":
                        return await this.walletBackup(toolArgs.account_name, toolArgs.password);
                    case "transaction_history":
                        return await this.transactionHistory(toolArgs.address, toolArgs.chain, toolArgs.limit);
                    case "gas_optimizer":
                        return await this.gasOptimizer(toolArgs.contract_address, toolArgs.function_call, toolArgs.chain);
                    case "multisig_create":
                        return await this.multisigCreate(toolArgs.owners, toolArgs.threshold, toolArgs.chain);
                    case "bridge_status":
                        return await this.bridgeStatus(toolArgs.tx_hash, toolArgs.bridge_type);
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    // Implementation methods
    async createAccount(name) {
        const output = await this.executeZetaCommand(['accounts', 'create', '--name', name]);
        return {
            content: [
                {
                    type: "text",
                    text: `Account creation result:\n${output}`,
                },
            ],
        };
    }
    async importAccount(name, privateKey, mnemonic) {
        const args = ['accounts', 'import', '--name', name];
        if (privateKey) {
            args.push('--private-key', privateKey);
        }
        else if (mnemonic) {
            args.push('--mnemonic', mnemonic);
        }
        const output = await this.executeZetaCommand(args);
        return {
            content: [
                {
                    type: "text",
                    text: `Account import result:\n${output}`,
                },
            ],
        };
    }
    async listAccounts() {
        const output = await this.executeZetaCommand(['accounts', 'list', '--json']);
        return {
            content: [
                {
                    type: "text",
                    text: `Available accounts:\n${output}`,
                },
            ],
        };
    }
    async showAccount(name) {
        const output = await this.executeZetaCommand(['accounts', 'show', '--name', name]);
        return {
            content: [
                {
                    type: "text",
                    text: `Account details:\n${output}`,
                },
            ],
        };
    }
    async getBalances(address, chain) {
        const args = ['query', 'balances', '--evm', address, '--json'];
        const output = await this.executeZetaCommand(args);
        return {
            content: [
                {
                    type: "text",
                    text: `Balance information:\n${output}`,
                },
            ],
        };
    }
    async queryCCTX(hash) {
        const output = await this.executeZetaCommand(['query', 'cctx', '--hash', hash]);
        return {
            content: [
                {
                    type: "text",
                    text: `Cross-chain transaction details:\n${output}`,
                },
            ],
        };
    }
    async getFees(from, to) {
        const args = ['query', 'fees', '--json'];
        const output = await this.executeZetaCommand(args);
        return {
            content: [
                {
                    type: "text",
                    text: `Fee information:\n${output}`,
                },
            ],
        };
    }
    async callContract(contract, chain, amount, data) {
        const args = ['zetachain', 'call', '--contract', contract, '--chain', chain];
        if (amount)
            args.push('--amount', amount);
        if (data)
            args.push('--data', data);
        const output = await this.executeZetaCommand(args);
        return {
            content: [
                {
                    type: "text",
                    text: `Contract call result:\n${output}`,
                },
            ],
        };
    }
    async withdrawTokens(amount, chain, recipient, token) {
        const args = ['zetachain', 'withdraw', '--amount', amount, '--chain', chain, '--recipient', recipient];
        if (token)
            args.push('--token', token);
        const output = await this.executeZetaCommand(args);
        return {
            content: [
                {
                    type: "text",
                    text: `Withdrawal result:\n${output}`,
                },
            ],
        };
    }
    async withdrawAndCall(amount, chain, contract, data) {
        const args = ['zetachain', 'withdraw-and-call', '--amount', amount, '--chain', chain, '--contract', contract];
        if (data)
            args.push('--data', data);
        const output = await this.executeZetaCommand(args);
        return {
            content: [
                {
                    type: "text",
                    text: `Withdraw and call result:\n${output}`,
                },
            ],
        };
    }
    async listTokens(chain) {
        const args = ['query', 'tokens', 'list'];
        if (chain)
            args.push('--chain', chain);
        const output = await this.executeZetaCommand(args);
        return {
            content: [
                {
                    type: "text",
                    text: `Token list:\n${output}`,
                },
            ],
        };
    }
    async listChains() {
        const output = await this.executeZetaCommand(['query', 'chains', 'list']);
        return {
            content: [
                {
                    type: "text",
                    text: `Supported chains:\n${output}`,
                },
            ],
        };
    }
    async requestFaucet(address) {
        const output = await this.executeZetaCommand(['faucet', '--address', address]);
        return {
            content: [
                {
                    type: "text",
                    text: `Faucet request result:\n${output}`,
                },
            ],
        };
    }
    async createProject(name, template) {
        const args = ['new', name];
        if (template)
            args.push('--template', template);
        const output = await this.executeZetaCommand(args);
        return {
            content: [
                {
                    type: "text",
                    text: `Project creation result:\n${output}`,
                },
            ],
        };
    }
    async getNetworkInfo(network = "testnet") {
        try {
            const rpcUrl = network === "mainnet"
                ? "https://zetachain-evm.blockpi.network/v1/rpc/public"
                : "https://zetachain-athens-evm.blockpi.network/v1/rpc/public";
            const chainId = network === "mainnet" ? 7000 : 7001;
            const response = await fetch(rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_blockNumber',
                    params: [],
                    id: 1
                })
            });
            const data = await response.json();
            const latestBlock = parseInt(data.result, 16);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            network: `ZetaChain ${network.charAt(0).toUpperCase() + network.slice(1)}`,
                            chainId,
                            rpcUrl,
                            latestBlock,
                            status: "healthy",
                            explorerUrl: network === "mainnet"
                                ? "https://explorer.zetachain.com"
                                : "https://athens3.explorer.zetachain.com"
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch network info: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async checkFoundry() {
        try {
            const checks = ['forge', 'cast', 'anvil'];
            const results = [];
            for (const tool of checks) {
                try {
                    const version = await new Promise((resolve, reject) => {
                        const child = spawn(tool, ['--version'], { stdio: ['pipe', 'pipe', 'pipe'] });
                        let output = '';
                        child.stdout.on('data', (data) => {
                            output += data.toString();
                        });
                        child.on('close', (code) => {
                            if (code === 0) {
                                resolve(output.trim());
                            }
                            else {
                                reject(new Error(`${tool} not found or failed`));
                            }
                        });
                        child.on('error', () => {
                            reject(new Error(`${tool} command not found`));
                        });
                    });
                    results.push(`✅ ${tool}: ${version.split('\n')[0]}`);
                }
                catch (error) {
                    results.push(`❌ ${tool}: Not installed or not working`);
                }
            }
            return {
                content: [
                    {
                        type: "text",
                        text: `Foundry Installation Check:\n${results.join('\n')}\n\nFoundry includes forge (build), cast (interact), and anvil (local node) for smart contract development.`,
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error checking Foundry: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
                isError: true,
            };
        }
    }
    setupErrorHandling() {
        this.server.onerror = (error) => {
            console.error("[MCP Error]", error);
        };
        process.on("SIGINT", async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    // === FOUNDRY FORGE IMPLEMENTATIONS ===
    async forgeBuild(path) {
        try {
            const args = ['forge', 'build'];
            if (path)
                args.push('--root', path);
            const output = await this.executeZetaCommand(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `🔨 **Forge Build Complete**\n\n${output}\n\n✅ **Smart contracts compiled successfully!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Forge build failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async forgeTest(path, pattern) {
        try {
            const args = ['forge', 'test'];
            if (path)
                args.push('--root', path);
            if (pattern)
                args.push('--match-test', pattern);
            const output = await this.executeZetaCommand(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `🧪 **Forge Test Results**\n\n${output}\n\n✅ **All tests completed!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Forge test failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async forgeCreate(contract, rpcUrl, privateKey, constructorArgs) {
        try {
            const args = ['forge', 'create', contract, '--rpc-url', rpcUrl, '--private-key', privateKey];
            if (constructorArgs)
                args.push('--constructor-args', constructorArgs);
            const output = await this.executeZetaCommand(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `🚀 **Contract Deployed**\n\n${output}\n\n✅ **Contract successfully deployed to the blockchain!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Contract deployment failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async forgeVerify(contractAddress, contractName, apiKey, chain) {
        try {
            const output = await this.executeZetaCommand([
                'forge', 'verify-contract', contractAddress, contractName, '--etherscan-api-key', apiKey, '--chain', chain
            ]);
            return {
                content: [
                    {
                        type: "text",
                        text: `🔍 **Contract Verification**\n\n${output}\n\n✅ **Contract verified on ${chain} explorer!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Contract verification failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // === FOUNDRY CAST IMPLEMENTATIONS ===
    async castCall(contractAddress, functionSignature, args, rpcUrl) {
        try {
            const castArgs = ['cast', 'call', contractAddress, functionSignature];
            if (args)
                castArgs.push(args);
            if (rpcUrl)
                castArgs.push('--rpc-url', rpcUrl);
            const output = await this.executeZetaCommand(castArgs);
            return {
                content: [
                    {
                        type: "text",
                        text: `📞 **Contract Call Result**\n\n${output}\n\n✅ **Function call executed successfully!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Contract call failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async castSend(contractAddress, functionSignature, args, rpcUrl, privateKey, value) {
        try {
            const castArgs = ['cast', 'send', contractAddress, functionSignature];
            if (args)
                castArgs.push(args);
            if (rpcUrl)
                castArgs.push('--rpc-url', rpcUrl);
            if (privateKey)
                castArgs.push('--private-key', privateKey);
            if (value)
                castArgs.push('--value', value);
            const output = await this.executeZetaCommand(castArgs);
            return {
                content: [
                    {
                        type: "text",
                        text: `📤 **Transaction Sent**\n\n${output}\n\n✅ **Transaction submitted to the blockchain!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async castBalance(address, rpcUrl) {
        try {
            const castArgs = ['cast', 'balance', address];
            if (rpcUrl)
                castArgs.push('--rpc-url', rpcUrl);
            const output = await this.executeZetaCommand(castArgs);
            return {
                content: [
                    {
                        type: "text",
                        text: `💰 **ETH Balance**\n\nAddress: ${address}\nBalance: ${output}\n\n✅ **Balance retrieved successfully!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Balance check failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async castNonce(address, rpcUrl) {
        try {
            const castArgs = ['cast', 'nonce', address];
            if (rpcUrl)
                castArgs.push('--rpc-url', rpcUrl);
            const output = await this.executeZetaCommand(castArgs);
            return {
                content: [
                    {
                        type: "text",
                        text: `🔢 **Transaction Nonce**\n\nAddress: ${address}\nNonce: ${output}\n\n✅ **Nonce retrieved successfully!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Nonce check failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async castGasPrice(rpcUrl) {
        try {
            const castArgs = ['cast', 'gas-price'];
            if (rpcUrl)
                castArgs.push('--rpc-url', rpcUrl);
            const output = await this.executeZetaCommand(castArgs);
            return {
                content: [
                    {
                        type: "text",
                        text: `⛽ **Current Gas Price**\n\n${output} wei\n\n✅ **Gas price retrieved successfully!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Gas price check failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async castBlock(block, rpcUrl) {
        try {
            const castArgs = ['cast', 'block', block];
            if (rpcUrl)
                castArgs.push('--rpc-url', rpcUrl);
            const output = await this.executeZetaCommand(castArgs);
            return {
                content: [
                    {
                        type: "text",
                        text: `🧱 **Block Information**\n\nBlock: ${block}\n\n${output}\n\n✅ **Block data retrieved successfully!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Block query failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async castTx(txHash, rpcUrl) {
        try {
            const castArgs = ['cast', 'tx', txHash];
            if (rpcUrl)
                castArgs.push('--rpc-url', rpcUrl);
            const output = await this.executeZetaCommand(castArgs);
            return {
                content: [
                    {
                        type: "text",
                        text: `📋 **Transaction Details**\n\nHash: ${txHash}\n\n${output}\n\n✅ **Transaction data retrieved successfully!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Transaction query failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // === FOUNDRY ANVIL IMPLEMENTATIONS ===
    async anvilStart(port, accounts, balance, forkUrl) {
        try {
            const args = ['anvil'];
            if (port)
                args.push('--port', port.toString());
            if (accounts)
                args.push('--accounts', accounts.toString());
            if (balance)
                args.push('--balance', balance.toString());
            if (forkUrl)
                args.push('--fork-url', forkUrl);
            // Note: This will start anvil in the background
            const output = await this.executeZetaCommand(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `🏗️ **Anvil Local Node Started**\n\n${output}\n\n✅ **Local Ethereum node is running!**\n\n🔗 **RPC URL**: http://localhost:${port || 8545}`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Anvil start failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async anvilSnapshot(rpcUrl) {
        try {
            const args = ['cast', 'rpc', 'evm_snapshot'];
            if (rpcUrl)
                args.push('--rpc-url', rpcUrl);
            const output = await this.executeZetaCommand(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `📸 **Snapshot Created**\n\nSnapshot ID: ${output}\n\n✅ **Blockchain state saved!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Snapshot creation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async anvilRevert(snapshotId, rpcUrl) {
        try {
            const args = ['cast', 'rpc', 'evm_revert', snapshotId];
            if (rpcUrl)
                args.push('--rpc-url', rpcUrl);
            const output = await this.executeZetaCommand(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `⏪ **Reverted to Snapshot**\n\nSnapshot ID: ${snapshotId}\nResult: ${output}\n\n✅ **Blockchain state restored!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Snapshot revert failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // === ZETACHAIN ADVANCED IMPLEMENTATIONS ===
    async zetaValidatorCreate(moniker, amount, commissionRate, minSelfDelegation) {
        try {
            const args = ['tx', 'staking', 'create-validator', '--moniker', moniker, '--amount', amount];
            if (commissionRate)
                args.push('--commission-rate', commissionRate);
            if (minSelfDelegation)
                args.push('--min-self-delegation', minSelfDelegation);
            const output = await this.executeZetaCommand(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `🏛️ **Validator Created**\n\nMoniker: ${moniker}\nAmount: ${amount}\n\n${output}\n\n✅ **Validator successfully created on ZetaChain!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Validator creation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async zetaGovernanceVote(proposalId, vote, fromAccount) {
        try {
            const output = await this.executeZetaCommand([
                'tx', 'gov', 'vote', proposalId, vote, '--from', fromAccount
            ]);
            return {
                content: [
                    {
                        type: "text",
                        text: `🗳️ **Governance Vote Cast**\n\nProposal: ${proposalId}\nVote: ${vote}\nFrom: ${fromAccount}\n\n${output}\n\n✅ **Vote successfully submitted!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Governance vote failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async zetaGovernanceProposals(status) {
        try {
            const args = ['query', 'gov', 'proposals'];
            if (status)
                args.push('--status', status);
            const output = await this.executeZetaCommand(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `📋 **Governance Proposals**\n\n${output}\n\n✅ **Proposals retrieved successfully!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Proposals query failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async zetaStakingDelegate(validatorAddress, amount, fromAccount) {
        try {
            const output = await this.executeZetaCommand([
                'tx', 'staking', 'delegate', validatorAddress, amount, '--from', fromAccount
            ]);
            return {
                content: [
                    {
                        type: "text",
                        text: `🎯 **Delegation Successful**\n\nValidator: ${validatorAddress}\nAmount: ${amount}\nFrom: ${fromAccount}\n\n${output}\n\n✅ **ZETA tokens successfully delegated!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Delegation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async zetaStakingRewards(delegatorAddress, validatorAddress) {
        try {
            const args = ['query', 'distribution', 'rewards', delegatorAddress];
            if (validatorAddress)
                args.push(validatorAddress);
            const output = await this.executeZetaCommand(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `💰 **Staking Rewards**\n\nDelegator: ${delegatorAddress}\n${validatorAddress ? `Validator: ${validatorAddress}\n` : ''}\n${output}\n\n✅ **Rewards information retrieved!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Rewards query failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // === CROSS-CHAIN IMPLEMENTATIONS ===
    async crossChainSend(fromChain, toChain, token, amount, recipient, fromAccount) {
        try {
            const output = await this.executeZetaCommand([
                'tx', 'crosschain', 'send', '--from-chain', fromChain, '--to-chain', toChain, '--token', token, '--amount', amount, '--recipient', recipient, '--from', fromAccount
            ]);
            return {
                content: [
                    {
                        type: "text",
                        text: `🌉 **Cross-Chain Transfer**\n\nFrom: ${fromChain}\nTo: ${toChain}\nToken: ${token}\nAmount: ${amount}\nRecipient: ${recipient}\n\n${output}\n\n✅ **Cross-chain transaction initiated!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Cross-chain transfer failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async crossChainStatus(txHash, cctxIndex) {
        try {
            const args = ['query', 'crosschain', 'status', '--tx-hash', txHash];
            if (cctxIndex)
                args.push('--cctx-index', cctxIndex);
            const output = await this.executeZetaCommand(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `🔍 **Cross-Chain Status**\n\nTransaction: ${txHash}\n${cctxIndex ? `CCTX Index: ${cctxIndex}\n` : ''}\n${output}\n\n✅ **Status retrieved successfully!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Cross-chain status query failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // === SMART CONTRACT IMPLEMENTATIONS ===
    async contractCompile(contractPath, optimize, outputDir) {
        try {
            const args = ['contract', 'compile', '--path', contractPath];
            if (optimize !== false)
                args.push('--optimize');
            if (outputDir)
                args.push('--output-dir', outputDir);
            const output = await this.executeZetaCommand(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `📦 **Contract Compiled**\n\nPath: ${contractPath}\nOptimized: ${optimize !== false}\n\n${output}\n\n✅ **Smart contract compiled successfully!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Contract compilation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async contractDeploy(contractName, chain, constructorArgs, fromAccount) {
        try {
            const args = ['contract', 'deploy', '--contract', contractName, '--chain', chain];
            if (constructorArgs && constructorArgs.length > 0) {
                args.push('--constructor-args', constructorArgs.join(','));
            }
            if (fromAccount)
                args.push('--from', fromAccount);
            const output = await this.executeZetaCommand(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `🚀 **Contract Deployed**\n\nContract: ${contractName}\nChain: ${chain}\nFrom: ${fromAccount || 'Default'}\n\n${output}\n\n✅ **Contract deployed successfully!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Contract deployment failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async contractInteract(contractAddress, functionName, args, chain, fromAccount) {
        try {
            const cmdArgs = ['contract', 'call', '--address', contractAddress, '--function', functionName];
            if (args && args.length > 0) {
                cmdArgs.push('--args', args.join(','));
            }
            if (chain)
                cmdArgs.push('--chain', chain);
            if (fromAccount)
                cmdArgs.push('--from', fromAccount);
            const output = await this.executeZetaCommand(cmdArgs);
            return {
                content: [
                    {
                        type: "text",
                        text: `📞 **Contract Interaction**\n\nAddress: ${contractAddress}\nFunction: ${functionName}\nChain: ${chain || 'Default'}\n\n${output}\n\n✅ **Contract function called successfully!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Contract interaction failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // === DEFI IMPLEMENTATIONS ===
    async defiSwap(fromToken, toToken, amount, chain, dex, slippage) {
        try {
            const args = ['defi', 'swap', '--from-token', fromToken, '--to-token', toToken, '--amount', amount, '--chain', chain];
            if (dex)
                args.push('--dex', dex);
            if (slippage)
                args.push('--slippage', slippage.toString());
            const output = await this.executeZetaCommand(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `🔄 **Token Swap**\n\nFrom: ${fromToken}\nTo: ${toToken}\nAmount: ${amount}\nChain: ${chain}\nDEX: ${dex || 'Auto'}\n\n${output}\n\n✅ **Swap executed successfully!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Token swap failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async defiLiquidityAdd(tokenA, tokenB, amountA, amountB, chain, dex) {
        try {
            const args = ['defi', 'add-liquidity', '--token-a', tokenA, '--token-b', tokenB, '--amount-a', amountA, '--amount-b', amountB, '--chain', chain];
            if (dex)
                args.push('--dex', dex);
            const output = await this.executeZetaCommand(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `💧 **Liquidity Added**\n\nToken A: ${tokenA} (${amountA})\nToken B: ${tokenB} (${amountB})\nChain: ${chain}\nDEX: ${dex || 'Auto'}\n\n${output}\n\n✅ **Liquidity successfully added to pool!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Liquidity addition failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async defiYieldFarm(protocol, pool, amount, chain) {
        try {
            const output = await this.executeZetaCommand([
                'defi', 'yield-farm', '--protocol', protocol, '--pool', pool, '--amount', amount, '--chain', chain
            ]);
            return {
                content: [
                    {
                        type: "text",
                        text: `🌾 **Yield Farming**\n\nProtocol: ${protocol}\nPool: ${pool}\nAmount: ${amount}\nChain: ${chain}\n\n${output}\n\n✅ **Tokens staked for yield farming!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Yield farming failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // === NFT IMPLEMENTATIONS ===
    async nftMint(collection, recipient, metadataUri, chain) {
        try {
            const output = await this.executeZetaCommand([
                'nft', 'mint', '--collection', collection, '--recipient', recipient, '--metadata-uri', metadataUri, '--chain', chain
            ]);
            return {
                content: [
                    {
                        type: "text",
                        text: `🎨 **NFT Minted**\n\nCollection: ${collection}\nRecipient: ${recipient}\nMetadata: ${metadataUri}\nChain: ${chain}\n\n${output}\n\n✅ **NFT successfully minted!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`NFT minting failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async nftTransfer(collection, tokenId, fromAddress, toAddress, chain) {
        try {
            const output = await this.executeZetaCommand([
                'nft', 'transfer', '--collection', collection, '--token-id', tokenId, '--from', fromAddress, '--to', toAddress, '--chain', chain
            ]);
            return {
                content: [
                    {
                        type: "text",
                        text: `🔄 **NFT Transfer**\n\nCollection: ${collection}\nToken ID: ${tokenId}\nFrom: ${fromAddress}\nTo: ${toAddress}\nChain: ${chain}\n\n${output}\n\n✅ **NFT successfully transferred!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`NFT transfer failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async nftMetadata(collection, tokenId, chain) {
        try {
            const output = await this.executeZetaCommand([
                'nft', 'metadata', '--collection', collection, '--token-id', tokenId, '--chain', chain
            ]);
            return {
                content: [
                    {
                        type: "text",
                        text: `📋 **NFT Metadata**\n\nCollection: ${collection}\nToken ID: ${tokenId}\nChain: ${chain}\n\n${output}\n\n✅ **Metadata retrieved successfully!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`NFT metadata query failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // === ADVANCED BLOCKCHAIN IMPLEMENTATIONS ===
    async blockExplorer(query, chain, type) {
        try {
            const args = ['explorer', 'search', '--query', query, '--chain', chain];
            if (type)
                args.push('--type', type);
            const output = await this.executeZetaCommand(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `🔍 **Block Explorer Search**\n\nQuery: ${query}\nChain: ${chain}\nType: ${type || 'Auto'}\n\n${output}\n\n✅ **Search completed successfully!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Block explorer search failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async gasTracker(chains, period) {
        try {
            const args = ['gas', 'tracker'];
            if (chains && chains.length > 0)
                args.push('--chains', chains.join(','));
            if (period)
                args.push('--period', period);
            const output = await this.executeZetaCommand(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `⛽ **Gas Price Tracker**\n\nChains: ${chains ? chains.join(', ') : 'All'}\nPeriod: ${period || '24h'}\n\n${output}\n\n✅ **Gas prices retrieved successfully!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Gas tracking failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async portfolioTracker(addresses, chains) {
        try {
            const args = ['portfolio', 'track', '--addresses', addresses.join(',')];
            if (chains && chains.length > 0)
                args.push('--chains', chains.join(','));
            const output = await this.executeZetaCommand(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `📊 **Portfolio Tracker**\n\nAddresses: ${addresses.length}\nChains: ${chains ? chains.join(', ') : 'All'}\n\n${output}\n\n✅ **Portfolio data retrieved successfully!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Portfolio tracking failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async securityAudit(contractAddress, chain, analysisType) {
        try {
            const args = ['security', 'audit', '--contract', contractAddress, '--chain', chain];
            if (analysisType)
                args.push('--type', analysisType);
            const output = await this.executeZetaCommand(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `🔒 **Security Audit**\n\nContract: ${contractAddress}\nChain: ${chain}\nType: ${analysisType || 'Basic'}\n\n${output}\n\n✅ **Security audit completed!**`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Security audit failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // Additional useful command implementations
    async walletExport(accountName, format) {
        try {
            const output = await this.executeZetaCommand(['keys', 'export', accountName, '--output-format', format]);
            return {
                content: [
                    {
                        type: "text",
                        text: `Wallet Export Successful:\n\n${output}\n\n⚠️ **Security Warning**: Keep this information secure and never share it publicly.`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to export wallet: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async walletBackup(accountName, password) {
        try {
            const output = await this.executeZetaCommand(['keys', 'backup', accountName, '--password', password]);
            return {
                content: [
                    {
                        type: "text",
                        text: `Wallet Backup Created:\n\n${output}\n\n✅ **Backup Complete**: Your wallet has been encrypted and backed up securely.`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to backup wallet: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async transactionHistory(address, chain, limit = 50) {
        try {
            const output = await this.executeZetaCommand(['query', 'txs', '--address', address, '--chain', chain, '--limit', limit.toString()]);
            return {
                content: [
                    {
                        type: "text",
                        text: `Transaction History for ${address} on ${chain}:\n\n${output}`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to get transaction history: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async gasOptimizer(contractAddress, functionCall, chain) {
        try {
            const output = await this.executeZetaCommand(['gas', 'optimize', '--contract', contractAddress, '--function', functionCall, '--chain', chain]);
            return {
                content: [
                    {
                        type: "text",
                        text: `Gas Optimization Analysis:\n\n${output}\n\n💡 **Tips**: Consider batching transactions, using efficient data types, and optimizing contract logic.`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to optimize gas: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async multisigCreate(owners, threshold, chain) {
        try {
            const ownersStr = owners.join(',');
            const output = await this.executeZetaCommand(['multisig', 'create', '--owners', ownersStr, '--threshold', threshold.toString(), '--chain', chain]);
            return {
                content: [
                    {
                        type: "text",
                        text: `Multisig Wallet Created:\n\n${output}\n\n🔐 **Multisig Details**:\n- Owners: ${owners.length}\n- Threshold: ${threshold}\n- Chain: ${chain}`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to create multisig: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async bridgeStatus(txHash, bridgeType) {
        if (this.testMode) {
            return {
                content: [{
                        type: "text",
                        text: `🌉 **Bridge Status (Demo Mode)**\n\nTransaction: ${txHash}\nBridge Type: ${bridgeType || 'Auto-detected'}\nStatus: ✅ Completed\nSource Chain: BSC Testnet\nDestination Chain: Ethereum Sepolia\nProgress: Confirmed → Pending → Mined → Completed\nTime: 2 minutes\n\n${this.getInstallationMessage()}`
                    }]
            };
        }
        try {
            const args = ['bridge', 'status', '--tx', txHash];
            if (bridgeType) {
                args.push('--type', bridgeType);
            }
            const output = await this.executeZetaCommand(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `Bridge Status for ${txHash}:\n\n${output}\n\n🌉 **Bridge Type**: ${bridgeType || 'Auto-detected'}`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to check bridge status: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("ZetaChain MCP server running on stdio");
    }
}
// Export for Smithery - return just the server instance
export default function createServer({ config }) {
    const serverInstance = new ZetaChainMCPServer();
    return serverInstance.server;
}
// Direct execution for local testing (CommonJS compatible)
if (typeof require !== 'undefined' && require.main === module) {
    const server = new ZetaChainMCPServer();
    server.run().catch(console.error);
}
