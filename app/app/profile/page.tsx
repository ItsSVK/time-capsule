'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useCapsules, useCapsuleActions } from '@/hooks/useCapsules';
import { CapsuleCard } from '@/components/capsule/CapsuleCard';
import { Button } from '@/components/ui/button';
import { CapsuleStatus, ParsedCapsule } from '@/lib/solana/types';
import Link from 'next/link';
import {
  User,
  Loader2,
  Plus,
  Timer,
  Vote,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { publicKey } = useWallet();
  const { userCapsules, loading, refetch } = useCapsules();
  const { cancelCapsule, closeCapsule } = useCapsuleActions();
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  console.log(' here is the userCapsules');
  console.log(userCapsules, { depth: null });
  // console.log(JSON.stringify(userCapsules, null, 2));

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCancelCapsule = async (capsule: ParsedCapsule) => {
    try {
      setActionLoading(capsule.publicKey.toBase58());
      await cancelCapsule(capsule.publicKey);
      toast.success('Capsule cancelled successfully!');
      await refetch();
    } catch (err) {
      console.error('Failed to cancel capsule:', err);
      toast.error(
        err instanceof Error ? err.message : 'Failed to cancel capsule'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseCapsule = async (capsule: ParsedCapsule) => {
    try {
      setActionLoading(capsule.publicKey.toBase58());
      await closeCapsule(capsule.publicKey);
      toast.success('Capsule deleted successfully! Rent reclaimed.');
      await refetch();
    } catch (err) {
      console.error('Failed to close capsule:', err);
      toast.error(
        err instanceof Error ? err.message : 'Failed to close capsule'
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (!publicKey) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Wallet Required
          </h2>
          <p className="text-zinc-400 mb-6">
            Please connect your wallet to view your profile
          </p>
        </div>
      </div>
    );
  }

  const activeCapsules = userCapsules.filter(
    c => c.status === CapsuleStatus.Active
  );
  const votingCapsules = userCapsules.filter(
    c => c.status === CapsuleStatus.OpenForVoting
  );
  const resolvedCapsules = userCapsules.filter(
    c => c.status === CapsuleStatus.Resolved
  );
  const cancelledCapsules = userCapsules.filter(
    c => c.status === CapsuleStatus.Cancelled
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-zinc-900/50 rounded-2xl p-8 border border-zinc-800 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>

            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">
                Your Profile
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <code className="text-zinc-400 text-sm bg-zinc-800 px-3 py-1 rounded-lg">
                  {publicKey.toBase58().slice(0, 8)}...
                  {publicKey.toBase58().slice(-8)}
                </code>
                <button
                  onClick={copyAddress}
                  className="p-2 text-zinc-500 hover:text-white transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Link href="/create">
              <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500">
                <Plus className="w-4 h-4 mr-2" />
                New Capsule
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Timer className="w-5 h-5 text-violet-400" />}
            label="Total Capsules"
            value={userCapsules.length}
          />
          <StatCard
            icon={<Timer className="w-5 h-5 text-amber-400" />}
            label="Active"
            value={activeCapsules.length}
          />
          <StatCard
            icon={<Vote className="w-5 h-5 text-blue-400" />}
            label="Voting"
            value={votingCapsules.length}
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
            label="Resolved"
            value={resolvedCapsules.length}
          />
        </div>

        {/* Capsules */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">
            Your Capsules
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : userCapsules.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-zinc-800/50 flex items-center justify-center">
                <Timer className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No capsules yet
              </h3>
              <p className="text-zinc-500 mb-6">
                Create your first time capsule to get started!
              </p>
              <Link href="/create">
                <Button className="bg-violet-600 hover:bg-violet-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Capsule
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCapsules.map((capsule, index) => (
                <div
                  key={capsule.publicKey.toBase58()}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative">
                    <CapsuleCard capsule={capsule} />
                    {/* Action buttons - higher z-index to appear above card */}
                    <div className="absolute top-3 right-3 flex gap-2 z-20">
                      {/* Cancel button for active capsules */}
                      {capsule.status === CapsuleStatus.Active && (
                        <button
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCancelCapsule(capsule);
                          }}
                          disabled={
                            actionLoading === capsule.publicKey.toBase58()
                          }
                          className="p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-colors disabled:opacity-50"
                          title="Cancel capsule"
                        >
                          {actionLoading === capsule.publicKey.toBase58() ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      {/* Delete button for cancelled or resolved capsules (with no stake) */}
                      {(capsule.status === CapsuleStatus.Cancelled ||
                        (capsule.status === CapsuleStatus.Resolved &&
                          capsule.account.stakeAmount.toNumber() === 0)) && (
                        <button
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCloseCapsule(capsule);
                          }}
                          disabled={
                            actionLoading === capsule.publicKey.toBase58()
                          }
                          className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete capsule (reclaim rent)"
                        >
                          {actionLoading === capsule.publicKey.toBase58() ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Delete Section */}
        {(cancelledCapsules.length > 0 ||
          resolvedCapsules.filter(c => c.account.stakeAmount.toNumber() === 0)
            .length > 0) && (
          <div className="mt-8 bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold text-white mb-4">
              Cleanup Options
            </h3>
            <p className="text-zinc-400 text-sm mb-4">
              Delete cancelled or resolved capsules to reclaim rent (~0.003 SOL
              each).
            </p>
            <div className="flex flex-wrap gap-3">
              {cancelledCapsules.length > 0 && (
                <Button
                  variant="outline"
                  className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                  onClick={async () => {
                    for (const capsule of cancelledCapsules) {
                      await handleCloseCapsule(capsule);
                    }
                  }}
                  disabled={actionLoading !== null}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete {cancelledCapsules.length} Cancelled
                </Button>
              )}
              {resolvedCapsules.filter(
                c => c.account.stakeAmount.toNumber() === 0
              ).length > 0 && (
                <Button
                  variant="outline"
                  className="border-zinc-600 text-zinc-400 hover:bg-zinc-800"
                  onClick={async () => {
                    for (const capsule of resolvedCapsules.filter(
                      c => c.account.stakeAmount.toNumber() === 0
                    )) {
                      await handleCloseCapsule(capsule);
                    }
                  }}
                  disabled={actionLoading !== null}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete{' '}
                  {
                    resolvedCapsules.filter(
                      c => c.account.stakeAmount.toNumber() === 0
                    ).length
                  }{' '}
                  Resolved
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-zinc-400 text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
