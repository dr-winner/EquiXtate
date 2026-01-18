import React, { useState } from 'react';
import { ProposalData } from '@/hooks/useGovernance';
import { VoteSupport } from '@/contracts/abi/PropertyGovernance';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, AlertCircle, Vote, Loader2 } from 'lucide-react';

interface VotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposalData;
  onVote: (proposalId: bigint, support: number, reason?: string) => Promise<void>;
  votingPower: bigint | undefined;
}

export function VotingModal({
  isOpen,
  onClose,
  proposal,
  onVote,
  votingPower,
}: VotingModalProps) {
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (selectedVote === null) {
      setError('Please select a vote option');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onVote(proposal.id, selectedVote, reason || undefined);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cast vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatVotingPower = (power: bigint | undefined) => {
    if (!power) return '0';
    return (Number(power) / 1e18).toFixed(2);
  };

  const voteOptions = [
    {
      value: VoteSupport.FOR,
      label: 'For',
      description: 'Support this proposal',
      icon: CheckCircle2,
      color: 'border-green-500 bg-green-500/10 hover:bg-green-500/20',
      selectedColor: 'border-green-500 bg-green-500/30 ring-2 ring-green-500',
      iconColor: 'text-green-500',
    },
    {
      value: VoteSupport.AGAINST,
      label: 'Against',
      description: 'Oppose this proposal',
      icon: XCircle,
      color: 'border-red-500 bg-red-500/10 hover:bg-red-500/20',
      selectedColor: 'border-red-500 bg-red-500/30 ring-2 ring-red-500',
      iconColor: 'text-red-500',
    },
    {
      value: VoteSupport.ABSTAIN,
      label: 'Abstain',
      description: 'Neither for nor against',
      icon: AlertCircle,
      color: 'border-slate-500 bg-slate-500/10 hover:bg-slate-500/20',
      selectedColor: 'border-slate-500 bg-slate-500/30 ring-2 ring-slate-500',
      iconColor: 'text-slate-400',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-purple-400" />
            Cast Your Vote
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Vote on proposal #{proposal.id.toString().slice(-6)}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Proposal Summary */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">{proposal.title}</h4>
            <p className="text-sm text-slate-400 line-clamp-3">{proposal.description}</p>
          </div>

          {/* Voting Power Info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Your Voting Power</span>
            <span className="font-semibold text-purple-400">
              {formatVotingPower(votingPower)} votes
            </span>
          </div>

          {/* Vote Options */}
          <div className="space-y-3">
            <Label className="text-slate-300">Select Your Vote</Label>
            <div className="grid gap-3">
              {voteOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedVote === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedVote(option.value)}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      isSelected ? option.selectedColor : option.color
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${option.iconColor}`} />
                    <div className="text-left">
                      <p className="font-semibold text-white">{option.label}</p>
                      <p className="text-sm text-slate-400">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-slate-300">
              Reason (Optional)
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Share why you're voting this way..."
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px]"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedVote === null || isSubmitting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Vote className="w-4 h-4 mr-2" />
                Submit Vote
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default VotingModal;
