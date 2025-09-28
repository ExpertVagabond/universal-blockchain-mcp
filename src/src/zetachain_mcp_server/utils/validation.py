"""
Validation utilities for ZetaChain MCP Server.
"""

import re
from typing import Union
from eth_utils import is_address, is_checksum_address
from eth_account import Account


def validate_address(address: str) -> bool:
    """Validate an Ethereum-compatible address."""
    try:
        return is_address(address)
    except Exception:
        return False


def validate_private_key(private_key: str) -> bool:
    """Validate a private key."""
    try:
        # Remove 0x prefix if present
        if private_key.startswith("0x"):
            private_key = private_key[2:]
        
        # Check if it's a valid hex string of correct length
        if len(private_key) != 64:
            return False
        
        # Try to create an account from the private key
        Account.from_key(private_key)
        return True
    except Exception:
        return False


def validate_mnemonic(mnemonic: str) -> bool:
    """Validate a BIP39 mnemonic phrase."""
    try:
        from mnemonic import Mnemonic
        mnemo = Mnemonic("english")
        return mnemo.check(mnemonic)
    except Exception:
        return False


def validate_chain_name(chain_name: str) -> bool:
    """Validate a chain name."""
    valid_chains = ["zetachain", "ethereum", "bsc", "polygon", "bitcoin"]
    return chain_name.lower() in valid_chains


def validate_amount(amount: Union[str, int, float]) -> bool:
    """Validate an amount value."""
    try:
        amount_float = float(amount)
        return amount_float > 0
    except (ValueError, TypeError):
        return False


def normalize_address(address: str) -> str:
    """Normalize an address to checksum format."""
    try:
        if is_address(address):
            return address
        return ""
    except Exception:
        return ""


def validate_transaction_hash(tx_hash: str) -> bool:
    """Validate a transaction hash."""
    try:
        # Remove 0x prefix if present
        if tx_hash.startswith("0x"):
            tx_hash = tx_hash[2:]
        
        # Check if it's a valid hex string of correct length (64 characters)
        if len(tx_hash) != 64:
            return False
        
        # Check if it contains only valid hex characters
        return bool(re.match(r'^[0-9a-fA-F]+$', tx_hash))
    except Exception:
        return False
