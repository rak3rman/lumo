import type { TestSelection, TestState, TestSubmission } from "@app/types/step";
import { useCallback, useEffect, useState } from "react";

interface UseTestStateProps {
  totalSteps: number;
}

export function useTestState({ totalSteps }: UseTestStateProps) {
  const [testState, setTestState] = useState<TestState | null>(null);
  const [testId, setTestId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Initialize new test on mount
  useEffect(() => {
    initializeNewTest();
  }, [totalSteps]);

  const initializeNewTest = useCallback(() => {
    const newTestId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newState: TestState = {
      currentStep: 1,
      isCompleted: false,
      selections: [],
      startTime: Date.now(),
      totalSteps,
    };

    setTestState(newState);
    setTestId(newTestId);
  }, [totalSteps]);

  const selectOption = useCallback(
    (stepNumber: number, optionIndex: number, optionName: string) => {
      if (!testState) return;

      const newSelection: TestSelection = {
        selectedOptionIndex: optionIndex,
        selectedOptionName: optionName,
        stepNumber,
        timestamp: Date.now(),
      };

      const updatedSelections = [...testState.selections];
      const existingIndex = updatedSelections.findIndex(
        (s) => s.stepNumber === stepNumber,
      );

      if (existingIndex >= 0) {
        updatedSelections[existingIndex] = newSelection;
      } else {
        updatedSelections.push(newSelection);
      }

      const isLastStep = stepNumber === totalSteps;
      const updatedState: TestState = {
        ...testState,
        currentStep: isLastStep ? stepNumber : stepNumber + 1,
        endTime: isLastStep ? Date.now() : undefined,
        isCompleted: isLastStep,
        selections: updatedSelections,
      };

      setTestState(updatedState);

      // Auto-advance to next question after a short delay (Typeform style)
      if (!isLastStep) {
        setTimeout(() => {
          window.location.href = `/test/${stepNumber + 1}`;
        }, 800); // 800ms delay for animation
      } else {
        // If it's the last step, redirect to results after a delay
        setTimeout(() => {
          window.location.href = `/test/results`;
        }, 800); // 800ms delay for animation
      }

      return updatedState;
    },
    [testState, totalSteps],
  );

  const goToStep = useCallback(
    (stepNumber: number) => {
      if (!testState) return;

      const updatedState: TestState = {
        ...testState,
        currentStep: stepNumber,
      };

      setTestState(updatedState);
    },
    [testState],
  );

  const resetTest = useCallback(() => {
    // Reset all state
    setTestState(null);
    setTestId(null);
    setIsSubmitting(false);
    setIsCalculating(false);

    // Initialize a completely new test
    initializeNewTest();
  }, [initializeNewTest]);

  const submitTest = useCallback(async (): Promise<TestSubmission | null> => {
    if (!testState || !testId || !testState.isCompleted) {
      throw new Error("Test is not completed");
    }

    setIsSubmitting(true);
    try {
      // Mock API call - replace with actual API endpoint
      const submission: TestSubmission = {
        state: testState,
        testId,
      };

      // Log the object being sent to the backend
      console.log("🚀 Submitting test data to backend:", submission);
      console.log("📊 Test Statistics:", {
        selections: testState.selections.map((s) => ({
          option: s.selectedOptionName,
          step: s.stepNumber,
          timestamp: new Date(s.timestamp).toISOString(),
        })),
        selectionsCount: testState.selections.length,
        testId,
        totalSteps: testState.totalSteps,
        totalTime: testState.endTime
          ? testState.endTime - testState.startTime
          : 0,
      });

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful submission
      console.log("✅ Test submitted successfully:", submission);

      return submission;
    } catch (error) {
      console.error("❌ Failed to submit test:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [testState, testId]);

  const calculateResults = useCallback(
    async (submission: TestSubmission): Promise<TestSubmission> => {
      setIsCalculating(true);
      try {
        // Log the submission being processed for results
        console.log("🧮 Calculating results for submission:", submission);
        console.log("📈 Processing data:", {
          selections: submission.state.selections.map((s) => ({
            option: s.selectedOptionName,
            step: s.stepNumber,
            timestamp: new Date(s.timestamp).toISOString(),
          })),
          selectionsCount: submission.state.selections.length,
          testId: submission.testId,
          totalTime: submission.state.endTime
            ? submission.state.endTime - submission.state.startTime
            : 0,
        });

        // Mock calculation delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mock result calculation based on selections
        const result = {
          personalityType: "Analytical Thinker", // Mock personality type
          recommendations: [
            "Consider exploring creative hobbies",
            "Try meditation for stress relief",
            "Join a book club to expand your social circle",
          ],
          selections: submission.state.selections,
          testId: submission.testId,
          totalTime:
            (submission.state.endTime || Date.now()) -
            submission.state.startTime,
        };

        const updatedSubmission: TestSubmission = {
          ...submission,
          result,
        };

        console.log("🎯 Results calculated:", result);
        return updatedSubmission;
      } finally {
        setIsCalculating(false);
      }
    },
    [],
  );

  return {
    calculateResults,
    goToStep,
    isCalculating,
    isSubmitting,
    resetTest,
    selectOption,
    submitTest,
    testId,
    testState,
  };
}
