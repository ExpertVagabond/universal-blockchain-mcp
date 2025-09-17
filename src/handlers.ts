import { CallToolRequest, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { executeZetaChainCommand } from './tools.js';
import { Config } from './config.js';

export async function handleToolCall(
  request: CallToolRequest,
  config: Config
): Promise<CallToolResult> {
  const { name, arguments: args } = request.params;

  try {
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
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

async function handleCreateContract(args: { name: string; template?: string; directory?: string }, config: Config): Promise<CallToolResult> {
  const { name, template = 'hello', directory } = args;
  
  try {
    // The 'new' command creates a new universal contract project
    let command = 'new';
    
    // Add options based on the CLI help output
    const options = [];
    
    // Use --output for the directory/name
    if (directory || name) {
      const outputPath = directory ? `${directory}/${name}` : name;
      options.push(`--output ${outputPath}`);
    }
    
    // Use --project for the template
    if (template) {
      options.push(`--project ${template}`);
    }
    
    if (!config.enableAnalytics) {
      options.push('--no-analytics');
    }
    
    // Build the final command
    if (options.length > 0) {
      command += ` ${options.join(' ')}`;
    }

    const result = await executeZetaChainCommand(command);
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Contract project '${name}' created successfully!\n\n${result.stdout || 'Project created.'}`
        }
      ]
    };
  } catch (error: any) {
    // If the command fails, provide helpful guidance
    if (error.message.includes('unknown')) {
      return {
        content: [
          {
            type: 'text',
            text: `📝 Contract Creation Guide for '${name}'\n\n` +
                  `To create a new ZetaChain contract project:\n` +
                  `1. Run: zetachain new --output ${name}\n` +
                  `2. Choose your project template from the interactive menu\n` +
                  `3. Follow the setup instructions\n\n` +
                  `Available templates include: hello, swap, nft, staking, counter`
          }
        ]
      };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `❌ Failed to create contract project: ${error.message}`
        }
      ],
      isError: true
    };
  }
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
  
  try {
    // Note: The actual query commands may vary based on the zetachain CLI version
    // For now, return informative messages about what would be queried
    let message = '';
    
    switch (queryType) {
      case 'balance':
        if (!address) throw new Error('Address is required for balance queries');
        message = `📊 Balance query for address: ${address}\n\nNote: Balance queries require network connection and may need additional setup.`;
        break;
      case 'transaction':
        if (!txHash) throw new Error('Transaction hash is required for transaction queries');
        message = `📊 Transaction query for hash: ${txHash}\n\nNote: Transaction queries require network connection.`;
        break;
      case 'block':
        const height = blockHeight || 'latest';
        message = `📊 Block query for height: ${height}\n\nNote: Block queries require network connection.`;
        break;
      case 'contract':
        if (!address) throw new Error('Address is required for contract queries');
        message = `📊 Contract query for address: ${address}\n\nNote: Contract queries require network connection.`;
        break;
      default:
        throw new Error(`Unsupported query type: ${queryType}`);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: message
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Query failed: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

async function handleManageAccounts(args: { action: string; name?: string; privateKey?: string }, config: Config): Promise<CallToolResult> {
  const { action, name, privateKey } = args;
  
  try {
    let command = '';
    
    switch (action) {
      case 'list':
        // List all available accounts
        command = 'accounts list';
        break;
      case 'create':
        if (!name) throw new Error('Name is required for creating accounts');
        // Create a new account with the given name
        command = `accounts create --key ${name}`;
        break;
      case 'import':
        if (!name || !privateKey) throw new Error('Name and private key are required for importing accounts');
        // For security reasons, we provide guidance rather than handling private keys directly
        return {
          content: [
            {
              type: 'text',
              text: `👤 Account Import Guide\n\n` +
                    `To import an account '${name}':\n` +
                    `1. Run: zetachain accounts import --key ${name}\n` +
                    `2. Enter your private key or mnemonic when prompted\n\n` +
                    `⚠️ Security Note: Never share private keys. Always import directly through the CLI.`
            }
          ]
        };
      case 'export':
        if (!name) throw new Error('Name is required for exporting accounts');
        // Show account details
        command = `accounts show --key ${name}`;
        break;
      default:
        throw new Error(`Unsupported account action: ${action}`);
    }

    const result = await executeZetaChainCommand(command);
    
    return {
      content: [
        {
          type: 'text',
          text: `👤 Account Management Result:\n\n${result.stdout || result.stderr || 'Command executed'}`
        }
      ]
    };
  } catch (error: any) {
    // Provide helpful guidance if the command fails
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      return {
        content: [
          {
            type: 'text',
            text: `📝 Account Management Guide\n\n` +
                  `Available commands:\n` +
                  `• zetachain accounts list - List all accounts\n` +
                  `• zetachain accounts create --key <name> - Create new account\n` +
                  `• zetachain accounts show --key <name> - Show account details\n` +
                  `• zetachain accounts delete --key <name> - Delete account\n` +
                  `• zetachain accounts import --key <name> - Import account\n\n` +
                  `Note: Some operations may require additional setup or configuration.`
          }
        ]
      };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `❌ Account management failed: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

async function handleGetBalance(args: { address: string; chainId?: string }, config: Config): Promise<CallToolResult> {
  const { address, chainId } = args;
  
  try {
    // The query command exists but specific balance queries may require network setup
    return {
      content: [
        {
          type: 'text',
          text: `💰 Balance Query\n\nAddress: ${address}\nChain: ${chainId || config.network}\n\nNote: Balance queries require network connection. Use the faucet command to request testnet tokens.`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Balance query failed: ${error.message}`
        }
      ],
      isError: true
    };
  }
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
  
  try {
    // Wallet generation typically involves creating a new mnemonic and deriving keys
    // The actual command might vary based on the CLI version
    return {
      content: [
        {
          type: 'text',
          text: `🔐 Wallet Generation Request for: ${name}\n\n` +
                `To generate a new wallet:\n` +
                `1. Use the 'zetachain accounts' command to manage wallets\n` +
                `2. Store your mnemonic phrase securely\n` +
                `3. Never share your private keys\n\n` +
                `⚠️ Important: This is a sensitive operation. Please use the CLI directly for wallet generation.`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Wallet generation failed: ${error.message}`
        }
      ],
      isError: true
    };
  }
}