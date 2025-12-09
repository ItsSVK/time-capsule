import { useState } from 'react';
import { UseFormTrigger } from 'react-hook-form';
import { FormData } from '../types';
import { steps } from '../constants';

export function useFormSteps(trigger: UseFormTrigger<FormData>) {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);

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

  return {
    currentStep,
    direction,
    nextStep,
    prevStep,
  };
}

