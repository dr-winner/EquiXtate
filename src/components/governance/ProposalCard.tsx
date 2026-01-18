import React from 'react';
import { ProposalData } from '@/hooks/useGovernance';
import { 
  ProposalState, 
  getProposalStateLabel, 
  getProposalStateColor, 
  getProposalTypeLabel 
} from '@/contracts/abi/PropertyGovernance';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowRight,
  Play,
  Ban,
  Vote
} from 'lucide-react';

interface ProposalCardProps {
  proposal: ProposalData;
  onVote: () => void;
  onQueue: () => void;
  onExecute: () => void;
  onCancel: () => void;
  walletAddress: string;
  isCompleted?: boolean;
}

export function ProposalCard({
  proposal,
  onVote,
  onQueue,
  onExecute,
  onCancel,
  walletAddress,
  isCompleted = false,
}: ProposalCardProps) {
  const stateLabel = getProposalStateLabel(proposal.state);
  const stateColor = getProposalStateColor(proposal.state);
  const typeLabel = getProposalTypeLabel(proposal.proposalType);

  // Calculate vote percentages
  const totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
  const forPercentage = totalVotes > 0n 
    ? Number((proposal.forVotes * 10000n) / totalVotes) / 100 
    : 0;
  const againstPercentage = totalVotes > 0n 
    ? Number((proposal.againstVotes * 10000n) / totalVotes) / 100 
    : 0;
  const abstainPercentage = totalVotes > 0n 
    ? Number((proposal.abstainVotes * 10000n) / totalVotes) / 100 
    : 0;

  // Format timestamps
  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format vote count
  const formatVotes = (votes: bigint) => {
    const num = Number(votes) / 1e18;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(2);
  };

  // Check if user is proposer
  const isProposer = proposal.proposer.toLowerCase() === walletAddress.toLowerCase();

  // Determine which actions are available
  const canVote = proposal.state === ProposalState.ACTIVE;
  const canQueue = proposal.state === ProposalState.SUCCEEDED;
  const canExecute = proposal.state === ProposalState.QUEUED && 
    Number(proposal.executionTime) * 1000 < Date.now();
  const canCancel = isProposer && 
    (proposal.state === ProposalState.PENDING || proposal.state === ProposalState.ACTIVE);

  // Get time remaining
  const getTimeRemaining = () => {
    const now = Date.now() / 1000;
    if (proposal.state === ProposalState.PENDING) {
      const start = Number(proposal.startTime);
      const diff = start - now;
      if (diff > 0) {
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        return `Starts in ${hours}h ${minutes}m`;
      }
    }
    if (proposal.state === ProposalState.ACTIVE) {
      const end = Number(proposal.endTime);
      const diff = end - now;
      if (diff > 0) {
        const days = Math.floor(diff / 86400);
        const hours = Math.floor((diff % 86400) / 3600);
        return `${days}d ${hours}h remaining`;
      }
    }
    if (proposal.state === ProposalState.QUEUED) {
      const exec = Number(proposal.executionTime);
      const diff = exec - now;
      if (diff > 0) {
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        return `Executable in ${hours}h ${minutes}m`;
      }
      return 'Ready to execute';
    }
    return null;
  };

  const timeRemaining = getTimeRemaining();

  return (
    <div className={`bg-slate-800/80 rounded-lg border ${isCompleted ? 'border-slate-700/50' : 'border-slate-700'} p-5 transition-all hover:border-slate-600`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${stateColor}`}>
              {stateLabel}
            </span>
            <span className="px-2 py-1 rounded text-xs bg-slate-700 text-slate-300">
              {typeLabel}
            </span>
            {timeRemaining && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                {timeRemaining}
              </span>
            )}
          </div>
          <h3 className={`text-lg font-semibold ${isCompleted ? 'text-slate-400' : 'text-white'}`}>
            {proposal.title}
          </h3>
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
            {proposal.description}
          </p>
        </div>
        <span className="text-slate-500 text-sm">
          #{proposal.id.toString().slice(-6)}
        </span>
      </div>

      {/* Vote Stats */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-green-400 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            For: {formatVotes(proposal.forVotes)} ({forPercentage.toFixed(1)}%)
          </span>
          <span className="text-red-400 flex items-center gap-1">
            <XCircle className="w-4 h-4" />
            Against: {formatVotes(proposal.againstVotes)} ({againstPercentage.toFixed(1)}%)
          </span>
          <span className="text-slate-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Abstain: {formatVotes(proposal.abstainVotes)} ({abstainPercentage.toFixed(1)}%)
          </span>
        </div>
        
        {/* Vote Progress Bar */}
        <div className="h-2 rounded-full overflow-hidden bg-slate-700 flex">
          <div 
            className="bg-green-500 transition-all"
            style={{ width: `${forPercentage}%` }}
          />
          <div 
            className="bg-red-500 transition-all"
            style={{ width: `${againstPercentage}%` }}
          />
          <div 
            className="bg-slate-500 transition-all"
            style={{ width: `${abstainPercentage}%` }}
          />
        </div>
      </div>

      {/* Footer with proposer and actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700">
        <div className="text-sm text-slate-500">
          Proposed by{' '}
          <span className="text-slate-400">
            {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
          </span>
          {isProposer && (
            <span className="ml-2 text-purple-400">(You)</span>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {canVote && (
            <Button 
              size="sm" 
              onClick={onVote}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Vote className="w-4 h-4 mr-1" />
              Vote
            </Button>
          )}
          {canQueue && (
            <Button 
              size="sm" 
              onClick={onQueue}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowRight className="w-4 h-4 mr-1" />
              Queue
            </Button>
          )}
          {canExecute && (
            <Button 
              size="sm" 
              onClick={onExecute}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-1" />
              Execute
            </Button>
          )}
          {canCancel && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onCancel}
              className="border-red-600 text-red-400 hover:bg-red-600/20"
            >
              <Ban className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProposalCard;
