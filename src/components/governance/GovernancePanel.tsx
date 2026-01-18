import React, { useState, useMemo } from 'react';
import { useGovernance, ProposalData } from '@/hooks/useGovernance';
import { ProposalType, ProposalState, getProposalStateLabel, getProposalStateColor, getProposalTypeLabel } from '@/contracts/abi/PropertyGovernance';
import { ProposalCard } from './ProposalCard';
import { CreateProposalModal } from './CreateProposalModal';
import { VotingModal } from './VotingModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Vote, Scale, Clock, CheckCircle, XCircle } from 'lucide-react';

interface GovernancePanelProps {
  propertyToken: string;
  walletAddress: string;
}

export function GovernancePanel({ propertyToken, walletAddress }: GovernancePanelProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ProposalData | null>(null);
  const [isVotingModalOpen, setIsVotingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  const {
    proposals,
    votingPower,
    canPropose,
    isLoading,
    createProposal,
    castVote,
    queueProposal,
    executeProposal,
    cancelProposal,
    refresh,
  } = useGovernance(walletAddress, propertyToken);

  // Filter proposals by status
  const activeProposals = useMemo(() => 
    proposals.filter(p => 
      p.state === ProposalState.ACTIVE || p.state === ProposalState.PENDING
    ), [proposals]
  );

  const queuedProposals = useMemo(() => 
    proposals.filter(p => 
      p.state === ProposalState.QUEUED || p.state === ProposalState.SUCCEEDED
    ), [proposals]
  );

  const completedProposals = useMemo(() => 
    proposals.filter(p => 
      p.state === ProposalState.EXECUTED || 
      p.state === ProposalState.DEFEATED ||
      p.state === ProposalState.CANCELED ||
      p.state === ProposalState.EXPIRED
    ), [proposals]
  );

  const handleCreateProposal = async (
    type: ProposalType,
    title: string,
    description: string,
    calldata: string
  ) => {
    await createProposal(type, title, description, calldata);
    setIsCreateModalOpen(false);
    refresh();
  };

  const handleVote = async (proposalId: bigint, support: number, reason?: string) => {
    await castVote(proposalId, support, reason);
    setIsVotingModalOpen(false);
    setSelectedProposal(null);
    refresh();
  };

  const handleQueue = async (proposalId: bigint) => {
    await queueProposal(proposalId);
    refresh();
  };

  const handleExecute = async (proposalId: bigint) => {
    await executeProposal(proposalId);
    refresh();
  };

  const handleCancel = async (proposalId: bigint) => {
    await cancelProposal(proposalId);
    refresh();
  };

  const openVoteModal = (proposal: ProposalData) => {
    setSelectedProposal(proposal);
    setIsVotingModalOpen(true);
  };

  const formatVotingPower = (power: bigint | undefined) => {
    if (!power) return '0';
    return (Number(power) / 1e18).toFixed(2);
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-purple-400" />
            Property Governance
          </h2>
          <p className="text-slate-400 mt-1">
            Vote on property decisions and proposals
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!canPropose}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Proposal
        </Button>
      </div>

      {/* Voting Power Card */}
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg p-4 mb-6 border border-purple-700/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Your Voting Power</p>
            <p className="text-2xl font-bold text-white">
              {formatVotingPower(votingPower)} votes
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Status</p>
            <p className={`font-semibold ${canPropose ? 'text-green-400' : 'text-yellow-400'}`}>
              {canPropose ? 'Can Create Proposals' : 'Insufficient Voting Power'}
            </p>
          </div>
          <Vote className="w-12 h-12 text-purple-400/50" />
        </div>
      </div>

      {/* Proposals Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-700/50 mb-4">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Active ({activeProposals.length})
          </TabsTrigger>
          <TabsTrigger value="queued" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Queued ({queuedProposals.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Completed ({completedProposals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-slate-400">Loading proposals...</p>
            </div>
          ) : activeProposals.length === 0 ? (
            <div className="text-center py-8 bg-slate-700/30 rounded-lg">
              <Vote className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No active proposals</p>
              <p className="text-slate-500 text-sm mt-1">
                Create a new proposal to start governance
              </p>
            </div>
          ) : (
            activeProposals.map(proposal => (
              <ProposalCard
                key={proposal.id.toString()}
                proposal={proposal}
                onVote={() => openVoteModal(proposal)}
                onQueue={() => handleQueue(proposal.id)}
                onExecute={() => handleExecute(proposal.id)}
                onCancel={() => handleCancel(proposal.id)}
                walletAddress={walletAddress}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="queued" className="space-y-4">
          {queuedProposals.length === 0 ? (
            <div className="text-center py-8 bg-slate-700/30 rounded-lg">
              <CheckCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No queued proposals</p>
            </div>
          ) : (
            queuedProposals.map(proposal => (
              <ProposalCard
                key={proposal.id.toString()}
                proposal={proposal}
                onVote={() => openVoteModal(proposal)}
                onQueue={() => handleQueue(proposal.id)}
                onExecute={() => handleExecute(proposal.id)}
                onCancel={() => handleCancel(proposal.id)}
                walletAddress={walletAddress}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedProposals.length === 0 ? (
            <div className="text-center py-8 bg-slate-700/30 rounded-lg">
              <XCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No completed proposals</p>
            </div>
          ) : (
            completedProposals.map(proposal => (
              <ProposalCard
                key={proposal.id.toString()}
                proposal={proposal}
                onVote={() => openVoteModal(proposal)}
                onQueue={() => handleQueue(proposal.id)}
                onExecute={() => handleExecute(proposal.id)}
                onCancel={() => handleCancel(proposal.id)}
                walletAddress={walletAddress}
                isCompleted
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Create Proposal Modal */}
      <CreateProposalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProposal}
      />

      {/* Voting Modal */}
      {selectedProposal && (
        <VotingModal
          isOpen={isVotingModalOpen}
          onClose={() => {
            setIsVotingModalOpen(false);
            setSelectedProposal(null);
          }}
          proposal={selectedProposal}
          onVote={handleVote}
          votingPower={votingPower}
        />
      )}
    </div>
  );
}

export default GovernancePanel;
