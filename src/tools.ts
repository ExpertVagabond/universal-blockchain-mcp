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

export async function executeZetaChainCommand(command: string): Promise<{ stdout: string; stderr: string }> {
  if (!command || typeof command !== 'string') {
    throw new Error('Invalid command: command must be a non-empty string');
  }

  try {
    // Try to use local zetachain first, fallback to global if not found
    let zetachainCmd = zetachainPath;
    try {
      await execAsync(`test -f ${zetachainPath}`);
    } catch {
      // Fallback to global zetachain if local not found
      zetachainCmd = 'zetachain';
    }
    
    console.log(`Executing ZetaChain command: ${zetachainCmd} ${command}`);
    
    const result = await execAsync(`${zetachainCmd} ${command}`, {
      timeout: 30000, // 30 second timeout
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    return result;
  } catch (error: any) {
    const errorMessage = error.code === 'ENOENT' 
      ? 'ZetaChain CLI not found. Please install the ZetaChain CLI globally or locally.'
      : error.message;
    
    console.error(`ZetaChain CLI execution failed:`, error);
    throw new Error(`ZetaChain CLI error: ${errorMessage}`);
  }
}