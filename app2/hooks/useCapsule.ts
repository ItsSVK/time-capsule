import { useCallback, useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useProgram } from './useProgram';
import {
  CapsuleAccount,
  CapsuleMetadata,
  ParsedCapsule,
  getCapsuleStatus,
  getCapsuleResult,
  getStakeDestination,
} from '@/lib/solana/types';
import { fetchMetadata } from '@/lib/pinata';

export function useCapsule(address: string | null) {
  const { program, wallet } = useProgram();
  const [capsule, setCapsule] = useState<ParsedCapsule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCapsule = useCallback(async () => {
    if (!address) {
      setLoading(false);
      setError('Invalid capsule address');
      return;
    }

    if (!wallet.publicKey) {
      setLoading(false);
      setError('Please connect your wallet to view this capsule');
      return;
    }

    if (!program) {
      // Program still initializing, keep loading
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const capsulePda = new PublicKey(address);
      const account = await (
        program.account as Record<
          string,
          { fetch: (pda: PublicKey) => Promise<CapsuleAccount> }
        >
      ).capsule.fetch(capsulePda);

      // Fetch metadata from IPFS
      const metadata = await fetchMetadata<CapsuleMetadata>(
        account.metadataUri
      );

      const status = getCapsuleStatus(account);
      const result = getCapsuleResult(account);
      const stakeDestination = getStakeDestination(account);
      const now = Math.floor(Date.now() / 1000);
      const openTimestamp = account.openTimestamp.toNumber();
      const votingEndTimestamp = account.votingEndTimestamp.toNumber();
      const totalVotes =
        account.yesVotes.toNumber() + account.noVotes.toNumber();
      const yesPercentage =
        totalVotes > 0
          ? (account.yesVotes.toNumber() / totalVotes) * 100
          : 50;

      setCapsule({
        publicKey: capsulePda,
        account,
        metadata: metadata || undefined,
        status,
        result,
        stakeDestination,
        timeRemaining: Math.max(0, openTimestamp - now),
        votingTimeRemaining: Math.max(0, votingEndTimestamp - now),
        totalVotes,
        yesPercentage,
      } as ParsedCapsule);
    } catch (err) {
      console.error('Error fetching capsule:', err);
      setError('Failed to fetch capsule');
    } finally {
      setLoading(false);
    }
  }, [program, address, wallet.publicKey]);

  useEffect(() => {
    fetchCapsule();
  }, [fetchCapsule]);

  return {
    capsule,
    loading,
    error,
    refetch: fetchCapsule,
  };
}

