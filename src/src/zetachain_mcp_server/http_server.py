"""
HTTP server wrapper for ZetaChain MCP Server.
"""

import asyncio
import json
import logging
import os
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn

from .server import ZetaChainMCPServer
from .config import ZetaChainConfig

# Configure logging
logger = logging.getLogger(__name__)

# Initialize the MCP server globally
zetachain_mcp_server: Optional[ZetaChainMCPServer] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage the lifespan of the FastAPI application."""
    global zetachain_mcp_server
    
    # Initialize the MCP server
    config = ZetaChainConfig(
        network=os.getenv("ZETACHAIN_NETWORK", "athens"),
        rpc_url=os.getenv("ZETACHAIN_RPC_URL", "https://zetachain-athens-evm.blockpi.network/v1/rpc/public"),
        timeout=int(os.getenv("ZETACHAIN_TIMEOUT", "10000"))
    )
    
    zetachain_mcp_server = ZetaChainMCPServer(config)
    await zetachain_mcp_server.initialize()
    
    yield
    
    # Cleanup
    await zetachain_mcp_server.close()


app = FastAPI(
    title="ZetaChain MCP HTTP Server",
    description="HTTP wrapper for the ZetaChain Model Context Protocol (MCP) server.",
    version="1.0.0",
    lifespan=lifespan
)


class MCPRequest(BaseModel):
    """MCP request model."""
    jsonrpc: str = "2.0"
    id: str
    method: str
    params: Dict[str, Any] = Field(default_factory=dict)


class MCPResponse(BaseModel):
    """MCP response model."""
    jsonrpc: str = "2.0"
    id: str
    result: Any = None
    error: Optional[Dict[str, Any]] = None


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "zetachain-mcp-server",
        "server_initialized": zetachain_mcp_server is not None
    }


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "service": "ZetaChain MCP HTTP Server",
        "version": "1.0.0",
        "description": "HTTP wrapper for ZetaChain Model Context Protocol server",
        "endpoints": {
            "health": "/health",
            "tools": "/tools",
            "mcp": "/mcp",
            "docs": "/docs"
        }
    }


@app.post("/mcp")
async def handle_mcp_request(request: MCPRequest):
    """Handle MCP protocol requests following the standard MCP specification."""
    if not zetachain_mcp_server:
        raise HTTPException(status_code=503, detail="MCP server not initialized")
    
    try:
        # Convert Pydantic model to dict for consistency
        request_dict = request.dict()
        
        # Handle the MCP request using the standard protocol
        response = await zetachain_mcp_server.handle_request(request_dict)
        
        return response
    except Exception as e:
        logger.error(f"Error handling MCP request: {e}")
        return {
            "jsonrpc": "2.0",
            "id": request.id,
            "error": {
                "code": -32603,
                "message": str(e)
            }
        }


@app.get("/tools")
async def list_tools_http():
    """List all available tools via HTTP."""
    if not zetachain_mcp_server:
        raise HTTPException(status_code=503, detail="MCP server not initialized")
    
    try:
        tools = await zetachain_mcp_server.list_tools()
        return {"tools": tools, "count": len(tools)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/tools/call")
async def call_tool_http(tool_name: str, args: Dict[str, Any]):
    """Call a tool via HTTP."""
    if not zetachain_mcp_server:
        raise HTTPException(status_code=503, detail="MCP server not initialized")
    
    try:
        result = await zetachain_mcp_server.call_tool(tool_name, args)
        return {"tool_name": tool_name, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/network/info")
async def get_network_info(chain: str = "zetachain"):
    """Get network information for a specific chain."""
    if not zetachain_mcp_server:
        raise HTTPException(status_code=503, detail="MCP server not initialized")
    
    try:
        result = await zetachain_mcp_server.call_tool("get_network_info", {"chain": chain})
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/chains")
async def get_supported_chains():
    """Get list of supported chains."""
    if not zetachain_mcp_server:
        raise HTTPException(status_code=503, detail="MCP server not initialized")
    
    try:
        result = await zetachain_mcp_server.call_tool("get_supported_chains", {})
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats")
async def get_platform_stats():
    """Get platform statistics."""
    if not zetachain_mcp_server:
        raise HTTPException(status_code=503, detail="MCP server not initialized")
    
    try:
        # Get various stats
        omnichain_stats = await zetachain_mcp_server.call_tool("get_omnichain_stats", {})
        governance_stats = await zetachain_mcp_server.call_tool("get_governance_stats", {})
        defi_stats = await zetachain_mcp_server.call_tool("get_defi_stats", {})
        
        return {
            "omnichain": omnichain_stats.get("result", {}),
            "governance": governance_stats.get("result", {}),
            "defi": defi_stats.get("result", {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def main():
    """Main entry point for the HTTP server."""
    uvicorn.run(app, host="0.0.0.0", port=8080)


if __name__ == "__main__":
    main()
