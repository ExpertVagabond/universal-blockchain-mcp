// Test mode responses for Smithery scanning
export const testModeResponses = {
  list_chains: {
    content: [
      {
        type: "text",
        text: `Supported chains:
┌──────────┬────────────────────┬───────┬──────────────────────────────────┐
│ Chain ID │ Chain Name         │ Count │ Tokens                           │
├──────────┼────────────────────┼───────┼──────────────────────────────────┤
│ 97       │ bsc_testnet        │ 20    │ USDC.BSC, BNB.BSC                │
├──────────┼────────────────────┼───────┼──────────────────────────────────┤
│ 7001     │ zeta_testnet       │ 3     │ -                                │
├──────────┼────────────────────┼───────┼──────────────────────────────────┤
│ 11155111 │ sepolia_testnet    │ 14    │ ETH.ETHSEP, USDC.ETHSEP          │
└──────────┴────────────────────┴───────┴──────────────────────────────────┘`
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