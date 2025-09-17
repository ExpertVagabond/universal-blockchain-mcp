#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { configSchema, defaultConfig, Config } from './config.js';
import { tools } from './tools.js';
import { handleToolCall } from './handlers.js';

class ZetaChainMCPServer {
  private server: Server;
  private config: Config;

  constructor() {
    this.server = new Server(
      {
        name: 'zetachain-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.config = defaultConfig;
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: Object.values(tools) as Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return await handleToolCall(request, this.config);
    });
  }

  public updateConfig(newConfig: Partial<Config>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('ZetaChain MCP Server running on stdio');
  }
}

// Export the createServer function for Smithery compatibility
export default function createServer(config?: Record<string, any>) {
  const server = new ZetaChainMCPServer();
  
  if (config) {
    try {
      const validatedConfig = configSchema.parse(config);
      server.updateConfig(validatedConfig);
    } catch (error) {
      console.error('Invalid configuration:', error);
      throw new Error('Configuration validation failed');
    }
  }
  
  return server;
}

// Export the config schema for Smithery
export { configSchema };

// Run the server if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createServer();
  server.run().catch((error) => {
    console.error('Failed to run server:', error);
    process.exit(1);
  });
}