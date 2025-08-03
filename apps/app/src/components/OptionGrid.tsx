import { OptionCard } from "@app/components/OptionCard";

interface Option {
  id: number;
  label: string;
  imageUrl: string;
}

interface OptionGridProps {
  options: Option[];
  onOptionSelect: (optionId: number) => void;
  isAnimating: boolean;
  selectedOption: number | null;
  currentStep: number;
}

export function OptionGrid({
  options,
  onOptionSelect,
  isAnimating,
  selectedOption,
  currentStep,
}: OptionGridProps) {
  return (
    <div className="grid grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
      {options.map((option) => (
        <div key={option.id} className="w-full">
          <OptionCard
            id={option.id}
            label={option.label}
            imageUrl={option.imageUrl}
            isSelected={selectedOption === option.id}
            isAnimating={isAnimating}
            isDisabled={isAnimating}
            onClick={() => onOptionSelect(option.id)}
          />
        </div>
      ))}
    </div>
  );
}
