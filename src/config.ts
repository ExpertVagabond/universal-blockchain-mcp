import { z } from 'zod';

export const configSchema = z.object({
  network: z.enum(['testnet', 'mainnet']).default('testnet').describe('ZetaChain network to connect to'),
  privateKey: z.string().optional().describe('Private key for transactions (optional)'),
  rpcUrl: z.string().optional().describe('Custom RPC URL (optional)'),
  enableAnalytics: z.boolean().default(false).describe('Enable analytics collection'),
});

export type Config = z.infer<typeof configSchema>;

export const defaultConfig: Config = {
  network: 'testnet',
  enableAnalytics: false,
};

// Validation utilities
export function validateAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  
  // Basic validation for common blockchain address formats
  const addressRegex = /^(0x[a-fA-F0-9]{40}|zeta[a-zA-Z0-9]{39,59}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/;
  return addressRegex.test(address.trim());
}

export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/[^a-zA-Z0-9_-]/g, '');
}