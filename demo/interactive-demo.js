#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';
import readline from 'readline';

console.log('🚀 ZetaChain MCP Server - Interactive Demo');
console.log('=' .repeat(50));

class InteractiveDemo {
  constructor() {
    this.server = null;
    this.messageId = 1;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async startServer() {
    console.log('\n📡 Starting MCP Server...');
    this.server = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.server.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message.includes('ZetaChain MCP Server running')) {
        console.log('✅ Server started successfully!\n');
      }
    });

    await setTimeout(2000);
    return this.server.pid !== undefined;
  }

  async sendMCPMessage(message) {
    return new Promise((resolve) => {
      let response = '';
      const timeoutId = setTimeout(() => {
        resolve({ error: 'Timeout' });
      }, 10000);

      const onData = (data) => {
        response += data.toString();
        try {
          const lines = response.split('\n');
          for (const line of lines) {
            if (line.trim().startsWith('{')) {
              const parsed = JSON.parse(line);
              if (parsed.id === message.id) {
                clearTimeout(timeoutId);
                this.server.stdout.off('data', onData);
                resolve(parsed);
                return;
              }
            }
          }
        } catch (e) {
          // Continue collecting data
        }
      };

      this.server.stdout.on('data', onData);
      this.server.stdin.write(JSON.stringify(message) + '\n');
    });
  }

  async initialize() {
    console.log('🔌 Initializing MCP connection...');
    const initMessage = {
      jsonrpc: "2.0",
      id: this.messageId++,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        clientInfo: { name: "interactive-demo", version: "1.0.0" }
      }
    };

    const response = await this.sendMCPMessage(initMessage);
    if (response.result) {
      console.log('✅ MCP connection initialized!\n');
      return true;
    }
    return false;
  }

  async listTools() {
    console.log('🔧 Available ZetaChain Tools:');
    console.log('-' .repeat(30));

    const listMessage = {
      jsonrpc: "2.0",
      id: this.messageId++,
      method: "tools/list"
    };

    const response = await this.sendMCPMessage(listMessage);
    if (response.result && response.result.tools) {
      response.result.tools.forEach((tool, index) => {
        console.log(`${index + 1}. ${tool.name} - ${tool.description}`);
      });
      console.log('');
      return response.result.tools;
    }
    return [];
  }

  async callTool(toolName, args) {
    console.log(`⚡ Calling tool: ${toolName}`);
    console.log(`📝 Arguments:`, JSON.stringify(args, null, 2));

    const callMessage = {
      jsonrpc: "2.0",
      id: this.messageId++,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args
      }
    };

    const response = await this.sendMCPMessage(callMessage);
    
    if (response.result && response.result.content) {
      console.log('\n📋 Result:');
      console.log('-' .repeat(20));
      response.result.content.forEach(content => {
        if (content.type === 'text') {
          console.log(content.text);
        }
      });
      console.log('');
    } else if (response.error) {
      console.log('❌ Error:', response.error.message);
    }

    return response;
  }

  async askUser(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async runDemoScenarios() {
    console.log('🎬 Demo Scenarios:');
    console.log('1. Network Information');
    console.log('2. Account Management');
    console.log('3. Create Smart Contract');
    console.log('4. Query Blockchain');
    console.log('5. Generate Wallet');
    console.log('6. Custom Tool Call');
    console.log('0. Exit Demo\n');

    while (true) {
      const choice = await this.askUser('Choose a demo scenario (0-6): ');

      switch (choice) {
        case '1':
          await this.demoNetworkInfo();
          break;
        case '2':
          await this.demoAccountManagement();
          break;
        case '3':
          await this.demoCreateContract();
          break;
        case '4':
          await this.demoQueryBlockchain();
          break;
        case '5':
          await this.demoGenerateWallet();
          break;
        case '6':
          await this.demoCustomTool();
          break;
        case '0':
          return;
        default:
          console.log('❌ Invalid choice. Please select 0-6.\n');
      }

      console.log('\n' + '='.repeat(50) + '\n');
    }
  }

  async demoNetworkInfo() {
    console.log('\n🌐 Network Information Demo');
    await this.callTool('list_networks', {});
  }

  async demoAccountManagement() {
    console.log('\n👤 Account Management Demo');
    await this.callTool('manage_accounts', { action: 'list' });
    
    const createNew = await this.askUser('Create a new test account? (y/n): ');
    if (createNew.toLowerCase() === 'y') {
      const accountName = await this.askUser('Enter account name: ');
      if (accountName) {
        await this.callTool('manage_accounts', { 
          action: 'create', 
          name: accountName 
        });
      }
    }
  }

  async demoCreateContract() {
    console.log('\n📝 Create Smart Contract Demo');
    
    const contractName = await this.askUser('Enter contract name (or press Enter for "demo-contract"): ');
    const name = contractName || 'demo-contract';
    
    console.log('\nAvailable templates: hello, swap, nft, staking, counter');
    const template = await this.askUser('Choose template (or press Enter for "hello"): ');
    const selectedTemplate = template || 'hello';
    
    const args = { name };
    if (selectedTemplate !== 'hello') {
      args.template = selectedTemplate;
    }
    
    await this.callTool('create_contract', args);
  }

  async demoQueryBlockchain() {
    console.log('\n📊 Blockchain Query Demo');
    
    console.log('Query types: balance, transaction, block');
    const queryType = await this.askUser('Choose query type: ');
    
    const args = { queryType };
    
    if (queryType === 'balance') {
      const address = await this.askUser('Enter address to query: ');
      if (address) {
        args.address = address;
      } else {
        console.log('❌ Address is required for balance queries');
        return;
      }
    } else if (queryType === 'transaction') {
      const txHash = await this.askUser('Enter transaction hash: ');
      if (txHash) {
        args.txHash = txHash;
      } else {
        console.log('❌ Transaction hash is required');
        return;
      }
    } else if (queryType === 'block') {
      const blockHeight = await this.askUser('Enter block height (or press Enter for latest): ');
      if (blockHeight) {
        args.blockHeight = blockHeight;
      }
    }
    
    await this.callTool('query_chain', args);
  }

  async demoGenerateWallet() {
    console.log('\n🔐 Generate Wallet Demo');
    
    const walletName = await this.askUser('Enter wallet name: ');
    if (walletName) {
      await this.callTool('generate_wallet', { name: walletName });
    } else {
      console.log('❌ Wallet name is required');
    }
  }

  async demoCustomTool() {
    console.log('\n🛠️  Custom Tool Call Demo');
    
    const tools = await this.listTools();
    const toolChoice = await this.askUser('Enter tool name: ');
    
    const selectedTool = tools.find(t => t.name === toolChoice);
    if (!selectedTool) {
      console.log('❌ Tool not found');
      return;
    }
    
    console.log('\nTool schema:', JSON.stringify(selectedTool.inputSchema, null, 2));
    const argsInput = await this.askUser('Enter arguments as JSON (or press Enter for {}): ');
    
    let args = {};
    if (argsInput) {
      try {
        args = JSON.parse(argsInput);
      } catch (e) {
        console.log('❌ Invalid JSON, using empty arguments');
      }
    }
    
    await this.callTool(toolChoice, args);
  }

  async cleanup() {
    if (this.server) {
      console.log('\n🔌 Shutting down server...');
      this.server.kill('SIGTERM');
    }
    this.rl.close();
  }

  async run() {
    try {
      const started = await this.startServer();
      if (!started) {
        console.log('❌ Failed to start server');
        return;
      }

      const initialized = await this.initialize();
      if (!initialized) {
        console.log('❌ Failed to initialize MCP connection');
        return;
      }

      await this.listTools();
      await this.runDemoScenarios();

    } catch (error) {
      console.log('❌ Demo error:', error.message);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the demo
const demo = new InteractiveDemo();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n👋 Demo interrupted. Cleaning up...');
  await demo.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n👋 Demo terminated. Cleaning up...');
  await demo.cleanup();
  process.exit(0);
});

await demo.run();
console.log('\n👋 Demo completed. Thanks for trying ZetaChain MCP Server!');
process.exit(0);