import { QuizService, type QuizStartResponse, type QuizResponseResult, type UserStatus, type UserPreferences, type TravelRecommendation } from "@app/services/quizService";
import type { StepResponse } from "@app/types/step";
import { useCallback, useEffect, useState } from "react";

// Quiz state interface
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

// Hook interface
interface UseQuizProps {
  totalSteps?: number;
  initialStep?: number;
}

// Hook return interface
interface UseQuizReturn {
  // State
  quizState: QuizState | null;
  currentStepData: StepResponse | null;
  loading: boolean;
  error: string | null;
  isSubmitting: boolean;
  
  // Actions
  startQuiz: () => Promise<void>;
  selectOption: (stepNumber: number, optionIndex: number, optionName: string) => Promise<void>;
  goToStep: (stepNumber: number) => void;
  resetQuiz: () => void;
  
  // Data fetching
  getUserStatus: () => Promise<UserStatus | null>;
  getUserPreferences: () => Promise<UserPreferences | null>;
  getTravelRecommendations: () => Promise<TravelRecommendation[] | null>;
}

export function useQuiz({ totalSteps = 10, initialStep }: UseQuizProps): UseQuizReturn {
  // State
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [currentStepData, setCurrentStepData] = useState<StepResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(initialStep || 1);

  // Initialize quiz from backend on mount
  useEffect(() => {
    initializeQuiz();
  }, []);

  // Load step data when current step changes
  useEffect(() => {
    if (quizState?.userId && currentStep) {
      loadStepData(currentStep);
    }
  }, [quizState?.userId, currentStep]);

  // Load specific step data
  const loadStepData = useCallback(async (stepNumber: number) => {
    if (!quizState?.userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Use the specific step endpoint to get the correct step data
      const stepData = await QuizService.getStep(stepNumber);
      setCurrentStepData(stepData);
    } catch (err) {
      console.error("Failed to load step data:", err);
      setError(err instanceof Error ? err.message : "Failed to load step data");
    } finally {
      setLoading(false);
    }
  }, [quizState?.userId]);

  // Initialize quiz - start new quiz session
  const initializeQuiz = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Start a new quiz session with the backend
      const startResponse = await QuizService.startQuiz();
      
      const newState: QuizState = {
        userId: startResponse.userId,
        currentStep: initialStep || startResponse.currentQuestion,
        totalSteps: startResponse.totalQuestions,
        isCompleted: false,
        selections: [],
        startTime: Date.now(),
      };

      setQuizState(newState);
    } catch (err) {
      console.error("Failed to initialize quiz:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize quiz");
    } finally {
      setLoading(false);
    }
  }, [initialStep]);

  // Start a new quiz (public method)
  const startQuiz = useCallback(async () => {
    await initializeQuiz();
  }, [initializeQuiz]);

  // Select an option
  const selectOption = useCallback(async (
    stepNumber: number, 
    optionIndex: number, 
    optionName: string
  ) => {
    if (!quizState?.userId) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Submit response to backend
      const response = await QuizService.submitResponse(
        quizState.userId,
        stepNumber,
        optionIndex
      );
      
      console.log("Quiz response:", response);

      // Create new selection
      const newSelection = {
        stepNumber,
        selectedOption: optionIndex,
        selectedOptionName: optionName,
        timestamp: Date.now(),
      };

      // Update selections
      const updatedSelections = [...quizState.selections];
      const existingIndex = updatedSelections.findIndex(
        (s) => s.stepNumber === stepNumber
      );

      if (existingIndex >= 0) {
        updatedSelections[existingIndex] = newSelection;
      } else {
        updatedSelections.push(newSelection);
      }

      // Update quiz state
      const isLastStep = stepNumber === quizState.totalSteps;
      const updatedState: QuizState = {
        ...quizState,
        currentStep: response.currentQuestion || quizState.currentStep,
        endTime: isLastStep ? Date.now() : undefined,
        isCompleted: response.isComplete,
        selections: updatedSelections,
      };
      
      console.log("Updated quiz state:", updatedState);
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
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to submit response:", err);
      setError(err instanceof Error ? err.message : "Failed to submit response");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [quizState]);

  // Go to a specific step
  const goToStep = useCallback((stepNumber: number) => {
    if (!quizState) return;

    // Update the current step, which will trigger the useEffect to load new data
    setCurrentStep(stepNumber);
    
    const updatedState: QuizState = {
      ...quizState,
      currentStep: stepNumber,
    };

    setQuizState(updatedState);
  }, [quizState]);

  // Reset quiz
  const resetQuiz = useCallback(() => {
    // Reset state
    setQuizState(null);
    setCurrentStepData(null);
    setError(null);
    setIsSubmitting(false);
    setCurrentStep(1);

    // Start new quiz
    startQuiz();
  }, [startQuiz]);

  // Get user status
  const getUserStatus = useCallback(async (): Promise<UserStatus | null> => {
    if (!quizState?.userId) return null;

    try {
      return await QuizService.getUserStatus(quizState.userId);
    } catch (err) {
      console.error("Failed to get user status:", err);
      throw err;
    }
  }, [quizState?.userId]);

  // Get user preferences
  const getUserPreferences = useCallback(async (): Promise<UserPreferences | null> => {
    if (!quizState?.userId) return null;

    try {
      return await QuizService.getUserPreferences(quizState.userId);
    } catch (err) {
      console.error("Failed to get user preferences:", err);
      throw err;
    }
  }, [quizState?.userId]);

  // Get travel recommendations
  const getTravelRecommendations = useCallback(async (): Promise<TravelRecommendation[] | null> => {
    if (!quizState?.userId) return null;

    try {
      const response = await QuizService.getTravelRecommendations(quizState.userId);
      return response.recommendations;
    } catch (err) {
      console.error("Failed to get travel recommendations:", err);
      throw err;
    }
  }, [quizState?.userId]);

  return {
    // State
    quizState,
    currentStepData,
    loading,
    error,
    isSubmitting,
    
    // Actions
    startQuiz,
    selectOption,
    goToStep,
    resetQuiz,
    
    // Data fetching
    getUserStatus,
    getUserPreferences,
    getTravelRecommendations,
  };
} 