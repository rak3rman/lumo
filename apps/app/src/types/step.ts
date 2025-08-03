export interface StepOption {
  name: string;
  img_url: string;
}

export interface StepData {
  prompt: string;
  has_next: boolean;
  options: StepOption[];
  bg_img_url?: string;
}

export interface StepResponse {
  data: StepData;
  step: number;
}

// New types for test state management
export interface TestSelection {
  stepNumber: number;
  selectedOptionIndex: number;
  selectedOptionName: string;
  timestamp: number;
}

export interface TestState {
  currentStep: number;
  totalSteps: number;
  selections: TestSelection[];
  isCompleted: boolean;
  startTime: number;
  endTime?: number;
}

export interface TestResult {
  testId: string;
  selections: TestSelection[];
  totalTime: number;
  personalityType?: string;
  recommendations?: string[];
}

export interface TestSubmission {
  testId: string;
  state: TestState;
  result?: TestResult;
}
