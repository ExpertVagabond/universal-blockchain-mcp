"""
Transport layer for MCP communication.
"""

import asyncio
import sys
from typing import Optional


class StdioTransport:
    """Standard I/O transport for MCP communication."""
    
    def __init__(self):
        self._closed = False
    
    async def read_request(self) -> Optional[str]:
        """Read a request from stdin."""
        if self._closed:
            return None
        
        try:
            # Read from stdin in a non-blocking way
            loop = asyncio.get_event_loop()
            line = await loop.run_in_executor(None, sys.stdin.readline)
            return line.strip() if line else None
        except Exception:
            return None
    
    async def write_response(self, response: str) -> None:
        """Write a response to stdout."""
        if self._closed:
            return
        
        try:
            print(response, flush=True)
        except Exception:
            pass
    
    async def close(self) -> None:
        """Close the transport."""
        self._closed = True
