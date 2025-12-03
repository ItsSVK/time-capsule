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

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);
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
    alert('Time Capsule created successfully!');
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
