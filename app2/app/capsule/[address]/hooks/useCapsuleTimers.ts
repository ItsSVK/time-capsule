import { useEffect, useState } from 'react';
import type { ParsedCapsule } from '@/lib/solana/types';

export function useCapsuleTimers(capsule: ParsedCapsule | null) {
  const [realTimeRemaining, setRealTimeRemaining] = useState(0);
  const [realVotingTimeRemaining, setRealVotingTimeRemaining] = useState(0);

  useEffect(() => {
    if (!capsule) return;

    const updateTimes = () => {
      const now = Math.floor(Date.now() / 1000);
      const openTimestamp = capsule.account.openTimestamp.toNumber();
      const votingEndTimestamp = capsule.account.votingEndTimestamp.toNumber();

      setRealTimeRemaining(Math.max(0, openTimestamp - now));
      setRealVotingTimeRemaining(Math.max(0, votingEndTimestamp - now));
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [capsule]);

  return {
    realTimeRemaining,
    realVotingTimeRemaining,
  };
}
