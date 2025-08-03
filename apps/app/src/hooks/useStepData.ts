import { StepApiService } from "@app/services/stepApi";
import type { StepResponse } from "@app/types/step";
import { useEffect, useState } from "react";

interface UseStepDataProps {
  stepNumber: number;
}

export function useStepData({ stepNumber }: UseStepDataProps) {
  const [stepData, setStepData] = useState<StepResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStepData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await StepApiService.getStep(stepNumber);
        setStepData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch step data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStepData();
  }, [stepNumber]);

  return {
    error,
    loading,
    stepData,
  };
}
