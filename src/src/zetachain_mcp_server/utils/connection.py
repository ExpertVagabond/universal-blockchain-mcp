"""
ZetaChain connection management.
"""

import logging
from typing import Optional, Dict, Any
from web3 import Web3
from ..config import ZetaChainConfig

logger = logging.getLogger(__name__)


class ZetaChainConnection:
    """Manages connections to ZetaChain and other supported networks."""

    def __init__(self, config: ZetaChainConfig):
        self.config = config
        self._web3_clients: Dict[str, Web3] = {}
        self._initialized = False

    async def initialize(self) -> None:
        """Initialize connections to all supported chains."""
        if self._initialized:
            return

        for chain_name, chain_config in self.config.supported_chains.items():
            try:
                rpc_url = chain_config.get("rpc_url")
                if rpc_url:
                    w3 = Web3(Web3.HTTPProvider(rpc_url))
                    if w3.is_connected():
                        self._web3_clients[chain_name] = w3
                        logger.info(f"Connected to {chain_name} at {rpc_url}")
                    else:
                        logger.warning(f"Failed to connect to {chain_name}")
            except Exception as e:
                logger.error(f"Error connecting to {chain_name}: {e}")

        self._initialized = True
        logger.info(f"Initialized connections to {len(self._web3_clients)} chains")

    async def get_client(self, chain_name: str = "zetachain") -> Optional[Web3]:
        """Get Web3 client for a specific chain."""
        if not self._initialized:
            await self.initialize()

        return self._web3_clients.get(chain_name.lower())

    async def get_chain_id(self, chain_name: str = "zetachain") -> Optional[int]:
        """Get chain ID for a specific chain."""
        client = await self.get_client(chain_name)
        if not client:
            return None

        try:
            # web3.py chain_id is synchronous
            return client.eth.chain_id
        except Exception as e:
            logger.error(f"Error getting chain ID for {chain_name}: {e}")
            return None

    async def get_balance(self, address: str, chain_name: str = "zetachain") -> Optional[int]:
        """Get balance for an address on a specific chain."""
        client = await self.get_client(chain_name)
        if not client:
            return None

        try:
            # web3.py get_balance is synchronous
            balance = client.eth.get_balance(address)
            return balance
        except Exception as e:
            logger.error(f"Error getting balance for {address} on {chain_name}: {e}")
            return None

    async def get_block_number(self, chain_name: str = "zetachain") -> Optional[int]:
        """Get latest block number for a specific chain."""
        client = await self.get_client(chain_name)
        if not client:
            return None

        try:
            # web3.py block_number is synchronous
            return client.eth.block_number
        except Exception as e:
            logger.error(f"Error getting block number for {chain_name}: {e}")
            return None

    async def get_network_info(self, chain_name: str = "zetachain") -> Dict[str, Any]:
        """Get network information for a specific chain."""
        client = await self.get_client(chain_name)
        chain_config = self.config.get_chain_config(chain_name)

        if not client or not chain_config:
            return {"error": f"Chain {chain_name} not available"}

        try:
            chain_id = await self.get_chain_id(chain_name)
            block_number = await self.get_block_number(chain_name)

            return {
                "chain": chain_name,
                "chainId": chain_id,
                "blockNumber": block_number,
                "rpcUrl": chain_config.get("rpc_url"),
                "explorer": chain_config.get("explorer"),
                "nativeCurrency": chain_config.get("native_currency"),
                "name": chain_config.get("name")
            }
        except Exception as e:
            logger.error(f"Error getting network info for {chain_name}: {e}")
            return {"error": str(e)}

    async def close(self) -> None:
        """Close all connections."""
        self._web3_clients.clear()
        self._initialized = False
        logger.info("Closed all ZetaChain connections")