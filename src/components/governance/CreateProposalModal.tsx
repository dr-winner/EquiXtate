import React, { useState } from 'react';
import { ProposalType, getProposalTypeLabel } from '@/contracts/abi/PropertyGovernance';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, FileText, Tag, AlignLeft, Code } from 'lucide-react';

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    type: ProposalType,
    title: string,
    description: string,
    calldata: string
  ) => Promise<void>;
}

export function CreateProposalModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateProposalModalProps) {
  const [type, setType] = useState<ProposalType>(ProposalType.OTHER);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [calldata, setCalldata] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const proposalTypes = [
    { value: ProposalType.PROPERTY_IMPROVEMENT, description: 'Renovations, upgrades, repairs' },
    { value: ProposalType.RENT_ADJUSTMENT, description: 'Modify rental price or terms' },
    { value: ProposalType.PROPERTY_SALE, description: 'Sell the entire property' },
    { value: ProposalType.MANAGEMENT_CHANGE, description: 'Change property manager' },
    { value: ProposalType.DIVIDEND_DISTRIBUTION, description: 'Distribute accumulated profits' },
    { value: ProposalType.RULE_CHANGE, description: 'Modify property rules or bylaws' },
    { value: ProposalType.OTHER, description: 'Other governance matters' },
  ];

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      setError('Please enter a proposal title');
      return;
    }
    if (title.trim().length < 10) {
      setError('Title must be at least 10 characters');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a proposal description');
      return;
    }
    if (description.trim().length < 50) {
      setError('Description must be at least 50 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(type, title.trim(), description.trim(), calldata);
      // Reset form
      setType(ProposalType.OTHER);
      setTitle('');
      setDescription('');
      setCalldata('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-400" />
            Create Proposal
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Submit a new proposal for token holders to vote on
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-5">
          {/* Proposal Type */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Proposal Type
            </Label>
            <Select 
              value={type.toString()} 
              onValueChange={(v) => setType(parseInt(v) as ProposalType)}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select proposal type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {proposalTypes.map((pt) => (
                  <SelectItem 
                    key={pt.value} 
                    value={pt.value.toString()}
                    className="text-white hover:bg-slate-600"
                  >
                    <div className="flex flex-col">
                      <span>{getProposalTypeLabel(pt.value)}</span>
                      <span className="text-xs text-slate-400">{pt.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief, descriptive title for your proposal"
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              maxLength={100}
            />
            <p className="text-xs text-slate-500 text-right">{title.length}/100</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300 flex items-center gap-2">
              <AlignLeft className="w-4 h-4" />
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed explanation of what you're proposing, why it's needed, and the expected outcome..."
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 min-h-[120px]"
              maxLength={1000}
            />
            <p className="text-xs text-slate-500 text-right">{description.length}/1000</p>
          </div>

          {/* Execution Calldata (Advanced) */}
          <div className="space-y-2">
            <Label htmlFor="calldata" className="text-slate-300 flex items-center gap-2">
              <Code className="w-4 h-4" />
              Execution Calldata
              <span className="text-xs bg-slate-600 px-2 py-0.5 rounded">Advanced</span>
            </Label>
            <Textarea
              id="calldata"
              value={calldata}
              onChange={(e) => setCalldata(e.target.value)}
              placeholder="0x... (Optional: Encoded function call for on-chain execution)"
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 font-mono text-sm min-h-[60px]"
            />
            <p className="text-xs text-slate-500">
              Leave empty for off-chain governance decisions
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-sm">
            <p className="text-purple-300 font-medium mb-1">Proposal Requirements</p>
            <ul className="text-slate-400 space-y-1 list-disc list-inside">
              <li>Minimum 1% of total voting power to create proposals</li>
              <li>1 day voting delay before voting begins</li>
              <li>7 day voting period</li>
              <li>4% quorum required for proposal to pass</li>
              <li>2 day timelock before execution</li>
            </ul>
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
            onClick={handleClose}
            disabled={isSubmitting}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Proposal
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateProposalModal;
