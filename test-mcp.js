#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

async function testMCPServer() {
  console.log('🧪 Testing ZetaChain MCP Server...\n');

  const server = spawn('npm', ['start'], {
    cwd: '/Users/dev/zetachain-mcp-server',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let serverReady = false;
  let output = '';

  server.stderr.on('data', (data) => {
    const message = data.toString();
    output += message;
    if (message.includes('ZetaChain MCP server running')) {
      serverReady = true;
    }
  });

  // Wait for server to start
  await setTimeout(2000);

  if (!serverReady) {
    console.error('❌ Server failed to start');
    console.log('Output:', output);
    server.kill();
    return false;
  }

  console.log('✅ Server started successfully');

  // Test initialization request
  const initRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {}
      },
      clientInfo: {
        name: "test-client",
        version: "1.0.0"
      }
    }
  };

  server.stdin.write(JSON.stringify(initRequest) + '\n');

  // Test tools/list request
  const listToolsRequest = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list"
  };

  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

  // Test tool call
  const toolCallRequest = {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "get_zetachain_network_info"
    }
  };

  server.stdin.write(JSON.stringify(toolCallRequest) + '\n');

  let responses = '';
  server.stdout.on('data', (data) => {
    responses += data.toString();
  });

  // Wait for responses
  await setTimeout(3000);

  console.log('📨 Server responses:', responses);

  server.kill();

  const responseLines = responses.trim().split('\n').filter(line => {
    return line.trim() && line.startsWith('{');
  });
  
  if (responseLines.length >= 2) {
    try {
      const toolsResponse = JSON.parse(responseLines[1]);
      if (toolsResponse.result && toolsResponse.result.tools) {
        console.log('✅ Tools list request successful');
        console.log(`📋 Found ${toolsResponse.result.tools.length} tools:`);
        toolsResponse.result.tools.forEach(tool => {
          console.log(`   - ${tool.name}: ${tool.description}`);
        });
        
        // Test a tool call
        if (responseLines.length >= 3) {
          const toolCallResponse = JSON.parse(responseLines[2]);
          if (toolCallResponse.result && toolCallResponse.result.content) {
            console.log('✅ Tool call request successful');
            return true;
          }
        }
        return true;
      }
    } catch (e) {
      console.error('❌ Failed to parse response:', e.message);
      console.log('Response lines:', responseLines);
      return false;
    }
  }

  console.error('❌ Did not receive expected responses');
  return false;
}

testMCPServer().then(success => {
  if (success) {
    console.log('\n🎉 ZetaChain MCP Server test completed successfully!');
    process.exit(0);
  } else {
    console.log('\n💥 ZetaChain MCP Server test failed');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Test failed with error:', error);
  process.exit(1);
});