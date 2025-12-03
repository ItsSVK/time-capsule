'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FormData } from './types';
import { steps, containerVariants } from './constants';
import BackgroundGradients from './components/BackgroundGradients';
import CardDecorations from './components/CardDecorations';
import FormHeader from './components/FormHeader';
import StepIndicator from './components/StepIndicator';
import BasicInfoStep from './components/BasicInfoStep';
import ScheduleStep from './components/ScheduleStep';
import ReviewStep from './components/ReviewStep';
import FormNavigation from './components/FormNavigation';
import { StakeDestination } from '@/lib/solana/types';
import { toast } from 'sonner';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCapsuleActions } from '@/hooks/useCapsules';
import { uploadImage, uploadMetadata } from '@/lib/pinata';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const { publicKey } = useWallet();
  const { createCapsule, addStake } = useCapsuleActions();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      category: '' as FormData['category'],
      file: null,
      unlockDate: '',
      unlockTime: '',
      votingDuration: null,
      quorum: 1,
      stakeAmount: 0,
      stakeDestination: StakeDestination.ReturnToCreator,
    },
  });

  const formData = watch();

  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 1:
        return await trigger(['title', 'description', 'category']);
      case 2:
        return await trigger([
          'unlockDate',
          'unlockTime',
          'votingDuration',
          'quorum',
        ]);
      default:
        return true;
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < steps.length) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log('Form submitted:', data);

    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      // setLoading(true);
      toast.loading('Creating capsule...');

      // Calculate open timestamp
      const openDateTime = new Date(`${data.unlockDate}T${data.unlockTime}`);
      const openTimestamp = Math.floor(openDateTime.getTime() / 1000);

      if (openTimestamp <= Math.floor(Date.now() / 1000)) {
        toast.error('Open date must be in the future');
        return;
      }

      // Upload image if provided
      let imageUri: string | undefined;
      if (data.file) {
        imageUri = await uploadImage(data.file[0] as File);
        if (!imageUri) {
          toast.error('Failed to upload image');
          return;
        }
      }

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

      // Create capsule on-chain
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
        // setStep('staking');
        const lamports = Math.floor(
          (data.stakeAmount as number) * LAMPORTS_PER_SOL
        );
        await addStake(
          capsulePda,
          lamports,
          data.stakeDestination as StakeDestination
        );
      }

      // setStep('complete');

      // Redirect to capsule page
      setTimeout(() => {
        // router.push(`/capsule/${capsulePda.toBase58()}`);
        toast.success('Time Capsule created successfully!');
      }, 1500);
    } catch (err) {
      console.error('Failed to create capsule:', err);
      toast.error(
        err instanceof Error ? err.message : 'Failed to create capsule'
      );
    } finally {
      toast.dismiss();
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <BackgroundGradients />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-xl relative"
      >
        <Card className="border-2 border-border/50 shadow-2xl backdrop-blur-xl bg-card/95 overflow-hidden">
          <CardDecorations />

          <FormHeader currentStep={currentStep} steps={steps} />

          <CardContent className="pt-8 pb-6 relative z-10">
            <StepIndicator steps={steps} currentStep={currentStep} />

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="relative">
                <AnimatePresence mode="wait" custom={direction}>
                  {currentStep === 1 && (
                    <BasicInfoStep
                      direction={direction}
                      register={register}
                      errors={errors}
                    />
                  )}

                  {currentStep === 2 && (
                    <ScheduleStep
                      direction={direction}
                      register={register}
                      errors={errors}
                    />
                  )}

                  {currentStep === 3 && (
                    <ReviewStep direction={direction} formData={formData} />
                  )}
                </AnimatePresence>
              </div>
            </form>
          </CardContent>

          <CardFooter>
            <FormNavigation
              currentStep={currentStep}
              totalSteps={steps.length}
              onPrevious={prevStep}
              onNext={nextStep}
              onSubmit={handleSubmit(onSubmit)}
            />
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
