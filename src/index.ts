/**
 * ZetaChain MCP Server
 * Provides AI assistants with access to ZetaChain blockchain development tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { ZetaChainTools } from "./tools"
import { ZetaChainHandlers } from "./handlers"
import { configSchema as zetaConfigSchema } from "./config"

// Configuration schema that maps to smithery.yaml
export const configSchema = z.object({
	network: z.enum(['testnet', 'mainnet']).default('testnet').describe("ZetaChain network to connect to"),
	privateKey: z.string().optional().describe("Private key for transactions (optional)"),
	rpcUrl: z.string().optional().describe("Custom RPC URL (optional)"),
	enableAnalytics: z.boolean().default(false).describe("Enable analytics collection"),
	debug: z.boolean().default(false).describe("Enable debug logging"),
})

export default function createServer({
	config,
}: {
	config: z.infer<typeof configSchema>
}) {
	const server = new McpServer({
		name: "ZetaChain MCP Server",
		version: "1.0.0",
	})

	// Initialize ZetaChain tools and handlers
	const tools = new ZetaChainTools(config)
	const handlers = new ZetaChainHandlers(config)

	// Register all ZetaChain tools
	server.registerTool(
		"create_contract",
		{
			title: "Create Contract",
			description: "Create a new ZetaChain smart contract project",
			inputSchema: {
				name: z.string().describe("Contract project name"),
				template: z.string().optional().describe("Template to use (e.g., 'counter', 'erc20')"),
			},
		},
		async (args) => handlers.createContract(args),
	)

	server.registerTool(
		"deploy_contract", 
		{
			title: "Deploy Contract",
			description: "Deploy a smart contract to ZetaChain",
			inputSchema: {
				contractPath: z.string().describe("Path to contract file"),
				network: z.string().optional().describe("Target network"),
			},
		},
		async (args) => handlers.deployContract(args),
	)

	server.registerTool(
		"query_chain",
		{
			title: "Query Chain",
			description: "Query blockchain data (balances, transactions, blocks)",
			inputSchema: {
				query: z.string().describe("Query type: 'balance', 'transaction', 'block'"),
				address: z.string().optional().describe("Address to query"),
				txHash: z.string().optional().describe("Transaction hash"),
				blockNumber: z.string().optional().describe("Block number"),
			},
		},
		async (args) => handlers.queryChain(args),
	)

	server.registerTool(
		"manage_accounts",
		{
			title: "Manage Accounts", 
			description: "Create and manage ZetaChain accounts",
			inputSchema: {
				action: z.enum(['list', 'create', 'import', 'delete']).describe("Account management action"),
				name: z.string().optional().describe("Account name"),
				privateKey: z.string().optional().describe("Private key for import"),
			},
		},
		async (args) => handlers.manageAccounts(args),
	)

	server.registerTool(
		"get_balance",
		{
			title: "Get Balance",
			description: "Check account balances across networks",
			inputSchema: {
				address: z.string().describe("Account address"),
				network: z.string().optional().describe("Network to check"),
			},
		},
		async (args) => handlers.getBalance(args),
	)

	server.registerTool(
		"send_transaction",
		{
			title: "Send Transaction",
			description: "Prepare and send transactions",
			inputSchema: {
				to: z.string().describe("Recipient address"), 
				amount: z.string().describe("Amount to send"),
				network: z.string().optional().describe("Network to use"),
			},
		},
		async (args) => handlers.sendTransaction(args),
	)

	server.registerTool(
		"list_networks",
		{
			title: "List Networks",
			description: "Display available ZetaChain networks and their information",
			inputSchema: {},
		},
		async (args) => handlers.listNetworks(args),
	)

	server.registerTool(
		"generate_wallet",
		{
			title: "Generate Wallet",
			description: "Create new wallets and key pairs",
			inputSchema: {
				name: z.string().optional().describe("Wallet name"),
			},
		},
		async (args) => handlers.generateWallet(args),
	)

	return server.server
}
