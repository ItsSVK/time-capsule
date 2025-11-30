'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCapsules } from '@/hooks/useCapsules';
import { CapsuleCard } from '@/components/capsule/CapsuleCard';
import { Button } from '@/components/ui/button';
import { CapsuleStatus } from '@/lib/solana/types';
import {
  Loader2,
  Timer,
  Vote,
  CheckCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

type FilterTab = 'all' | 'active' | 'voting' | 'resolved';

export default function Home() {
  const { publicKey } = useWallet();
  const {
    capsules,
    activeCapsules,
    votingCapsules,
    resolvedCapsules,
    loading,
    error,
  } = useCapsules();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filteredCapsules = {
    all: capsules,
    active: activeCapsules,
    voting: votingCapsules,
    resolved: resolvedCapsules,
  }[activeTab];

  const tabs = [
    {
      id: 'all' as FilterTab,
      label: 'All',
      count: capsules.length,
      icon: Sparkles,
    },
    {
      id: 'active' as FilterTab,
      label: 'Locked',
      count: activeCapsules.length,
      icon: Timer,
    },
    {
      id: 'voting' as FilterTab,
      label: 'Voting',
      count: votingCapsules.length,
      icon: Vote,
    },
    {
      id: 'resolved' as FilterTab,
      label: 'Resolved',
      count: resolvedCapsules.length,
      icon: CheckCircle,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">Lock Your Predictions</span>
            <br />
            <span className="text-white">On Solana</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-8">
            Create time-locked capsules with your predictions, goals, and
            commitments. Stake SOL for accountability. Let the community decide
            your fate.
          </p>

          {!publicKey ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-zinc-500">
                Connect your wallet to get started
              </p>
            </div>
          ) : (
            <Link href="/create">
              <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-8 py-6 text-lg rounded-xl">
                Create Your First Capsule
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-zinc-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard
              label="Total Capsules"
              value={capsules.length.toString()}
            />
            <StatCard label="Active" value={activeCapsules.length.toString()} />
            <StatCard
              label="Open for Voting"
              value={votingCapsules.length.toString()}
            />
            <StatCard
              label="Resolved"
              value={resolvedCapsules.length.toString()}
            />
          </div>
        </div>
      </section>

      {/* Capsule Feed */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-violet-600 text-white'
                      : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-xs ${
                      activeTab === tab.id ? 'bg-white/20' : 'bg-zinc-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20">
              <p className="text-rose-400">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredCapsules.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
                <Timer className="w-10 h-10 text-zinc-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No capsules found
              </h3>
              <p className="text-zinc-500 mb-6">
                {activeTab === 'all'
                  ? 'Be the first to create a time capsule!'
                  : `No ${activeTab} capsules at the moment.`}
              </p>
              {publicKey && (
                <Link href="/create">
                  <Button className="bg-violet-600 hover:bg-violet-500 text-white">
                    Create Capsule
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Capsule Grid */}
          {!loading && !error && filteredCapsules.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCapsules.map((capsule, index) => (
                <div
                  key={capsule.publicKey.toBase58()}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CapsuleCard capsule={capsule} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">
        {value}
      </div>
      <div className="text-sm text-zinc-500">{label}</div>
    </div>
  );
}
