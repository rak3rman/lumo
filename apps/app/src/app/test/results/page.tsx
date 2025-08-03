"use client";

import { useEffect, useState } from "react";

// Mock data types based on what the backend would return
interface MockTravelRecommendation {
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

interface MockItinerary {
  locationName: string;
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
}

interface MockUserPreferences {
  travelStyle: string;
  budgetRange: string;
  preferredClimate: string;
  activityLevel: string;
  accommodationType: string;
  cuisinePreference: string;
}

export default function ResultsPage() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<MockItinerary | null>(null);
  const [generatingItinerary, setGeneratingItinerary] = useState(false);

  // Mock data that would come from the backend
  const mockUserPreferences: MockUserPreferences = {
    travelStyle: "Adventure Seeker",
    budgetRange: "$2000-$4000",
    preferredClimate: "Tropical",
    activityLevel: "High",
    accommodationType: "Boutique Hotels",
    cuisinePreference: "Local & Street Food"
  };

  const mockRecommendations: MockTravelRecommendation[] = [
    {
      id: "1",
      locationName: "Bali",
      country: "Indonesia",
      description: "A paradise island known for its stunning beaches, vibrant culture, and spiritual temples. Perfect for adventure seekers who love nature and cultural experiences.",
      estimatedBudgetRange: "$2500-$4000",
      bestTimeToVisit: "April to October",
      keyAttractions: ["Ubud Sacred Monkey Forest", "Tanah Lot Temple", "Mount Batur"],
      main_attractions: [
        {
          name: "Ubud Sacred Monkey Forest",
          description: "A mystical forest sanctuary home to hundreds of long-tailed macaques and ancient temples.",
          url: "https://monkeyforestubud.com"
        },
        {
          name: "Tanah Lot Temple",
          description: "A stunning sea temple perched on a rocky outcrop, one of Bali's most iconic landmarks.",
          url: "https://tanahlot.net"
        },
        {
          name: "Mount Batur",
          description: "An active volcano offering spectacular sunrise hikes and breathtaking views of Lake Batur.",
          url: "https://mountbatur.com"
        }
      ],
      events: [
        {
          name: "Nyepi Day",
          dates: "March (date varies)",
          description: "Bali's Day of Silence, a unique cultural experience where the entire island shuts down for 24 hours."
        },
        {
          name: "Galungan Festival",
          dates: "Every 210 days",
          description: "A major Balinese Hindu festival celebrating the victory of good over evil with elaborate ceremonies."
        }
      ],
      local_insights: [
        {
          source: "Local Guide",
          tip: "Visit temples early morning to avoid crowds and experience the spiritual atmosphere"
        },
        {
          source: "Travel Blog",
          tip: "Learn basic Balinese phrases - locals appreciate the effort and it enhances your experience"
        }
      ],
      reasoning: "Based on your preference for adventure activities, cultural experiences, and tropical climate, Bali offers the perfect combination of outdoor adventures, spiritual experiences, and stunning natural beauty."
    },
    {
      id: "2",
      locationName: "Costa Rica",
      country: "Central America",
      description: "A biodiversity hotspot with lush rainforests, active volcanoes, and pristine beaches. Ideal for nature lovers and adventure enthusiasts.",
      estimatedBudgetRange: "$3000-$4500",
      bestTimeToVisit: "December to April",
      keyAttractions: ["Arenal Volcano", "Monteverde Cloud Forest", "Manuel Antonio National Park"],
      main_attractions: [
        {
          name: "Arenal Volcano",
          description: "An active volcano with hot springs, hiking trails, and stunning views of the surrounding rainforest.",
          url: "https://arenal.net"
        },
        {
          name: "Monteverde Cloud Forest",
          description: "A mystical cloud forest reserve with hanging bridges, zip lines, and diverse wildlife.",
          url: "https://monteverde.com"
        },
        {
          name: "Manuel Antonio National Park",
          description: "A coastal national park with pristine beaches, hiking trails, and abundant wildlife including sloths and monkeys.",
          url: "https://manuelantonio.com"
        }
      ],
      events: [
        {
          name: "Envision Festival",
          dates: "February",
          description: "A transformative festival celebrating music, art, and sustainability in the jungle."
        },
        {
          name: "Independence Day",
          dates: "September 15",
          description: "Celebrate Costa Rica's independence with parades, traditional dances, and cultural events."
        }
      ],
      local_insights: [
        {
          source: "Local Guide",
          tip: "Book activities in advance during peak season, especially for popular attractions like Arenal"
        },
        {
          source: "Travel Blog",
          tip: "Pack rain gear even in dry season - weather can change quickly in the rainforest"
        }
      ],
      reasoning: "Your love for adventure and nature makes Costa Rica an ideal destination, offering world-class zip-lining, volcano hikes, and wildlife encounters in a tropical setting."
    },
    {
      id: "3",
      locationName: "New Zealand",
      country: "Oceania",
      description: "A land of dramatic landscapes, from snow-capped mountains to pristine beaches. Perfect for thrill-seekers and outdoor enthusiasts.",
      estimatedBudgetRange: "$4000-$6000",
      bestTimeToVisit: "October to April",
      keyAttractions: ["Milford Sound", "Tongariro Alpine Crossing", "Queenstown Adventure Sports"],
      main_attractions: [
        {
          name: "Milford Sound",
          description: "A breathtaking fjord with towering cliffs, waterfalls, and abundant marine life.",
          url: "https://milfordsound.com"
        },
        {
          name: "Tongariro Alpine Crossing",
          description: "One of the world's best day hikes through volcanic landscapes and emerald lakes.",
          url: "https://tongariro.com"
        },
        {
          name: "Queenstown Adventure Sports",
          description: "The adventure capital of the world, offering bungee jumping, skydiving, and extreme sports.",
          url: "https://queenstown.com"
        }
      ],
      events: [
        {
          name: "Waitangi Day",
          dates: "February 6",
          description: "New Zealand's national day celebrating the signing of the Treaty of Waitangi with cultural performances."
        },
        {
          name: "Matariki",
          dates: "June/July",
          description: "Māori New Year celebration with traditional ceremonies and cultural events."
        }
      ],
      local_insights: [
        {
          source: "Local Guide",
          tip: "Book popular hikes like Tongariro Crossing well in advance, especially during peak season"
        },
        {
          source: "Travel Blog",
          tip: "Rent a campervan for the ultimate Kiwi experience and flexibility to explore remote areas"
        }
      ],
      reasoning: "Your high activity level and preference for adventure activities align perfectly with New Zealand's world-renowned outdoor activities and extreme sports scene."
    }
  ];

  const handleGenerateItinerary = async (locationName: string) => {
    setGeneratingItinerary(true);
    setSelectedLocation(locationName);

    // Simulate API call delay
    setTimeout(() => {
      const mockItinerary: MockItinerary = {
        locationName,
        itineraryData: {
          morning: locationName === "Bali" 
            ? "Start your day with a sunrise yoga session at a traditional Balinese compound, followed by a healthy breakfast of tropical fruits and local coffee. Then head to the Sacred Monkey Forest for an early morning visit to avoid crowds and capture the mystical atmosphere."
            : locationName === "Costa Rica"
            ? "Begin with a guided birdwatching tour in the cloud forest, spotting colorful toucans and quetzals. Enjoy a traditional Costa Rican breakfast of gallo pinto with fresh tropical fruits before embarking on a canopy tour with zip lines through the rainforest."
            : "Start with an early morning hike to the top of Mount Cook for breathtaking sunrise views. Enjoy a hearty breakfast at a local café before heading to the adventure capital for your first adrenaline-pumping activity of the day.",
          afternoon: locationName === "Bali"
            ? "Visit the iconic Tanah Lot Temple during low tide for the best photo opportunities. Enjoy a traditional Balinese lunch at a local warung, then take a cooking class to learn how to prepare authentic Indonesian dishes using fresh local ingredients."
            : locationName === "Costa Rica"
            ? "Explore the Arenal Volcano National Park with a guided hike through lava fields and rainforest trails. Stop for a refreshing swim in natural hot springs, then enjoy a traditional casado lunch with rice, beans, and fresh fish."
            : "Embark on the famous Tongariro Alpine Crossing, a challenging but rewarding hike through volcanic landscapes. Marvel at the emerald lakes and steam vents, then enjoy a well-deserved lunch at the summit with panoramic views.",
          evening: locationName === "Bali"
            ? "Experience a traditional Kecak dance performance at sunset, followed by a romantic dinner at a beachfront restaurant. End your day with a relaxing Balinese massage and meditation session under the stars."
            : locationName === "Costa Rica"
            ? "Take a guided night walk in the rainforest to spot nocturnal wildlife like sloths and frogs. Enjoy dinner at a local sodas (traditional restaurant) with live music, then relax in natural hot springs under the starlit sky."
            : "Return to Queenstown for an evening of adventure sports - try bungee jumping or skydiving for an adrenaline rush. Enjoy dinner at a local pub with craft beer and live music, sharing stories with fellow travelers."
        },
        activities: {
          main_attractions: mockRecommendations.find(r => r.locationName === locationName)?.main_attractions || [],
          events: mockRecommendations.find(r => r.locationName === locationName)?.events || [],
          local_insights: mockRecommendations.find(r => r.locationName === locationName)?.local_insights || []
        },
        total_cost: {
          total: locationName === "Bali" ? 3200 : locationName === "Costa Rica" ? 3800 : 5200
        },
        travel_tips: [
          "Book popular attractions in advance, especially during peak season",
          "Pack layers for changing weather conditions",
          "Learn basic local phrases to enhance your experience",
          "Consider hiring local guides for authentic experiences",
          "Respect local customs and traditions"
        ]
      };

      setItinerary(mockItinerary);
      setGeneratingItinerary(false);
    }, 2000);
  };

  const handleResetQuiz = () => {
    // Clear any stored data and redirect to home
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Your Travel Personality Results
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Based on your responses, here are your personalized travel recommendations
          </p>
        </div>

        {/* User Preferences */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Your Travel Style
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(mockUserPreferences).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className="text-gray-600 mt-1">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Travel Recommendations */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Recommended Destinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRecommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {recommendation.locationName}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {recommendation.country}
                </p>
                <p className="text-gray-700 mb-4">
                  {recommendation.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium">{recommendation.estimatedBudgetRange}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Best Time:</span>
                    <span className="font-medium">{recommendation.bestTimeToVisit}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleGenerateItinerary(recommendation.locationName)}
                  disabled={generatingItinerary}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {generatingItinerary && selectedLocation === recommendation.locationName
                    ? "Generating Itinerary..."
                    : "Generate Itinerary"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Generated Itinerary */}
        {itinerary && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Your Itinerary for {itinerary.locationName}
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-bold text-yellow-800 mb-2">Morning</h3>
                  <p className="text-yellow-700">{itinerary.itineraryData.morning}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="font-bold text-orange-800 mb-2">Afternoon</h3>
                  <p className="text-orange-700">{itinerary.itineraryData.afternoon}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-bold text-purple-800 mb-2">Evening</h3>
                  <p className="text-purple-700">{itinerary.itineraryData.evening}</p>
                </div>
              </div>

              {/* Key Attractions */}
              {itinerary.activities.main_attractions.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Key Attractions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {itinerary.activities.main_attractions.map((attraction, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-2">{attraction.name}</h4>
                        <p className="text-gray-600 text-sm">{attraction.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Local Insights */}
              {itinerary.activities.local_insights.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Local Insights</h3>
                  <div className="space-y-3">
                    {itinerary.activities.local_insights.map((insight, index) => (
                      <div key={index} className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium mb-1">Source: {insight.source}</p>
                        <p className="text-gray-700">{insight.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cost Estimate */}
              {itinerary.total_cost && (
                <div className="mt-6 bg-green-50 rounded-lg p-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Estimated Total Cost</h3>
                  <p className="text-2xl font-bold text-green-600">${itinerary.total_cost.total.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-1">Includes flights, accommodation, activities, and meals</p>
                </div>
              )}

              {/* Travel Tips */}
              {itinerary.travel_tips && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Travel Tips</h3>
                  <ul className="space-y-2">
                    {itinerary.travel_tips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center space-x-4">
          <button
            onClick={handleResetQuiz}
            className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Start Over
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
