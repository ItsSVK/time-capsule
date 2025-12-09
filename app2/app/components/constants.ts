import {
  Lock,
  Vote,
  Coins,
  Shield,
  Users,
  Zap,
  Calendar,
  Clock,
  CheckCircle,
} from 'lucide-react';

export const features = [
  {
    icon: Lock,
    title: 'Time-Locked Capsules',
    description:
      'Create capsules that unlock at a future date. Set your goals, predictions, or commitments and let time reveal the outcome.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Vote,
    title: 'Community Voting',
    description:
      'When your capsule opens, the community votes to determine success. Transparent, democratic, and fair resolution.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Coins,
    title: 'Accountability Stakes',
    description:
      'Optional stakes add weight to your commitments. Choose where stakes go on success or failure.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'On-Chain Security',
    description:
      'Built on Solana blockchain. Your capsules are immutable, transparent, and secured by decentralized technology.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      "Solana's high-speed transactions mean instant capsule creation and voting. No waiting, no delays.",
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Users,
    title: 'Social Accountability',
    description:
      'Share your goals publicly. Let the community hold you accountable and celebrate your achievements together.',
    color: 'from-rose-500 to-pink-500',
  },
];

export const steps = [
  {
    number: '01',
    title: 'Create Your Capsule',
    description:
      'Set your goal, prediction, or commitment. Add an optional stake and choose when it unlocks.',
    icon: Calendar,
  },
  {
    number: '02',
    title: 'Wait for Unlock',
    description:
      'Your capsule remains locked until the chosen date. Share it with friends and build anticipation.',
    icon: Clock,
  },
  {
    number: '03',
    title: 'Community Votes',
    description:
      'Once unlocked, the community votes on whether your goal was achieved or prediction came true.',
    icon: Vote,
  },
  {
    number: '04',
    title: 'Resolution',
    description:
      'Stakes are resolved based on the vote. Success means you keep your stake, failure distributes it.',
    icon: CheckCircle,
  },
];

export const parallaxSections = [
  {
    title: 'Lock Your Future',
    subtitle: 'Time-locked commitments',
    gradient: 'from-blue-600/80 via-purple-600/80 to-pink-600/80',
    icon: Lock,
    content:
      'Create capsules that unlock at your chosen moment. Set goals, make predictions, commit to change.',
  },
  {
    title: 'Community Decides',
    subtitle: 'Democratic resolution',
    gradient: 'from-purple-600/80 via-pink-600/80 to-rose-600/80',
    icon: Vote,
    content:
      'When your capsule opens, the community votes. Transparent, fair, and decentralized.',
  },
  {
    title: 'Stake Your Claim',
    subtitle: 'Accountability matters',
    gradient: 'from-amber-600/80 via-orange-600/80 to-red-600/80',
    icon: Coins,
    content:
      'Add stakes to show commitment. Choose where they go on success or failure.',
  },
];

