import { Button } from "@app/components/ui/button";
import Link from "next/link";

interface StepIndicatorsProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
}

export function StepIndicators({
  currentStep,
  totalSteps,
  onStepChange,
}: StepIndicatorsProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="flex justify-center gap-2 mb-8">
      {steps.map((stepNumber) => (
        <Button
          key={stepNumber}
          variant={stepNumber === currentStep ? "default" : "outline"}
          size="sm"
          asChild
          className={
            stepNumber === currentStep
              ? "bg-gray-700"
              : "border-gray-300 text-gray-700"
          }
        >
          <Link href={`/test/${stepNumber}`}>{stepNumber}</Link>
        </Button>
      ))}
    </div>
  );
}
