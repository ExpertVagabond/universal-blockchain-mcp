import { CallToolRequest, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { executeZetaChainCommand } from './tools.js';
import { Config, validateAddress, sanitizeInput } from './config.js';
import { logger, LogLevel } from './logger.js';
import { performanceMonitor, withTiming } from './performance.js';
import { healthMonitor } from './health.js';

export async function handleToolCall(
  request: CallToolRequest,
  config: Config
): Promise<CallToolResult> {
  const { name, arguments: args } = request.params;
  const timer = performanceMonitor.startTimer();

  logger.info('Tool call initiated', { tool: name, args });

  try {
    let result: CallToolResult;
    
    switch (name) {
      case 'create_contract':
        result = await handleCreateContract(args as any, config);
        break;
      
      case 'deploy_contract':
        result = await handleDeployContract(args as any, config);
        break;
      
      case 'query_chain':
        result = await handleQueryChain(args as any, config);
        break;
      
      case 'manage_accounts':
        result = await handleManageAccounts(args as any, config);
        break;
      
      case 'get_balance':
        result = await handleGetBalance(args as any, config);
        break;
      
      case 'send_transaction':
        result = await handleSendTransaction(args as any, config);
        break;
      
      case 'list_networks':
        result = await handleListNetworks(config);
        break;
      
      case 'generate_wallet':
        result = await handleGenerateWallet(args as any, config);
        break;
      
      case 'health_check':
        result = await handleHealthCheck(config);
        break;
      
      case 'get_metrics':
        result = await handleGetMetrics(args as any);
        break;
      
      case 'get_logs':
        result = await handleGetLogs(args as any);
        break;
      
      case 'clear_cache':
        result = await handleClearCache(args as any);
        break;
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    const duration = timer();
    performanceMonitor.recordToolCall(name, duration, true);
    logger.info('Tool call completed successfully', { tool: name, duration });
    
    return result;
  } catch (error: any) {
    const duration = timer();
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    performanceMonitor.recordToolCall(name, duration, false);
    logger.error('Tool call failed', { tool: name, duration, error: errorMessage }, error);
    
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error executing ${name}: ${errorMessage}`
        }
      ],
      isError: true
    };
  }
}

async function handleCreateContract(args: { name: string; template?: string; directory?: string }, config: Config): Promise<CallToolResult> {
  const { name, template = 'hello', directory } = args;
  
  // Validate contract name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('Contract name is required and must be a non-empty string');
  }
  
  // Sanitize name to prevent command injection
  const sanitizedName = name.replace(/[^a-zA-Z0-9_-]/g, '');
  if (sanitizedName !== name) {
    throw new Error('Contract name contains invalid characters. Only letters, numbers, hyphens, and underscores are allowed.');
  }
  
  let command = `new ${sanitizedName}`;
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

async function handleGetBalance(args: { address: string; chainId?: string }, config: Config): Promise<CallToolResult> {
  const { address, chainId } = args;
  
  // Validate address format using the utility function
  if (!validateAddress(address)) {
    throw new Error('Invalid address format. Please provide a valid blockchain address.');
  }
  
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
  const cacheKey = `networks_${config.network}`;
  
  // Check cache first
  const cachedResult = performanceMonitor.getCacheItem<CallToolResult>(cacheKey);
  if (cachedResult) {
    logger.debug('Returning cached network list');
    return cachedResult;
  }

  const result: CallToolResult = {
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

  // Cache for 10 minutes (networks don't change often)
  performanceMonitor.setCacheItem(cacheKey, result, 600000);
  
  return result;
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

async function handleHealthCheck(config: Config): Promise<CallToolResult> {
  const health = await healthMonitor.performHealthCheck(config);
  
  const statusIcon = health.status === 'healthy' ? '✅' : 
                    health.status === 'degraded' ? '⚠️' : '❌';
  
  let text = `${statusIcon} **Health Status: ${health.status.toUpperCase()}**\n\n`;
  text += `🕒 **Uptime:** ${Math.round(health.uptime / 1000)}s\n`;
  text += `📦 **Version:** ${health.version}\n`;
  text += `🧠 **Memory:** ${Math.round(health.memoryUsage.heapUsed / 1024 / 1024)}MB used\n\n`;
  
  text += `**Component Status:**\n`;
  for (const [component, check] of Object.entries(health.checks)) {
    const checkIcon = check.status === 'pass' ? '✅' : 
                     check.status === 'warn' ? '⚠️' : '❌';
    text += `${checkIcon} **${component}**: ${check.message}\n`;
    if (check.responseTime) {
      text += `   Response time: ${check.responseTime}ms\n`;
    }
  }
  
  return {
    content: [
      {
        type: 'text',
        text
      }
    ]
  };
}

async function handleGetMetrics(args: { detailed?: boolean }): Promise<CallToolResult> {
  const { detailed = false } = args;
  const metrics = performanceMonitor.getMetrics();
  
  let text = `📊 **Performance Metrics**\n\n`;
  
  text += `**Tool Calls:**\n`;
  text += `• Total: ${metrics.toolCalls.total}\n`;
  text += `• Successful: ${metrics.toolCalls.successful}\n`;
  text += `• Failed: ${metrics.toolCalls.failed}\n`;
  text += `• Average Response Time: ${metrics.toolCalls.averageResponseTime}ms\n`;
  
  if (metrics.toolCalls.slowestCall) {
    text += `• Slowest Call: ${metrics.toolCalls.slowestCall.tool} (${metrics.toolCalls.slowestCall.duration}ms)\n`;
  }
  
  text += `\n**Cache Performance:**\n`;
  text += `• Hits: ${metrics.cache.hits}\n`;
  text += `• Misses: ${metrics.cache.misses}\n`;
  text += `• Hit Rate: ${metrics.cache.hitRate}%\n`;
  
  text += `\n**Memory Usage:**\n`;
  text += `• Heap Used: ${Math.round(metrics.memory.heapUsed / 1024 / 1024)}MB\n`;
  text += `• Heap Total: ${Math.round(metrics.memory.heapTotal / 1024 / 1024)}MB\n`;
  text += `• RSS: ${Math.round(metrics.memory.rss / 1024 / 1024)}MB\n`;
  
  text += `\n**Uptime:** ${Math.round(metrics.uptime / 1000)}s\n`;
  
  if (detailed) {
    const recentCalls = performanceMonitor.getRecentCalls(5);
    if (recentCalls.length > 0) {
      text += `\n**Recent Calls (last 5 minutes):**\n`;
      recentCalls.slice(-10).forEach(call => {
        const status = call.success ? '✅' : '❌';
        text += `${status} ${call.tool}: ${call.duration}ms\n`;
      });
    }
  }
  
  return {
    content: [
      {
        type: 'text',
        text
      }
    ]
  };
}

async function handleGetLogs(args: { level?: string; count?: number }): Promise<CallToolResult> {
  const { level, count = 50 } = args;
  
  let logs;
  if (level) {
    const logLevel = LogLevel[level as keyof typeof LogLevel];
    logs = logger.getLogsByLevel(logLevel, count);
  } else {
    logs = logger.getRecentLogs(count);
  }
  
  if (logs.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: `📝 No logs found${level ? ` for level ${level}` : ''}`
        }
      ]
    };
  }
  
  let text = `📝 **Recent Logs**${level ? ` (${level} level)` : ''}\n\n`;
  
  logs.forEach(log => {
    const levelName = LogLevel[log.level];
    const icon = log.level === LogLevel.ERROR ? '❌' : 
                log.level === LogLevel.WARN ? '⚠️' : 
                log.level === LogLevel.INFO ? 'ℹ️' : '🔍';
    
    text += `${icon} **[${log.timestamp}]** ${levelName}: ${log.message}\n`;
    if (log.context) {
      text += `   Context: ${JSON.stringify(log.context)}\n`;
    }
    if (log.error) {
      text += `   Error: ${log.error.message}\n`;
    }
    text += `\n`;
  });
  
  return {
    content: [
      {
        type: 'text',
        text
      }
    ]
  };
}

async function handleClearCache(args: { confirm: boolean }): Promise<CallToolResult> {
  if (!args.confirm) {
    return {
      content: [
        {
          type: 'text',
          text: `⚠️ Cache clearing requires confirmation. Set 'confirm' to true to proceed.`
        }
      ]
    };
  }
  
  const metrics = performanceMonitor.getMetrics();
  const cacheSize = metrics.cache.hits + metrics.cache.misses;
  
  performanceMonitor.clearCache();
  logger.info('Cache cleared by user request');
  
  return {
    content: [
      {
        type: 'text',
        text: `🗑️ **Cache Cleared Successfully**\n\nPrevious cache statistics:\n• Total requests: ${cacheSize}\n• Hit rate: ${metrics.cache.hitRate}%\n\nMemory has been freed and cache statistics have been reset.`
      }
    ]
  };
}