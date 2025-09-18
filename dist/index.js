#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, InitializeRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { configSchema, defaultConfig } from './config.js';
import { tools } from './tools.js';
import { handleToolCall } from './handlers.js';
class ZetaChainMCPServer {
    server;
    config;
    constructor() {
        this.server = new Server({
            name: 'zetachain-mcp-server',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.config = defaultConfig;
        this.setupHandlers();
    }
    setupHandlers() {
        this.server.setRequestHandler(InitializeRequestSchema, async (request) => {
            // Extract configuration from initialize request
            const initConfig = request.params?.meta?.config || {};
            try {
                // Validate and merge configuration
                const validatedConfig = configSchema.parse({
                    ...this.config,
                    ...initConfig
                });
                this.config = validatedConfig;
            }
            catch (error) {
                // Use default config if validation fails
                console.error('Configuration validation failed, using defaults:', error);
            }
            return {
                protocolVersion: '2024-11-05',
                capabilities: {
                    tools: {},
                },
                serverInfo: {
                    name: 'zetachain-mcp-server',
                    version: '1.0.0',
                },
            };
        });
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: Object.values(tools),
            };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            return await handleToolCall(request, this.config);
        });
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('ZetaChain MCP Server running on stdio');
    }
}
// Export the server class and config schema
export { ZetaChainMCPServer, configSchema };
// Run the server if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const server = new ZetaChainMCPServer();
    server.run().catch((error) => {
        console.error('Failed to run server:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map