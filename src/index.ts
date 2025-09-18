#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

class ZetaChainMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "zetachain-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "get_zetachain_balance",
          description: "Get ZetaChain token balance for an address",
          inputSchema: {
            type: "object",
            properties: {
              address: {
                type: "string",
                description: "The wallet address to check balance for",
              },
            },
            required: ["address"],
          },
        },
        {
          name: "get_zetachain_network_info",
          description: "Get ZetaChain network information",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "estimate_cross_chain_fee",
          description: "Estimate fees for cross-chain transactions",
          inputSchema: {
            type: "object",
            properties: {
              fromChain: {
                type: "string",
                description: "Source chain identifier",
              },
              toChain: {
                type: "string",
                description: "Destination chain identifier",
              },
              amount: {
                type: "string",
                description: "Amount to transfer",
              },
            },
            required: ["fromChain", "toChain", "amount"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const toolArgs = args as Record<string, any> || {};

        switch (name) {
          case "get_zetachain_balance":
            if (!toolArgs.address) {
              throw new Error("Address parameter is required");
            }
            return await this.getZetaChainBalance(toolArgs.address);

          case "get_zetachain_network_info":
            return await this.getZetaChainNetworkInfo();

          case "estimate_cross_chain_fee":
            if (!toolArgs.fromChain || !toolArgs.toChain || !toolArgs.amount) {
              throw new Error("fromChain, toChain, and amount parameters are required");
            }
            return await this.estimateCrossChainFee(
              toolArgs.fromChain,
              toolArgs.toChain,
              toolArgs.amount
            );

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
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

  private async getZetaChainBalance(address: string) {
    // Mock implementation - replace with actual ZetaChain API calls
    return {
      content: [
        {
          type: "text",
          text: `ZetaChain balance for ${address}: 1000.0 ZETA`,
        },
      ],
    };
  }

  private async getZetaChainNetworkInfo() {
    // Mock implementation - replace with actual ZetaChain API calls
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            network: "ZetaChain Mainnet",
            chainId: "7000",
            blockHeight: 1234567,
            status: "healthy",
          }, null, 2),
        },
      ],
    };
  }

  private async estimateCrossChainFee(fromChain: string, toChain: string, amount: string) {
    // Mock implementation - replace with actual ZetaChain API calls
    return {
      content: [
        {
          type: "text",
          text: `Cross-chain fee estimate from ${fromChain} to ${toChain} for ${amount}: 0.1 ZETA`,
        },
      ],
    };
  }

  private setupErrorHandling() {
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