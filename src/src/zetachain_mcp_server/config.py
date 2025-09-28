"""
Configuration management for ZetaChain MCP Server.
"""

from dataclasses import dataclass
from typing import Dict, Any, Optional
import os


@dataclass
class ZetaChainConfig:
    """Configuration for ZetaChain MCP Server."""

    # Network configuration
    network: str = "athens"  # athens, mainnet, localhost
    rpc_url: str = "https://zetachain-athens-evm.blockpi.network/v1/rpc/public"
    gateway_address: str = "0x6c533f7fe93fae114d0954697069df33c9b74fd7"

    # Cross-chain configuration
    supported_chains: Dict[str, Dict[str, Any]] = None

    # Timeout settings
    timeout: int = 15000  # milliseconds

    # Wallet settings
    wallet_storage_path: str = "./data/wallets"

    def __post_init__(self):
        """Initialize configuration after dataclass creation."""
        if self.supported_chains is None:
            self.supported_chains = {
                "zetachain": {
                    "name": "ZetaChain Athens Testnet",
                    "chain_id": 7001,
                    "rpc_url": "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
                    "explorer": "https://explorer.zetachain.com",
                    "native_currency": "ZETA"
                },
                "ethereum": {
                    "name": "Ethereum Sepolia",
                    "chain_id": 11155111,
                    "rpc_url": "https://eth-sepolia.public.blastapi.io",
                    "explorer": "https://sepolia.etherscan.io",
                    "native_currency": "ETH"
                },
                "bsc": {
                    "name": "BSC Testnet",
                    "chain_id": 97,
                    "rpc_url": "https://data-seed-prebsc-1-s1.binance.org:8545",
                    "explorer": "https://testnet.bscscan.com",
                    "native_currency": "BNB"
                },
                "polygon": {
                    "name": "Polygon Mumbai",
                    "chain_id": 80001,
                    "rpc_url": "https://rpc.ankr.com/polygon_mumbai",
                    "explorer": "https://mumbai.polygonscan.com",
                    "native_currency": "MATIC"
                },
                "avalanche": {
                    "name": "Avalanche Fuji",
                    "chain_id": 43113,
                    "rpc_url": "https://api.avax-test.network/ext/bc/C/rpc",
                    "explorer": "https://testnet.snowtrace.io",
                    "native_currency": "AVAX"
                },
                "optimism": {
                    "name": "Optimism Goerli",
                    "chain_id": 420,
                    "rpc_url": "https://goerli.optimism.io",
                    "explorer": "https://goerli-optimism.etherscan.io",
                    "native_currency": "ETH"
                },
                "arbitrum": {
                    "name": "Arbitrum Goerli",
                    "chain_id": 421613,
                    "rpc_url": "https://goerli-rollup.arbitrum.io/rpc",
                    "explorer": "https://goerli.arbiscan.io",
                    "native_currency": "ETH"
                }
            }

        # Override with environment variables if present
        self.network = os.getenv("ZETACHAIN_NETWORK", self.network)
        self.rpc_url = os.getenv("ZETACHAIN_RPC_URL", self.rpc_url)
        self.gateway_address = os.getenv("ZETACHAIN_GATEWAY", self.gateway_address)
        self.timeout = int(os.getenv("ZETACHAIN_TIMEOUT", str(self.timeout)))

    def get_chain_config(self, chain_name: str) -> Optional[Dict[str, Any]]:
        """Get configuration for a specific chain."""
        return self.supported_chains.get(chain_name.lower())

    def get_rpc_url(self, chain_name: str) -> Optional[str]:
        """Get RPC URL for a specific chain."""
        chain_config = self.get_chain_config(chain_name)
        return chain_config.get("rpc_url") if chain_config else None

    def get_explorer_url(self, chain_name: str) -> Optional[str]:
        """Get explorer URL for a specific chain."""
        chain_config = self.get_chain_config(chain_name)
        return chain_config.get("explorer") if chain_config else None