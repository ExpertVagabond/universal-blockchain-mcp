import { z } from 'zod';
export declare const configSchema: z.ZodObject<{
    network: z.ZodDefault<z.ZodEnum<["testnet", "mainnet"]>>;
    privateKey: z.ZodOptional<z.ZodString>;
    rpcUrl: z.ZodOptional<z.ZodString>;
    enableAnalytics: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    network: "testnet" | "mainnet";
    enableAnalytics: boolean;
    privateKey?: string | undefined;
    rpcUrl?: string | undefined;
}, {
    network?: "testnet" | "mainnet" | undefined;
    privateKey?: string | undefined;
    rpcUrl?: string | undefined;
    enableAnalytics?: boolean | undefined;
}>;
export type Config = z.infer<typeof configSchema>;
export declare const defaultConfig: Config;
//# sourceMappingURL=config.d.ts.map