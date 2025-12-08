import { StakeDestination } from '@/lib/solana/types';
import { VOTING_DURATION_OPTIONS } from '@/lib/solana/constants';

export function formatVotingDuration(seconds: number): string {
  const option = VOTING_DURATION_OPTIONS.find(opt => opt.value === seconds);
  return option ? option.label : `${seconds} seconds`;
}

export function formatStakeDestination(destination: StakeDestination): string {
  const labels: Record<StakeDestination, string> = {
    [StakeDestination.CommunityPool]: 'Community Pool',
    [StakeDestination.Charity]: 'Charity',
    [StakeDestination.TopVoters]: 'Top Voters',
    [StakeDestination.ReturnToCreator]: 'Return to Creator',
  };
  return labels[destination] || destination;
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

