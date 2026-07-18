// Test mode responses for Smithery scanning.
//
// These are deliberately static — Smithery scans the server without network access,
// so nothing here may make a call. The chain table is generated from the registry at
// module load rather than hand-written, which keeps it offline while making it
// impossible for the fixture to drift from the real supported-chain set.
import { CHAINS } from './chains.js';

const pad = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s.padEnd(n));

const chainTableRows = Object.values(CHAINS)
  .map(
    (c) =>
      `│ ${pad(String(c.chainId), 8)} │ ${pad(c.key, 20)} │ ${pad(c.nativeCurrency.symbol, 6)} │ ${pad(c.testnet ? 'testnet' : 'mainnet', 8)} │`,
  )
  .join('\n');

export const testModeResponses = {
  list_chains: {
    content: [
      {
        type: "text",
        text: `Supported chains:
┌──────────┬──────────────────────┬────────┬──────────┐
│ Chain ID │ Network              │ Native │ Kind     │
├──────────┼──────────────────────┼────────┼──────────┤
${chainTableRows}
└──────────┴──────────────────────┴────────┴──────────┘`
      }
    ]
  },

  list_tokens: {
    content: [
      {
        type: "text", 
        text: `Token list:
┌──────────┬──────────────┬────────────────────────────────────────────┐
│ Chain ID │ Symbol       │ ZRC-20                                     │
├──────────┼──────────────┼────────────────────────────────────────────┤
│ 97       │ USDC.BSC     │ 0x7c8dDa80bbBE1254a7aACf3219EBe1481c6E01d7 │
├──────────┼──────────────┼────────────────────────────────────────────┤
│ 97       │ BNB.BSC      │ 0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891 │
└──────────┴──────────────┴────────────────────────────────────────────┘`
      }
    ]
  },

  get_balances: {
    content: [
      {
        type: "text",
        text: `Balance information:
Address: 0x742d35Cc6634C0532925a3b8D5C20aE6f0f3FFaa
ZETA Balance: 0.000000 ZETA
Chain: zeta_testnet (7001)`
      }
    ]
  },

  get_fees: {
    content: [
      {
        type: "text",
        text: `Fee information:
Cross-chain messaging fees:
- Ethereum → ZetaChain: 0.001 ZETA
- BSC → ZetaChain: 0.0005 ZETA  
- Polygon → ZetaChain: 0.0003 ZETA`
      }
    ]
  },

  list_accounts: {
    content: [
      {
        type: "text",
        text: `Available accounts:
No accounts found. Use 'create_account' to create a new account.`
      }
    ]
  }
};