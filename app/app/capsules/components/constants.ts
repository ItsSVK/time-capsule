import {
  Lock,
  Vote,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { CapsuleStatus } from '@/lib/solana/types';

// Animation variants
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
      when: 'beforeChildren',
    },
  },
};

export const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

// Status configuration
export const statusConfig = {
  [CapsuleStatus.Active]: {
    color: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/30',
    text: 'text-blue-500',
    bg: 'bg-blue-500/10',
    icon: Lock,
    label: 'Locked',
  },
  [CapsuleStatus.OpenForVoting]: {
    color: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-500/30',
    text: 'text-purple-500',
    bg: 'bg-purple-500/10',
    icon: Vote,
    label: 'Voting Open',
  },
  [CapsuleStatus.Resolved]: {
    color: 'from-green-500/20 to-green-600/10',
    border: 'border-green-500/30',
    text: 'text-green-500',
    bg: 'bg-green-500/10',
    icon: CheckCircle,
    label: 'Resolved',
  },
  [CapsuleStatus.Cancelled]: {
    color: 'from-red-500/20 to-red-600/10',
    border: 'border-red-500/30',
    text: 'text-red-500',
    bg: 'bg-red-500/10',
    icon: XCircle,
    label: 'Cancelled',
  },
};

