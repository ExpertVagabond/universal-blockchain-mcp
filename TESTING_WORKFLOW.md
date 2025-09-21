# 🧪 **Universal Blockchain MCP - Complete Testing Workflow**

## 📋 **Logical Testing Sequence**

The tools must be tested in a specific order because many depend on prerequisites like local networks, created accounts, and funded wallets.

---

## **Phase 1: Environment Setup & Network Info** 

### 1.1 Basic Network Information
```bash
# Test network connectivity and basic info (no dependencies)
1. get_network_info       # ✅ Get ZetaChain network status
2. list_chains           # ✅ List all supported chains  
3. list_tokens           # ✅ List all ZRC-20 tokens
4. check_foundry         # ✅ Verify Foundry installation
```

**Expected Results:**
- Network info shows current ZetaChain status
- Chains list shows 11+ connected chains (ETH, BSC, Polygon, etc.)
- Tokens list shows available ZRC-20 tokens
- Foundry check shows installation status

---

## **Phase 2: Local Development Environment**

### 2.1 Start Local Infrastructure
```bash
# Start required local services
5. anvil_start           # 🚀 Start local Anvil testnet
```

**Dependencies:** None  
**Expected Results:** Local Anvil testnet running on default port

### 2.2 Development Tools Setup
```bash
# Verify development environment
6. forge_build           # 🔨 Test Foundry build system
7. create_project        # 📁 Create new project structure
```

**Dependencies:** Foundry installed  
**Expected Results:** 
- Build system working
- New project created with proper structure

---

## **Phase 3: Account Management**

### 3.1 Account Creation & Import
```bash
# Create accounts before any operations requiring them
8. create_account        # 👤 Create new ZetaChain account
9. list_accounts         # 📋 Verify account creation
10. show_account         # 🔍 Get account details
```

**Dependencies:** None  
**Expected Results:**
- New account created with address and private key
- Account appears in list
- Account details show address, balance (0), etc.

### 3.2 Account Funding
```bash
# Fund account for testing operations
11. request_faucet       # 💰 Request testnet ZETA tokens
12. get_balances        # 💵 Check balance after faucet
```

**Dependencies:** Account created  
**Expected Results:**
- Faucet request successful
- Balance shows received ZETA tokens

---

## **Phase 4: Basic Blockchain Operations**

### 4.1 Fee & Cross-Chain Info
```bash
# Test fee and cross-chain queries
13. get_fees            # 💸 Get cross-chain fees
14. query_cctx          # 🔗 Test cross-chain transaction query (requires existing tx)
```

**Dependencies:** Funded account  
**Expected Results:**
- Fee structure for different chains
- Cross-chain transaction details (if available)

### 4.2 Cast Operations (Local Testing)
```bash
# Test Cast operations on local Anvil
15. cast_balance        # 📊 Check balance using Cast
16. cast_nonce          # 🔢 Get account nonce
17. cast_gas_price      # ⛽ Get current gas price
18. cast_block          # 📦 Get latest block info
```

**Dependencies:** Anvil running, account created  
**Expected Results:**
- Balance matches get_balances result
- Nonce shows current transaction count
- Gas price from local network
- Latest block information

---

## **Phase 5: Smart Contract Development**

### 5.1 Contract Compilation & Deployment
```bash
# Test contract development workflow
19. contract_compile    # 🔧 Compile smart contract
20. contract_deploy     # 🚀 Deploy contract to local network
21. contract_interact   # 🤝 Interact with deployed contract
```

**Dependencies:** Anvil running, funded account, project created  
**Expected Results:**
- Contract compiles successfully
- Contract deploys with address
- Contract interaction returns expected results

### 5.2 Advanced Forge Operations
```bash
# Test advanced Forge features
22. forge_test          # ✅ Run contract tests
23. forge_create        # 🏭 Create contract via Forge
24. forge_verify        # ✔️ Verify contract (if on testnet)
```

**Dependencies:** Contracts compiled, local network running  
**Expected Results:**
- Tests pass successfully
- Contract creation via Forge works
- Verification process (may skip if local only)

---

## **Phase 6: Cross-Chain Operations**

### 6.1 Token Operations
```bash
# Test cross-chain token operations (requires testnet)
25. withdraw_tokens     # 📤 Withdraw tokens to connected chain
26. withdraw_and_call   # 📤🔄 Withdraw and call contract
27. cross_chain_send    # 🌐 Send tokens cross-chain
28. cross_chain_status  # 📊 Check cross-chain transaction status
```

**Dependencies:** Testnet deployment, funded account with tokens  
**Expected Results:**
- Successful cross-chain operations
- Transaction hashes and status updates
- Tokens appear on destination chains

### 6.2 Advanced Cross-Chain
```bash
# Test advanced cross-chain features
29. call_contract       # 📞 Call contract on connected chain
30. bridge_status       # 🌉 Monitor bridge operations
```

**Dependencies:** Deployed contracts on multiple chains  
**Expected Results:**
- Contract calls execute successfully
- Bridge status shows operational state

---

## **Phase 7: DeFi Operations**

### 7.1 DeFi Protocol Testing
```bash
# Test DeFi operations (requires liquidity)
31. defi_swap           # 🔄 Execute token swap
32. defi_liquidity_add  # 💧 Add liquidity to pool
33. defi_yield_farm     # 🌾 Yield farming operations
```

**Dependencies:** Multiple tokens, funded account, DEX deployed  
**Expected Results:**
- Successful token swaps
- Liquidity provision
- Yield farming rewards

---

## **Phase 8: NFT Operations**

### 8.1 NFT Lifecycle
```bash
# Test NFT operations
34. nft_mint           # 🎨 Mint new NFT
35. nft_transfer       # 📮 Transfer NFT
36. nft_metadata       # 📋 Get/set NFT metadata
```

**Dependencies:** NFT contract deployed, funded account  
**Expected Results:**
- NFT minted with token ID
- NFT transferred successfully
- Metadata retrieved/updated

---

## **Phase 9: Advanced Features**

### 9.1 Security & Optimization
```bash
# Test security and optimization tools
37. security_audit     # 🔒 Audit smart contracts
38. gas_optimizer      # ⚡ Optimize gas usage
39. multisig_create    # 🔐 Create multisig wallet
```

**Dependencies:** Contracts deployed  
**Expected Results:**
- Security audit reports
- Gas optimization suggestions
- Multisig wallet created

### 9.2 Monitoring & Analytics
```bash
# Test monitoring tools
40. gas_tracker        # 📈 Track gas prices
41. portfolio_tracker  # 💼 Monitor portfolio
42. transaction_history # 📜 View transaction history
43. block_explorer     # 🔍 Browse blockchain data
```

**Dependencies:** Transaction history exists  
**Expected Results:**
- Gas price trends
- Portfolio valuation
- Transaction history display
- Block explorer data

---

## **Phase 10: ZetaChain Governance**

### 10.1 Governance Operations
```bash
# Test governance features (requires staked tokens)
44. zeta_governance_proposals    # 🗳️ View governance proposals
45. zeta_governance_vote        # ✅ Vote on proposals
46. zeta_staking_delegate       # 🤝 Delegate tokens for staking
47. zeta_staking_rewards        # 🎁 Claim staking rewards
48. zeta_validator_create       # 👑 Create validator (advanced)
```

**Dependencies:** Staked ZETA tokens, active governance  
**Expected Results:**
- Governance proposals listed
- Voting transaction successful
- Staking delegation active
- Rewards claimed
- Validator creation (if conditions met)

---

## **Phase 11: Wallet Management**

### 11.1 Wallet Operations
```bash
# Test wallet management features
49. wallet_export      # 📤 Export wallet data
50. wallet_backup      # 💾 Backup wallet securely
51. import_account     # 📥 Import existing account
```

**Dependencies:** Created accounts and wallets  
**Expected Results:**
- Wallet data exported successfully
- Backup created securely
- Account imported from private key

---

## **Phase 12: Advanced Testing**

### 12.1 Network State Management
```bash
# Test Anvil state management
52. anvil_snapshot     # 📸 Take blockchain snapshot
53. anvil_revert       # ⏪ Revert to snapshot
```

**Dependencies:** Anvil running, operations executed  
**Expected Results:**
- Snapshot taken successfully
- State reverted to snapshot point

### 12.2 Advanced Cast Operations
```bash
# Test remaining Cast operations
54. cast_call          # 📞 Call contract function
55. cast_send          # 📤 Send transaction
56. cast_tx            # 🔍 Get transaction details
```

**Dependencies:** Deployed contracts, transaction hashes  
**Expected Results:**
- Contract function calls work
- Transactions sent successfully
- Transaction details retrieved

---

## **🚨 Dependency Matrix**

| Tool Category | Required Prerequisites |
|---------------|----------------------|
| **Network Info** | None |
| **Local Dev** | Foundry installed |
| **Accounts** | None → create first |
| **Funding** | Account created |
| **Blockchain Ops** | Funded account |
| **Contracts** | Anvil + funded account |
| **Cross-Chain** | Testnet + multiple tokens |
| **DeFi** | Deployed DEX + liquidity |
| **NFT** | NFT contract + funded account |
| **Governance** | Staked tokens |
| **Advanced** | Full environment |

---

## **📊 Success Criteria**

### **Phase Success Indicators:**
- ✅ **Phase 1-2**: Environment ready
- ✅ **Phase 3**: Account created and funded  
- ✅ **Phase 4-5**: Local development working
- ✅ **Phase 6**: Cross-chain operations functional
- ✅ **Phase 7-8**: DeFi/NFT ecosystem active
- ✅ **Phase 9-10**: Advanced features working
- ✅ **Phase 11-12**: Complete workflow tested

### **Overall Success:**
- **55/55 tools** tested successfully
- **End-to-end workflow** functional
- **Production readiness** confirmed

This logical workflow ensures each tool is tested with proper dependencies in place!