import { z } from 'zod';
export const configSchema = z.object({
    network: z.enum(['testnet', 'mainnet']).default('testnet').describe('ZetaChain network to connect to'),
    privateKey: z.string().optional().describe('Private key for transactions (optional)'),
    rpcUrl: z.string().optional().describe('Custom RPC URL (optional)'),
    enableAnalytics: z.boolean().default(false).describe('Enable analytics collection'),
});
export const defaultConfig = {
    network: 'testnet',
    enableAnalytics: false,
};
//# sourceMappingURL=config.js.map