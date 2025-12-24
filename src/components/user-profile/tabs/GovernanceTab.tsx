
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from '@/components/ui/use-toast';
import { Button } from "@/components/ui/button";

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
      <h3 className="text-xl font-semibold mb-4">Active Governance Proposals</h3>
      <div className="grid gap-4">
        {proposals.map((proposal) => (
          <Card key={proposal.id} className="glassmorphism">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{proposal.title}</span>
                <Badge variant="secondary">{proposal.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm mb-4">
                <p>Ends: {proposal.votingEnds}</p>
                <p>Your Voting Power: <span className="text-primary/80">{proposal.votingPower} votes</span></p>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => handleVote(proposal.id)}>
                  Vote For
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleVote(proposal.id)}>
                  Vote Against
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GovernanceTab;
