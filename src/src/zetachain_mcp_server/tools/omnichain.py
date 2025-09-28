"""
Omnichain messaging tools for ZetaChain MCP Server.
"""

import json
import time
import hashlib
from typing import Dict, Any, Optional
from ..utils.connection import ZetaChainConnection
from ..utils.validation import validate_address
from ..utils.timeout import with_timeout
from ..config import ZetaChainConfig

import logging
logger = logging.getLogger(__name__)


class OmnichainManager:
    """Manages omnichain messaging through ZetaChain."""
    
    def __init__(self, config: ZetaChainConfig, connection: ZetaChainConnection):
        self.config = config
        self.connection = connection
        self.messages: Dict[str, Dict[str, Any]] = {}
    
    async def send_omnichain_message(self, from_chain: str, to_chain: str, message: str, 
                                   sender_address: str, recipient_address: str) -> Dict[str, Any]:
        """Send an omnichain message."""
        try:
            if not validate_address(sender_address) or not validate_address(recipient_address):
                return {"error": "Invalid address"}
            
            # Generate message ID
            message_id = hashlib.sha256(
                f"{from_chain}{to_chain}{message}{sender_address}{recipient_address}{int(time.time())}".encode()
            ).hexdigest()[:16]
            
            # Store message (in real implementation, this would interact with ZetaChain contracts)
            message_data = {
                "id": message_id,
                "fromChain": from_chain,
                "toChain": to_chain,
                "message": message,
                "senderAddress": sender_address,
                "recipientAddress": recipient_address,
                "timestamp": int(time.time()),
                "status": "pending"
            }
            
            self.messages[message_id] = message_data
            
            logger.info(f"Sent omnichain message {message_id} from {from_chain} to {to_chain}")
            
            return {
                "success": True,
                "messageId": message_id,
                "status": "pending",
                "estimatedDelivery": "5-10 minutes"
            }
        except Exception as e:
            logger.error(f"Error sending omnichain message: {e}")
            return {"error": str(e)}
    
    async def get_message_status(self, message_id: str) -> Dict[str, Any]:
        """Get status of an omnichain message."""
        try:
            if message_id not in self.messages:
                return {"error": "Message not found"}
            
            message_data = self.messages[message_id]
            
            # Simulate status progression (in real implementation, this would query ZetaChain contracts)
            import random
            statuses = ["pending", "confirmed", "delivered", "failed"]
            current_status = random.choice(statuses)
            message_data["status"] = current_status
            
            return {
                "success": True,
                "message": message_data
            }
        except Exception as e:
            logger.error(f"Error getting message status: {e}")
            return {"error": str(e)}
    
    async def get_messages(self, address: str, limit: int = 10) -> Dict[str, Any]:
        """Get omnichain messages for an address."""
        try:
            if not validate_address(address):
                return {"error": "Invalid address"}
            
            # Filter messages for the address
            user_messages = []
            for message_id, message_data in self.messages.items():
                if (message_data["senderAddress"].lower() == address.lower() or 
                    message_data["recipientAddress"].lower() == address.lower()):
                    user_messages.append(message_data)
            
            # Sort by timestamp (newest first)
            user_messages.sort(key=lambda x: x["timestamp"], reverse=True)
            
            # Limit results
            user_messages = user_messages[:limit]
            
            return {
                "success": True,
                "messages": user_messages,
                "count": len(user_messages)
            }
        except Exception as e:
            logger.error(f"Error getting messages: {e}")
            return {"error": str(e)}
    
    async def get_omnichain_stats(self) -> Dict[str, Any]:
        """Get omnichain messaging statistics."""
        try:
            total_messages = len(self.messages)
            pending_messages = sum(1 for msg in self.messages.values() if msg["status"] == "pending")
            confirmed_messages = sum(1 for msg in self.messages.values() if msg["status"] == "confirmed")
            delivered_messages = sum(1 for msg in self.messages.values() if msg["status"] == "delivered")
            failed_messages = sum(1 for msg in self.messages.values() if msg["status"] == "failed")
            
            # Get unique addresses
            unique_addresses = set()
            for msg in self.messages.values():
                unique_addresses.add(msg["senderAddress"])
                unique_addresses.add(msg["recipientAddress"])
            
            return {
                "success": True,
                "stats": {
                    "totalMessages": total_messages,
                    "pendingMessages": pending_messages,
                    "confirmedMessages": confirmed_messages,
                    "deliveredMessages": delivered_messages,
                    "failedMessages": failed_messages,
                    "uniqueAddresses": len(unique_addresses),
                    "successRate": f"{(delivered_messages / max(total_messages, 1)) * 100:.1f}%"
                }
            }
        except Exception as e:
            logger.error(f"Error getting omnichain stats: {e}")
            return {"error": str(e)}
    
    async def get_chain_status(self) -> Dict[str, Any]:
        """Get status of all supported chains."""
        try:
            chain_statuses = {}
            
            for chain_name in self.config.supported_chains.keys():
                network_info = await self.connection.get_network_info(chain_name)
                if "error" not in network_info:
                    chain_statuses[chain_name] = {
                        "status": "online",
                        "blockNumber": network_info.get("blockNumber"),
                        "chainId": network_info.get("chainId"),
                        "lastUpdate": int(time.time())
                    }
                else:
                    chain_statuses[chain_name] = {
                        "status": "offline",
                        "error": network_info.get("error"),
                        "lastUpdate": int(time.time())
                    }
            
            return {
                "success": True,
                "chains": chain_statuses
            }
        except Exception as e:
            logger.error(f"Error getting chain status: {e}")
            return {"error": str(e)}
