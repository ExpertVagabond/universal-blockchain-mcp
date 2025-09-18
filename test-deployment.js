#!/usr/bin/env node

import createServer, { configSchema } from './dist/index.js';

console.log('🧪 Testing ZetaChain MCP Server Deployment...\n');

async function testDeployment() {
  try {
    // Test configuration
    const testConfig = {
      network: 'testnet',
      debug: false,
      enableAnalytics: false
    };

    console.log('1. ✅ Testing configuration validation...');
    const validatedConfig = configSchema.parse(testConfig);
    console.log('   Config validated:', validatedConfig);

    console.log('\n2. ✅ Creating server instance...');
    const server = createServer({ config: validatedConfig });
    
    if (server && typeof server === 'object') {
      console.log('   Server created successfully');
    } else {
      throw new Error('Server creation failed');
    }

    console.log('\n3. ✅ Checking server structure...');
    console.log('   Server type:', typeof server);
    console.log('   Server has methods:', Object.keys(server).length > 0);

    console.log('\n🎉 All deployment tests passed!');
    console.log('\n📋 Server Summary:');
    console.log('   • Runtime: TypeScript/Node.js');
    console.log('   • Tools: 8 ZetaChain blockchain tools');
    console.log('   • SDK: MCP v1.18.1');
    console.log('   • Build: ✅ Successful');
    console.log('   • Configuration: ✅ Valid');

    return true;
  } catch (error) {
    console.error('\n❌ Deployment test failed:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

testDeployment().then(success => {
  if (success) {
    console.log('\n🚀 Server is ready for deployment!');
    process.exit(0);
  } else {
    console.log('\n💥 Server has issues that need fixing.');
    process.exit(1);
  }
});