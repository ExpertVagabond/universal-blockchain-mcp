#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

async function runTest(name, request) {
  console.log(`\n🧪 Testing: ${name}`);
  
  const server = spawn('npm', ['start'], {
    cwd: '/Users/dev/zetachain-mcp-server',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let serverReady = false;
  server.stderr.on('data', (data) => {
    if (data.toString().includes('ZetaChain MCP server running')) {
      serverReady = true;
    }
  });

  await setTimeout(2000);
  
  if (!serverReady) {
    server.kill();
    console.log('❌ Server failed to start');
    return;
  }

  server.stdin.write(JSON.stringify(request) + '\n');
  
  let responses = '';
  server.stdout.on('data', (data) => {
    responses += data.toString();
  });

  await setTimeout(10000); // Increase timeout for CLI commands
  server.kill();

  const responseLines = responses.trim().split('\n').filter(line => 
    line.trim() && line.startsWith('{')
  );

  if (responseLines.length > 0) {
    try {
      const response = JSON.parse(responseLines[responseLines.length - 1]);
      if (response.result) {
        console.log('✅ Success');
        if (response.result.content) {
          console.log('📋 Response:', JSON.parse(response.result.content[0].text));
        } else {
          console.log('📋 Response:', response.result);
        }
      } else if (response.error) {
        console.log('❌ Error:', response.error);
      }
    } catch (e) {
      console.log('❌ Parse error:', e.message);
      console.log('Raw response:', responseLines[responseLines.length - 1]);
    }
  } else {
    console.log('❌ No response received');
  }
}

async function testComprehensive() {
  console.log('🔥 Comprehensive ZetaChain MCP Server Testing\n');

  // Test 1: List tools
  await runTest('List Tools', {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list"
  });

  // Test 2: Get network info (testnet)
  await runTest('Network Info (Testnet)', {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "get_network_info",
      arguments: { network: "testnet" }
    }
  });

  // Test 3: Get balance (valid address)
  await runTest('Balance Query (Valid Address)', {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "get_balances",
      arguments: { 
        address: "0x742d35Cc6634C0532925a3b8D5C20aE6f0f3FFaa"
      }
    }
  });

  // Test 4: List supported chains
  await runTest('List Supported Chains', {
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "list_chains",
      arguments: {}
    }
  });

  // Test 5: List ZRC-20 tokens
  await runTest('List ZRC-20 Tokens', {
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "list_tokens",
      arguments: {}
    }
  });

  // Test 6: Get cross-chain fees
  await runTest('Get Cross-Chain Fees', {
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: {
      name: "get_fees",
      arguments: {}
    }
  });

  console.log('\n🎯 Testing Complete!');
}

testComprehensive().catch(console.error);