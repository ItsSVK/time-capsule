"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useProgram } from "@/hooks/useProgram";
import { useCapsuleActions } from "@/hooks/useCapsules";
import { fetchMetadata } from "@/lib/pinata";
import {
  CapsuleAccount,
  CapsuleMetadata,
  CapsuleStatus,
  CapsuleResult,
  getCapsuleStatus,
  getCapsuleResult,
  getStakeDestination,
  StakeDestination,
} from "@/lib/solana/types";
import { CountdownTimer } from "@/components/capsule/CountdownTimer";
import { VotePanel } from "@/components/capsule/VotePanel";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Clock,
  User,
  Coins,
  CheckCircle,
  XCircle,
  Vote,
  ExternalLink,
  Loader2,
  PlayCircle,
  Gavel,
  Wallet,
} from "lucide-react";

export default function CapsuleDetailPage() {
  const params = useParams();
  const address = params.address as string;
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useProgram();
  const { openForVoting, resolveCapsule, claimStake } = useCapsuleActions();

  const [capsule, setCapsule] = useState<CapsuleAccount | null>(null);
  const [metadata, setMetadata] = useState<CapsuleMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCapsule = useCallback(async () => {
    if (!program || !address) return;

    try {
      setLoading(true);
      const capsulePda = new PublicKey(address);
      const account = await (program.account as Record<string, { fetch: (pda: PublicKey) => Promise<CapsuleAccount> }>).capsule.fetch(capsulePda);
      setCapsule(account);

      // Fetch metadata
      const meta = await fetchMetadata<CapsuleMetadata>(account.metadataUri);
      setMetadata(meta);
    } catch (err) {
      console.error("Failed to fetch capsule:", err);
      setError("Failed to load capsule");
    } finally {
      setLoading(false);
    }
  }, [program, address]);

  useEffect(() => {
    fetchCapsule();
  }, [fetchCapsule]);

  const handleOpenForVoting = async () => {
    try {
      setActionLoading(true);
      await openForVoting(new PublicKey(address));
      await fetchCapsule();
    } catch (err) {
      console.error("Failed to open for voting:", err);
      setError(err instanceof Error ? err.message : "Failed to open for voting");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    try {
      setActionLoading(true);
      await resolveCapsule(new PublicKey(address));
      await fetchCapsule();
    } catch (err) {
      console.error("Failed to resolve:", err);
      setError(err instanceof Error ? err.message : "Failed to resolve capsule");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaim = async () => {
    try {
      setActionLoading(true);
      await claimStake(new PublicKey(address));
      await fetchCapsule();
    } catch (err) {
      console.error("Failed to claim:", err);
      setError(err instanceof Error ? err.message : "Failed to claim stake");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (error || !capsule) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Capsule Not Found</h2>
          <p className="text-zinc-400 mb-6">{error || "The capsule you're looking for doesn't exist."}</p>
          <Link href="/">
            <Button variant="outline" className="border-zinc-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const status = getCapsuleStatus(capsule);
  const result = getCapsuleResult(capsule);
  const stakeDestination = getStakeDestination(capsule);
  const stakeAmount = capsule.stakeAmount.toNumber() / LAMPORTS_PER_SOL;
  const hasStake = stakeAmount > 0;
  const isCreator = publicKey && capsule.creator.equals(publicKey);
  const now = Math.floor(Date.now() / 1000);
  const canOpenForVoting = status === CapsuleStatus.Active && capsule.openTimestamp.toNumber() <= now;
  const canResolve = status === CapsuleStatus.OpenForVoting && capsule.votingEndTimestamp.toNumber() <= now;
  const totalVotes = capsule.yesVotes.toNumber() + capsule.noVotes.toNumber();
  const yesPercentage = totalVotes > 0 ? (capsule.yesVotes.toNumber() / totalVotes) * 100 : 50;

  const parsedCapsule = {
    publicKey: new PublicKey(address),
    account: capsule,
    metadata: metadata || undefined,
    status,
    result,
    stakeDestination,
    timeRemaining: Math.max(0, capsule.openTimestamp.toNumber() - now),
    votingTimeRemaining: Math.max(0, capsule.votingEndTimestamp.toNumber() - now),
    totalVotes,
    yesPercentage,
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Explore
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
              {/* Status Badge */}
              <StatusBadge status={status} result={result} />

              {/* Title & Description */}
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-4 mb-3">
                {metadata?.name || "Untitled Capsule"}
              </h1>
              <p className="text-zinc-400 text-lg leading-relaxed">
                {metadata?.description || "No description provided"}
              </p>

              {/* Category */}
              {metadata?.category && (
                <span className="inline-block mt-4 px-3 py-1 bg-zinc-800 text-zinc-400 text-sm rounded-lg">
                  {metadata.category}
                </span>
              )}

              {/* Image */}
              {metadata?.image && (
                <div className="mt-6 rounded-xl overflow-hidden">
                  <img
                    src={metadata.image}
                    alt={metadata.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Voting Panel */}
            {(status === CapsuleStatus.OpenForVoting || status === CapsuleStatus.Resolved) && (
              <VotePanel capsule={parsedCapsule} onVoted={fetchCapsule} />
            )}

            {/* Action Buttons */}
            {publicKey && (
              <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                <div className="flex flex-wrap gap-3">
                  {canOpenForVoting && (
                    <Button
                      onClick={handleOpenForVoting}
                      disabled={actionLoading}
                      className="bg-blue-600 hover:bg-blue-500"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <PlayCircle className="w-4 h-4 mr-2" />
                      )}
                      Open for Voting
                    </Button>
                  )}

                  {canResolve && (
                    <Button
                      onClick={handleResolve}
                      disabled={actionLoading}
                      className="bg-emerald-600 hover:bg-emerald-500"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Gavel className="w-4 h-4 mr-2" />
                      )}
                      Resolve Capsule
                    </Button>
                  )}

                  {status === CapsuleStatus.Resolved && hasStake && isCreator && (
                    <Button
                      onClick={handleClaim}
                      disabled={actionLoading}
                      className="bg-amber-600 hover:bg-amber-500"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Wallet className="w-4 h-4 mr-2" />
                      )}
                      Claim Stake
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timer Card */}
            <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {status === CapsuleStatus.Active ? "Opens in" : "Voting ends in"}
              </h3>
              {status === CapsuleStatus.Active && (
                <CountdownTimer
                  targetTimestamp={capsule.openTimestamp.toNumber()}
                  className="text-2xl"
                />
              )}
              {status === CapsuleStatus.OpenForVoting && (
                <CountdownTimer
                  targetTimestamp={capsule.votingEndTimestamp.toNumber()}
                  className="text-2xl"
                />
              )}
              {status === CapsuleStatus.Resolved && (
                <div className="text-emerald-400 font-semibold">Completed</div>
              )}
            </div>

            {/* Info Card */}
            <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 space-y-4">
              <InfoRow
                icon={<User className="w-4 h-4" />}
                label="Creator"
                value={capsule.creator.toBase58().slice(0, 4) + "..." + capsule.creator.toBase58().slice(-4)}
              />
              <InfoRow
                icon={<Vote className="w-4 h-4" />}
                label="Quorum"
                value={`${capsule.quorum.toString()} votes required`}
              />
              <InfoRow
                icon={<Clock className="w-4 h-4" />}
                label="Voting Duration"
                value={`${capsule.votingDuration.toNumber() / 3600} hours`}
              />
              {hasStake && (
                <>
                  <InfoRow
                    icon={<Coins className="w-4 h-4" />}
                    label="Stake"
                    value={`${stakeAmount.toFixed(4)} SOL`}
                  />
                  <InfoRow
                    icon={<Wallet className="w-4 h-4" />}
                    label="On Failure"
                    value={formatStakeDestination(stakeDestination)}
                  />
                </>
              )}
            </div>

            {/* NFT Info */}
            <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">NFT Details</h3>
              <a
                href={`https://explorer.solana.com/address/${capsule.nftMint.toBase58()}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm"
              >
                View on Explorer
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, result }: { status: CapsuleStatus; result?: CapsuleResult }) {
  const config = {
    [CapsuleStatus.Active]: { label: "Locked", icon: Clock, className: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
    [CapsuleStatus.OpenForVoting]: { label: "Voting", icon: Vote, className: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
    [CapsuleStatus.Resolved]: {
      label: result === CapsuleResult.Success ? "Success" : "Failed",
      icon: result === CapsuleResult.Success ? CheckCircle : XCircle,
      className: result === CapsuleResult.Success ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30",
    },
    [CapsuleStatus.Cancelled]: { label: "Cancelled", icon: XCircle, className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30" },
  }[status];

  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${config.className}`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-zinc-500 text-sm">
        {icon}
        {label}
      </span>
      <span className="text-zinc-300 text-sm font-medium">{value}</span>
    </div>
  );
}

function formatStakeDestination(dest: StakeDestination): string {
  return {
    [StakeDestination.CommunityPool]: "Community Pool",
    [StakeDestination.Charity]: "Charity",
    [StakeDestination.TopVoters]: "Top Voters",
    [StakeDestination.ReturnToCreator]: "Return to Creator",
  }[dest];
}

