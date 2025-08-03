"use client";

import {
  ErrorMessage,
  LoadingSpinner,
  StepForm,
} from "@app/components";
import { useQuiz } from "@app/hooks/useQuiz";
import { use } from "react";

interface TestPageProps {
  params: Promise<{
    step: string;
  }>;
}

export default function TestPage({ params }: TestPageProps) {
  const { step } = use(params);

  // Convert step to number for navigation
  const currentStep = parseInt(step) || 1;

  // Use the new quiz hook with the current step
  const {
    quizState,
    currentStepData,
    loading,
    error,
    isSubmitting,
    selectOption,
    goToStep,
    resetQuiz,
  } = useQuiz({ totalSteps: 10, initialStep: currentStep });

  // Handle option selection
  const handleOptionSelect = async (optionIndex: number, optionName: string) => {
    if (!quizState) return;

    try {
      await selectOption(currentStep, optionIndex, optionName);
    } catch (error) {
      console.error("Failed to select option:", error);
      // Error handling is done in the hook
    }
  };

  // Handle step navigation
  const handleStepChange = (newStep: number) => {
    if (newStep >= 1 && newStep <= 10) {
      goToStep(newStep);
      window.location.href = `/test/${newStep}`;
    }
  };

  // Handle quiz reset
  const handleResetQuiz = () => {
    resetQuiz();
    // Force navigation to first step after reset
    setTimeout(() => {
      window.location.href = "/test/1";
    }, 100);
  };

  // Show loading state while quiz state is initializing
  if (!quizState || loading) {
    return <LoadingSpinner />;
  }

  // Show error state
  if (error || !currentStepData) {
    return (
      <ErrorMessage
        message={error || "Failed to load step data"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Get previous selections for this step
  const previousSelections = quizState.selections.map((s) => ({
    selectedOptionIndex: s.selectedOption,
    stepNumber: s.stepNumber,
  }));

  return (
    <StepForm
      currentStep={currentStep}
      totalSteps={quizState.totalSteps}
      stepData={currentStepData.data}
      onOptionSelect={handleOptionSelect}
      onStepChange={handleStepChange}
      isAnimating={isSubmitting}
      selectedOption={null} // Selection is handled by the quiz state
      previousSelections={previousSelections}
      onResetTest={handleResetQuiz}
    />
  );
}
