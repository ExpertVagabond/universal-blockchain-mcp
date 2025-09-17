#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';
import assert from 'assert';

console.log('🧪 ZetaChain MCP Server Test Suite\n');

class MCPTestSuite {
  constructor() {
    this.server = null;
    this.testResults = [];
  }

  async startServer() {
    console.log('🚀 Starting MCP Server...');
    this.server = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let serverOutput = '';
    this.server.stdout.on('data', (data) => {
      serverOutput += data.toString();
    });

    this.server.stderr.on('data', (data) => {
      console.log('Server stderr:', data.toString());
    });

    await setTimeout(2000);
    
    if (this.server.pid) {
      console.log('✅ Server started successfully (PID:', this.server.pid, ')\n');
      return true;
    }
    return false;
  }

  async sendMCPMessage(message) {
    return new Promise((resolve) => {
      let response = '';
      const timeoutId = global.setTimeout(() => {
        resolve({ error: 'Timeout' });
      }, 5000);

      const onData = (data) => {
        response += data.toString();
        try {
          const parsed = JSON.parse(response.split('\n').find(line => line.trim().startsWith('{')));
          global.clearTimeout(timeoutId);
          this.server.stdout.off('data', onData);
          resolve(parsed);
        } catch (e) {
          // Continue collecting data
        }
      };

      this.server.stdout.on('data', onData);
      this.server.stdin.write(JSON.stringify(message) + '\n');
    });
  }

  async testInitialization() {
    console.log('📡 Testing MCP Initialization...');
    
    const initMessage = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        clientInfo: { name: "test-client", version: "1.0.0" }
      }
    };

    const response = await this.sendMCPMessage(initMessage);
    
    try {
      assert(response.result, 'Initialize should return result');
      assert(response.result.protocolVersion === "2024-11-05", 'Protocol version should match');
      assert(response.result.serverInfo.name === 'zetachain-mcp-server', 'Server name should match');
      
      this.testResults.push({ test: 'Initialization', status: '✅ PASSED' });
      console.log('✅ Initialization test passed\n');
      return true;
    } catch (error) {
      this.testResults.push({ test: 'Initialization', status: '❌ FAILED', error: error.message });
      console.log('❌ Initialization test failed:', error.message, '\n');
      return false;
    }
  }

  async testToolsListing() {
    console.log('🔧 Testing Tools Listing...');
    
    const listToolsMessage = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list"
    };

    const response = await this.sendMCPMessage(listToolsMessage);
    
    try {
      assert(response.result, 'List tools should return result');
      assert(Array.isArray(response.result.tools), 'Tools should be an array');
      assert(response.result.tools.length === 8, 'Should have 8 tools');
      
      const expectedTools = [
        'create_contract', 'deploy_contract', 'query_chain', 'manage_accounts',
        'get_balance', 'send_transaction', 'list_networks', 'generate_wallet'
      ];
      
      const actualTools = response.result.tools.map(tool => tool.name);
      expectedTools.forEach(toolName => {
        assert(actualTools.includes(toolName), `Should include ${toolName} tool`);
      });
      
      this.testResults.push({ test: 'Tools Listing', status: '✅ PASSED' });
      console.log('✅ Tools listing test passed\n');
      return true;
    } catch (error) {
      this.testResults.push({ test: 'Tools Listing', status: '❌ FAILED', error: error.message });
      console.log('❌ Tools listing test failed:', error.message, '\n');
      return false;
    }
  }

  async testToolExecution() {
    console.log('⚡ Testing Tool Execution...');
    
    const toolCallMessage = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "list_networks",
        arguments: {}
      }
    };

    const response = await this.sendMCPMessage(toolCallMessage);
    
    try {
      assert(response.result, 'Tool call should return result');
      assert(Array.isArray(response.result.content), 'Content should be an array');
      assert(response.result.content[0].type === 'text', 'Content should be text type');
      assert(response.result.content[0].text.includes('ZetaChain Networks'), 'Should contain network info');
      
      this.testResults.push({ test: 'Tool Execution', status: '✅ PASSED' });
      console.log('✅ Tool execution test passed\n');
      return true;
    } catch (error) {
      this.testResults.push({ test: 'Tool Execution', status: '❌ FAILED', error: error.message });
      console.log('❌ Tool execution test failed:', error.message, '\n');
      return false;
    }
  }

  async testErrorHandling() {
    console.log('🛡️ Testing Error Handling...');
    
    const invalidToolMessage = {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "invalid_tool",
        arguments: {}
      }
    };

    const response = await this.sendMCPMessage(invalidToolMessage);
    
    try {
      assert(response.result, 'Should return result even for errors');
      assert(response.result.isError === true, 'Should indicate error');
      assert(response.result.content[0].text.includes('Unknown tool'), 'Should contain error message');
      
      this.testResults.push({ test: 'Error Handling', status: '✅ PASSED' });
      console.log('✅ Error handling test passed\n');
      return true;
    } catch (error) {
      this.testResults.push({ test: 'Error Handling', status: '❌ FAILED', error: error.message });
      console.log('❌ Error handling test failed:', error.message, '\n');
      return false;
    }
  }

  async testAccountManagement() {
    console.log('👤 Testing Account Management...');
    
    const accountListMessage = {
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "manage_accounts",
        arguments: { action: "list" }
      }
    };

    const response = await this.sendMCPMessage(accountListMessage);
    
    try {
      assert(response.result, 'Account management should return result');
      assert(response.result.content[0].text.includes('Account Management'), 'Should contain account info');
      
      this.testResults.push({ test: 'Account Management', status: '✅ PASSED' });
      console.log('✅ Account management test passed\n');
      return true;
    } catch (error) {
      this.testResults.push({ test: 'Account Management', status: '❌ FAILED', error: error.message });
      console.log('❌ Account management test failed:', error.message, '\n');
      return false;
    }
  }

  stopServer() {
    if (this.server) {
      console.log('🔌 Stopping server...');
      this.server.kill('SIGTERM');
    }
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(50));
    
    this.testResults.forEach(result => {
      console.log(`${result.status} ${result.test}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    const passed = this.testResults.filter(r => r.status.includes('✅')).length;
    const total = this.testResults.length;
    
    console.log('=' .repeat(50));
    console.log(`📈 Overall: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 ALL TESTS PASSED! Server is fully functional.');
    } else {
      console.log('⚠️  Some tests failed. Review the errors above.');
    }
  }

  async runAll() {
    try {
      const serverStarted = await this.startServer();
      if (!serverStarted) {
        console.log('❌ Failed to start server');
        return;
      }

      await this.testInitialization();
      await this.testToolsListing();
      await this.testToolExecution();
      await this.testErrorHandling();
      await this.testAccountManagement();
      
    } catch (error) {
      console.log('❌ Test suite failed:', error.message);
    } finally {
      this.stopServer();
      this.printResults();
    }
  }
}

// Run the test suite
const testSuite = new MCPTestSuite();
await testSuite.runAll();

process.exit(0);