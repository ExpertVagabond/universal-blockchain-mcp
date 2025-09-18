#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { z } from 'zod';

const execAsync = promisify(exec);

// Configuration schema
const configSchema = z.object({
  network: z.enum(['testnet', 'mainnet']).default('testnet'),
  privateKey: z.string().optional(),
  rpcUrl: z.string().optional(),
  enableAnalytics: z.boolean().default(false),
  debug: z.boolean().default(false),
});

type Config = z.infer<typeof configSchema>;

class ZetaChainMCPServer {
  private server: Server;
  private config: Config;

  constructor(config: Partial<Config> = {}) {
    this.config = configSchema.parse(config);
    this.server = new Server(
      {
        name: 'zetachain-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'zetachain_accounts_list',
            description: 'List all ZetaChain accounts',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'zetachain_query_balances',
            description: 'Query account balances',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Account name',
                  default: 'default',
                },
              },
              required: [],
            },
          },
          {
            name: 'zetachain_localnet_check',
            description: 'Check localnet status',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'zetachain_faucet_request',
            description: 'Request testnet tokens from faucet',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Account name',
                  default: 'default',
                },
              },
              required: [],
            },
          },
          {
            name: 'zetachain_query_chains',
            description: 'List supported chains',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'zetachain_query_tokens',
            description: 'List ZRC-20 tokens',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result: string;

        switch (name) {
          case 'zetachain_accounts_list':
            result = await this.executeCommand('zetachain accounts list');
            break;

          case 'zetachain_query_balances':
            const accountName = (args as any)?.name || 'default';
            result = await this.executeCommand(`zetachain query balances --name ${accountName}`);
            break;

          case 'zetachain_localnet_check':
            result = await this.executeCommand('zetachain localnet check');
            break;

          case 'zetachain_faucet_request':
            const faucetAccount = (args as any)?.name || 'default';
            result = await this.executeCommand(`zetachain faucet --name ${faucetAccount}`);
            break;

          case 'zetachain_query_chains':
            result = await this.executeCommand('zetachain query chains list');
            break;

          case 'zetachain_query_tokens':
            result = await this.executeCommand('zetachain query tokens list');
            break;

          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async executeCommand(command: string): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync(command, {
        env: {
          ...process.env,
          ZETACHAIN_NETWORK: this.config.network,
          ...(this.config.enableAnalytics ? {} : { NO_ANALYTICS: 'true' }),
        },
      });

      if (stderr && this.config.debug) {
        console.error('Command stderr:', stderr);
      }

      return stdout || 'Command executed successfully';
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Command failed: ${error.message}`);
      }
      throw error;
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('ZetaChain MCP Server running on stdio');
  }
}

// Factory function for Smithery
export function createServer(config: Partial<Config> = {}) {
  return new ZetaChainMCPServer(config);
}

// Run if called directly
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].includes('index')) {
  const server = new ZetaChainMCPServer();
  server.run().catch(console.error);
}