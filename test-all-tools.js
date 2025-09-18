#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

async function runMCPTest(name, request, timeout = 15000) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`📤 Request: ${JSON.stringify(request, null, 2)}`);
  
  const server = spawn('npm', ['start'], {
    cwd: '/Users/dev/zetachain-mcp-server',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let serverReady = false;
  let output = '';
  let error = '';

  server.stderr.on('data', (data) => {
    const message = data.toString();
    error += message;
    if (message.includes('ZetaChain MCP server running')) {
      serverReady = true;
    }
  });

  server.stdout.on('data', (data) => {
    output += data.toString();
  });

  // Wait for server to start
  await setTimeout(3000);
  
  if (!serverReady) {
    server.kill();
    console.log('❌ Server failed to start');
    console.log('Error output:', error);
    return { success: false, error: 'Server startup failed' };
  }

  console.log('✅ Server started');

  // Send request
  server.stdin.write(JSON.stringify(request) + '\n');
  
  // Wait for response
  await setTimeout(timeout);
  server.kill();

  // Parse responses
  const responseLines = output.trim().split('\n').filter(line => 
    line.trim() && line.startsWith('{')
  );

  if (responseLines.length === 0) {
    console.log('❌ No response received');
    return { success: false, error: 'No response' };
  }

  try {
    const response = JSON.parse(responseLines[responseLines.length - 1]);
    
    if (response.error) {
      console.log('❌ Error response:', response.error);
      return { success: false, error: response.error };
    }

    if (response.result) {
      console.log('✅ Success');
      if (response.result.content) {
        console.log('📋 Response content:');
        response.result.content.forEach(content => {
          console.log(content.text);
        });
      } else if (response.result.tools) {
        console.log(`📋 Found ${response.result.tools.length} tools`);
      } else {
        console.log('📋 Response:', JSON.stringify(response.result, null, 2));
      }
      return { success: true, response: response.result };
    }

    console.log('❌ Unexpected response format');
    return { success: false, error: 'Unexpected format' };

  } catch (e) {
    console.log('❌ Failed to parse response:', e.message);
    console.log('Raw output:', output);
    return { success: false, error: 'Parse error' };
  }
}

async function testAllTools() {
  console.log('🔥 COMPREHENSIVE ZETACHAIN MCP SERVER TESTING');
  console.log('===============================================\n');

  const results = [];

  // Test 1: List Tools
  const listResult = await runMCPTest('List All Tools', {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list"
  });
  results.push({ name: 'list_tools', ...listResult });

  // Test 2: Network Info
  const networkResult = await runMCPTest('Get Network Info (Testnet)', {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "get_network_info",
      arguments: { network: "testnet" }
    }
  });
  results.push({ name: 'get_network_info', ...networkResult });

  // Test 3: List Chains
  const chainsResult = await runMCPTest('List Supported Chains', {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "list_chains",
      arguments: {}
    }
  }, 20000); // Longer timeout for CLI command
  results.push({ name: 'list_chains', ...chainsResult });

  // Test 4: List Tokens
  const tokensResult = await runMCPTest('List ZRC-20 Tokens', {
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "list_tokens",
      arguments: {}
    }
  }, 20000);
  results.push({ name: 'list_tokens', ...tokensResult });

  // Test 5: Get Balances
  const balanceResult = await runMCPTest('Get Balances for Address', {
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "get_balances",
      arguments: { 
        address: "0x742d35Cc6634C0532925a3b8D5C20aE6f0f3FFaa"
      }
    }
  }, 20000);
  results.push({ name: 'get_balances', ...balanceResult });

  // Test 6: Get Cross-Chain Fees
  const feesResult = await runMCPTest('Get Cross-Chain Fees', {
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: {
      name: "get_fees",
      arguments: {}
    }
  }, 20000);
  results.push({ name: 'get_fees', ...feesResult });

  // Test 7: List Accounts
  const accountsResult = await runMCPTest('List Accounts', {
    jsonrpc: "2.0",
    id: 7,
    method: "tools/call",
    params: {
      name: "list_accounts",
      arguments: {}
    }
  }, 20000);
  results.push({ name: 'list_accounts', ...accountsResult });

  // Test 8: Request Faucet (will likely fail but test the validation)
  const faucetResult = await runMCPTest('Request Faucet Tokens', {
    jsonrpc: "2.0",
    id: 8,
    method: "tools/call",
    params: {
      name: "request_faucet",
      arguments: { 
        address: "0x742d35Cc6634C0532925a3b8D5C20aE6f0f3FFaa"
      }
    }
  }, 25000);
  results.push({ name: 'request_faucet', ...faucetResult });

  // Test 9: Create Project (will test but might fail without proper setup)
  const projectResult = await runMCPTest('Create Project', {
    jsonrpc: "2.0",
    id: 9,
    method: "tools/call",
    params: {
      name: "create_project",
      arguments: { 
        name: "test-project"
      }
    }
  }, 30000);
  results.push({ name: 'create_project', ...projectResult });

  // Test 10: Query CCTX (will fail but test validation)
  const cctxResult = await runMCPTest('Query Cross-Chain Transaction', {
    jsonrpc: "2.0",
    id: 10,
    method: "tools/call",
    params: {
      name: "query_cctx",
      arguments: { 
        hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      }
    }
  }, 20000);
  results.push({ name: 'query_cctx', ...cctxResult });

  // Test error handling with invalid parameters
  const errorResult = await runMCPTest('Test Error Handling (Invalid Tool)', {
    jsonrpc: "2.0",
    id: 11,
    method: "tools/call",
    params: {
      name: "invalid_tool",
      arguments: {}
    }
  });
  results.push({ name: 'error_handling', ...errorResult });

  // Generate summary
  console.log('\n\n🎯 TESTING SUMMARY');
  console.log('==================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${results.length}`);
  console.log(`🎯 Success Rate: ${(successful/results.length*100).toFixed(1)}%\n`);

  console.log('📋 DETAILED RESULTS:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const reason = result.success ? 'SUCCESS' : result.error;
    console.log(`${status} ${result.name}: ${reason}`);
  });

  console.log('\n🏁 Testing Complete!');
  
  return results;
}

testAllTools().catch(console.error);