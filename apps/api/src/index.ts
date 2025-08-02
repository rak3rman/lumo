import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

// Add middleware
app.use("*", logger());
app.use("*", cors());

// In-memory storage
const users = new Map<string, { 
  userId: string; 
  responses: string; 
  preferences?: any; 
  isCompleted: boolean; 
  createdAt: Date;
  updatedAt: Date;
}>();
const recommendations = new Map<string, any[]>();
const itineraries = new Map<string, any>();

// Quiz questions (static data) - Updated to match frontend StepResponse format
const QUIZ_STEPS = [
  {
    data: {
      bg_img_url: "/api/placeholder/bg/1",
      has_next: true,
      options: [
        {
          img_url: "https://lumoagentinloop.s3.us-east-1.amazonaws.com/Terracotta+red+door+in+a+barren+land.jpg",
          name: "Crisp and misty"
        },
        {
          img_url: "/api/placeholder/2",
          name: "Dry heat with a golden sun"
        },
        {
          img_url: "/api/placeholder/3",
          name: "A cozy drizzle"
        },
        {
          img_url: "/api/placeholder/4",
          name: "Warm, breezy night air"
        }
      ],
      prompt: "You're walking with no destination. What's the weather like?"
    },
    step: 1
  },
  {
    data: {
      bg_img_url: "/api/placeholder/bg/2",
      has_next: true,
      options: [
        {
          img_url: "/api/placeholder/1",
          name: "Emerald green"
        },
        {
          img_url: "/api/placeholder/2",
          name: "Terracotta red"
        },
        {
          img_url: "/api/placeholder/3",
          name: "Ocean blue"
        },
        {
          img_url: "/api/placeholder/4",
          name: "Matte black"
        }
      ],
      prompt: "You come across a door in the middle of nowhere. What color is it?"
    },
    step: 2
  },
  {
    data: {
      bg_img_url: "/api/placeholder/bg/3",
      has_next: true,
      options: [
        {
          img_url: "/api/placeholder/1",
          name: "Waves crashing"
        },
        {
          img_url: "/api/placeholder/2",
          name: "Distant music and laughter"
        },
        {
          img_url: "/api/placeholder/3",
          name: "Wind moving through trees"
        },
        {
          img_url: "/api/placeholder/4",
          name: "Silence"
        }
      ],
      prompt: "You step through and hear..."
    },
    step: 3
  },
  {
    data: {
      bg_img_url: "/api/placeholder/bg/4",
      has_next: true,
      options: [
        {
          img_url: "/api/placeholder/1",
          name: "A hand-drawn map"
        },
        {
          img_url: "/api/placeholder/2",
          name: "A polaroid camera"
        },
        {
          img_url: "/api/placeholder/3",
          name: "A playlist"
        },
        {
          img_url: "/api/placeholder/4",
          name: "A warm drink in a thermos"
        }
      ],
      prompt: "A stranger hands you something for your journey. What is it?"
    },
    step: 4
  },
  {
    data: {
      bg_img_url: "/api/placeholder/bg/5",
      has_next: true,
      options: [
        {
          img_url: "/api/placeholder/1",
          name: "Fresh fruit, just picked"
        },
        {
          img_url: "/api/placeholder/2",
          name: "Street food in a paper wrapper"
        },
        {
          img_url: "/api/placeholder/3",
          name: "Something hot from a local café"
        },
        {
          img_url: "/api/placeholder/4",
          name: "A full-course meal shared at a long table"
        }
      ],
      prompt: "You're suddenly hungry. What's the first thing you crave?"
    },
    step: 5
  },
  {
    data: {
      bg_img_url: "/api/placeholder/bg/6",
      has_next: true,
      options: [
        {
          img_url: "/api/placeholder/1",
          name: "Jump in — the more the merrier"
        },
        {
          img_url: "/api/placeholder/2",
          name: "Join for a bit, then wander solo"
        },
        {
          img_url: "/api/placeholder/3",
          name: "Politely decline and keep exploring"
        },
        {
          img_url: "/api/placeholder/4",
          name: "Stay nearby, watching from a distance"
        }
      ],
      prompt: "You're invited to join a group. You…"
    },
    step: 6
  },
  {
    data: {
      bg_img_url: "/api/placeholder/bg/7",
      has_next: true,
      options: [
        {
          img_url: "/api/placeholder/1",
          name: "A quiet cabin under stars"
        },
        {
          img_url: "/api/placeholder/2",
          name: "Rooftop views of a glowing city"
        },
        {
          img_url: "/api/placeholder/3",
          name: "A hammock between two palm trees"
        },
        {
          img_url: "/api/placeholder/4",
          name: "A cozy inn with candles and books"
        }
      ],
      prompt: "As night falls, you find the perfect spot to rest. What surrounds you?"
    },
    step: 7
  },
  {
    data: {
      bg_img_url: "/api/placeholder/bg/8",
      has_next: true,
      options: [
        {
          img_url: "/api/placeholder/1",
          name: "On top of a mountain"
        },
        {
          img_url: "/api/placeholder/2",
          name: "In the middle of a festival"
        },
        {
          img_url: "/api/placeholder/3",
          name: "Floating on water"
        },
        {
          img_url: "/api/placeholder/4",
          name: "Alone, smiling"
        }
      ],
      prompt: "The sky lights up with color. You realize you're..."
    },
    step: 8
  },
  {
    data: {
      bg_img_url: "/api/placeholder/bg/9",
      has_next: true,
      options: [
        {
          img_url: "/api/placeholder/1",
          name: "A guidebook"
        },
        {
          img_url: "/api/placeholder/2",
          name: "Your camera"
        },
        {
          img_url: "/api/placeholder/3",
          name: "A fresh outfit"
        },
        {
          img_url: "/api/placeholder/4",
          name: "Nothing — you take it all in"
        }
      ],
      prompt: "You wake up in a new place. What do you reach for first?"
    },
    step: 9
  },
  {
    data: {
      bg_img_url: "/api/placeholder/bg/10",
      has_next: false,
      options: [
        {
          img_url: "/api/placeholder/1",
          name: "Say yes before they finish the sentence"
        },
        {
          img_url: "/api/placeholder/2",
          name: "Ask what's next"
        },
        {
          img_url: "/api/placeholder/3",
          name: "Say, \"Only if I can bring someone with me\""
        },
        {
          img_url: "/api/placeholder/4",
          name: "Smile and walk toward the next dream"
        }
      ],
      prompt: "A whisper asks: \"Want to stay a little longer?\" You…"
    },
    step: 10
  }
];

// Enhanced mock recommendations with activities and local insights
const enhancedRecommendations = {
  "adventure": [
    {
      bestTimeToVisit: "June-August (Summer) or September-March (Northern Lights)",
      country: "Iceland",
      description: "Ideal for your adventurous spirit with stunning natural landscapes and unique experiences.",
      estimatedBudgetRange: "$150-300/day",
      events: [
        {"dates": "September-March", "description": "Best aurora viewing", "name": "Northern Lights Season"},
        {"dates": "November", "description": "Music festival with local bands", "name": "Iceland Airwaves"}
      ],
      id: "rec_adventure_1",
      keyAttractions: ["Blue Lagoon", "Golden Circle", "Northern Lights"],
      local_insights: [
        {"source": "Reddit r/Iceland", "tip": "Skip Blue Lagoon, go to Sky Lagoon instead - locals prefer it"},
        {"source": "Local Guide", "tip": "Best hot dogs at Bæjarins Beztu Pylsur - Bill Clinton ate here"},
        {"source": "Reddit r/VisitingIceland", "tip": "Rent a car to see Northern Lights away from city lights"}
      ],
      locationName: "Reykjavik, Iceland",
      main_attractions: [
        {"description": "Famous geothermal spa", "name": "Blue Lagoon", "url": "https://www.tripadvisor.com/Attraction_Review-g189970-d324862"},
        {"description": "Geysers, waterfalls, and national park", "name": "Golden Circle", "url": "https://www.tripadvisor.com/Attraction_Review-g189970-d324863"},
        {"description": "Aurora borealis viewing", "name": "Northern Lights", "url": "https://www.tripadvisor.com/Attraction_Review-g189970-d324864"}
      ],
      reasoning: "Perfect for high adventure level and cultural interest."
    }
  ],
  "cultural": [
    {
      bestTimeToVisit: "March-May (Cherry Blossom) or October-November (Fall Colors)",
      country: "Japan",
      description: "Perfect for your dreamy, cultural preferences with ancient temples and serene gardens.",
      estimatedBudgetRange: "$100-200/day",
      events: [
        {"dates": "July", "description": "Traditional festival with parades", "name": "Gion Matsuri Festival"},
        {"dates": "Late March-Early April", "description": "Hanami parties in Maruyama Park", "name": "Cherry Blossom Season"}
      ],
      id: "rec_cultural_1",
      keyAttractions: ["Fushimi Inari Shrine", "Arashiyama Bamboo Grove", "Kinkaku-ji (Golden Pavilion)"],
      local_insights: [
        {"source": "Reddit r/JapanTravel", "tip": "Visit Fushimi Inari early morning (6-7am) to avoid crowds"},
        {"source": "Local Blog", "tip": "Try the hidden tea house in Arashiyama - locals only know about it"},
        {"source": "Reddit r/Kyoto", "tip": "Best ramen is at Ichiran near Kyoto Station, not the tourist spots"}
      ],
      locationName: "Kyoto, Japan",
      main_attractions: [
        {"description": "Famous shrine with thousands of torii gates", "name": "Fushimi Inari Shrine", "url": "https://www.tripadvisor.com/Attraction_Review-g298564-d324859"},
        {"description": "Serene bamboo forest path", "name": "Arashiyama Bamboo Grove", "url": "https://www.tripadvisor.com/Attraction_Review-g298564-d324860"},
        {"description": "Stunning golden temple", "name": "Kinkaku-ji (Golden Pavilion)", "url": "https://www.tripadvisor.com/Attraction_Review-g298564-d324861"}
      ],
      reasoning: "Matches your preference for cultural experiences and solo exploration."
    }
  ]
};

// Routes

// Get all quiz steps (legacy endpoint)
app.get("/api/quiz/questions", (c) => {
  return c.json({
    questions: QUIZ_STEPS,
    total: QUIZ_STEPS.length
  });
});

// Get individual quiz step by step number
app.get("/api/quiz/step/:stepNumber", (c) => {
  const stepNumber = parseInt(c.req.param("stepNumber"));
  
  if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > QUIZ_STEPS.length) {
    return c.json({ error: "Invalid step number" }, 400);
  }
  
  const step = QUIZ_STEPS.find(s => s.step === stepNumber);
  
  if (!step) {
    return c.json({ error: "Step not found" }, 404);
  }
  
  return c.json(step);
});

// Get current step for a user
app.get("/api/user/:userId/current-step", async (c) => {
  const userId = c.req.param("userId");
  
  try {
    const user = users.get(userId);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const responseCount: number = user.responses ? user.responses.split(",").length : 0;
    const currentStep = responseCount + 1;
    
    if (currentStep > QUIZ_STEPS.length) {
      return c.json({ error: "Quiz already completed" }, 400);
    }
    
    const step = QUIZ_STEPS.find(s => s.step === currentStep);
    
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
      userId,
      responses: "",
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return c.json({
      message: "Quiz session started",
      userId: userId,
      currentQuestion: 1,
      totalQuestions: QUIZ_STEPS.length
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
    
    console.log("Parsed fields:", { userId, stepNumber, selectedOption, types: { userId: typeof userId, stepNumber: typeof stepNumber, selectedOption: typeof selectedOption } });
    
    if (!userId || stepNumber === undefined || stepNumber === null || selectedOption === undefined || selectedOption === null) {
      console.log("Missing required fields:", { userId, stepNumber, selectedOption });
      return c.json({ error: "userId, stepNumber, and selectedOption are required" }, 400);
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
    const user = users.get(userId);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
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
        travelStyle: travelStyle,
        preferredActivities: getPreferredActivities(travelStyle),
        accommodationPreference: "boutique hotels",
        budgetPriority: "mid-range",
        pacePreference: "moderate",
        foodPreference: "local cuisine",
        socialPreference: "solo exploration",
        adventureLevel: "high",
        culturalInterest: "high"
      };
      
      user.preferences = mockPreferences;
      user.isCompleted = true;

      return c.json({
        message: "Quiz completed! User preferences generated.",
        userId,
        isComplete: true,
        preferences: mockPreferences
      });
    }

    return c.json({
      message: "Response saved",
      userId,
      currentQuestion: stepNumber + 1,
      isComplete: false
    });

  } catch (error) {
    console.error("Error saving quiz response:", error);
    return c.json({ error: "Failed to save quiz response" }, 500);
  }
});

// Helper function to determine travel style based on responses
function determineTravelStyle(responses: string): string {
  // Simple logic based on response patterns
  const responseArray = responses.split(",").map(r => r.split(":")[1]);
  
  // Count different types of responses (now using 0, 1, 2, 3)
  const zeroCount = responseArray.filter(r => r === "0").length;
  const oneCount = responseArray.filter(r => r === "1").length;
  const twoCount = responseArray.filter(r => r === "2").length;
  const threeCount = responseArray.filter(r => r === "3").length;
  
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
    "adventure": ["hiking", "photography", "natural wonders", "outdoor activities"],
    "cultural": ["temple visits", "museums", "historical sites", "local markets"],
    "relaxed": ["spa visits", "meditation", "nature walks", "tea ceremonies"],
    "luxury": ["fine dining", "spa treatments", "exclusive experiences", "shopping"]
  };
  
  return activities[travelStyle as keyof typeof activities] || ["sightseeing", "dining", "cultural experiences"];
}

// Get user preferences
app.get("/api/user/:userId/preferences", async (c) => {
  const userId = c.req.param("userId");
  
  try {
    const user = users.get(userId);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    if (!user.isCompleted) {
      return c.json({ error: "Quiz not completed yet" }, 400);
    }

    return c.json({
      userId: user.userId,
      preferences: user.preferences,
      isCompleted: user.isCompleted
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
    const user = users.get(userId);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    if (!user.isCompleted) {
      return c.json({ error: "Quiz not completed yet" }, 400);
    }

    // Check if recommendations already exist
    const existingRecommendations = recommendations.get(userId) || [];

    if (existingRecommendations.length > 0) {
      return c.json({
        userId,
        recommendations: existingRecommendations
      });
    }

    // Generate enhanced recommendations based on travel style
    const travelStyle = user.preferences.travelStyle;
    const styleRecommendations = enhancedRecommendations[travelStyle as keyof typeof enhancedRecommendations] || enhancedRecommendations.cultural;

    recommendations.set(userId, styleRecommendations);

    return c.json({
      userId,
      recommendations: styleRecommendations
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
    const user = users.get(userId);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    if (!user.isCompleted) {
      return c.json({ error: "Quiz not completed yet" }, 400);
    }

    // Check if itinerary already exists
    const existingItinerary = itineraries.get(`${userId}_${locationName}`);

    if (existingItinerary) {
      return c.json({
        userId,
        locationName,
        itinerary: existingItinerary
      });
    }

    // Use real scraper data to generate itinerary
    try {
      const { spawn } = require('child_process');
      
      console.log("🔍 Calling Python scraper for:", locationName);
      console.log("🔍 Current working directory:", process.cwd());
      console.log("🔍 Python command:", 'python3', ['-m', 'src.scrapers.scraper_manager', 'generate_itinerary', JSON.stringify({
        location: locationName,
        user_preferences: {
          travel_style: user.preferences.travelStyle,
          preferred_activities: user.preferences.preferredActivities,
          food_preference: user.preferences.foodPreference,
          pace_preference: user.preferences.pacePreference,
          adventure_level: user.preferences.adventureLevel,
          cultural_interest: user.preferences.culturalInterest
        }
      })]);
      
      // Call the Python scraper manager to get real data
      const pythonProcess = spawn('bash', [
        '-c',
        `source venv/bin/activate && python3 -m src.scrapers.scraper_manager generate_itinerary '${JSON.stringify({
          location: locationName,
          user_preferences: {
            travel_style: user.preferences.travelStyle,
            preferred_activities: user.preferences.preferredActivities,
            food_preference: user.preferences.foodPreference,
            pace_preference: user.preferences.pacePreference,
            adventure_level: user.preferences.adventureLevel,
            cultural_interest: user.preferences.culturalInterest
          }
        })}'`
      ], {
        cwd: process.cwd() // Ensure we're in the right directory
      });

      let realItineraryData = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data: Buffer) => {
        realItineraryData += data.toString();
      });

      pythonProcess.stderr.on('data', (data: Buffer) => {
        errorOutput += data.toString();
        console.log("Python stderr:", data.toString());
      });

      await new Promise((resolve, reject) => {
        pythonProcess.on('close', (code: number) => {
          console.log("Python process exited with code:", code);
          console.log("Python stdout:", realItineraryData);
          console.log("Python stderr:", errorOutput);
          
          if (code === 0) {
            try {
              const itineraryData = JSON.parse(realItineraryData);
              resolve(itineraryData);
            } catch (e) {
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
      if (realItineraryData && !errorOutput.includes('Error')) {
        try {
          // Find the JSON object in the output (it might be mixed with other text)
          const jsonMatch = realItineraryData.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const itineraryData = JSON.parse(jsonMatch[0]);
            
            const realItinerary = {
              userId,
              locationName,
              itineraryData: {
                morning: itineraryData.morning_schedule || "Start your day with local attractions",
                afternoon: itineraryData.afternoon_schedule || "Explore cultural sites and local cuisine",
                evening: itineraryData.evening_schedule || "Experience evening activities and local culture"
              },
              activities: {
                main_attractions: itineraryData.attractions || [],
                local_insights: itineraryData.local_insights || [],
                events: itineraryData.events || [],
                weather: itineraryData.weather_conditions || {},
                transportation: itineraryData.transportation_info || {},
                restaurants: itineraryData.restaurants || {}
              },
              total_cost: itineraryData.total_estimated_cost || { total: 100 },
              travel_tips: itineraryData.travel_tips || [],
              createdAt: new Date()
            };

            itineraries.set(`${userId}_${locationName}`, realItinerary);

            return c.json({
              userId,
              locationName,
              itinerary: realItinerary
            });
          }
        } catch (e) {
          console.log("Error parsing real itinerary data, using fallback:", e);
        }
      }

    } catch (e) {
      console.log("Error calling Python scraper, using fallback data");
    }

    // Fallback to enhanced mock data
    const enhancedMockItinerary = {
      id: `itinerary_${Date.now().toString()}`,
      userId,
      locationName,
      itineraryData: {
        morning: "Start your day with a traditional breakfast at a local café, then visit the main attractions.",
        afternoon: "Explore hidden gems known only to locals, enjoy a leisurely lunch at a family-owned restaurant.",
        evening: "Experience the local nightlife and cultural activities, ending with a peaceful evening stroll."
      },
      activities: {
        main_attractions: [
          {"name": "Main Attraction 1", "url": "https://tripadvisor.com/attraction1", "description": "Must-see location"},
          {"name": "Main Attraction 2", "url": "https://tripadvisor.com/attraction2", "description": "Popular spot"}
        ],
        local_insights: [
          {"source": "Reddit r/travel", "tip": "Visit early morning to avoid crowds"},
          {"source": "Local Blog", "tip": "Best food is at the family-owned restaurant on Main St"}
        ],
        events: [
          {"name": "Local Festival", "dates": "Seasonal", "description": "Traditional celebration"}
        ]
      },
      createdAt: new Date()
    };

    itineraries.set(`${userId}_${locationName}`, enhancedMockItinerary);

    return c.json({
      userId,
      locationName,
      itinerary: enhancedMockItinerary
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
    const user = users.get(userId);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const responseCount: number = user.responses ? user.responses.split(",").length : 0;

    return c.json({
      userId: user.userId,
      isCompleted: user.isCompleted,
      currentQuestion: (responseCount + 1) as number,
      totalQuestions: QUIZ_STEPS.length,
      hasPreferences: !!user.preferences
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
    version: "1.0.0",
    status: "healthy"
  });
});

// Start the server
const port = parseInt(process.env.PORT || "3000");
console.log(`🚀 Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});
