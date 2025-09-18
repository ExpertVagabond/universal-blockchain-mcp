#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
class ZetaChainMCPServer {
    server;
    constructor() {
        this.server = new Server({
            name: "zetachain-mcp-server",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.setupErrorHandling();
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "get_zetachain_balance",
                    description: "Get ZetaChain ZETA token balance for a specific wallet address on ZetaChain mainnet or testnet",
                    inputSchema: {
                        type: "object",
                        properties: {
                            address: {
                                type: "string",
                                description: "The wallet address (0x...) to check ZETA balance for",
                                pattern: "^0x[a-fA-F0-9]{40}$"
                            },
                            network: {
                                type: "string",
                                description: "Network to query (mainnet or testnet)",
                                enum: ["mainnet", "testnet"],
                                default: "testnet"
                            }
                        },
                        required: ["address"],
                    },
                },
                {
                    name: "get_zetachain_network_info",
                    description: "Get current ZetaChain network status, including latest block, chain ID, and validator information",
                    inputSchema: {
                        type: "object",
                        properties: {
                            network: {
                                type: "string",
                                description: "Network to query (mainnet or testnet)",
                                enum: ["mainnet", "testnet"],
                                default: "testnet"
                            }
                        },
                    },
                },
                {
                    name: "estimate_cross_chain_fee",
                    description: "Estimate gas fees for cross-chain transactions between supported chains (Ethereum, BSC, Bitcoin, Polygon, etc.)",
                    inputSchema: {
                        type: "object",
                        properties: {
                            fromChain: {
                                type: "string",
                                description: "Source chain identifier",
                                enum: ["ethereum", "bsc", "bitcoin", "polygon", "avalanche", "fantom", "zetachain"],
                            },
                            toChain: {
                                type: "string",
                                description: "Destination chain identifier",
                                enum: ["ethereum", "bsc", "bitcoin", "polygon", "avalanche", "fantom", "zetachain"],
                            },
                            amount: {
                                type: "string",
                                description: "Amount to transfer (in wei/satoshi/smallest unit)",
                                pattern: "^[0-9]+$"
                            },
                            tokenAddress: {
                                type: "string",
                                description: "Token contract address (for ERC20 tokens, optional for native tokens)",
                                pattern: "^0x[a-fA-F0-9]{40}$"
                            }
                        },
                        required: ["fromChain", "toChain", "amount"],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                const toolArgs = args || {};
                switch (name) {
                    case "get_zetachain_balance":
                        if (!toolArgs.address) {
                            throw new Error("Address parameter is required");
                        }
                        if (!this.isValidAddress(toolArgs.address)) {
                            throw new Error("Invalid address format. Address must be a valid Ethereum address (0x...)");
                        }
                        const network = toolArgs.network || "testnet";
                        return await this.getZetaChainBalance(toolArgs.address, network);
                    case "get_zetachain_network_info":
                        const networkInfo = toolArgs.network || "testnet";
                        return await this.getZetaChainNetworkInfo(networkInfo);
                    case "estimate_cross_chain_fee":
                        if (!toolArgs.fromChain || !toolArgs.toChain || !toolArgs.amount) {
                            throw new Error("fromChain, toChain, and amount parameters are required");
                        }
                        if (!this.isValidAmount(toolArgs.amount)) {
                            throw new Error("Invalid amount format. Amount must be a positive integer in smallest unit (wei/satoshi)");
                        }
                        if (toolArgs.tokenAddress && !this.isValidAddress(toolArgs.tokenAddress)) {
                            throw new Error("Invalid token address format");
                        }
                        return await this.estimateCrossChainFee(toolArgs.fromChain, toolArgs.toChain, toolArgs.amount, toolArgs.tokenAddress);
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
                };
            }
        });
    }
    isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
    isValidAmount(amount) {
        return /^[0-9]+$/.test(amount) && BigInt(amount) > 0;
    }
    getNetworkRPC(network) {
        const networks = {
            mainnet: "https://zetachain-evm.blockpi.network/v1/rpc/public",
            testnet: "https://zetachain-athens-evm.blockpi.network/v1/rpc/public"
        };
        return networks[network] || networks.testnet;
    }
    getChainId(network) {
        const chainIds = {
            mainnet: 7000,
            testnet: 7001
        };
        return chainIds[network] || chainIds.testnet;
    }
    async getZetaChainBalance(address, network = "testnet") {
        try {
            const rpcUrl = this.getNetworkRPC(network);
            const chainId = this.getChainId(network);
            // Make RPC call to get balance
            const response = await fetch(rpcUrl, {
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
            if (data.error) {
                throw new Error(`RPC Error: ${data.error.message}`);
            }
            const balanceWei = BigInt(data.result);
            const balanceZeta = Number(balanceWei) / 1e18;
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            address,
                            network,
                            chainId,
                            balance: {
                                wei: data.result,
                                zeta: balanceZeta.toFixed(6),
                                formatted: `${balanceZeta.toFixed(6)} ZETA`
                            }
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch balance: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getZetaChainNetworkInfo(network = "testnet") {
        try {
            const rpcUrl = this.getNetworkRPC(network);
            const chainId = this.getChainId(network);
            // Get latest block
            const blockResponse = await fetch(rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_blockNumber',
                    params: [],
                    id: 1
                })
            });
            const blockData = await blockResponse.json();
            if (blockData.error) {
                throw new Error(`RPC Error: ${blockData.error.message}`);
            }
            const latestBlock = parseInt(blockData.result, 16);
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
    async estimateCrossChainFee(fromChain, toChain, amount, tokenAddress) {
        try {
            // This is a simplified estimation - in reality you'd query ZetaChain's cross-chain protocols
            const chainFeeMultipliers = {
                ethereum: 1.5,
                bsc: 0.8,
                bitcoin: 2.0,
                polygon: 0.6,
                avalanche: 0.9,
                fantom: 0.5,
                zetachain: 0.3
            };
            const baseFee = 0.01; // Base fee in ZETA
            const fromMultiplier = chainFeeMultipliers[fromChain] || 1.0;
            const toMultiplier = chainFeeMultipliers[toChain] || 1.0;
            const estimatedFee = baseFee * fromMultiplier * toMultiplier;
            const amountBN = BigInt(amount);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            fromChain,
                            toChain,
                            amount: amount,
                            tokenAddress: tokenAddress || "native",
                            estimatedFee: {
                                zeta: estimatedFee.toFixed(6),
                                usd: (estimatedFee * 0.65).toFixed(2) // Rough ZETA price estimate
                            },
                            warning: "This is an estimated fee. Actual fees may vary based on network congestion and other factors.",
                            recommendation: "Use ZetaChain's official SDK for precise fee estimation in production applications."
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to estimate fees: ${error instanceof Error ? error.message : String(error)}`);
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
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("ZetaChain MCP server running on stdio");
    }
}
const server = new ZetaChainMCPServer();
server.run().catch(console.error);
