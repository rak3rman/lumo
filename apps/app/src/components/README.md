# Step Form Components

This directory contains highly reusable components for building multi-step forms with a Typeform-like experience.

## Components

### StepForm
The main container component that orchestrates the entire step form experience.

**Props:**
- `currentStep: number` - Current step number
- `totalSteps: number` - Total number of steps
- `stepData: StepData` - Step data from API
- `onOptionSelect: (optionId: number) => void` - Callback when option is selected
- `onStepChange: (step: number) => void` - Callback when step changes
- `isAnimating: boolean` - Whether animation is in progress
- `selectedOption: number | null` - Currently selected option

### StepHeader
Displays the step title and description.

**Props:**
- `title: string` - Step title
- `description?: string` - Optional step description

### OptionCard
Individual selectable option card with image background.

**Props:**
- `id: number` - Option ID
- `label: string` - Option label
- `imageUrl: string` - Background image URL
- `isSelected: boolean` - Whether option is selected
- `isAnimating: boolean` - Whether animation is in progress
- `isDisabled: boolean` - Whether option is disabled
- `onClick: () => void` - Click handler

### OptionGrid
2x2 grid layout for displaying options.

**Props:**
- `options: Option[]` - Array of options
- `onOptionSelect: (optionId: number) => void` - Option selection callback
- `isAnimating: boolean` - Whether animation is in progress
- `selectedOption: number | null` - Currently selected option
- `currentStep: number` - Current step number

### StepNavigation
Previous/Next navigation buttons.

**Props:**
- `currentStep: number` - Current step number
- `totalSteps: number` - Total number of steps
- `onStepChange: (step: number) => void` - Step change callback
- `hasNext?: boolean` - Whether there's a next step available
- `selectedOption?: number | null` - Currently selected option (Next button is disabled if no option selected)



### BackToHome
Back to home button.

**Props:** None

## Hook

### useStepForm
Custom hook for managing step form state and logic.

**Parameters:**
- `currentStep: number` - Current step number
- `totalSteps: number` - Total number of steps
- `onStepChange: (step: number) => void` - Step change callback
- `hasNext?: boolean` - Whether there's a next step available

**Returns:**
- `selectedOption: number | null` - Currently selected option
- `isAnimating: boolean` - Whether animation is in progress
- `handleOptionSelect: (optionId: number) => void` - Option selection handler

### useStepData
Custom hook for fetching step data from API.

**Parameters:**
- `stepNumber: number` - Step number to fetch

**Returns:**
- `stepData: StepResponse | null` - Step data from API
- `loading: boolean` - Whether data is being fetched
- `error: string | null` - Error message if fetch failed

## Usage Example

```tsx
import { StepForm, LoadingSpinner, ErrorMessage } from "@app/components";
import { useStepForm, useStepData } from "@app/hooks";

function MyStepForm() {
  const currentStep = 1;
  const totalSteps = 4;
  
  // Fetch step data
  const { stepData, loading, error } = useStepData({ stepNumber: currentStep });

  const handleStepChange = (newStep: number) => {
    // Navigate to new step
  };

  const { selectedOption, isAnimating, handleOptionSelect } = useStepForm({
    currentStep,
    totalSteps,
    onStepChange: handleStepChange,
    hasNext: stepData?.data.has_next,
  });

  // Show loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show error state
  if (error || !stepData) {
    return (
      <ErrorMessage 
        message={error || "Failed to load step data"} 
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <StepForm
      currentStep={currentStep}
      totalSteps={totalSteps}
      stepData={stepData.data}
      onOptionSelect={handleOptionSelect}
      onStepChange={handleStepChange}
      isAnimating={isAnimating}
      selectedOption={selectedOption}
    />
  );
}
```

## Features

- **Typeform-like animations** - Smooth transitions and visual feedback
- **Responsive design** - Works on all screen sizes
- **Accessible** - Proper ARIA labels and keyboard navigation
- **Customizable** - Easy to theme and modify
- **Reusable** - Can be used for any multi-step form
- **Type-safe** - Full TypeScript support 