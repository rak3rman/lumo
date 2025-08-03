"use client";

import type { StepData } from "@app/types/step";
import { useEffect, useState } from "react";
import { BackToHome } from "./BackToHome.tsx";
import { OptionGrid } from "./OptionGrid.tsx";
import { StepHeader } from "./StepHeader.tsx";
import { StepIndicators } from "./StepIndicators.tsx";
import { StepNavigation } from "./StepNavigation.tsx";

interface StepFormProps {
  currentStep: number;
  totalSteps: number;
  stepData: StepData;
  onOptionSelect: (optionIndex: number, optionName: string) => void;
  onStepChange: (step: number) => void;
  isAnimating: boolean;
  selectedOption: number | null;
  previousSelections?: Array<{
    stepNumber: number;
    selectedOptionIndex: number;
  }>;
  onResetTest?: () => void;
}

export function StepForm({
  currentStep,
  totalSteps,
  stepData,
  onOptionSelect,
  onStepChange,
  isAnimating,
  selectedOption,
  previousSelections = [],
  onResetTest,
}: StepFormProps) {
  const handleOptionSelect = (optionId: number) => {
    const optionIndex = optionId - 1; // Convert to 0-based index
    const optionName =
      stepData.options[optionIndex]?.name || `Option ${optionId}`;
    onOptionSelect(optionIndex, optionName);
  };

  // Get previously selected option for this step
  const previousSelection = previousSelections.find(
    (s) => s.stepNumber === currentStep,
  );
  const defaultSelectedOption = previousSelection
    ? previousSelection.selectedOptionIndex + 1
    : null;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8 relative flex items-center justify-center"
      style={{
        backgroundImage: stepData.bg_img_url
          ? `url(${stepData.bg_img_url})`
          : undefined,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="w-full">
        <StepHeader
          title={stepData.prompt}
          description="Click on an option to proceed"
        />

        <OptionGrid
          options={stepData.options.map((option, index) => ({
            id: index + 1,
            imageUrl: option.img_url,
            label: option.name,
          }))}
          onOptionSelect={handleOptionSelect}
          isAnimating={isAnimating}
          selectedOption={selectedOption || defaultSelectedOption}
          currentStep={currentStep}
        />

        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onStepChange={onStepChange}
          hasNext={stepData.has_next}
          selectedOption={selectedOption || defaultSelectedOption}
        />

        {/* Reset Test Button */}
        {onResetTest && (
          <div className="absolute top-4 right-4">
            <button
              onClick={onResetTest}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Start Over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
