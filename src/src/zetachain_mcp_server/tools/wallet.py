"""
Wallet management tools for ZetaChain MCP Server.
"""

import json
import os
import time
import base64
from typing import Dict, Any, List, Optional
from eth_account import Account
from mnemonic import Mnemonic

# Enable HD wallet features
Account.enable_unaudited_hdwallet_features()
from ..utils.connection import ZetaChainConnection
from ..utils.validation import validate_address, validate_private_key, validate_mnemonic
from ..utils.timeout import with_timeout
from ..config import ZetaChainConfig

import logging
logger = logging.getLogger(__name__)


class WalletManager:
    """Manages wallets across multiple chains."""
    
    def __init__(self, config: ZetaChainConfig, connection: ZetaChainConnection):
        self.config = config
        self.connection = connection
        self.wallets: Dict[str, Dict[str, Any]] = {}
        self._load_wallets()
    
    def _load_wallets(self) -> None:
        """Load wallets from storage."""
        try:
            os.makedirs(self.config.wallet_storage_path, exist_ok=True)
            wallets_file = os.path.join(self.config.wallet_storage_path, "wallets.json")
            
            if os.path.exists(wallets_file):
                with open(wallets_file, 'r') as f:
                    self.wallets = json.load(f)
                logger.info(f"Loaded {len(self.wallets)} wallets")
        except Exception as e:
            logger.error(f"Error loading wallets: {e}")
            self.wallets = {}
    
    def _save_wallets(self) -> None:
        """Save wallets to storage."""
        try:
            os.makedirs(self.config.wallet_storage_path, exist_ok=True)
            wallets_file = os.path.join(self.config.wallet_storage_path, "wallets.json")
            
            with open(wallets_file, 'w') as f:
                json.dump(self.wallets, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving wallets: {e}")
    
    async def create_wallet(self, name: str, mnemonic: Optional[str] = None) -> Dict[str, Any]:
        """Create a new wallet."""
        try:
            if name in self.wallets:
                return {"error": f"Wallet '{name}' already exists"}
            
            if mnemonic:
                if not validate_mnemonic(mnemonic):
                    return {"error": "Invalid mnemonic phrase"}
                account = Account.from_mnemonic(mnemonic)
            else:
                account = Account.create()
                mnemo = Mnemonic("english")
                mnemonic = mnemo.generate(strength=256)
                account = Account.from_mnemonic(mnemonic)
            
            wallet_data = {
                "name": name,
                "address": account.address,
                "private_key": account.key.hex(),
                "mnemonic": mnemonic,
                "created_at": str(int(time.time())),
                "chains": {}
            }
            
            self.wallets[name] = wallet_data
            self._save_wallets()
            
            logger.info(f"Created wallet '{name}' with address {account.address}")
            
            return {
                "success": True,
                "wallet": {
                    "name": name,
                    "address": account.address,
                    "mnemonic": mnemonic
                }
            }
        except Exception as e:
            logger.error(f"Error creating wallet: {e}")
            return {"error": str(e)}
    
    async def import_wallet(self, name: str, private_key: str) -> Dict[str, Any]:
        """Import an existing wallet from private key."""
        try:
            if name in self.wallets:
                return {"error": f"Wallet '{name}' already exists"}
            
            if not validate_private_key(private_key):
                return {"error": "Invalid private key"}
            
            account = Account.from_key(private_key)
            
            wallet_data = {
                "name": name,
                "address": account.address,
                "private_key": private_key,
                "created_at": str(int(time.time())),
                "chains": {}
            }
            
            self.wallets[name] = wallet_data
            self._save_wallets()
            
            logger.info(f"Imported wallet '{name}' with address {account.address}")
            
            return {
                "success": True,
                "wallet": {
                    "name": name,
                    "address": account.address
                }
            }
        except Exception as e:
            logger.error(f"Error importing wallet: {e}")
            return {"error": str(e)}
    
    async def list_wallets(self) -> Dict[str, Any]:
        """List all wallets."""
        try:
            wallet_list = []
            for name, wallet_data in self.wallets.items():
                wallet_list.append({
                    "name": name,
                    "address": wallet_data["address"],
                    "created_at": wallet_data.get("created_at", "unknown")
                })
            
            return {
                "success": True,
                "wallets": wallet_list,
                "count": len(wallet_list)
            }
        except Exception as e:
            logger.error(f"Error listing wallets: {e}")
            return {"error": str(e)}
    
    async def get_balance(self, wallet_name: str, chain: str = "zetachain") -> Dict[str, Any]:
        """Get balance for a wallet on a specific chain."""
        try:
            if wallet_name not in self.wallets:
                return {"error": f"Wallet '{wallet_name}' not found"}
            
            wallet_data = self.wallets[wallet_name]
            address = wallet_data["address"]
            
            balance = await self.connection.get_balance(address, chain)
            if balance is None:
                return {"error": f"Failed to get balance on {chain}"}
            
            # Convert wei to ETH/ZETA
            balance_eth = balance / 10**18
            
            return {
                "success": True,
                "balance": {
                    "address": address,
                    "chain": chain,
                    "wei": str(balance),
                    "eth": str(balance_eth)
                }
            }
        except Exception as e:
            logger.error(f"Error getting balance: {e}")
            return {"error": str(e)}
    
    async def get_wallet_info(self, wallet_name: str) -> Dict[str, Any]:
        """Get detailed information about a wallet."""
        try:
            if wallet_name not in self.wallets:
                return {"error": f"Wallet '{wallet_name}' not found"}
            
            wallet_data = self.wallets[wallet_name]
            
            # Get balances for all supported chains
            balances = {}
            for chain_name in self.config.supported_chains.keys():
                balance = await self.connection.get_balance(wallet_data["address"], chain_name)
                if balance is not None:
                    balances[chain_name] = {
                        "wei": str(balance),
                        "eth": str(balance / 10**18)
                    }
            
            return {
                "success": True,
                "wallet": {
                    "name": wallet_name,
                    "address": wallet_data["address"],
                    "created_at": wallet_data.get("created_at", "unknown"),
                    "balances": balances
                }
            }
        except Exception as e:
            logger.error(f"Error getting wallet info: {e}")
            return {"error": str(e)}
    
    def get_wallet_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """Get wallet data by name."""
        return self.wallets.get(name)
