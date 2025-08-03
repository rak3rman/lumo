import { useEffect, useState } from "react";

interface UseStepFormProps {
  currentStep: number;
  totalSteps: number;
  onOptionSelect: (optionIndex: number, optionName: string) => void;
  hasNext?: boolean;
}

export function useStepForm({
  currentStep,
  totalSteps,
  onOptionSelect,
  hasNext = true,
}: UseStepFormProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset animation state when step changes
  useEffect(() => {
    setSelectedOption(null);
    setIsAnimating(false);
  }, [currentStep]);

  const handleOptionSelect = (optionNumber: number) => {
    if (isAnimating) return;

    setSelectedOption(optionNumber);
    setIsAnimating(true);

    // Typeform-style: quick highlight, then smooth transition
    setTimeout(() => {
      // Convert to 0-based index and get option name
      const optionIndex = optionNumber - 1;
      const optionName = `Option ${optionNumber}`; // This will be overridden by StepForm

      // Call the parent handler with option index and name
      onOptionSelect(optionIndex, optionName);
    }, 800);
  };

  return {
    handleOptionSelect,
    isAnimating,
    selectedOption,
  };
}
