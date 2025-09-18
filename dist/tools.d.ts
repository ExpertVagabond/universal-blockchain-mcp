import { Tool } from '@modelcontextprotocol/sdk/types.js';
export interface ZetaChainTools {
    createContract: Tool;
    deployContract: Tool;
    queryChain: Tool;
    manageAccounts: Tool;
    getBalance: Tool;
    sendTransaction: Tool;
    listNetworks: Tool;
    generateWallet: Tool;
}
export declare const tools: ZetaChainTools;
export declare function executeZetaChainCommand(command: string): Promise<{
    stdout: string;
    stderr: string;
}>;
//# sourceMappingURL=tools.d.ts.map