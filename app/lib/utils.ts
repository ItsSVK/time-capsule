import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind class names, resolving any conflicts.
 *
 * @param inputs - An array of class names to merge.
 * @returns A string of merged and optimized class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const getProgressMessage = (progress: number): string => {
  if (progress < 10) return 'Initializing...';
  if (progress < 30) return 'Validating form...';
  if (progress === 30) return 'Uploading image...';
  if (progress === 40) return 'Uploading metadata...';
  if (progress === 60) return 'Creating capsule...';
  if (progress === 70) return 'Signing capsule transaction...';
  if (progress === 85) return 'Adding stake...';
  if (progress === 90) return 'Signing stake transaction...';
  if (progress === 95) return 'Finalizing...';
  if (progress === 100) return 'Success!';
  return 'Initializing...';
};
