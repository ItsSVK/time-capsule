import { useCallback, useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useProgram } from './useProgram';
import { PROGRAM_ID } from '@/lib/solana/constants';

interface VoterRecord {
  vote: boolean;
  timestamp: number;
}

export function useVoterStatus(capsuleAddress: string | null) {
  const { program, wallet } = useProgram();
  const [hasVoted, setHasVoted] = useState(false);
  const [voterRecord, setVoterRecord] = useState<VoterRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const checkVoterStatus = useCallback(async () => {
    if (!program || !wallet.publicKey || !capsuleAddress) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const capsulePda = new PublicKey(capsuleAddress);

      // Derive voter record PDA
      const [voterRecordPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('voter'),
          capsulePda.toBuffer(),
          wallet.publicKey.toBuffer(),
        ],
        PROGRAM_ID
      );

      // Try to fetch voter record
      const record = await (
        program.account as Record<
          string,
          {
            fetch: (pda: PublicKey) => Promise<{
              vote: boolean;
              timestamp: { toNumber: () => number };
            }>;
          }
        >
      ).voterRecord.fetch(voterRecordPda);

      setHasVoted(true);
      setVoterRecord({
        vote: record.vote,
        timestamp: record.timestamp.toNumber(),
      });
    } catch {
      // Voter record doesn't exist, user hasn't voted
      setHasVoted(false);
      setVoterRecord(null);
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, capsuleAddress]);

  useEffect(() => {
    checkVoterStatus();
  }, [checkVoterStatus]);

  return {
    hasVoted,
    voterRecord,
    loading,
    refetch: checkVoterStatus,
  };
}

