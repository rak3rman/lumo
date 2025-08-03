import type { StepResponse } from "@app/types/step";

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Types for API responses
export interface QuizStartResponse {
  userId: string;
  currentQuestion: number;
  totalQuestions: number;
  message: string;
}

export interface QuizResponseResult {
  currentQuestion: number;
  isComplete: boolean;
  message: string;
  userId: string;
  preferences?: any;
}

export interface UserStatus {
  userId: string;
  currentQuestion: number;
  totalQuestions: number;
  isCompleted: boolean;
  hasPreferences: boolean;
}

export interface TravelRecommendation {
  id: string;
  locationName: string;
  country: string;
  description: string;
  estimatedBudgetRange: string;
  bestTimeToVisit: string;
  keyAttractions: string[];
  main_attractions: Array<{
    name: string;
    description: string;
    url: string;
  }>;
  events: Array<{
    name: string;
    dates: string;
    description: string;
  }>;
  local_insights: Array<{
    source: string;
    tip: string;
  }>;
  reasoning: string;
}

export interface UserPreferences {
  userId: string;
  isCompleted: boolean;
  preferences: any;
}

// Error handling
class QuizApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = "QuizApiError";
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new QuizApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof QuizApiError) {
      throw error;
    }
    throw new QuizApiError(
      error instanceof Error ? error.message : "Network error",
      0
    );
  }
}

// Quiz Service Class
export class QuizService {
  // Start a new quiz session
  static async startQuiz(): Promise<QuizStartResponse> {
    return apiRequest<QuizStartResponse>("/api/quiz/start", {
      method: "POST",
    });
  }

  // Get a specific step by step number
  static async getStep(stepNumber: number): Promise<StepResponse> {
    return apiRequest<StepResponse>(`/api/quiz/step/${stepNumber}`);
  }

  // Get current step for a user
  static async getCurrentStep(userId: string): Promise<StepResponse> {
    return apiRequest<StepResponse>(`/api/user/${userId}/current-step`);
  }

  // Submit a quiz response
  static async submitResponse(
    userId: string,
    stepNumber: number,
    selectedOption: number
  ): Promise<QuizResponseResult> {
    return apiRequest<QuizResponseResult>("/api/quiz/response", {
      method: "POST",
      body: JSON.stringify({
        userId,
        stepNumber,
        selectedOption,
      }),
    });
  }

  // Get user status
  static async getUserStatus(userId: string): Promise<UserStatus> {
    return apiRequest<UserStatus>(`/api/user/${userId}/status`);
  }

  // Get user preferences (after quiz completion)
  static async getUserPreferences(userId: string): Promise<UserPreferences> {
    return apiRequest<UserPreferences>(`/api/user/${userId}/preferences`);
  }

  // Get travel recommendations
  static async getTravelRecommendations(
    userId: string
  ): Promise<{
    userId: string;
    recommendations: TravelRecommendation[];
  }> {
    return apiRequest<{
      userId: string;
      recommendations: TravelRecommendation[];
    }>(`/api/user/${userId}/recommendations`);
  }

  // Generate itinerary for a specific location
  static async generateItinerary(
    userId: string,
    locationName: string
  ): Promise<{
    itinerary: {
      locationName: string;
      userId: string;
      createdAt: string;
      itineraryData: {
        morning: string;
        afternoon: string;
        evening: string;
      };
      activities: {
        main_attractions: Array<{
          name: string;
          description: string;
          url: string;
        }>;
        events: Array<{
          name: string;
          dates: string;
          description: string;
        }>;
        local_insights: Array<{
          source: string;
          tip: string;
        }>;
      };
      total_cost?: {
        total: number;
      };
      travel_tips?: string[];
    };
    locationName: string;
    userId: string;
  }> {
    return apiRequest<{
      itinerary: {
        locationName: string;
        userId: string;
        createdAt: string;
        itineraryData: {
          morning: string;
          afternoon: string;
          evening: string;
        };
        activities: {
          main_attractions: Array<{
            name: string;
            description: string;
            url: string;
          }>;
          events: Array<{
            name: string;
            dates: string;
            description: string;
          }>;
          local_insights: Array<{
            source: string;
            tip: string;
          }>;
        };
        total_cost?: {
          total: number;
        };
        travel_tips?: string[];
      };
      locationName: string;
      userId: string;
    }>(`/api/user/${userId}/itinerary`, {
      method: "POST",
      body: JSON.stringify({ locationName }),
    });
  }

  // Health check
  static async healthCheck(): Promise<{
    message: string;
    status: string;
    version: string;
  }> {
    return apiRequest<{
      message: string;
      status: string;
      version: string;
    }>("/");
  }
} 