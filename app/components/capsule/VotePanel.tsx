"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ParsedCapsule, CapsuleStatus } from "@/lib/solana/types";
import { useCapsuleActions } from "@/hooks/useCapsules";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";

interface VotePanelProps {
  capsule: ParsedCapsule;
  onVoted?: () => void;
}

export function VotePanel({ capsule, onVoted }: VotePanelProps) {
  const { castVote } = useCapsuleActions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);

  const handleVote = async (vote: boolean) => {
    try {
      setLoading(true);
      setError(null);
      await castVote(capsule.publicKey, vote);
      setVoted(true);
      onVoted?.();
    } catch (err) {
      console.error("Vote failed:", err);
      setError(err instanceof Error ? err.message : "Failed to cast vote");
    } finally {
      setLoading(false);
    }
  };

  const isVotingOpen = capsule.status === CapsuleStatus.OpenForVoting;
  const totalVotes = capsule.totalVotes;
  const yesPercentage = capsule.yesPercentage;
  const noPercentage = 100 - yesPercentage;

  return (
    <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
      <h3 className="text-lg font-semibold text-white mb-4">Community Vote</h3>
      
      {/* Vote Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-emerald-400 flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            Yes ({capsule.account.yesVotes.toNumber()})
          </span>
          <span className="text-rose-400 flex items-center gap-1">
            No ({capsule.account.noVotes.toNumber()})
            <ThumbsDown className="w-4 h-4" />
          </span>
        </div>
        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${totalVotes > 0 ? yesPercentage : 50}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-500"
            style={{ width: `${totalVotes > 0 ? noPercentage : 50}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-zinc-500 mt-1">
          <span>{yesPercentage.toFixed(1)}%</span>
          <span>{totalVotes} total votes</span>
          <span>{noPercentage.toFixed(1)}%</span>
        </div>
      </div>

      {/* Quorum Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-zinc-400 mb-1">
          <span>Quorum Progress</span>
          <span>{totalVotes} / {capsule.account.quorum.toNumber()} votes</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ 
              width: `${Math.min(100, (totalVotes / capsule.account.quorum.toNumber()) * 100)}%` 
            }}
          />
        </div>
      </div>

      {/* Voting Buttons */}
      {isVotingOpen && !voted && (
        <div className="flex gap-3">
          <Button
            onClick={() => handleVote(true)}
            disabled={loading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-12"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ThumbsUp className="w-5 h-5 mr-2" />
                Vote Yes
              </>
            )}
          </Button>
          <Button
            onClick={() => handleVote(false)}
            disabled={loading}
            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white h-12"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ThumbsDown className="w-5 h-5 mr-2" />
                Vote No
              </>
            )}
          </Button>
        </div>
      )}

      {voted && (
        <div className="text-center text-emerald-400 py-3 bg-emerald-500/10 rounded-lg">
          ✓ Your vote has been recorded!
        </div>
      )}

      {error && (
        <div className="text-center text-rose-400 py-3 bg-rose-500/10 rounded-lg mt-3">
          {error}
        </div>
      )}
    </div>
  );
}

