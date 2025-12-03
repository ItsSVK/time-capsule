import { CapsuleCategory } from '@/lib/solana/constants';
import { StakeDestination } from '@/lib/solana/types';

export type FormData = {
  title: string;
  description: string;
  category: CapsuleCategory;
  file: FileList | null;
  unlockDate: string;
  unlockTime: string;
  votingDuration: number | null;
  quorum: number;
  stakeAmount: number;
  stakeDestination: StakeDestination;
};

export type Step = {
  id: number;
  title: string;
  description: string;
};
