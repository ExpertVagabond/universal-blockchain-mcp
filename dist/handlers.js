import { executeZetaChainCommand } from './tools.js';
export async function handleToolCall(request, config) {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'create_contract':
                return await handleCreateContract(args, config);
            case 'deploy_contract':
                return await handleDeployContract(args, config);
            case 'query_chain':
                return await handleQueryChain(args, config);
            case 'manage_accounts':
                return await handleManageAccounts(args, config);
            case 'get_balance':
                return await handleGetBalance(args, config);
            case 'send_transaction':
                return await handleSendTransaction(args, config);
            case 'list_networks':
                return await handleListNetworks(config);
            case 'generate_wallet':
                return await handleGenerateWallet(args, config);
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
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
async function handleCreateContract(args, config) {
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
                text: `✅ Contract project '${name}' created successfully!\n\n${result.stdout}`
            }
        ]
    };
}
async function handleDeployContract(args, config) {
    const { contractPath, network = config.network } = args;
    return {
        content: [
            {
                type: 'text',
                text: `🚀 Contract deployment prepared for ${contractPath} on ${network}\n\nNote: Actual deployment requires compilation with hardhat/foundry and deployment scripts.`
            }
        ]
    };
}
async function handleQueryChain(args, config) {
    const { queryType, address, txHash, blockHeight } = args;
    let command = '';
    switch (queryType) {
        case 'balance':
            if (!address)
                throw new Error('Address is required for balance queries');
            command = `query balance ${address}`;
            break;
        case 'transaction':
            if (!txHash)
                throw new Error('Transaction hash is required for transaction queries');
            command = `query tx ${txHash}`;
            break;
        case 'block':
            command = blockHeight ? `query block ${blockHeight}` : 'query block latest';
            break;
        default:
            throw new Error(`Unsupported query type: ${queryType}`);
    }
    const result = await executeZetaChainCommand(command);
    return {
        content: [
            {
                type: 'text',
                text: `📊 Query Result:\n\n${result.stdout}`
            }
        ]
    };
}
async function handleManageAccounts(args, config) {
    const { action, name, privateKey } = args;
    let command = '';
    switch (action) {
        case 'list':
            command = 'accounts list';
            break;
        case 'create':
            if (!name)
                throw new Error('Name is required for creating accounts');
            command = `accounts create ${name}`;
            break;
        case 'import':
            if (!name || !privateKey)
                throw new Error('Name and private key are required for importing accounts');
            command = `accounts import ${name} ${privateKey}`;
            break;
        default:
            throw new Error(`Unsupported account action: ${action}`);
    }
    const result = await executeZetaChainCommand(command);
    return {
        content: [
            {
                type: 'text',
                text: `👤 Account Management Result:\n\n${result.stdout}`
            }
        ]
    };
}
async function handleGetBalance(args, config) {
    const { address, chainId } = args;
    let command = `query balance ${address}`;
    if (chainId) {
        command += ` --chain ${chainId}`;
    }
    const result = await executeZetaChainCommand(command);
    return {
        content: [
            {
                type: 'text',
                text: `💰 Balance Query Result:\n\n${result.stdout}`
            }
        ]
    };
}
async function handleSendTransaction(args, config) {
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
async function handleListNetworks(config) {
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
async function handleGenerateWallet(args, config) {
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
//# sourceMappingURL=handlers.js.map