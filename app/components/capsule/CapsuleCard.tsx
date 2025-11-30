"use client";

import Link from "next/link";
import { ParsedCapsule, CapsuleStatus, CapsuleResult } from "@/lib/solana/types";
import { CountdownTimer } from "./CountdownTimer";
import { 
  Clock, 
  Vote, 
  CheckCircle, 
  XCircle, 
  Coins,
  Users,
  ArrowRight 
} from "lucide-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface CapsuleCardProps {
  capsule: ParsedCapsule;
}

const statusConfig = {
  [CapsuleStatus.Active]: {
    label: "Locked",
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  [CapsuleStatus.OpenForVoting]: {
    label: "Voting",
    icon: Vote,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  [CapsuleStatus.Resolved]: {
    label: "Resolved",
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  [CapsuleStatus.Cancelled]: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-zinc-400",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/30",
  },
};

export function CapsuleCard({ capsule }: CapsuleCardProps) {
  const status = statusConfig[capsule.status];
  const StatusIcon = status.icon;
  const stakeAmount = capsule.account.stakeAmount.toNumber() / LAMPORTS_PER_SOL;
  const hasStake = stakeAmount > 0;

  return (
    <Link href={`/capsule/${capsule.publicKey.toBase58()}`}>
      <div className="group relative bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all duration-300 overflow-hidden">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Status Badge */}
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color} ${status.border} border mb-3`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {status.label}
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-2">
                {capsule.metadata?.name || "Untitled Capsule"}
              </h3>
            </div>

            {/* Image placeholder */}
            {capsule.metadata?.image && (
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 ml-4 flex-shrink-0">
                <img 
                  src={capsule.metadata.image} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
            {capsule.metadata?.description || "No description provided"}
          </p>

          {/* Category Badge */}
          {capsule.metadata?.category && (
            <span className="inline-block px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded-md mb-4">
              {capsule.metadata.category}
            </span>
          )}

          {/* Timer or Result */}
          <div className="mb-4">
            {capsule.status === CapsuleStatus.Active && (
              <CountdownTimer 
                targetTimestamp={capsule.account.openTimestamp.toNumber()} 
                label="Opens in"
              />
            )}
            {capsule.status === CapsuleStatus.OpenForVoting && (
              <CountdownTimer 
                targetTimestamp={capsule.account.votingEndTimestamp.toNumber()} 
                label="Voting ends in"
              />
            )}
            {capsule.status === CapsuleStatus.Resolved && capsule.result && (
              <div className={`flex items-center gap-2 ${capsule.result === CapsuleResult.Success ? 'text-emerald-400' : 'text-rose-400'}`}>
                {capsule.result === CapsuleResult.Success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {capsule.result === CapsuleResult.Success ? 'Success!' : 'Failed'}
                </span>
              </div>
            )}
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-4">
              {/* Stake Amount */}
              {hasStake && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="text-zinc-300">{stakeAmount.toFixed(2)} SOL</span>
                </div>
              )}
              
              {/* Vote Count */}
              <div className="flex items-center gap-1.5 text-sm">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-zinc-300">{capsule.totalVotes} votes</span>
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  );
}

