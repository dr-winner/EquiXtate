
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from '@/components/ui/use-toast';

interface GovernanceProposal {
  id: number;
  title: string;
  status: string;
  votingEnds: string;
  votingPower: number;
}

interface GovernanceTabProps {
  proposals: GovernanceProposal[];
}

const GovernanceTab: React.FC<GovernanceTabProps> = ({ proposals }) => {
  
  const handleVote = (proposalId: number) => {
    toast({
      title: "Vote cast successfully",
      description: `Your vote for proposal #${proposalId} has been recorded.`
    });
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-orbitron mb-4">Active Governance Proposals</h3>
      <div className="grid gap-4">
        {proposals.map((proposal) => (
          <Card key={proposal.id} className="bg-space-deep-purple/30 border-space-deep-purple">
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>{proposal.title}</span>
                <Badge className="bg-green-500">{proposal.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm mb-4">
                <p>Ends: {proposal.votingEnds}</p>
                <p>Your Voting Power: <span className="text-space-neon-purple">{proposal.votingPower} votes</span></p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleVote(proposal.id)}
                  className="flex-1 px-4 py-2 bg-green-600 rounded-md text-white hover:bg-green-700 transition-all"
                >
                  Vote For
                </button>
                <button 
                  onClick={() => handleVote(proposal.id)}
                  className="flex-1 px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700 transition-all"
                >
                  Vote Against
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GovernanceTab;
