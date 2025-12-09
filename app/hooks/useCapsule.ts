import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  PublicKey,
  Keypair,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
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
import idl from '@/lib/solana/idl.json';

export function useCapsule(address: string | null) {
  const { program: walletProgram } = useProgram();
  const { connection } = useConnection();
  const [capsule, setCapsule] = useState<ParsedCapsule | null>(null);
  const [loading, setLoading] = useState(true);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a read-only program for fetching data when wallet is not connected
  const readOnlyProgram = useMemo(() => {
    if (walletProgram) return walletProgram; // Use wallet program if available

    // Create a read-only provider with a dummy keypair
    const dummyKeypair = Keypair.generate();
    const readOnlyProvider = new AnchorProvider(
      connection,
      {
        publicKey: dummyKeypair.publicKey,
        signTransaction: async (tx: Transaction | VersionedTransaction) => tx,
        signAllTransactions: async (
          txs: (Transaction | VersionedTransaction)[]
        ) => txs,
      } as never,
      AnchorProvider.defaultOptions()
    );

    return new Program(idl as Idl, readOnlyProvider);
  }, [walletProgram, connection]);

  const fetchCapsule = useCallback(
    async (isRefetch = false) => {
      if (!address) {
        setLoading(false);
        setError('Invalid capsule address');
        return;
      }

      if (!readOnlyProgram) {
        // Program still initializing, keep loading
        return;
      }

      try {
        // Only set loading to true on initial fetch, not on refetch
        if (isRefetch) {
          setRefetching(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const capsulePda = new PublicKey(address);
        const account = await (
          readOnlyProgram.account as Record<
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
        if (
          err instanceof Error &&
          err.message.includes('Account does not exist')
        ) {
          setError('Capsule not found');
        } else {
          setError('Failed to fetch capsule');
        }
      } finally {
        setLoading(false);
        setRefetching(false);
      }
    },
    [readOnlyProgram, address]
  );

  useEffect(() => {
    fetchCapsule();
  }, [fetchCapsule]);

  return {
    capsule,
    loading,
    refetching,
    error,
    refetch: () => fetchCapsule(true),
  };
}
