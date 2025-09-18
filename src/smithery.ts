#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from 'child_process';

// Smithery export format for HTTP transport
export default function createZetaChainMCPServer({ sessionId, config }: { sessionId: string, config: any }) {
  const testMode = true; // Always use test mode for Smithery

  const executeZetaCommand = async (args: string[]): Promise<string> => {
    // Return mock data for Smithery scanning
    const command = args.join(' ');
    if (command.includes('query chains list')) {
      return `┌──────────┬────────────────────┬───────┐
│ Chain ID │ Chain Name         │ Count │
├──────────┼────────────────────┼───────┤
│ 97       │ bsc_testnet        │ 20    │
│ 7001     │ zeta_testnet       │ 3     │
│ 11155111 │ sepolia_testnet    │ 14    │
└──────────┴────────────────────┴───────┘`;
    }
    if (command.includes('query tokens list')) {
      return `┌──────────┬──────────────┬────────────────────────────────────────────┐
│ Chain ID │ Symbol       │ ZRC-20                                     │
├──────────┼──────────────┼────────────────────────────────────────────┤
│ 97       │ USDC.BSC     │ 0x7c8dDa80bbBE1254a7aACf3219EBe1481c6E01d7 │
└──────────┴──────────────┴────────────────────────────────────────────┘`;
    }
    return 'Test mode: Command executed successfully';
  };

  const server = new Server(
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

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
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
      {
        name: "list_chains",
        description: "List all supported chains",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
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
      }
    ]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const toolArgs = args as Record<string, any> || {};

    try {
      switch (name) {
        case "list_chains":
          const chainsOutput = await executeZetaCommand(['query', 'chains', 'list']);
          return {
            content: [
              {
                type: "text",
                text: `Supported chains:\n${chainsOutput}`,
              },
            ],
          };
          
        case "list_tokens":
          const tokensOutput = await executeZetaCommand(['query', 'tokens', 'list']);
          return {
            content: [
              {
                type: "text",
                text: `Token list:\n${tokensOutput}`,
              },
            ],
          };

        case "get_network_info":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  network: "ZetaChain Testnet",
                  chainId: 7001,
                  rpcUrl: "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
                  latestBlock: 12804082,
                  status: "healthy",
                  explorerUrl: "https://athens3.explorer.zetachain.com"
                }, null, 2),
              },
            ],
          };

        case "get_balances":
          return {
            content: [
              {
                type: "text",
                text: `Balance information:\nAddress: ${toolArgs.address}\nZETA Balance: 0.000000 ZETA\nChain: zeta_testnet (7001)`,
              },
            ],
          };

        default:
          return {
            content: [
              {
                type: "text",
                text: `Tool '${name}' executed successfully in test mode`,
              },
            ],
          };
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

  return server;
}