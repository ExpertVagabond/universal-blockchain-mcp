import { CallToolRequest, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { executeZetaChainCommand } from './tools.js';
import { Config } from './config.js';

export async function handleToolCall(
  request: CallToolRequest,
  config: Config
): Promise<CallToolResult> {
  const { name, arguments: args } = request.params;

  // Validate request structure
  if (!name || typeof name !== 'string') {
    return {
      content: [
        {
          type: 'text',
          text: '❌ Error: Tool name is required and must be a string'
        }
      ],
      isError: true
    };
  }

  if (!args || typeof args !== 'object') {
    return {
      content: [
        {
          type: 'text',
          text: '❌ Error: Tool arguments are required and must be an object'
        }
      ],
      isError: true
    };
  }

  try {
    console.error(`🔧 Executing tool: ${name} with args:`, JSON.stringify(args, null, 2));
    
    switch (name) {
      case 'create_contract':
        return await handleCreateContract(args as any, config);
      
      case 'deploy_contract':
        return await handleDeployContract(args as any, config);
      
      case 'query_chain':
        return await handleQueryChain(args as any, config);
      
      case 'manage_accounts':
        return await handleManageAccounts(args as any, config);
      
      case 'get_balance':
        return await handleGetBalance(args as any, config);
      
      case 'send_transaction':
        return await handleSendTransaction(args as any, config);
      
      case 'list_networks':
        return await handleListNetworks(config);
      
      case 'generate_wallet':
        return await handleGenerateWallet(args as any, config);
      
      default:
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error: Unknown tool '${name}'. Available tools: create_contract, deploy_contract, query_chain, manage_accounts, get_balance, send_transaction, list_networks, generate_wallet`
            }
          ],
          isError: true
        };
    }
  } catch (error: any) {
    console.error(`❌ Tool execution failed for ${name}:`, error);
    
    // Provide more detailed error information
    const errorMessage = error.message || 'Unknown error occurred';
    const errorDetails = error.stack ? `\n\nStack trace: ${error.stack}` : '';
    
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error executing '${name}': ${errorMessage}${process.env.NODE_ENV === 'development' ? errorDetails : ''}`
        }
      ],
      isError: true
    };
  }
}

async function handleCreateContract(args: { name: string; template?: string; directory?: string }, config: Config): Promise<CallToolResult> {
  // Validate required parameters
  if (!args.name || typeof args.name !== 'string' || args.name.trim() === '') {
    throw new Error('Contract name is required and must be a non-empty string');
  }

  // Validate template if provided
  const validTemplates = ['hello', 'swap', 'nft', 'staking', 'counter'];
  if (args.template && !validTemplates.includes(args.template)) {
    throw new Error(`Invalid template '${args.template}'. Valid templates: ${validTemplates.join(', ')}`);
  }

  // Validate directory path if provided
  if (args.directory && (typeof args.directory !== 'string' || args.directory.trim() === '')) {
    throw new Error('Directory must be a non-empty string if provided');
  }

  const { name, template = 'hello', directory } = args;
  
  let command = `new ${name}`;
  if (template !== 'hello') {
    command += ` --template ${template}`;
  }
  if (directory) {
    command += ` --path ${directory}`;
  }
  if (!config.enableAnalytics) {
    command += ' --no-analytics';
  }

  const result = await executeZetaChainCommand(command);
  
  return {
    content: [
      {
        type: 'text',
        text: `✅ Contract project '${name}' created successfully!\n\n📁 Template: ${template}\n${directory ? `📂 Directory: ${directory}\n` : ''}🔧 Command executed: zetachain ${command}\n\n📋 Output:\n${result.stdout}`
      }
    ]
  };
}

async function handleDeployContract(args: { contractPath: string; network?: string; args?: string[] }, config: Config): Promise<CallToolResult> {
  const { contractPath, network = config.network, args: constructorArgs = [] } = args;
  
  // This would typically involve compilation and deployment
  // For now, we'll show how to prepare for deployment
  const result = await executeZetaChainCommand(`--help`);
  
  return {
    content: [
      {
        type: 'text',
        text: `🚀 Contract deployment prepared for ${contractPath} on ${network}\n\nNote: Actual deployment requires compilation with hardhat/foundry and deployment scripts.\nRefer to ZetaChain documentation for deployment steps.`
      }
    ]
  };
}

async function handleQueryChain(args: { queryType: string; address?: string; txHash?: string; blockHeight?: string }, config: Config): Promise<CallToolResult> {
  const { queryType, address, txHash, blockHeight } = args;
  
  let command = '';
  
  switch (queryType) {
    case 'balance':
      if (!address) throw new Error('Address is required for balance queries');
      command = `query balance ${address}`;
      break;
    case 'transaction':
      if (!txHash) throw new Error('Transaction hash is required for transaction queries');
      command = `query tx ${txHash}`;
      break;
    case 'block':
      command = blockHeight ? `query block ${blockHeight}` : 'query block latest';
      break;
    default:
      throw new Error(`Unsupported query type: ${queryType}`);
  }

  const result = await executeZetaChainCommand(command, true); // Use cache for query operations
  
  return {
    content: [
      {
        type: 'text',
        text: `📊 Query Result:\n\n${result.stdout}`
      }
    ]
  };
}

async function handleManageAccounts(args: { action: string; name?: string; privateKey?: string }, config: Config): Promise<CallToolResult> {
  const { action, name, privateKey } = args;
  
  let command = '';
  
  switch (action) {
    case 'list':
      command = 'accounts list';
      break;
    case 'create':
      if (!name) throw new Error('Name is required for creating accounts');
      command = `accounts create ${name}`;
      break;
    case 'import':
      if (!name || !privateKey) throw new Error('Name and private key are required for importing accounts');
      command = `accounts import ${name} ${privateKey}`;
      break;
    default:
      throw new Error(`Unsupported account action: ${action}`);
  }

  const result = await executeZetaChainCommand(command, action === 'list'); // Use cache for list operations
  
  return {
    content: [
      {
        type: 'text',
        text: `👤 Account Management Result:\n\n${result.stdout}`
      }
    ]
  };
}

async function handleGetBalance(args: { address: string; chainId?: string }, config: Config): Promise<CallToolResult> {
  const { address, chainId } = args;
  
  let command = `query balance ${address}`;
  if (chainId) {
    command += ` --chain ${chainId}`;
  }

  const result = await executeZetaChainCommand(command, true); // Use cache for balance queries
  
  return {
    content: [
      {
        type: 'text',
        text: `💰 Balance Query Result:\n\n${result.stdout}`
      }
    ]
  };
}

async function handleSendTransaction(args: { to: string; amount: string; chainId?: string; data?: string }, config: Config): Promise<CallToolResult> {
  const { to, amount, chainId, data } = args;
  
  // Note: This is a simplified example. In practice, you'd want more validation and safety checks
  let command = `send ${to} ${amount}`;
  if (chainId) {
    command += ` --chain ${chainId}`;
  }
  if (data) {
    command += ` --data ${data}`;
  }

  return {
    content: [
      {
        type: 'text',
        text: `⚠️ Transaction preparation completed.\n\nTo: ${to}\nAmount: ${amount}\nChain: ${chainId || 'default'}\n\nNote: For security, actual transaction sending should be confirmed manually. Use the ZetaChain CLI directly for sensitive operations.`
      }
    ]
  };
}

async function handleListNetworks(config: Config): Promise<CallToolResult> {
  return {
    content: [
      {
        type: 'text',
        text: `🌐 ZetaChain Networks:\n\n` +
              `📡 Testnet (Current: ${config.network === 'testnet' ? '✅' : '❌'})\n` +
              `- Chain ID: 7001\n` +
              `- RPC: https://zetachain-evm.blockpi.network/v1/rpc/public\n` +
              `- Explorer: https://zetachain.blockscout.com/\n\n` +
              `🚀 Mainnet (Current: ${config.network === 'mainnet' ? '✅' : '❌'})\n` +
              `- Chain ID: 7000\n` +
              `- RPC: https://zetachain-evm.blockpi.network/v1/rpc/public\n` +
              `- Explorer: https://zetachain.blockscout.com/`
      }
    ]
  };
}

async function handleGenerateWallet(args: { name: string }, config: Config): Promise<CallToolResult> {
  const { name } = args;
  
  const command = `accounts create ${name}`;
  const result = await executeZetaChainCommand(command);
  
  return {
    content: [
      {
        type: 'text',
        text: `🔐 New Wallet Generated:\n\n${result.stdout}\n\n⚠️ Important: Save your private key securely. Never share it with anyone!`
      }
    ]
  };
}