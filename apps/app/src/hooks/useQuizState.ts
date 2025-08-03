import { StepApiService } from "@app/services/stepApi";
import type { StepResponse } from "@app/types/step";
import { useCallback, useEffect, useState } from "react";

export interface QuizState {
  userId: string | null;
  currentStep: number;
  totalSteps: number;
  isCompleted: boolean;
  selections: Array<{
    stepNumber: number;
    selectedOption: number;
    selectedOptionName: string;
    timestamp: number;
  }>;
  startTime: number;
  endTime?: number;
}

interface UseQuizStateProps {
  totalSteps?: number;
}

export function useQuizState({ totalSteps = 10 }: UseQuizStateProps) {
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [currentStepData, setCurrentStepData] = useState<StepResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize quiz state from backend
  useEffect(() => {
    initializeNewQuiz();
  }, [totalSteps]);

  const initializeNewQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Start a new quiz session with the backend
      const startResponse = await StepApiService.startQuiz();
      
      const newState: QuizState = {
        userId: startResponse.userId,
        currentStep: startResponse.currentQuestion,
        totalSteps: startResponse.totalQuestions,
        isCompleted: false,
        selections: [],
        startTime: Date.now(),
      };

      setQuizState(newState);

      // Load the first step data
      await loadCurrentStepData(startResponse.userId);
    } catch (err) {
      console.error("Failed to initialize quiz:", err);
      setError(err instanceof Error ? err.message : "Failed to start quiz");
    } finally {
      setLoading(false);
    }
  }, [totalSteps]);

  const loadCurrentStepData = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current step data from backend
      const stepData = await StepApiService.getCurrentStep(userId);
      setCurrentStepData(stepData);
    } catch (err) {
      console.error("Failed to load step data:", err);
      setError(err instanceof Error ? err.message : "Failed to load step data");
    } finally {
      setLoading(false);
    }
  }, []);

  const selectOption = useCallback(
    async (stepNumber: number, optionIndex: number, optionName: string) => {
      if (!quizState || !quizState.userId) return;

      setIsSubmitting(true);
      setError(null);

      try {
        // Submit response to backend
        const response = await StepApiService.submitResponse(
          quizState.userId,
          stepNumber,
          optionIndex
        );

        const newSelection = {
          stepNumber,
          selectedOption: optionIndex,
          selectedOptionName: optionName,
          timestamp: Date.now(),
        };

        const updatedSelections = [...quizState.selections];
        const existingIndex = updatedSelections.findIndex(
          (s) => s.stepNumber === stepNumber
        );

        if (existingIndex >= 0) {
          updatedSelections[existingIndex] = newSelection;
        } else {
          updatedSelections.push(newSelection);
        }

        const isLastStep = stepNumber === quizState.totalSteps;
        const updatedState: QuizState = {
          ...quizState,
          currentStep: response.currentQuestion,
          endTime: isLastStep ? Date.now() : undefined,
          isCompleted: response.isComplete,
          selections: updatedSelections,
        };

        setQuizState(updatedState);

        // Auto-advance to next question after a short delay
        if (!isLastStep) {
          setTimeout(() => {
            window.location.href = `/test/${stepNumber + 1}`;
          }, 800);
        } else {
          // If it's the last step, redirect to results after a delay
          setTimeout(() => {
            window.location.href = `/test/results`;
          }, 800);
        }

        return updatedState;
      } catch (err) {
        console.error("Failed to submit response:", err);
        setError(err instanceof Error ? err.message : "Failed to submit response");
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [quizState]
  );

  const goToStep = useCallback(
    (stepNumber: number) => {
      if (!quizState) return;

      const updatedState: QuizState = {
        ...quizState,
        currentStep: stepNumber,
      };

      setQuizState(updatedState);
    },
    [quizState]
  );

  const resetQuiz = useCallback(() => {
    // Reset all state
    setQuizState(null);
    setCurrentStepData(null);
    setError(null);
    setIsSubmitting(false);

    // Initialize a completely new quiz
    initializeNewQuiz();
  }, [initializeNewQuiz]);

  const getUserStatus = useCallback(async () => {
    if (!quizState?.userId) return null;

    try {
      return await StepApiService.getUserStatus(quizState.userId);
    } catch (err) {
      console.error("Failed to get user status:", err);
      throw err;
    }
  }, [quizState?.userId]);

  const getUserPreferences = useCallback(async () => {
    if (!quizState?.userId) return null;

    try {
      return await StepApiService.getUserPreferences(quizState.userId);
    } catch (err) {
      console.error("Failed to get user preferences:", err);
      throw err;
    }
  }, [quizState?.userId]);

  const getTravelRecommendations = useCallback(async () => {
    if (!quizState?.userId) return null;

    try {
      return await StepApiService.getTravelRecommendations(quizState.userId);
    } catch (err) {
      console.error("Failed to get travel recommendations:", err);
      throw err;
    }
  }, [quizState?.userId]);

  const generateItinerary = useCallback(async (locationName: string) => {
    if (!quizState?.userId) return null;

    try {
      return await StepApiService.generateItinerary(quizState.userId, locationName);
    } catch (err) {
      console.error("Failed to generate itinerary:", err);
      throw err;
    }
  }, [quizState?.userId]);

  return {
    currentStepData,
    error,
    generateItinerary,
    getUserPreferences,
    getUserStatus,
    getTravelRecommendations,
    goToStep,
    isSubmitting,
    loading,
    quizState,
    resetQuiz,
    selectOption,
  };
} 