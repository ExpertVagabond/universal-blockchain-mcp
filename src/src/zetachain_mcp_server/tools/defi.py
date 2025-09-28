"""
DeFi tools for ZetaChain MCP Server.
"""

import json
import time
from typing import Dict, Any, Optional, List
from ..utils.connection import ZetaChainConnection
from ..utils.validation import validate_address, validate_amount
from ..utils.timeout import with_timeout
from ..config import ZetaChainConfig

import logging
logger = logging.getLogger(__name__)


class DeFiManager:
    """Manages DeFi operations on ZetaChain."""
    
    def __init__(self, config: ZetaChainConfig, connection: ZetaChainConnection):
        self.config = config
        self.connection = connection
        self.pools: Dict[str, Dict[str, Any]] = {}
        self.positions: Dict[str, List[Dict[str, Any]]] = {}
        self._initialize_mock_data()
    
    def _initialize_mock_data(self) -> None:
        """Initialize mock DeFi data for demonstration."""
        # Mock liquidity pools
        self.pools = {
            "ZETA_USDC": {
                "id": "ZETA_USDC",
                "tokenA": "ZETA",
                "tokenB": "USDC",
                "reserveA": 1000000,
                "reserveB": 2000000,
                "totalLiquidity": 2000000,
                "apy": 15.5,
                "fee": 0.3,
                "tvl": 3000000
            },
            "ETH_USDC": {
                "id": "ETH_USDC", 
                "tokenA": "ETH",
                "tokenB": "USDC",
                "reserveA": 500,
                "reserveB": 1000000,
                "totalLiquidity": 1000000,
                "apy": 12.8,
                "fee": 0.3,
                "tvl": 2000000
            },
            "BTC_USDC": {
                "id": "BTC_USDC",
                "tokenA": "BTC", 
                "tokenB": "USDC",
                "reserveA": 20,
                "reserveB": 800000,
                "totalLiquidity": 800000,
                "apy": 8.2,
                "fee": 0.5,
                "tvl": 1600000
            }
        }
    
    async def get_pools(self) -> Dict[str, Any]:
        """Get available liquidity pools."""
        try:
            pool_list = list(self.pools.values())
            
            # Sort by TVL (highest first)
            pool_list.sort(key=lambda x: x["tvl"], reverse=True)
            
            return {
                "success": True,
                "pools": pool_list,
                "count": len(pool_list)
            }
        except Exception as e:
            logger.error(f"Error getting pools: {e}")
            return {"error": str(e)}
    
    async def get_pool_info(self, pool_id: str) -> Dict[str, Any]:
        """Get detailed information about a specific pool."""
        try:
            if pool_id not in self.pools:
                return {"error": "Pool not found"}
            
            pool = self.pools[pool_id]
            
            # Calculate additional metrics
            pool["priceRatio"] = pool["reserveB"] / pool["reserveA"]
            pool["volume24h"] = pool["tvl"] * 0.1  # Mock 24h volume
            pool["fees24h"] = pool["volume24h"] * (pool["fee"] / 100)
            
            return {
                "success": True,
                "pool": pool
            }
        except Exception as e:
            logger.error(f"Error getting pool info: {e}")
            return {"error": str(e)}
    
    async def add_liquidity(self, pool_id: str, token_a_amount: str, token_b_amount: str, 
                          user_address: str) -> Dict[str, Any]:
        """Add liquidity to a pool."""
        try:
            if pool_id not in self.pools:
                return {"error": "Pool not found"}
            
            if not validate_address(user_address):
                return {"error": "Invalid user address"}
            
            if not validate_amount(token_a_amount) or not validate_amount(token_b_amount):
                return {"error": "Invalid amounts"}
            
            pool = self.pools[pool_id]
            amount_a = float(token_a_amount)
            amount_b = float(token_b_amount)
            
            # Calculate LP tokens to mint (simplified calculation)
            if pool["reserveA"] == 0 and pool["reserveB"] == 0:
                # First liquidity provision
                lp_tokens = (amount_a * amount_b) ** 0.5
            else:
                # Calculate based on existing reserves
                lp_tokens_a = (amount_a / pool["reserveA"]) * pool["totalLiquidity"]
                lp_tokens_b = (amount_b / pool["reserveB"]) * pool["totalLiquidity"]
                lp_tokens = min(lp_tokens_a, lp_tokens_b)
            
            # Update pool reserves
            pool["reserveA"] += amount_a
            pool["reserveB"] += amount_b
            pool["totalLiquidity"] += lp_tokens
            pool["tvl"] = pool["reserveA"] + pool["reserveB"]
            
            # Record user position
            if user_address not in self.positions:
                self.positions[user_address] = []
            
            position = {
                "poolId": pool_id,
                "lpTokens": lp_tokens,
                "tokenAAmount": amount_a,
                "tokenBAmount": amount_b,
                "timestamp": int(time.time())
            }
            self.positions[user_address].append(position)
            
            logger.info(f"Added liquidity: {user_address} added {amount_a} {pool['tokenA']} and {amount_b} {pool['tokenB']} to {pool_id}")
            
            return {
                "success": True,
                "transaction": {
                    "poolId": pool_id,
                    "lpTokens": lp_tokens,
                    "tokenAAmount": amount_a,
                    "tokenBAmount": amount_b,
                    "userAddress": user_address
                }
            }
        except Exception as e:
            logger.error(f"Error adding liquidity: {e}")
            return {"error": str(e)}
    
    async def remove_liquidity(self, pool_id: str, lp_tokens: str, user_address: str) -> Dict[str, Any]:
        """Remove liquidity from a pool."""
        try:
            if pool_id not in self.pools:
                return {"error": "Pool not found"}
            
            if not validate_address(user_address):
                return {"error": "Invalid user address"}
            
            if not validate_amount(lp_tokens):
                return {"error": "Invalid LP token amount"}
            
            pool = self.pools[pool_id]
            lp_amount = float(lp_tokens)
            
            # Calculate tokens to return
            token_a_amount = (lp_amount / pool["totalLiquidity"]) * pool["reserveA"]
            token_b_amount = (lp_amount / pool["totalLiquidity"]) * pool["reserveB"]
            
            # Update pool reserves
            pool["reserveA"] -= token_a_amount
            pool["reserveB"] -= token_b_amount
            pool["totalLiquidity"] -= lp_amount
            pool["tvl"] = pool["reserveA"] + pool["reserveB"]
            
            logger.info(f"Removed liquidity: {user_address} removed {lp_amount} LP tokens from {pool_id}")
            
            return {
                "success": True,
                "transaction": {
                    "poolId": pool_id,
                    "lpTokens": lp_amount,
                    "tokenAAmount": token_a_amount,
                    "tokenBAmount": token_b_amount,
                    "userAddress": user_address
                }
            }
        except Exception as e:
            logger.error(f"Error removing liquidity: {e}")
            return {"error": str(e)}
    
    async def swap_tokens(self, pool_id: str, token_in: str, amount_in: str, 
                         user_address: str) -> Dict[str, Any]:
        """Swap tokens in a pool."""
        try:
            if pool_id not in self.pools:
                return {"error": "Pool not found"}
            
            if not validate_address(user_address):
                return {"error": "Invalid user address"}
            
            if not validate_amount(amount_in):
                return {"error": "Invalid input amount"}
            
            pool = self.pools[pool_id]
            amount = float(amount_in)
            
            # Determine swap direction
            if token_in == pool["tokenA"]:
                # Swapping tokenA for tokenB
                amount_out = (amount * pool["reserveB"]) / (pool["reserveA"] + amount)
                token_out = pool["tokenB"]
                # Update reserves
                pool["reserveA"] += amount
                pool["reserveB"] -= amount_out
            else:
                # Swapping tokenB for tokenA
                amount_out = (amount * pool["reserveA"]) / (pool["reserveB"] + amount)
                token_out = pool["tokenA"]
                # Update reserves
                pool["reserveB"] += amount
                pool["reserveA"] -= amount_out
            
            # Calculate price impact
            price_impact = (amount_out / amount) * 100
            
            logger.info(f"Token swap: {user_address} swapped {amount} {token_in} for {amount_out} {token_out} in {pool_id}")
            
            return {
                "success": True,
                "swap": {
                    "poolId": pool_id,
                    "tokenIn": token_in,
                    "tokenOut": token_out,
                    "amountIn": amount,
                    "amountOut": amount_out,
                    "priceImpact": f"{price_impact:.2f}%",
                    "userAddress": user_address
                }
            }
        except Exception as e:
            logger.error(f"Error swapping tokens: {e}")
            return {"error": str(e)}
    
    async def get_user_positions(self, user_address: str) -> Dict[str, Any]:
        """Get user's liquidity positions."""
        try:
            if not validate_address(user_address):
                return {"error": "Invalid user address"}
            
            positions = self.positions.get(user_address, [])
            
            # Calculate current values for each position
            for position in positions:
                pool_id = position["poolId"]
                if pool_id in self.pools:
                    pool = self.pools[pool_id]
                    # Calculate current value based on current reserves
                    current_value_a = (position["lpTokens"] / pool["totalLiquidity"]) * pool["reserveA"]
                    current_value_b = (position["lpTokens"] / pool["totalLiquidity"]) * pool["reserveB"]
                    position["currentValueA"] = current_value_a
                    position["currentValueB"] = current_value_b
                    position["totalValue"] = current_value_a + current_value_b
            
            return {
                "success": True,
                "positions": positions,
                "count": len(positions)
            }
        except Exception as e:
            logger.error(f"Error getting user positions: {e}")
            return {"error": str(e)}
    
    async def get_defi_stats(self) -> Dict[str, Any]:
        """Get DeFi platform statistics."""
        try:
            total_tvl = sum(pool["tvl"] for pool in self.pools.values())
            total_pools = len(self.pools)
            avg_apy = sum(pool["apy"] for pool in self.pools.values()) / total_pools
            
            # Calculate total positions
            total_positions = sum(len(positions) for positions in self.positions.values())
            unique_users = len(self.positions)
            
            return {
                "success": True,
                "stats": {
                    "totalTVL": total_tvl,
                    "totalPools": total_pools,
                    "averageAPY": f"{avg_apy:.1f}%",
                    "totalPositions": total_positions,
                    "uniqueUsers": unique_users
                }
            }
        except Exception as e:
            logger.error(f"Error getting DeFi stats: {e}")
            return {"error": str(e)}
