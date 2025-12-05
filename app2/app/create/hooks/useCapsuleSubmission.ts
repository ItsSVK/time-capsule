import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { FormData } from '../types';
import { StakeDestination } from '@/lib/solana/types';
import { useCapsuleActions } from '@/hooks/useCapsules';
import { uploadImage, uploadMetadata } from '@/lib/pinata';
import { getProgressMessage } from '@/lib/utils';

export function useCapsuleSubmission() {
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const { publicKey } = useWallet();
  const { createCapsule, addStake } = useCapsuleActions();
  const router = useRouter();

  const submitCapsule = async (data: FormData) => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setShowProgressBar(true);
      setSubmitting(true);
      setProgress(20);

      // Calculate open timestamp
      const openDateTime = new Date(`${data.unlockDate}T${data.unlockTime}`);
      const openTimestamp = Math.floor(openDateTime.getTime() / 1000);

      if (openTimestamp <= Math.floor(Date.now() / 1000)) {
        toast.error('Open date must be in the future');
        setProgress(0);
        setSubmitting(false);
        return;
      }

      setProgress(30);
      // Upload image if provided
      let imageUri: string | undefined;
      if (data.file) {
        imageUri = await uploadImage(data.file[0] as File);
      }

      setProgress(40);

      // Create metadata
      const metadata = {
        name: data.title,
        description: data.description,
        image: imageUri,
        category: data.category,
        attributes: [
          { trait_type: 'Category', value: data.category },
          { trait_type: 'Open Date', value: openDateTime.toISOString() },
          {
            trait_type: 'Voting Duration',
            value: `${(data.votingDuration as number) / 3600} hours`,
          },
          { trait_type: 'Quorum', value: data.quorum },
        ],
      };

      // Upload metadata to Pinata
      const metadataUri = await uploadMetadata(metadata);
      setProgress(60);

      // Create capsule on-chain
      setProgress(70);
      const symbol = 'TCAP';
      const { tx, capsulePda } = await createCapsule(
        metadataUri,
        openTimestamp,
        data.votingDuration as number,
        data.quorum,
        data.title.slice(0, 32),
        symbol
      );
      console.log('Capsule created:', tx);

      // Add stake if enabled
      if (data.stakeAmount && data.stakeAmount > 0) {
        setProgress(85);
        const lamports = Math.floor(
          (data.stakeAmount as number) * LAMPORTS_PER_SOL
        );
        setProgress(90);
        await addStake(
          capsulePda,
          lamports,
          data.stakeDestination as StakeDestination
        );
      }

      setProgress(95);
      toast.success('Time Capsule created successfully!');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(100);
      // Redirect to capsule page
      router.push(`/capsule/${capsulePda.toBase58()}`);
      setSubmitting(false);
    } catch (err) {
      console.error('Failed to create capsule:', err);
      toast.error(
        err instanceof Error ? err.message : 'Failed to create capsule'
      );
      setProgress(0);
      setShowProgressBar(false);
      setSubmitting(false);
    }
  };

  return {
    progress,
    submitting,
    showProgressBar,
    submitCapsule,
    progressMessage: getProgressMessage(progress),
  };
}
