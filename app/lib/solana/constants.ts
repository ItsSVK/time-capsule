import { PublicKey } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey(
  'CqDKXwZffTzXQYsZvaYGTwKwGhdN6sHjMdQTVo5QHx54'
);
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);
export const RPC_ENDPOINT = 'https://api.devnet.solana.com';

// Capsule categories for filtering
export const CAPSULE_CATEGORIES = [
  'Prediction',
  'Goal',
  'Commitment',
  'Challenge',
  'Fun',
  'Other',
] as const;

export type CapsuleCategory = (typeof CAPSULE_CATEGORIES)[number];

// Default voting duration options (in seconds)
export const VOTING_DURATION_OPTIONS = [
  { label: '1 Hour', value: 3600 },
  { label: '6 Hours', value: 21600 },
  { label: '12 Hours', value: 43200 },
  { label: '24 Hours', value: 86400 },
  { label: '48 Hours', value: 172800 },
  { label: '1 Week', value: 604800 },
] as const;
