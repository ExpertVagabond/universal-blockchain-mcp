"""
Base MCP server implementation for ZetaChain.
"""

import asyncio
import json
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

from .transport import StdioTransport
from ..config import ZetaChainConfig

logger = logging.getLogger(__name__)


class MCPServer(ABC):
    """Abstract base class for MCP servers."""
    
    def __init__(self, config: ZetaChainConfig):
        self.config = config
        self.transport = StdioTransport()
        self.tools: List[Dict[str, Any]] = []
        self._initialized = False
    
    async def initialize(self) -> Dict[str, Any]:
        """Initialize the MCP server and return capabilities."""
        if not self._initialized:
            await self._load_tools()
            self._initialized = True
            logger.info("ZetaChain MCP Server initialized")
        
        return {
            "protocolVersion": "2024-11-05",
            "capabilities": {
                "tools": {"listChanged": True},
                "resources": {"subscribe": True, "listChanged": True},
                "prompts": {"listChanged": True},
                "logging": {},
                "experimental": {}
            },
            "serverInfo": {
                "name": "zetachain-mcp-server",
                "version": "1.0.0",
            },
        }
    
    @abstractmethod
    async def _load_tools(self) -> None:
        """Load available tools."""
        pass
    
    async def list_tools(self) -> List[Dict[str, Any]]:
        """List all available tools."""
        return self.tools
    
    async def call_tool(self, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call a specific tool by name."""
        tool_method = getattr(self, f"tool_{name}", None)
        if not tool_method:
            raise ValueError(f"Tool '{name}' not found")
        
        try:
            result = await tool_method(**arguments)
            return {"success": True, "result": result}
        except Exception as e:
            logger.error(f"Error in tool {name}: {e}")
            return {"success": False, "error": str(e)}
    
    async def handle_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Handle incoming MCP requests."""
        method = request.get("method")
        params = request.get("params", {})
        request_id = request.get("id", "1")
        
        try:
            if method == "initialize":
                result = await self.initialize()
                return {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "result": result,
                }
            elif method == "tools/list":
                tools = await self.list_tools()
                return {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "result": {"tools": tools},
                }
            elif method == "tools/call":
                tool_name = params.get("name")
                tool_args = params.get("arguments", {})
                result = await self.call_tool(tool_name, tool_args)
                return {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "result": {
                        "content": [{"type": "text", "text": json.dumps(result, indent=2)}]
                    },
                }
            else:
                return {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "error": {
                        "code": -32601,
                        "message": f"Method not found: {method}",
                    },
                }
        except Exception as e:
            logger.error(f"Error handling request {method}: {e}")
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {
                    "code": -32603,
                    "message": str(e)
                }
            }
    
    async def run(self) -> None:
        """Run the MCP server."""
        await self.initialize()
        
        try:
            while True:
                request_data = await self.transport.read_request()
                if not request_data:
                    break
                
                try:
                    request = json.loads(request_data)
                    response = await self.handle_request(request)
                    await self.transport.write_response(json.dumps(response))
                except json.JSONDecodeError as e:
                    error_response = {
                        "jsonrpc": "2.0",
                        "id": None,
                        "error": {
                            "code": -32700,
                            "message": f"Parse error: {e}"
                        }
                    }
                    await self.transport.write_response(json.dumps(error_response))
                except Exception as e:
                    logger.error(f"Unexpected error: {e}")
                    break
        except KeyboardInterrupt:
            logger.info("Server stopped by user")
        finally:
            await self.close()
    
    async def close(self) -> None:
        """Close the MCP server."""
        await self.transport.close()
        logger.info("ZetaChain MCP Server closed")
