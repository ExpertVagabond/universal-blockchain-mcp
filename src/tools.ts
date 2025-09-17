import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const execAsync = promisify(exec);

// Get the path to the local zetachain CLI
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);
const zetachainPath = join(projectRoot, 'node_modules', '.bin', 'zetachain');

export interface ZetaChainTools {
  createContract: Tool;
  deployContract: Tool;
  queryChain: Tool;
  manageAccounts: Tool;
  getBalance: Tool;
  sendTransaction: Tool;
  listNetworks: Tool;
  generateWallet: Tool;
}

export const tools: ZetaChainTools = {
  createContract: {
    name: 'create_contract',
    description: 'Create a new ZetaChain smart contract project',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the contract project'
        },
        template: {
          type: 'string',
          enum: ['hello', 'swap', 'nft', 'staking', 'counter'],
          description: 'Contract template to use'
        },
        directory: {
          type: 'string',
          description: 'Directory to create the project in (optional)',
        }
      },
      required: ['name']
    }
  },

  deployContract: {
    name: 'deploy_contract',
    description: 'Deploy a ZetaChain smart contract',
    inputSchema: {
      type: 'object',
      properties: {
        contractPath: {
          type: 'string',
          description: 'Path to the contract to deploy'
        },
        network: {
          type: 'string',
          enum: ['testnet', 'mainnet'],
          description: 'Network to deploy to'
        },
        args: {
          type: 'array',
          items: { type: 'string' },
          description: 'Constructor arguments for the contract'
        }
      },
      required: ['contractPath']
    }
  },

  queryChain: {
    name: 'query_chain',
    description: 'Query ZetaChain for information',
    inputSchema: {
      type: 'object',
      properties: {
        queryType: {
          type: 'string',
          enum: ['balance', 'transaction', 'block', 'contract'],
          description: 'Type of query to perform'
        },
        address: {
          type: 'string',
          description: 'Address to query (for balance/contract queries)'
        },
        txHash: {
          type: 'string',
          description: 'Transaction hash (for transaction queries)'
        },
        blockHeight: {
          type: 'string',
          description: 'Block height (for block queries)'
        }
      },
      required: ['queryType']
    }
  },

  manageAccounts: {
    name: 'manage_accounts',
    description: 'Manage ZetaChain accounts',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['list', 'create', 'import', 'export'],
          description: 'Action to perform on accounts'
        },
        name: {
          type: 'string',
          description: 'Account name (for create/import actions)'
        },
        privateKey: {
          type: 'string',
          description: 'Private key (for import action)'
        }
      },
      required: ['action']
    }
  },

  getBalance: {
    name: 'get_balance',
    description: 'Get balance for a ZetaChain address',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Address to check balance for'
        },
        chainId: {
          type: 'string',
          description: 'Chain ID to check balance on (optional)'
        }
      },
      required: ['address']
    }
  },

  sendTransaction: {
    name: 'send_transaction',
    description: 'Send a transaction on ZetaChain',
    inputSchema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Recipient address'
        },
        amount: {
          type: 'string',
          description: 'Amount to send'
        },
        chainId: {
          type: 'string',
          description: 'Target chain ID'
        },
        data: {
          type: 'string',
          description: 'Transaction data (for contract calls)'
        }
      },
      required: ['to', 'amount']
    }
  },

  listNetworks: {
    name: 'list_networks',
    description: 'List available ZetaChain networks and their information',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },

  generateWallet: {
    name: 'generate_wallet',
    description: 'Generate a new ZetaChain wallet',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name for the new wallet'
        }
      },
      required: ['name']
    }
  }
};

// Cache for CLI path resolution and command results
const cliPathCache = new Map<string, string>();
const commandCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute cache for command results

export async function executeZetaChainCommand(command: string, useCache: boolean = false): Promise<{ stdout: string; stderr: string }> {
  try {
    // Check cache for recent identical commands (for read-only operations)
    if (useCache) {
      const cached = commandCache.get(command);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.error(`🚀 Using cached result for: zetachain ${command}`);
        return cached.result;
      }
    }

    // Resolve CLI path with caching
    let zetachainCmd = await resolveZetaChainCLI();
    
    console.error(`🔧 Executing: ${zetachainCmd} ${command}`);
    const startTime = Date.now();
    
    const result = await execAsync(`${zetachainCmd} ${command}`, {
      timeout: 30000, // 30 second timeout
      maxBuffer: 1024 * 1024 // 1MB buffer
    });
    
    const executionTime = Date.now() - startTime;
    console.error(`✅ Command completed in ${executionTime}ms`);
    
    // Cache read-only command results
    if (useCache && isReadOnlyCommand(command)) {
      commandCache.set(command, { result, timestamp: Date.now() });
      
      // Clean old cache entries
      if (commandCache.size > 100) {
        const now = Date.now();
        for (const [key, value] of commandCache.entries()) {
          if (now - value.timestamp > CACHE_TTL) {
            commandCache.delete(key);
          }
        }
      }
    }
    
    return result;
  } catch (error: any) {
    console.error(`❌ ZetaChain CLI error for command "${command}":`, error.message);
    throw new Error(`ZetaChain CLI error: ${error.message}`);
  }
}

async function resolveZetaChainCLI(): Promise<string> {
  const cacheKey = 'zetachain-cli-path';
  
  // Check cache first
  if (cliPathCache.has(cacheKey)) {
    return cliPathCache.get(cacheKey)!;
  }
  
  let zetachainCmd = zetachainPath;
  
  try {
    // Check if local CLI exists
    await execAsync(`test -f ${zetachainPath}`);
    console.error(`📦 Using local ZetaChain CLI: ${zetachainPath}`);
  } catch {
    try {
      // Check if global CLI exists
      await execAsync('which zetachain');
      zetachainCmd = 'zetachain';
      console.error(`🌐 Using global ZetaChain CLI`);
    } catch {
      throw new Error('ZetaChain CLI not found. Please install it with: npm install -g zetachain');
    }
  }
  
  // Cache the resolved path
  cliPathCache.set(cacheKey, zetachainCmd);
  return zetachainCmd;
}

function isReadOnlyCommand(command: string): boolean {
  const readOnlyCommands = [
    'query',
    'accounts list',
    '--help',
    '--version',
    'docs'
  ];
  
  return readOnlyCommands.some(readOnlyCmd => command.includes(readOnlyCmd));
}

// Clear caches periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of commandCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      commandCache.delete(key);
    }
  }
}, CACHE_TTL);