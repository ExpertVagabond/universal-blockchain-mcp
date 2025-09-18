#!/usr/bin/env node
import { configSchema, Config } from './config.js';
declare class ZetaChainMCPServer {
    private server;
    private config;
    constructor();
    private setupHandlers;
    updateConfig(newConfig: Partial<Config>): void;
    run(): Promise<void>;
}
export { ZetaChainMCPServer, configSchema };
//# sourceMappingURL=index.d.ts.map