import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

// Add middleware
app.use("*", logger());
app.use("*", cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
}));

// In-memory storage
const users = new Map<
  string,
  {
    userId: string;
    responses: string;
    preferences?: any;
    isCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
>();
const recommendations = new Map<string, any[]>();
const itineraries = new Map<string, any>();

// Quiz questions (static data) - Updated to match frontend StepResponse format
const QUIZ_STEPS = [
  {
    data: {
      bg_img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/2.png",
      has_next: true,
      options: [
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/weather+is+Warm+breezy+night.jpg",
          name: "Warm, breezy night air",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/weather+is+raining.jpg",
          name: "A cozy drizzle",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/Dry+heat+with+a+golden+sun.jpg",
          name: "Dry heat with a golden sun",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/crisp+and+misty+weather.jpg",
          name: "Crisp and misty",
        },
      ],
      prompt: "You're walking with no destination. What's the weather like?",
    },
    step: 1,
  },
  {
    data: {
      bg_img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/3.png",
      has_next: true,
      options: [
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/Matte+black+door+in+a+barren+land+closeup.jpg",
          name: "Matte Black",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/ocean+blue+door+in+a+barren+land.jpg",
          name: "Ocean Blue",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/Terracotta+red+door+in+a+barren+land.jpg",
          name: "Terracotta Red",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/Emerald+green+door+in+a+barren+land.jpg",
          name: "Emerald Green",
        },
      ],
      prompt: "You come across a door in the middle of nowhere. What color is it?",
    },
    step: 2,
  },
  {
    data: {
      bg_img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/4.png",
      has_next: true,
      options: [
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/Waves+crashing.jpg",
          name: "Waves crashing",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/Distant+music.jpg",
          name: "Distant music and laughter",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/super+windy+forest.jpg",
          name: "Wind moving through trees",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/still+water.jpg",
          name: "Silence",
        },
      ],
      prompt: "You step through and hear...",
    },
    step: 3,
  },
  {
    data: {
      bg_img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/6.png",
      has_next: true,
      options: [
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/A+hand-drawn+map+in+a+roll.jpg",
          name: "A hand drawn map",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/polaroid+camera.jpg",
          name: "A polaroid camera",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/thermos+no+people.jpg",
          name: "A warm drink in a thermos",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/compass.jpg",
          name: "A tiny compass",
        },
      ],
      prompt: "A stranger hands you something for your journey. What is it?",
    },
    step: 4,
  },
  {
    data: {
      bg_img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/7.png",
      has_next: true,
      options: [
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/fruit.jpg",
          name: "Fresh fruit, just picked",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/Street+food+in+a+paper+wrapper.jpg",
          name: "Street food in a paper wrapper",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/Something+hot+from+a+local+cafe.jpg",
          name: "Something hot from a local café",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/A+full-course+meal+shared+at+a+long+table+no+people.jpg",
          name: "A full-course meal shared at a long table",
        },
      ],
      prompt: "You're suddenly hungry. What's the first thing you crave?",
    },
    step: 5,
  },
  {
    data: {
      bg_img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/8.png",
      has_next: true,
      options: [
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/small+bonfire+with+campers.jpg",
          name: "Jump in — the more the merrier",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/invite2.jpg",
          name: "Join for a bit, then wander solo",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/invite3.jpg",
          name: "Politely decline and keep exploring",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/invite4.jpg",
          name: "Stay nearby, watching from a distance",
        },
      ],
      prompt: "You're invited to join a group. You…",
    },
    step: 6,
  },
  {
    data: {
      bg_img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/12.png",
      has_next: true,
      options: [
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/A+quiet+cabin+under+stars+.jpg",
          name: "A quiet cabin under stars",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/Rooftop+night+views.jpg",
          name: "Rooftop views of a glowing city",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/A+hammock+between+two+palm+trees+night.jpg",
          name: "A hammock between two palm trees",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/A+cozy+inn+with+candles+and+books+.jpg",
          name: "A cozy inn with candles and books",
        },
      ],
      prompt: "As night falls, you find the perfect spot to rest. What surrounds you?",
    },
    step: 7,
  },
  {
    data: {
      bg_img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/9.png",
      has_next: true,
      options: [
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/On+top+of+a+mountain+.jpg",
          name: "On top of a mountain",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/In+the+middle+of+a+festival+.jpg",
          name: "In the middle of a festival",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/someone+Floating+on+water+.jpg",
          name: "Floating on water",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/someone+Alone+smiling+.jpg",
          name: "Alone, smiling",
        },
      ],
      prompt: "The sky lights up with color. You realize you're...",
    },
    step: 8,
  },
  {
    data: {
      bg_img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/10.png",
      has_next: true,
      options: [
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/A+guidebook.jpg",
          name: "A guidebook",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/camera.jpg",
          name: "Your camera",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/outfit+on+a+hanger.jpg",
          name: "A fresh outfit",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/someone+taking+it+all+in.jpg",
          name: "Nothing — you take it all in",
        },
      ],
      prompt: "You wake up in a new place. What do you reach for first?",
    },
    step: 9,
  },
  {
    data: {
      bg_img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/11.png",
      has_next: false,
      options: [
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/yes.png",
          name: "Say yes before they finish the sentence",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/polaroid+camera.jpg",
          name: "Ask what's next",
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/thermos+no+people.jpg",
          name: 'Say, "Only if I can bring someone with me"',
        },
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/Emerald+green+door+in+a+barren+land.jpg",
          name: "Smile and walk toward the next dream",
        },
      ],
      prompt: "A whisper asks: \"Want to stay a little longer?\" You…",
    },
    step: 10,
  },
];

// Enhanced mock recommendations with activities and local insights
const enhancedRecommendations = {
  adventure: [
    {
      bestTimeToVisit:
        "June-August (Summer) or September-March (Northern Lights)",
      country: "Iceland",
      description:
        "Ideal for your adventurous spirit with stunning natural landscapes and unique experiences.",
      estimatedBudgetRange: "$150-300/day",
      events: [
        {
          dates: "September-March",
          description: "Best aurora viewing",
          name: "Northern Lights Season",
        },
        {
          dates: "November",
          description: "Music festival with local bands",
          name: "Iceland Airwaves",
        },
      ],
      id: "rec_adventure_1",
      keyAttractions: ["Blue Lagoon", "Golden Circle", "Northern Lights"],
      local_insights: [
        {
          source: "Reddit r/Iceland",
          tip: "Skip Blue Lagoon, go to Sky Lagoon instead - locals prefer it",
        },
        {
          source: "Local Guide",
          tip: "Best hot dogs at Bæjarins Beztu Pylsur - Bill Clinton ate here",
        },
        {
          source: "Reddit r/VisitingIceland",
          tip: "Rent a car to see Northern Lights away from city lights",
        },
      ],
      locationName: "Reykjavik, Iceland",
      main_attractions: [
        {
          description: "Famous geothermal spa",
          name: "Blue Lagoon",
          url: "https://www.tripadvisor.com/Attraction_Review-g189970-d324862",
        },
        {
          description: "Geysers, waterfalls, and national park",
          name: "Golden Circle",
          url: "https://www.tripadvisor.com/Attraction_Review-g189970-d324863",
        },
        {
          description: "Aurora borealis viewing",
          name: "Northern Lights",
          url: "https://www.tripadvisor.com/Attraction_Review-g189970-d324864",
        },
      ],
      reasoning: "Perfect for high adventure level and cultural interest.",
    },
  ],
  cultural: [
    {
      bestTimeToVisit:
        "March-May (Cherry Blossom) or October-November (Fall Colors)",
      country: "Japan",
      description:
        "Perfect for your dreamy, cultural preferences with ancient temples and serene gardens.",
      estimatedBudgetRange: "$100-200/day",
      events: [
        {
          dates: "July",
          description: "Traditional festival with parades",
          name: "Gion Matsuri Festival",
        },
        {
          dates: "Late March-Early April",
          description: "Hanami parties in Maruyama Park",
          name: "Cherry Blossom Season",
        },
      ],
      id: "rec_cultural_1",
      keyAttractions: [
        "Fushimi Inari Shrine",
        "Arashiyama Bamboo Grove",
        "Kinkaku-ji (Golden Pavilion)",
      ],
      local_insights: [
        {
          source: "Reddit r/JapanTravel",
          tip: "Visit Fushimi Inari early morning (6-7am) to avoid crowds",
        },
        {
          source: "Local Blog",
          tip: "Try the hidden tea house in Arashiyama - locals only know about it",
        },
        {
          source: "Reddit r/Kyoto",
          tip: "Best ramen is at Ichiran near Kyoto Station, not the tourist spots",
        },
      ],
      locationName: "Kyoto, Japan",
      main_attractions: [
        {
          description: "Famous shrine with thousands of torii gates",
          name: "Fushimi Inari Shrine",
          url: "https://www.tripadvisor.com/Attraction_Review-g298564-d324859",
        },
        {
          description: "Serene bamboo forest path",
          name: "Arashiyama Bamboo Grove",
          url: "https://www.tripadvisor.com/Attraction_Review-g298564-d324860",
        },
        {
          description: "Stunning golden temple",
          name: "Kinkaku-ji (Golden Pavilion)",
          url: "https://www.tripadvisor.com/Attraction_Review-g298564-d324861",
        },
      ],
      reasoning:
        "Matches your preference for cultural experiences and solo exploration.",
    },
  ],
};

// Routes

// Get all quiz steps (legacy endpoint)
app.get("/api/quiz/questions", (c) => {
  return c.json({
    questions: QUIZ_STEPS,
    total: QUIZ_STEPS.length,
  });
});

// Get individual quiz step by step number
app.get("/api/quiz/step/:stepNumber", (c) => {
  const stepNumber = parseInt(c.req.param("stepNumber"));

  if (
    Number.isNaN(stepNumber) ||
    stepNumber < 1 ||
    stepNumber > QUIZ_STEPS.length
  ) {
    return c.json({ error: "Invalid step number" }, 400);
  }

  const step = QUIZ_STEPS.find((s) => s.step === stepNumber);

  if (!step) {
    return c.json({ error: "Step not found" }, 404);
  }

  return c.json(step);
});

// Get current step for a user
app.get("/api/user/:userId/current-step", async (c) => {
  const userId = c.req.param("userId");

  try {
    let user = users.get(userId);

    // Create user if it doesn't exist (for hardcoded userId)
    if (!user) {
      user = {
        createdAt: new Date(),
        isCompleted: false,
        responses: "",
        updatedAt: new Date(),
        userId,
      };
      users.set(userId, user);
    }

    const responseCount: number = user.responses
      ? user.responses.split(",").length
      : 0;
    const currentStep = responseCount + 1;

    if (currentStep > QUIZ_STEPS.length) {
      return c.json({ error: "Quiz already completed" }, 400);
    }

    const step = QUIZ_STEPS.find((s) => s.step === currentStep);

    if (!step) {
      return c.json({ error: "Step not found" }, 404);
    }

    return c.json(step);
  } catch (error) {
    console.error("Error getting current step:", error);
    return c.json({ error: "Failed to get current step" }, 500);
  }
});

// Start a new quiz session (auto-generates userId)
app.post("/api/quiz/start", async (c) => {
  try {
    // Generate a unique userId
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create new user session
    users.set(userId, {
      createdAt: new Date(),
      isCompleted: false,
      responses: "",
      updatedAt: new Date(),
      userId,
    });

    return c.json({
      currentQuestion: 1,
      message: "Quiz session started",
      totalQuestions: QUIZ_STEPS.length,
      userId: userId,
    });
  } catch (error) {
    console.error("Error starting quiz session:", error);
    return c.json({ error: "Failed to start quiz session" }, 500);
  }
});

// Test endpoint for debugging
app.post("/api/test", async (c) => {
  try {
    const body = await c.req.json();
    console.log("Test endpoint received:", body);
    return c.json({ received: body });
  } catch (error) {
    console.log("Test endpoint error:", error);
    return c.json({ error: "Failed to parse JSON" }, 400);
  }
});

// Submit quiz response
app.post("/api/quiz/response", async (c) => {
  try {
    const body = await c.req.json();
    console.log("Received quiz response body:", body);

    const { userId, stepNumber, selectedOption } = body;

    console.log("Parsed fields:", {
      selectedOption,
      stepNumber,
      types: {
        selectedOption: typeof selectedOption,
        stepNumber: typeof stepNumber,
        userId: typeof userId,
      },
      userId,
    });

    if (
      !userId ||
      stepNumber === undefined ||
      stepNumber === null ||
      selectedOption === undefined ||
      selectedOption === null
    ) {
      console.log("Missing required fields:", {
        selectedOption,
        stepNumber,
        userId,
      });
      return c.json(
        { error: "userId, stepNumber, and selectedOption are required" },
        400,
      );
    }

    // Validate step number
    if (stepNumber < 1 || stepNumber > QUIZ_STEPS.length) {
      return c.json({ error: "Invalid step number" }, 400);
    }

    // Validate selected option (should be 0, 1, 2, or 3 for the 4 options)
    if (![0, 1, 2, 3].includes(selectedOption)) {
      return c.json({ error: "selectedOption must be 0, 1, 2, or 3" }, 400);
    }

    // Get current user
    let user = users.get(userId);

    // Create user if it doesn't exist (for hardcoded userId)
    if (!user) {
      user = {
        createdAt: new Date(),
        isCompleted: false,
        responses: "",
        updatedAt: new Date(),
        userId,
      };
      users.set(userId, user);
    }

    if (user.isCompleted) {
      return c.json({ error: "Quiz already completed" }, 400);
    }

    // Update quiz responses
    const currentResponses = user.responses || "";
    const newResponse = `${stepNumber}:${selectedOption}`;
    const updatedResponses = currentResponses
      ? `${currentResponses},${newResponse}`
      : newResponse;

    user.responses = updatedResponses;
    user.updatedAt = new Date();

    // Check if quiz is complete (10 questions)
    const responseCount = updatedResponses.split(",").length;
    const isComplete = responseCount >= 10;

    if (isComplete) {
      // Generate enhanced user preferences based on responses
      const travelStyle = determineTravelStyle(updatedResponses);
      const mockPreferences = {
        accommodationPreference: "boutique hotels",
        adventureLevel: "high",
        budgetPriority: "mid-range",
        culturalInterest: "high",
        foodPreference: "local cuisine",
        pacePreference: "moderate",
        preferredActivities: getPreferredActivities(travelStyle),
        socialPreference: "solo exploration",
        travelStyle: travelStyle,
      };

      user.preferences = mockPreferences;
      user.isCompleted = true;

      return c.json({
        isComplete: true,
        message: "Quiz completed! User preferences generated.",
        preferences: mockPreferences,
        userId,
      });
    }

    return c.json({
      currentQuestion: stepNumber + 1,
      isComplete: false,
      message: "Response saved",
      userId,
    });
  } catch (error) {
    console.error("Error saving quiz response:", error);
    return c.json({ error: "Failed to save quiz response" }, 500);
  }
});

// Helper function to determine travel style based on responses
function determineTravelStyle(responses: string): string {
  // Simple logic based on response patterns
  const responseArray = responses.split(",").map((r) => r.split(":")[1]);

  // Count different types of responses (now using 0, 1, 2, 3)
  const zeroCount = responseArray.filter((r) => r === "0").length;
  const oneCount = responseArray.filter((r) => r === "1").length;
  const twoCount = responseArray.filter((r) => r === "2").length;
  const threeCount = responseArray.filter((r) => r === "3").length;

  // Determine style based on dominant responses
  if (zeroCount > 3) return "adventure";
  if (oneCount > 3) return "cultural";
  if (twoCount > 3) return "relaxed";
  if (threeCount > 3) return "luxury";

  return "cultural"; // default
}

// Helper function to get preferred activities based on travel style
function getPreferredActivities(travelStyle: string): string[] {
  const activities = {
    adventure: [
      "hiking",
      "photography",
      "natural wonders",
      "outdoor activities",
    ],
    cultural: ["temple visits", "museums", "historical sites", "local markets"],
    luxury: [
      "fine dining",
      "spa treatments",
      "exclusive experiences",
      "shopping",
    ],
    relaxed: ["spa visits", "meditation", "nature walks", "tea ceremonies"],
  };

  return (
    activities[travelStyle as keyof typeof activities] || [
      "sightseeing",
      "dining",
      "cultural experiences",
    ]
  );
}

// Get user preferences
app.get("/api/user/:userId/preferences", async (c) => {
  const userId = c.req.param("userId");

  try {
    let user = users.get(userId);

    // Create user if it doesn't exist (for hardcoded userId)
    if (!user) {
      user = {
        createdAt: new Date(),
        isCompleted: false,
        responses: "",
        updatedAt: new Date(),
        userId,
      };
      users.set(userId, user);
    }

    if (!user.isCompleted) {
      return c.json({ error: "Quiz not completed yet" }, 400);
    }

    return c.json({
      isCompleted: user.isCompleted,
      preferences: user.preferences,
      userId: user.userId,
    });
  } catch (error) {
    console.error("Error getting user preferences:", error);
    return c.json({ error: "Failed to get user preferences" }, 500);
  }
});

// Get travel recommendations
app.get("/api/user/:userId/recommendations", async (c) => {
  const userId = c.req.param("userId");

  try {
    let user = users.get(userId);

    // Create user if it doesn't exist (for hardcoded userId)
    if (!user) {
      user = {
        createdAt: new Date(),
        isCompleted: false,
        responses: "",
        updatedAt: new Date(),
        userId,
      };
      users.set(userId, user);
    }

    if (!user.isCompleted) {
      return c.json({ error: "Quiz not completed yet" }, 400);
    }

    // Check if recommendations already exist
    const existingRecommendations = recommendations.get(userId) || [];

    if (existingRecommendations.length > 0) {
      return c.json({
        recommendations: existingRecommendations,
        userId,
      });
    }

    // Generate enhanced recommendations based on travel style
    const travelStyle = user.preferences.travelStyle;
    const styleRecommendations =
      enhancedRecommendations[
        travelStyle as keyof typeof enhancedRecommendations
      ] || enhancedRecommendations.cultural;

    recommendations.set(userId, styleRecommendations);

    return c.json({
      recommendations: styleRecommendations,
      userId,
    });
  } catch (error) {
    console.error("Error getting travel recommendations:", error);
    return c.json({ error: "Failed to get travel recommendations" }, 500);
  }
});

// Generate itinerary for a specific location
app.post("/api/user/:userId/itinerary", async (c) => {
  const userId = c.req.param("userId");
  const { locationName } = await c.req.json();

  if (!locationName) {
    return c.json({ error: "locationName is required" }, 400);
  }

  try {
    let user = users.get(userId);

    // Create user if it doesn't exist (for hardcoded userId)
    if (!user) {
      user = {
        createdAt: new Date(),
        isCompleted: false,
        responses: "",
        updatedAt: new Date(),
        userId,
      };
      users.set(userId, user);
    }

    if (!user.isCompleted) {
      return c.json({ error: "Quiz not completed yet" }, 400);
    }

    // Check if itinerary already exists
    const existingItinerary = itineraries.get(`${userId}_${locationName}`);

    if (existingItinerary) {
      return c.json({
        itinerary: existingItinerary,
        locationName,
        userId,
      });
    }

    // Use real scraper data to generate itinerary
    try {
      const { spawn } = await import("node:child_process");

      console.log("🔍 Calling Python scraper for:", locationName);
      console.log("🔍 Current working directory:", process.cwd());
      console.log("🔍 Python command:", "python3", [
        "-m",
        "src.scrapers.scraper_manager",
        "generate_itinerary",
        JSON.stringify({
          location: locationName,
          user_preferences: {
            adventure_level: user.preferences.adventureLevel,
            cultural_interest: user.preferences.culturalInterest,
            food_preference: user.preferences.foodPreference,
            pace_preference: user.preferences.pacePreference,
            preferred_activities: user.preferences.preferredActivities,
            travel_style: user.preferences.travelStyle,
          },
        }),
      ]);

      // Call the Python scraper manager to get real data
      const pythonProcess = spawn(
        "bash",
        [
          "-c",
          `source venv/bin/activate && python3 -m src.scrapers.scraper_manager generate_itinerary '${JSON.stringify(
            {
              location: locationName,
              user_preferences: {
                adventure_level: user.preferences.adventureLevel,
                cultural_interest: user.preferences.culturalInterest,
                food_preference: user.preferences.foodPreference,
                pace_preference: user.preferences.pacePreference,
                preferred_activities: user.preferences.preferredActivities,
                travel_style: user.preferences.travelStyle,
              },
            },
          )}'`,
        ],
        {
          cwd: process.cwd(), // Ensure we're in the right directory
        },
      );

      let realItineraryData = "";
      let errorOutput = "";

      pythonProcess.stdout.on("data", (data: Buffer) => {
        realItineraryData += data.toString();
      });

      pythonProcess.stderr.on("data", (data: Buffer) => {
        errorOutput += data.toString();
        console.log("Python stderr:", data.toString());
      });

      await new Promise((resolve, _reject) => {
        pythonProcess.on("close", (code: number) => {
          console.log("Python process exited with code:", code);
          console.log("Python stdout:", realItineraryData);
          console.log("Python stderr:", errorOutput);

          if (code === 0) {
            try {
              const itineraryData = JSON.parse(realItineraryData);
              resolve(itineraryData);
            } catch (_e) {
              console.log("Error parsing Python output, using fallback data");
              resolve(null);
            }
          } else {
            console.log("Python scraper failed, using fallback data");
            resolve(null);
          }
        });
      });

      // If we got real data, use it
      if (realItineraryData && !errorOutput.includes("Error")) {
        try {
          // Find the JSON object in the output (it might be mixed with other text)
          const jsonMatch = realItineraryData.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const itineraryData = JSON.parse(jsonMatch[0]);

            const realItinerary = {
              activities: {
                events: itineraryData.events || [],
                local_insights: itineraryData.local_insights || [],
                main_attractions: itineraryData.attractions || [],
                restaurants: itineraryData.restaurants || {},
                transportation: itineraryData.transportation_info || {},
                weather: itineraryData.weather_conditions || {},
              },
              createdAt: new Date(),
              itineraryData: {
                afternoon:
                  itineraryData.afternoon_schedule ||
                  "Explore cultural sites and local cuisine",
                evening:
                  itineraryData.evening_schedule ||
                  "Experience evening activities and local culture",
                morning:
                  itineraryData.morning_schedule ||
                  "Start your day with local attractions",
              },
              locationName,
              total_cost: itineraryData.total_estimated_cost || { total: 100 },
              travel_tips: itineraryData.travel_tips || [],
              userId,
            };

            itineraries.set(`${userId}_${locationName}`, realItinerary);

            return c.json({
              itinerary: realItinerary,
              locationName,
              userId,
            });
          }
        } catch (e) {
          console.log("Error parsing real itinerary data, using fallback:", e);
        }
      }
    } catch (_e) {
      console.log("Error calling Python scraper, using fallback data");
    }

    // Fallback to enhanced mock data
    const enhancedMockItinerary = {
      activities: {
        events: [
          {
            dates: "Seasonal",
            description: "Traditional celebration",
            name: "Local Festival",
          },
        ],
        local_insights: [
          {
            source: "Reddit r/travel",
            tip: "Visit early morning to avoid crowds",
          },
          {
            source: "Local Blog",
            tip: "Best food is at the family-owned restaurant on Main St",
          },
        ],
        main_attractions: [
          {
            description: "Must-see location",
            name: "Main Attraction 1",
            url: "https://tripadvisor.com/attraction1",
          },
          {
            description: "Popular spot",
            name: "Main Attraction 2",
            url: "https://tripadvisor.com/attraction2",
          },
        ],
      },
      createdAt: new Date(),
      id: `itinerary_${Date.now().toString()}`,
      itineraryData: {
        afternoon:
          "Explore hidden gems known only to locals, enjoy a leisurely lunch at a family-owned restaurant.",
        evening:
          "Experience the local nightlife and cultural activities, ending with a peaceful evening stroll.",
        morning:
          "Start your day with a traditional breakfast at a local café, then visit the main attractions.",
      },
      locationName,
      userId,
    };

    itineraries.set(`${userId}_${locationName}`, enhancedMockItinerary);

    return c.json({
      itinerary: enhancedMockItinerary,
      locationName,
      userId,
    });
  } catch (error) {
    console.error("Error generating itinerary:", error);
    return c.json({ error: "Failed to generate itinerary" }, 500);
  }
});

// Get user status
app.get("/api/user/:userId/status", async (c) => {
  const userId = c.req.param("userId");

  try {
    let user = users.get(userId);

    // Create user if it doesn't exist (for hardcoded userId)
    if (!user) {
      user = {
        createdAt: new Date(),
        isCompleted: false,
        responses: "",
        updatedAt: new Date(),
        userId,
      };
      users.set(userId, user);
    }

    const responseCount: number = user.responses
      ? user.responses.split(",").length
      : 0;

    return c.json({
      currentQuestion: (responseCount + 1) as number,
      hasPreferences: !!user.preferences,
      isCompleted: user.isCompleted,
      totalQuestions: QUIZ_STEPS.length,
      userId: user.userId,
    });
  } catch (error) {
    console.error("Error getting user status:", error);
    return c.json({ error: "Failed to get user status" }, 500);
  }
});

// Health check
app.get("/", (c) => {
  return c.json({
    message: "Lumo Travel Recommendation API",
    status: "healthy",
    version: "1.0.0",
  });
});

// Start the server
const port = parseInt(process.env.PORT || "3001");
console.log(`🚀 Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
