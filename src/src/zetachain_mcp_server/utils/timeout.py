"""
Timeout utilities for ZetaChain MCP Server.
"""

import asyncio
import logging
from typing import Any, Coroutine

logger = logging.getLogger(__name__)


async def with_timeout(coro: Coroutine[Any, Any, Any], timeout_ms: int) -> Any:
    """Execute a coroutine with a timeout in milliseconds."""
    try:
        return await asyncio.wait_for(coro, timeout=timeout_ms / 1000)
    except asyncio.TimeoutError:
        logger.error(f"Operation timed out after {timeout_ms}ms")
        raise
    except Exception as e:
        logger.error(f"Operation failed: {e}")
        raise
