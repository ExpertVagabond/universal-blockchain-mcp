"""
ZetaChain MCP Server implementation.
"""

import asyncio
import logging
import sys
from typing import Dict, Any

from .core.base import MCPServer
from .config import ZetaChainConfig
from .utils.connection import ZetaChainConnection
from .tools.wallet import WalletManager
from .tools.cross_chain import CrossChainManager
from .tools.omnichain import OmnichainManager
from .tools.governance import GovernanceManager
from .tools.defi import DeFiManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ZetaChainMCPServer(MCPServer):
    """ZetaChain MCP Server implementation."""
    
    def __init__(self, config: ZetaChainConfig):
        super().__init__(config)
        self.connection = ZetaChainConnection(config)
        self.wallet_manager = WalletManager(config, self.connection)
        self.cross_chain_manager = CrossChainManager(config, self.connection)
        self.omnichain_manager = OmnichainManager(config, self.connection)
        self.governance_manager = GovernanceManager(config, self.connection)
        self.defi_manager = DeFiManager(config, self.connection)
    
    async def _load_tools(self) -> None:
        """Load all available ZetaChain tools."""
        self.tools = [
            # Wallet Management Tools
            {
                "name": "create_wallet",
                "description": "Create a new ZetaChain wallet",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string", "description": "Name for the wallet"},
                        "mnemonic": {"type": "string", "description": "Optional mnemonic phrase"}
                    },
                    "required": ["name"]
                }
            },
            {
                "name": "import_wallet",
                "description": "Import an existing wallet from private key",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string", "description": "Name for the wallet"},
                        "private_key": {"type": "string", "description": "Private key in hex format"}
                    },
                    "required": ["name", "private_key"]
                }
            },
            {
                "name": "list_wallets",
                "description": "List all created/imported wallets",
                "inputSchema": {
                    "type": "object",
                    "properties": {}
                }
            },
            {
                "name": "get_balance",
                "description": "Get balance for a wallet on a specific chain",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "wallet_name": {"type": "string", "description": "Name of the wallet"},
                        "chain": {"type": "string", "description": "Chain name (default: zetachain)"}
                    },
                    "required": ["wallet_name"]
                }
            },
            {
                "name": "get_wallet_info",
                "description": "Get detailed information about a wallet",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "wallet_name": {"type": "string", "description": "Name of the wallet"}
                    },
                    "required": ["wallet_name"]
                }
            },
            
            # Cross-Chain Tools
            {
                "name": "get_supported_chains",
                "description": "Get list of supported chains for cross-chain operations",
                "inputSchema": {
                    "type": "object",
                    "properties": {}
                }
            },
            {
                "name": "get_bridge_info",
                "description": "Get bridge information between two chains",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "from_chain": {"type": "string", "description": "Source chain"},
                        "to_chain": {"type": "string", "description": "Destination chain"}
                    },
                    "required": ["from_chain", "to_chain"]
                }
            },
            {
                "name": "estimate_cross_chain_fee",
                "description": "Estimate fees for cross-chain transfer",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "from_chain": {"type": "string", "description": "Source chain"},
                        "to_chain": {"type": "string", "description": "Destination chain"},
                        "amount": {"type": "string", "description": "Amount to transfer"}
                    },
                    "required": ["from_chain", "to_chain", "amount"]
                }
            },
            {
                "name": "get_cross_chain_status",
                "description": "Get status of a cross-chain transaction",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "tx_hash": {"type": "string", "description": "Transaction hash"}
                    },
                    "required": ["tx_hash"]
                }
            },
            {
                "name": "get_cross_chain_history",
                "description": "Get cross-chain transaction history for an address",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "address": {"type": "string", "description": "Wallet address"},
                        "limit": {"type": "integer", "description": "Number of transactions to return"}
                    },
                    "required": ["address"]
                }
            },
            
            # Omnichain Messaging Tools
            {
                "name": "send_omnichain_message",
                "description": "Send an omnichain message",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "from_chain": {"type": "string", "description": "Source chain"},
                        "to_chain": {"type": "string", "description": "Destination chain"},
                        "message": {"type": "string", "description": "Message content"},
                        "sender_address": {"type": "string", "description": "Sender address"},
                        "recipient_address": {"type": "string", "description": "Recipient address"}
                    },
                    "required": ["from_chain", "to_chain", "message", "sender_address", "recipient_address"]
                }
            },
            {
                "name": "get_message_status",
                "description": "Get status of an omnichain message",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "message_id": {"type": "string", "description": "Message ID"}
                    },
                    "required": ["message_id"]
                }
            },
            {
                "name": "get_messages",
                "description": "Get omnichain messages for an address",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "address": {"type": "string", "description": "Wallet address"},
                        "limit": {"type": "integer", "description": "Number of messages to return"}
                    },
                    "required": ["address"]
                }
            },
            {
                "name": "get_omnichain_stats",
                "description": "Get omnichain messaging statistics",
                "inputSchema": {
                    "type": "object",
                    "properties": {}
                }
            },
            {
                "name": "get_chain_status",
                "description": "Get status of all supported chains",
                "inputSchema": {
                    "type": "object",
                    "properties": {}
                }
            },
            
            # Governance Tools
            {
                "name": "get_proposals",
                "description": "Get governance proposals",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "status": {"type": "string", "description": "Filter by status (voting, passed, failed)"}
                    }
                }
            },
            {
                "name": "get_proposal",
                "description": "Get details of a specific proposal",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "proposal_id": {"type": "string", "description": "Proposal ID"}
                    },
                    "required": ["proposal_id"]
                }
            },
            {
                "name": "vote_on_proposal",
                "description": "Vote on a governance proposal",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "proposal_id": {"type": "string", "description": "Proposal ID"},
                        "voter_address": {"type": "string", "description": "Voter address"},
                        "vote": {"type": "string", "enum": ["yes", "no", "abstain"], "description": "Vote option"},
                        "voting_power": {"type": "integer", "description": "Voting power"}
                    },
                    "required": ["proposal_id", "voter_address", "vote", "voting_power"]
                }
            },
            {
                "name": "get_voting_power",
                "description": "Get voting power for an address",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "address": {"type": "string", "description": "Wallet address"}
                    },
                    "required": ["address"]
                }
            },
            {
                "name": "get_governance_stats",
                "description": "Get governance statistics",
                "inputSchema": {
                    "type": "object",
                    "properties": {}
                }
            },
            
            # DeFi Tools
            {
                "name": "get_pools",
                "description": "Get available liquidity pools",
                "inputSchema": {
                    "type": "object",
                    "properties": {}
                }
            },
            {
                "name": "get_pool_info",
                "description": "Get detailed information about a specific pool",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "pool_id": {"type": "string", "description": "Pool ID"}
                    },
                    "required": ["pool_id"]
                }
            },
            {
                "name": "add_liquidity",
                "description": "Add liquidity to a pool",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "pool_id": {"type": "string", "description": "Pool ID"},
                        "token_a_amount": {"type": "string", "description": "Amount of token A"},
                        "token_b_amount": {"type": "string", "description": "Amount of token B"},
                        "user_address": {"type": "string", "description": "User address"}
                    },
                    "required": ["pool_id", "token_a_amount", "token_b_amount", "user_address"]
                }
            },
            {
                "name": "remove_liquidity",
                "description": "Remove liquidity from a pool",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "pool_id": {"type": "string", "description": "Pool ID"},
                        "lp_tokens": {"type": "string", "description": "Amount of LP tokens to remove"},
                        "user_address": {"type": "string", "description": "User address"}
                    },
                    "required": ["pool_id", "lp_tokens", "user_address"]
                }
            },
            {
                "name": "swap_tokens",
                "description": "Swap tokens in a pool",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "pool_id": {"type": "string", "description": "Pool ID"},
                        "token_in": {"type": "string", "description": "Input token"},
                        "amount_in": {"type": "string", "description": "Input amount"},
                        "user_address": {"type": "string", "description": "User address"}
                    },
                    "required": ["pool_id", "token_in", "amount_in", "user_address"]
                }
            },
            {
                "name": "get_user_positions",
                "description": "Get user's liquidity positions",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "user_address": {"type": "string", "description": "User address"}
                    },
                    "required": ["user_address"]
                }
            },
            {
                "name": "get_defi_stats",
                "description": "Get DeFi platform statistics",
                "inputSchema": {
                    "type": "object",
                    "properties": {}
                }
            },
            
            # Network Tools
            {
                "name": "get_network_info",
                "description": "Get network information for a specific chain",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "chain": {"type": "string", "description": "Chain name (default: zetachain)"}
                    }
                }
            }
        ]
    
    # Wallet Management Tool Implementations
    async def tool_create_wallet(self, name: str, mnemonic: str = None) -> Dict[str, Any]:
        """Create a new wallet."""
        return await self.wallet_manager.create_wallet(name, mnemonic)
    
    async def tool_import_wallet(self, name: str, private_key: str) -> Dict[str, Any]:
        """Import an existing wallet."""
        return await self.wallet_manager.import_wallet(name, private_key)
    
    async def tool_list_wallets(self) -> Dict[str, Any]:
        """List all wallets."""
        return await self.wallet_manager.list_wallets()
    
    async def tool_get_balance(self, wallet_name: str, chain: str = "zetachain") -> Dict[str, Any]:
        """Get wallet balance."""
        return await self.wallet_manager.get_balance(wallet_name, chain)
    
    async def tool_get_wallet_info(self, wallet_name: str) -> Dict[str, Any]:
        """Get wallet information."""
        return await self.wallet_manager.get_wallet_info(wallet_name)
    
    # Cross-Chain Tool Implementations
    async def tool_get_supported_chains(self) -> Dict[str, Any]:
        """Get supported chains."""
        return await self.cross_chain_manager.get_supported_chains()
    
    async def tool_get_bridge_info(self, from_chain: str, to_chain: str) -> Dict[str, Any]:
        """Get bridge information."""
        return await self.cross_chain_manager.get_bridge_info(from_chain, to_chain)
    
    async def tool_estimate_cross_chain_fee(self, from_chain: str, to_chain: str, amount: str) -> Dict[str, Any]:
        """Estimate cross-chain fees."""
        return await self.cross_chain_manager.estimate_cross_chain_fee(from_chain, to_chain, amount)
    
    async def tool_get_cross_chain_status(self, tx_hash: str) -> Dict[str, Any]:
        """Get cross-chain transaction status."""
        return await self.cross_chain_manager.get_cross_chain_status(tx_hash)
    
    async def tool_get_cross_chain_history(self, address: str, limit: int = 10) -> Dict[str, Any]:
        """Get cross-chain history."""
        return await self.cross_chain_manager.get_cross_chain_history(address, limit)
    
    # Omnichain Tool Implementations
    async def tool_send_omnichain_message(self, from_chain: str, to_chain: str, message: str,
                                        sender_address: str, recipient_address: str) -> Dict[str, Any]:
        """Send omnichain message."""
        return await self.omnichain_manager.send_omnichain_message(
            from_chain, to_chain, message, sender_address, recipient_address
        )
    
    async def tool_get_message_status(self, message_id: str) -> Dict[str, Any]:
        """Get message status."""
        return await self.omnichain_manager.get_message_status(message_id)
    
    async def tool_get_messages(self, address: str, limit: int = 10) -> Dict[str, Any]:
        """Get messages for address."""
        return await self.omnichain_manager.get_messages(address, limit)
    
    async def tool_get_omnichain_stats(self) -> Dict[str, Any]:
        """Get omnichain statistics."""
        return await self.omnichain_manager.get_omnichain_stats()
    
    async def tool_get_chain_status(self) -> Dict[str, Any]:
        """Get chain status."""
        return await self.omnichain_manager.get_chain_status()
    
    # Governance Tool Implementations
    async def tool_get_proposals(self, status: str = None) -> Dict[str, Any]:
        """Get governance proposals."""
        return await self.governance_manager.get_proposals(status)
    
    async def tool_get_proposal(self, proposal_id: str) -> Dict[str, Any]:
        """Get proposal details."""
        return await self.governance_manager.get_proposal(proposal_id)
    
    async def tool_vote_on_proposal(self, proposal_id: str, voter_address: str, 
                                  vote: str, voting_power: int) -> Dict[str, Any]:
        """Vote on proposal."""
        return await self.governance_manager.vote_on_proposal(proposal_id, voter_address, vote, voting_power)
    
    async def tool_get_voting_power(self, address: str) -> Dict[str, Any]:
        """Get voting power."""
        return await self.governance_manager.get_voting_power(address)
    
    async def tool_get_governance_stats(self) -> Dict[str, Any]:
        """Get governance statistics."""
        return await self.governance_manager.get_governance_stats()
    
    # DeFi Tool Implementations
    async def tool_get_pools(self) -> Dict[str, Any]:
        """Get liquidity pools."""
        return await self.defi_manager.get_pools()
    
    async def tool_get_pool_info(self, pool_id: str) -> Dict[str, Any]:
        """Get pool information."""
        return await self.defi_manager.get_pool_info(pool_id)
    
    async def tool_add_liquidity(self, pool_id: str, token_a_amount: str, 
                               token_b_amount: str, user_address: str) -> Dict[str, Any]:
        """Add liquidity to pool."""
        return await self.defi_manager.add_liquidity(pool_id, token_a_amount, token_b_amount, user_address)
    
    async def tool_remove_liquidity(self, pool_id: str, lp_tokens: str, user_address: str) -> Dict[str, Any]:
        """Remove liquidity from pool."""
        return await self.defi_manager.remove_liquidity(pool_id, lp_tokens, user_address)
    
    async def tool_swap_tokens(self, pool_id: str, token_in: str, amount_in: str, user_address: str) -> Dict[str, Any]:
        """Swap tokens in pool."""
        return await self.defi_manager.swap_tokens(pool_id, token_in, amount_in, user_address)
    
    async def tool_get_user_positions(self, user_address: str) -> Dict[str, Any]:
        """Get user positions."""
        return await self.defi_manager.get_user_positions(user_address)
    
    async def tool_get_defi_stats(self) -> Dict[str, Any]:
        """Get DeFi statistics."""
        return await self.defi_manager.get_defi_stats()
    
    # Network Tool Implementations
    async def tool_get_network_info(self, chain: str = "zetachain") -> Dict[str, Any]:
        """Get network information."""
        return await self.connection.get_network_info(chain)
    
    async def close(self) -> None:
        """Close the server and all connections."""
        await self.connection.close()
        await super().close()


async def main():
    """Main entry point for the ZetaChain MCP Server."""
    import argparse
    
    parser = argparse.ArgumentParser(description="ZetaChain MCP Server")
    parser.add_argument("--network", default="athens", help="ZetaChain network (athens, mainnet, localhost)")
    parser.add_argument("--rpc-url", help="Custom RPC URL")
    parser.add_argument("--timeout", type=int, default=10000, help="Request timeout in milliseconds")
    
    args = parser.parse_args()
    
    # Create configuration
    config = ZetaChainConfig(
        network=args.network,
        rpc_url=args.rpc_url or None,
        timeout=args.timeout
    )
    
    # Create and run server
    server = ZetaChainMCPServer(config)
    await server.run()


if __name__ == "__main__":
    asyncio.run(main())
