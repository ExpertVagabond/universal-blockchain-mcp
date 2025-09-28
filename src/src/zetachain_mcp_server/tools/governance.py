"""
Governance tools for ZetaChain MCP Server.
"""

import json
import time
from typing import Dict, Any, Optional, List
from ..utils.connection import ZetaChainConnection
from ..utils.validation import validate_address
from ..utils.timeout import with_timeout
from ..config import ZetaChainConfig

import logging
logger = logging.getLogger(__name__)


class GovernanceManager:
    """Manages ZetaChain governance operations."""
    
    def __init__(self, config: ZetaChainConfig, connection: ZetaChainConnection):
        self.config = config
        self.connection = connection
        self.proposals: Dict[str, Dict[str, Any]] = {}
        self._initialize_mock_data()
    
    def _initialize_mock_data(self) -> None:
        """Initialize mock governance data for demonstration."""
        # Mock proposals
        self.proposals = {
            "prop_001": {
                "id": "prop_001",
                "title": "Increase ZETA Staking Rewards",
                "description": "Proposal to increase staking rewards from 10% to 12% APY",
                "status": "voting",
                "startTime": int(time.time()) - 86400,  # 1 day ago
                "endTime": int(time.time()) + 604800,   # 7 days from now
                "proposer": "0x1234567890123456789012345678901234567890",
                "votes": {
                    "yes": 1500000,
                    "no": 200000,
                    "abstain": 100000
                },
                "totalVotingPower": 1800000
            },
            "prop_002": {
                "id": "prop_002", 
                "title": "Add New Cross-Chain Bridge",
                "description": "Proposal to add support for Avalanche bridge",
                "status": "passed",
                "startTime": int(time.time()) - 1209600,  # 2 weeks ago
                "endTime": int(time.time()) - 259200,     # 3 days ago
                "proposer": "0x2345678901234567890123456789012345678901",
                "votes": {
                    "yes": 2000000,
                    "no": 500000,
                    "abstain": 200000
                },
                "totalVotingPower": 2700000
            }
        }
    
    async def get_proposals(self, status: Optional[str] = None) -> Dict[str, Any]:
        """Get governance proposals."""
        try:
            proposals = list(self.proposals.values())
            
            if status:
                proposals = [p for p in proposals if p["status"] == status]
            
            # Sort by start time (newest first)
            proposals.sort(key=lambda x: x["startTime"], reverse=True)
            
            return {
                "success": True,
                "proposals": proposals,
                "count": len(proposals)
            }
        except Exception as e:
            logger.error(f"Error getting proposals: {e}")
            return {"error": str(e)}
    
    async def get_proposal(self, proposal_id: str) -> Dict[str, Any]:
        """Get details of a specific proposal."""
        try:
            if proposal_id not in self.proposals:
                return {"error": "Proposal not found"}
            
            proposal = self.proposals[proposal_id]
            
            # Calculate voting power percentages
            total_votes = sum(proposal["votes"].values())
            if total_votes > 0:
                proposal["votePercentages"] = {
                    "yes": f"{(proposal['votes']['yes'] / total_votes) * 100:.1f}%",
                    "no": f"{(proposal['votes']['no'] / total_votes) * 100:.1f}%",
                    "abstain": f"{(proposal['votes']['abstain'] / total_votes) * 100:.1f}%"
                }
            
            return {
                "success": True,
                "proposal": proposal
            }
        except Exception as e:
            logger.error(f"Error getting proposal: {e}")
            return {"error": str(e)}
    
    async def vote_on_proposal(self, proposal_id: str, voter_address: str, 
                             vote: str, voting_power: int) -> Dict[str, Any]:
        """Vote on a governance proposal."""
        try:
            if proposal_id not in self.proposals:
                return {"error": "Proposal not found"}
            
            if not validate_address(voter_address):
                return {"error": "Invalid voter address"}
            
            if vote not in ["yes", "no", "abstain"]:
                return {"error": "Invalid vote option"}
            
            proposal = self.proposals[proposal_id]
            
            # Check if proposal is still open for voting
            current_time = int(time.time())
            if current_time > proposal["endTime"]:
                return {"error": "Voting period has ended"}
            
            if current_time < proposal["startTime"]:
                return {"error": "Voting period has not started"}
            
            # Update votes (in real implementation, this would interact with ZetaChain contracts)
            proposal["votes"][vote] += voting_power
            proposal["totalVotingPower"] += voting_power
            
            logger.info(f"Vote cast: {voter_address} voted {vote} on {proposal_id}")
            
            return {
                "success": True,
                "message": f"Vote cast successfully",
                "proposalId": proposal_id,
                "vote": vote,
                "votingPower": voting_power
            }
        except Exception as e:
            logger.error(f"Error voting on proposal: {e}")
            return {"error": str(e)}
    
    async def get_voting_power(self, address: str) -> Dict[str, Any]:
        """Get voting power for an address."""
        try:
            if not validate_address(address):
                return {"error": "Invalid address"}
            
            # Simulate voting power calculation (in real implementation, this would query ZetaChain contracts)
            # Voting power is typically based on staked ZETA tokens
            import random
            voting_power = random.randint(1000, 100000)  # Mock voting power
            
            return {
                "success": True,
                "votingPower": {
                    "address": address,
                    "power": voting_power,
                    "source": "staked ZETA tokens"
                }
            }
        except Exception as e:
            logger.error(f"Error getting voting power: {e}")
            return {"error": str(e)}
    
    async def get_governance_stats(self) -> Dict[str, Any]:
        """Get governance statistics."""
        try:
            total_proposals = len(self.proposals)
            active_proposals = sum(1 for p in self.proposals.values() if p["status"] == "voting")
            passed_proposals = sum(1 for p in self.proposals.values() if p["status"] == "passed")
            failed_proposals = sum(1 for p in self.proposals.values() if p["status"] == "failed")
            
            total_voting_power = sum(p["totalVotingPower"] for p in self.proposals.values())
            avg_participation = total_voting_power / max(total_proposals, 1)
            
            return {
                "success": True,
                "stats": {
                    "totalProposals": total_proposals,
                    "activeProposals": active_proposals,
                    "passedProposals": passed_proposals,
                    "failedProposals": failed_proposals,
                    "totalVotingPower": total_voting_power,
                    "averageParticipation": int(avg_participation)
                }
            }
        except Exception as e:
            logger.error(f"Error getting governance stats: {e}")
            return {"error": str(e)}
