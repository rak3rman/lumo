import { Button } from "@app/components/ui/button";
import Link from "next/link";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  hasNext?: boolean;
  selectedOption?: number | null;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onStepChange,
  hasNext = true,
  selectedOption = null,
}: StepNavigationProps) {
  return (
    <div className="flex justify-center gap-4 mb-8">
      {currentStep > 1 && (
        <Button
          variant="outline"
          asChild
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <Link href={`/test/${currentStep - 1}`}>← Previous</Link>
        </Button>
      )}

      {hasNext && currentStep < totalSteps && (
        <Button
          className={`${
            selectedOption
              ? "bg-gray-700 hover:bg-gray-800 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          asChild={!!selectedOption}
          disabled={!selectedOption}
        >
          {selectedOption ? (
            <Link href={`/test/${currentStep + 1}`}>Next →</Link>
          ) : (
            <span>Next →</span>
          )}
        </Button>
      )}
    </div>
  );
}
