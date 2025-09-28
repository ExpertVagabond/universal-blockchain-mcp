"""
ZetaChain MCP Server - Python implementation for omnichain blockchain interactions.

This package provides a Model Context Protocol (MCP) server for ZetaChain,
enabling cross-chain operations, omnichain messaging, and multi-blockchain
wallet management through a unified interface.
"""

__version__ = "1.0.0"
__author__ = "ExpertVagabond"
__email__ = "your-email@example.com"

from .server import ZetaChainMCPServer
from .config import ZetaChainConfig

__all__ = ["ZetaChainMCPServer", "ZetaChainConfig"]
