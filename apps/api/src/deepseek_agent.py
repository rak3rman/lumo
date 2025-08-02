#!/usr/bin/env python3
"""
Enhanced DeepSeek Agent for Lumo Travel Recommendation System 
Handles personality quiz responses and generates user preferences
Includes real web scraping for activities and local insights
"""

import os
import json
import sys
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from openai import OpenAI

# Import scrapers
try:
    from scrapers.scraper_manager import ScraperManager
    SCRAPERS_AVAILABLE = True
except ImportError:
    print("⚠️  Scrapers not available, using fallback data")
    SCRAPERS_AVAILABLE = False

@dataclass
class QuizResponse:
    question_number: int
    question_text: str
    selected_option: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str

@dataclass
class UserPreferences:
    user_id: str
    travel_style: str
    preferred_activities: List[str]
    accommodation_preference: str
    budget_priority: str
    pace_preference: str
    food_preference: str
    social_preference: str
    adventure_level: str
    cultural_interest: str

class DeepSeekAgent:
    def __init__(self, api_key: str):
        """Initialize the DeepSeek agent with API key"""
        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com"
        )
        
        # Initialize scraper manager if available
        if SCRAPERS_AVAILABLE:
            self.scraper_manager = ScraperManager()
        else:
            self.scraper_manager = None
        
        # Top travel destinations by category
        self.top_destinations = {
            "cultural": ["Kyoto, Japan", "Rome, Italy", "Istanbul, Turkey", "Marrakech, Morocco", "Varanasi, India"],
            "adventure": ["Reykjavik, Iceland", "Queenstown, New Zealand", "Banff, Canada", "Interlaken, Switzerland", "Patagonia, Chile"],
            "relaxed": ["Bali, Indonesia", "Santorini, Greece", "Maldives", "Tuscany, Italy", "Kyoto, Japan"],
            "luxury": ["Dubai, UAE", "Singapore", "Tokyo, Japan", "Paris, France", "New York, USA"],
            "budget": ["Bangkok, Thailand", "Hanoi, Vietnam", "Mexico City, Mexico", "Budapest, Hungary", "Porto, Portugal"],
            "food": ["Tokyo, Japan", "Bangkok, Thailand", "Paris, France", "Istanbul, Turkey", "Mexico City, Mexico"],
            "nature": ["Banff, Canada", "Interlaken, Switzerland", "Queenstown, New Zealand", "Reykjavik, Iceland", "Patagonia, Chile"]
        }
    
    def scrape_activities(self, location: str) -> Dict[str, Any]:
        """
        Scrape activities and local insights for a destination
        """
        if self.scraper_manager:
            try:
                print(f"🔍 Scraping real data for {location}...")
                location_data = self.scraper_manager.get_comprehensive_location_data(location)
                
                return {
                    "main_attractions": location_data.get('attractions', []),
                    "local_insights": location_data.get('local_insights', {}),
                    "events": location_data.get('events', []),
                    "weather": location_data.get('weather', {}),
                    "transportation": location_data.get('transportation', {}),
                    "restaurants": location_data.get('restaurants', {}),
                    "best_time_to_visit": location_data.get('best_time_to_visit', {}),
                    "source": "Real-time scraping"
                }
            except Exception as e:
                print(f"Error scraping data for {location}: {e}")
                return self._get_fallback_activities(location)
        else:
            return self._get_fallback_activities(location)
    
    def _get_fallback_activities(self, location: str) -> Dict[str, Any]:
        """
        Get fallback activities data when scrapers are not available
        """
        # Fallback data for common destinations
        fallback_data = {
            "Kyoto, Japan": {
                "main_attractions": [
                    {"name": "Fushimi Inari Shrine", "url": "https://www.tripadvisor.com/Attraction_Review-g298564-d324859", "description": "Famous shrine with thousands of torii gates"},
                    {"name": "Arashiyama Bamboo Grove", "url": "https://www.tripadvisor.com/Attraction_Review-g298564-d324860", "description": "Serene bamboo forest path"},
                    {"name": "Kinkaku-ji (Golden Pavilion)", "url": "https://www.tripadvisor.com/Attraction_Review-g298564-d324861", "description": "Stunning golden temple"}
                ],
                "local_insights": [
                    {"source": "Reddit r/JapanTravel", "tip": "Visit Fushimi Inari early morning (6-7am) to avoid crowds"},
                    {"source": "Local Blog", "tip": "Try the hidden tea house in Arashiyama - locals only know about it"},
                    {"source": "Reddit r/Kyoto", "tip": "Best ramen is at Ichiran near Kyoto Station, not the tourist spots"}
                ],
                "events": [
                    {"name": "Gion Matsuri Festival", "dates": "July", "description": "Traditional festival with parades"},
                    {"name": "Cherry Blossom Season", "dates": "Late March-Early April", "description": "Hanami parties in Maruyama Park"}
                ]
            },
            "Reykjavik, Iceland": {
                "main_attractions": [
                    {"name": "Blue Lagoon", "url": "https://www.tripadvisor.com/Attraction_Review-g189970-d324862", "description": "Famous geothermal spa"},
                    {"name": "Golden Circle", "url": "https://www.tripadvisor.com/Attraction_Review-g189970-d324863", "description": "Geysers, waterfalls, and national park"},
                    {"name": "Northern Lights", "url": "https://www.tripadvisor.com/Attraction_Review-g189970-d324864", "description": "Aurora borealis viewing"}
                ],
                "local_insights": [
                    {"source": "Reddit r/Iceland", "tip": "Skip Blue Lagoon, go to Sky Lagoon instead - locals prefer it"},
                    {"source": "Local Guide", "tip": "Best hot dogs at Bæjarins Beztu Pylsur - Bill Clinton ate here"},
                    {"source": "Reddit r/VisitingIceland", "tip": "Rent a car to see Northern Lights away from city lights"}
                ],
                "events": [
                    {"name": "Northern Lights Season", "dates": "September-March", "description": "Best aurora viewing"},
                    {"name": "Iceland Airwaves", "dates": "November", "description": "Music festival with local bands"}
                ]
            },
            "Bali, Indonesia": {
                "main_attractions": [
                    {"name": "Ubud Sacred Monkey Forest", "url": "https://www.tripadvisor.com/Attraction_Review-g297701-d324865", "description": "Temple complex with monkeys"},
                    {"name": "Tegallalang Rice Terraces", "url": "https://www.tripadvisor.com/Attraction_Review-g297701-d324866", "description": "Stunning rice paddies"},
                    {"name": "Tanah Lot Temple", "url": "https://www.tripadvisor.com/Attraction_Review-g297701-d324867", "description": "Sea temple on rock formation"}
                ],
                "local_insights": [
                    {"source": "Reddit r/bali", "tip": "Skip Kuta, stay in Ubud or Canggu for authentic experience"},
                    {"source": "Local Blog", "tip": "Best warung (local restaurant) is Warung Babi Guling Ibu Oka"},
                    {"source": "Reddit r/indonesia", "tip": "Learn basic Indonesian - locals appreciate the effort"}
                ],
                "events": [
                    {"name": "Nyepi (Day of Silence)", "dates": "March", "description": "Bali's most important holiday"},
                    {"name": "Galungan Festival", "dates": "Every 210 days", "description": "Celebration of good over evil"}
                ]
            }
        }
        
        return fallback_data.get(location, {
            "main_attractions": [],
            "local_insights": [],
            "events": []
        })
    
    def parse_responses_string(self, responses_string: str) -> List[QuizResponse]:
        """
        Parse the concatenated responses string into individual responses
        Format: "1:A,2:B,3:C,4:D,5:A,6:B,7:C,8:D,9:A,10:B"
        """
        if not responses_string:
            return []
        
        # Quiz questions (dream-inspired, hardcoded to match the API)
        questions = [
            ("You're walking with no destination. What's the weather like?", "Crisp and misty", "Dry heat with a golden sun", "A cozy drizzle", "Warm, breezy night air"),
            ("You come across a door in the middle of nowhere. What color is it?", "Emerald green", "Terracotta red", "Ocean blue", "Matte black"),
            ("You step through and hear...", "Waves crashing", "Distant music and laughter", "Wind moving through trees", "Silence"),
            ("A stranger hands you something for your journey. What is it?", "A hand-drawn map", "A polaroid camera", "A playlist", "A warm drink in a thermos"),
            ("You're suddenly hungry. What's the first thing you crave?", "Fresh fruit, just picked", "Street food in a paper wrapper", "Something hot from a local café", "A full-course meal shared at a long table"),
            ("You're invited to join a group. You…", "Jump in — the more the merrier", "Join for a bit, then wander solo", "Politely decline and keep exploring", "Stay nearby, watching from a distance"),
            ("As night falls, you find the perfect spot to rest. What surrounds you?", "A quiet cabin under stars", "Rooftop views of a glowing city", "A hammock between two palm trees", "A cozy inn with candles and books"),
            ("The sky lights up with color. You realize you're...", "On top of a mountain", "In the middle of a festival", "Floating on water", "Alone, smiling"),
            ("You wake up in a new place. What do you reach for first?", "A guidebook", "Your camera", "A fresh outfit", "Nothing — you take it all in"),
            ("A whisper asks: \"Want to stay a little longer?\" You…", "Say yes before they finish the sentence", "Ask what's next", "Say, \"Only if I can bring someone with me\"", "Smile and walk toward the next dream")
        ]
        
        responses = []
        response_parts = responses_string.split(',')
        
        for part in response_parts:
            if ':' in part:
                question_num_str, selected_option = part.split(':')
                question_number = int(question_num_str)
                
                if 1 <= question_number <= len(questions):
                    question_text, option_a, option_b, option_c, option_d = questions[question_number - 1]
                    responses.append(QuizResponse(
                        question_number=question_number,
                        question_text=question_text,
                        selected_option=selected_option,
                        option_a=option_a,
                        option_b=option_b,
                        option_c=option_c,
                        option_d=option_d
                    ))
        
        return responses
    
    def analyze_quiz_response(self, response: QuizResponse) -> Dict[str, Any]:
        """
        Analyze a single quiz response and provide reasoning
        """
        prompt = f"""
        Analyze this dream-inspired personality quiz response and provide insights about the user's travel preferences.
        
        Question: {response.question_text}
        Option A: {response.option_a}
        Option B: {response.option_b}
        Option C: {response.option_c}
        Option D: {response.option_d}
        User's Choice: {response.selected_option}
        
        Please provide:
        1. Brief reasoning for why this choice was made
        2. What this reveals about their travel personality and dream preferences
        3. How this might influence travel recommendations
        
        Respond in JSON format with keys: reasoning, personality_insight, travel_implications
        """
        
        try:
            completion = self.client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "You are a travel psychology expert analyzing dream-inspired personality quiz responses."},
                    {"role": "user", "content": prompt}
                ],
                stream=False
            )
            
            response_text = completion.choices[0].message.content
            # Try to parse as JSON, fallback to text if needed
            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                return {
                    "reasoning": response_text,
                    "personality_insight": "Analysis provided",
                    "travel_implications": "Will be considered in recommendations"
                }
                
        except Exception as e:
            print(f"Error analyzing quiz response: {e}")
            return {
                "reasoning": "Analysis unavailable",
                "personality_insight": "Unable to analyze",
                "travel_implications": "Will use default preferences"
            }
    
    def generate_user_preferences(self, user_id: str, responses: List[QuizResponse]) -> UserPreferences:
        """
        Generate comprehensive user preferences from dream-inspired quiz responses
        """
        # Analyze all responses
        analyses = []
        for response in responses:
            analysis = self.analyze_quiz_response(response)
            analyses.append({
                "question": response.question_text,
                "choice": response.selected_option,
                "analysis": analysis
            })
        
        # Enhanced prompt for better preference generation
        prompt = f"""
        Based on these dream-inspired personality quiz responses and analyses, generate a comprehensive user profile for travel recommendations.
        
        Quiz Responses and Analyses:
        {json.dumps(analyses, indent=2)}
        
        These questions are designed to reveal travel preferences through dream scenarios. Please generate a detailed user preferences profile in JSON format with the following structure:
        {{
            "travel_style": "Choose from: cultural, adventure, relaxed, luxury, budget, food, nature",
            "preferred_activities": ["list", "of", "specific", "activities"],
            "accommodation_preference": "e.g., luxury hotels, boutique hotels, hostels, homestays, cabins, rooftop stays",
            "budget_priority": "e.g., luxury, mid-range, budget-conscious",
            "pace_preference": "e.g., fast-paced, moderate, relaxed, dreamy",
            "food_preference": "e.g., local cuisine, familiar food, fine dining, street food, fresh produce",
            "social_preference": "e.g., group activities, solo exploration, intimate experiences, social gatherings",
            "adventure_level": "e.g., high, moderate, low",
            "cultural_interest": "e.g., high, moderate, low"
        }}
        
        Make sure the preferences are consistent with the dream-inspired quiz responses and provide realistic, actionable insights for travel planning.
        Focus on creating a profile that will help recommend from the world's top travel destinations.
        """
        
        try:
            completion = self.client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "You are a travel recommendation expert creating user profiles from dream-inspired personality assessments."},
                    {"role": "user", "content": prompt}
                ],
                stream=False
            )
            
            response_text = completion.choices[0].message.content
            preferences_data = json.loads(response_text)
            
            return UserPreferences(
                user_id=user_id,
                travel_style=preferences_data.get("travel_style", "balanced"),
                preferred_activities=preferences_data.get("preferred_activities", []),
                accommodation_preference=preferences_data.get("accommodation_preference", "moderate"),
                budget_priority=preferences_data.get("budget_priority", "mid-range"),
                pace_preference=preferences_data.get("pace_preference", "moderate"),
                food_preference=preferences_data.get("food_preference", "mixed"),
                social_preference=preferences_data.get("social_preference", "flexible"),
                adventure_level=preferences_data.get("adventure_level", "moderate"),
                cultural_interest=preferences_data.get("cultural_interest", "moderate")
            )
            
        except Exception as e:
            print(f"Error generating user preferences: {e}")
            # Return default preferences
            return UserPreferences(
                user_id=user_id,
                travel_style="balanced",
                preferred_activities=["sightseeing", "dining", "cultural experiences"],
                accommodation_preference="moderate",
                budget_priority="mid-range",
                pace_preference="moderate",
                food_preference="mixed",
                social_preference="flexible",
                adventure_level="moderate",
                cultural_interest="moderate"
            )
    
    def suggest_travel_locations(self, preferences: UserPreferences) -> List[Dict[str, Any]]:
        """
        Suggest travel locations based on user preferences from dream-inspired quiz
        Enhanced with real scraping data
        """
        # Get relevant top destinations based on travel style
        travel_style = preferences.travel_style.lower()
        relevant_destinations = self.top_destinations.get(travel_style, self.top_destinations["cultural"])
        
        # Enhanced prompt for better recommendations
        prompt = f"""
        Based on these user preferences from a dream-inspired personality quiz, suggest 3-5 travel destinations from this curated list of top global destinations:
        
        Available Top Destinations: {', '.join(relevant_destinations)}
        
        User Preferences:
        - Travel Style: {preferences.travel_style}
        - Preferred Activities: {', '.join(preferences.preferred_activities)}
        - Accommodation: {preferences.accommodation_preference}
        - Budget: {preferences.budget_priority}
        - Pace: {preferences.pace_preference}
        - Food: {preferences.food_preference}
        - Social: {preferences.social_preference}
        - Adventure Level: {preferences.adventure_level}
        - Cultural Interest: {preferences.cultural_interest}
        
        These preferences were derived from dream scenarios, so consider destinations that match the dreamy, intuitive nature of the quiz.
        
        For each destination, provide:
        - Name and country
        - Brief description of why it's perfect for this dream-inspired traveler
        - Best time to visit
        - Estimated budget range
        - Key attractions/experiences that match their dream preferences
        - Local insights and hidden gems
        
        Respond in JSON format with an array of destinations. Focus on providing actionable, specific recommendations with real activities and local knowledge.
        """
        
        try:
            completion = self.client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "You are a travel expert suggesting personalized destinations from top global locations based on dream-inspired personality assessments."},
                    {"role": "user", "content": prompt}
                ],
                stream=False
            )
            
            response_text = completion.choices[0].message.content
            recommendations = json.loads(response_text)
            
            # Enhance recommendations with real scraped data
            enhanced_recommendations = []
            for rec in recommendations:
                location_name = rec.get("name", rec.get("locationName", ""))
                if location_name:
                    # Get real scraped data for this location
                    activities = self.scrape_activities(location_name)
                    rec["activities"] = activities
                    rec["main_attractions"] = activities.get("main_attractions", [])
                    rec["local_insights"] = activities.get("local_insights", [])
                    rec["events"] = activities.get("events", [])
                    rec["weather"] = activities.get("weather", {})
                    rec["best_time_to_visit"] = activities.get("best_time_to_visit", {})
                
                enhanced_recommendations.append(rec)
            
            return enhanced_recommendations
            
        except Exception as e:
            print(f"Error suggesting travel locations: {e}")
            return []
    
    def generate_itinerary(self, location: str, preferences: UserPreferences) -> Dict[str, Any]:
        """
        Generate a detailed 1-day itinerary for a specific location based on dream-inspired preferences
        Enhanced with real scraped data and realistic timing
        """
        # Get real scraped data for the location
        activities = self.scrape_activities(location)
        
        prompt = f"""
        Create a detailed 1-day itinerary for {location} based on these user preferences from a dream-inspired personality quiz:
        
        - Travel Style: {preferences.travel_style}
        - Preferred Activities: {', '.join(preferences.preferred_activities)}
        - Food Preference: {preferences.food_preference}
        - Pace: {preferences.pace_preference}
        - Adventure Level: {preferences.adventure_level}
        
        Available Real Scraped Data:
        {json.dumps(activities, indent=2)}
        
        Since these preferences come from dream scenarios, consider creating an itinerary that feels magical and dreamy while being practical.
        
        Create a DETAILED hourly schedule with the following format:
        
        MORNING (6:00 AM - 12:00 PM):
        6:00-7:00 AM: [Activity] - [Specific location/address] - [Duration: 1 hour]
        7:00-7:30 AM: Travel to [Next location] via [Transportation method] - [Duration: 30 minutes]
        7:30-9:00 AM: [Activity] - [Specific location/address] - [Duration: 1.5 hours]
        9:00-9:15 AM: Travel to [Next location] via [Transportation method] - [Duration: 15 minutes]
        9:15-11:00 AM: [Activity] - [Specific location/address] - [Duration: 1.75 hours]
        11:00-11:30 AM: Travel to [Lunch location] via [Transportation method] - [Duration: 30 minutes]
        11:30-12:30 PM: Lunch at [Restaurant name] - [Specific address] - [Duration: 1 hour]
        
        AFTERNOON (12:30 PM - 6:00 PM):
        12:30-1:00 PM: Travel to [Next location] via [Transportation method] - [Duration: 30 minutes]
        1:00-3:00 PM: [Activity] - [Specific location/address] - [Duration: 2 hours]
        3:00-3:15 PM: Travel to [Next location] via [Transportation method] - [Duration: 15 minutes]
        3:15-5:00 PM: [Activity] - [Specific location/address] - [Duration: 1.75 hours]
        5:00-5:30 PM: Travel to [Evening location] via [Transportation method] - [Duration: 30 minutes]
        5:30-6:00 PM: [Evening activity] - [Specific location/address] - [Duration: 30 minutes]
        
        EVENING (6:00 PM - 10:00 PM):
        6:00-7:30 PM: Dinner at [Restaurant name] - [Specific address] - [Duration: 1.5 hours]
        7:30-8:00 PM: Travel to [Evening activity] via [Transportation method] - [Duration: 30 minutes]
        8:00-10:00 PM: [Evening activity] - [Specific location/address] - [Duration: 2 hours]
        
        Include:
        - SPECIFIC TIMES for each activity (hourly breakdown)
        - REALISTIC DURATIONS based on activity type
        - EXACT LOCATIONS and addresses where possible
        - TRANSPORTATION METHODS (walking, bus, train, taxi, etc.)
        - TRAVEL TIMES between locations
        - RESTAURANT NAMES and addresses for meals
        - LOCAL HIDDEN GEMS that tourists don't know about
        - WEATHER-AWARE suggestions (indoor/outdoor based on conditions)
        - CROWD DENSITY considerations (avoid peak times)
        - CULTURAL EXPERIENCES that match their personality
        - DREAMY, ATMOSPHERIC locations that match their dream preferences
        - SPECIFIC URLs and local tips from the provided activities data
        
        Make sure the schedule is:
        1. REALISTIC - Don't cram too much in one day
        2. LOGICAL - Group activities by area to minimize travel time
        3. PERSONALIZED - Match their travel style and preferences
        4. PRACTICAL - Include realistic travel times and rest periods
        5. AUTHENTIC - Use local insights and hidden gems
        
        Structure the response as a detailed hourly itinerary with times, activities, locations, and explanations for why each choice was made.
        """
        
        try:
            completion = self.client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "You are a local travel expert creating detailed hourly itineraries based on dream-inspired personality assessments and real local knowledge. Focus on creating realistic, well-paced schedules with proper timing and travel logistics."},
                    {"role": "user", "content": prompt}
                ],
                stream=False
            )
            
            response_text = completion.choices[0].message.content
            return {"itinerary": response_text, "location": location, "activities": activities}
            
        except Exception as e:
            print(f"Error generating itinerary: {e}")
            return {"error": "Unable to generate itinerary", "location": location}

def create_sample_responses() -> List[QuizResponse]:
    """
    Create sample responses for testing
    """
    questions = [
        ("You're walking with no destination. What's the weather like?", "Crisp and misty", "Dry heat with a golden sun", "A cozy drizzle", "Warm, breezy night air"),
        ("You come across a door in the middle of nowhere. What color is it?", "Emerald green", "Terracotta red", "Ocean blue", "Matte black"),
        ("You step through and hear...", "Waves crashing", "Distant music and laughter", "Wind moving through trees", "Silence"),
        ("A stranger hands you something for your journey. What is it?", "A hand-drawn map", "A polaroid camera", "A playlist", "A warm drink in a thermos"),
        ("You're suddenly hungry. What's the first thing you crave?", "Fresh fruit, just picked", "Street food in a paper wrapper", "Something hot from a local café", "A full-course meal shared at a long table"),
        ("You're invited to join a group. You…", "Jump in — the more the merrier", "Join for a bit, then wander solo", "Politely decline and keep exploring", "Stay nearby, watching from a distance"),
        ("As night falls, you find the perfect spot to rest. What surrounds you?", "A quiet cabin under stars", "Rooftop views of a glowing city", "A hammock between two palm trees", "A cozy inn with candles and books"),
        ("The sky lights up with color. You realize you're...", "On top of a mountain", "In the middle of a festival", "Floating on water", "Alone, smiling"),
        ("You wake up in a new place. What do you reach for first?", "A guidebook", "Your camera", "A fresh outfit", "Nothing — you take it all in"),
        ("A whisper asks: \"Want to stay a little longer?\" You…", "Say yes before they finish the sentence", "Ask what's next", "Say, \"Only if I can bring someone with me\"", "Smile and walk toward the next dream")
    ]
    
    # Create sample responses (you can modify these)
    sample_choices = ["A", "B", "C", "D", "A", "B", "C", "D", "A", "B"]
    
    responses = []
    for i, (question_text, option_a, option_b, option_c, option_d) in enumerate(questions, 1):
        responses.append(QuizResponse(
            question_number=i,
            question_text=question_text,
            selected_option=sample_choices[i-1],
            option_a=option_a,
            option_b=option_b,
            option_c=option_c,
            option_d=option_d
        ))
    
    return responses

def handle_api_call(method: str, data: str):
    """Handle API calls from the Node.js server"""
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        return json.dumps({"error": "DEEPSEEK_API_KEY not set"})
    
    agent = DeepSeekAgent(api_key)
    
    try:
        parsed_data = json.loads(data)
        
        if method == "analyze_response":
            response = QuizResponse(**parsed_data)
            result = agent.analyze_quiz_response(response)
            return json.dumps(result)
            
        elif method == "generate_preferences":
            user_id = parsed_data["userId"]
            responses_data = parsed_data["responses"]
            responses = [QuizResponse(**r) for r in responses_data]
            result = agent.generate_user_preferences(user_id, responses)
            return json.dumps({
                "userId": result.user_id,
                "travelStyle": result.travel_style,
                "preferredActivities": result.preferred_activities,
                "accommodationPreference": result.accommodation_preference,
                "budgetPriority": result.budget_priority,
                "pacePreference": result.pace_preference,
                "foodPreference": result.food_preference,
                "socialPreference": result.social_preference,
                "adventureLevel": result.adventure_level,
                "culturalInterest": result.cultural_interest
            })
            
        elif method == "suggest_locations":
            preferences = UserPreferences(**parsed_data)
            result = agent.suggest_travel_locations(preferences)
            return json.dumps(result)
            
        elif method == "generate_itinerary":
            location = parsed_data["location"]
            preferences = UserPreferences(**parsed_data["preferences"])
            result = agent.generate_itinerary(location, preferences)
            return json.dumps(result)
            
        else:
            return json.dumps({"error": f"Unknown method: {method}"})
            
    except Exception as e:
        return json.dumps({"error": str(e)})

def main():
    """Main function - handle command line arguments or run standalone test"""
    if len(sys.argv) > 1:
        # API call mode
        method = sys.argv[1]
        data = sys.argv[2] if len(sys.argv) > 2 else "{}"
        result = handle_api_call(method, data)
        print(result)
    else:
        """Standalone test of the Enhanced DeepSeek agent"""
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            print("❌ DEEPSEEK_API_KEY not set!")
            print("Please set your DeepSeek API key:")
            print("export DEEPSEEK_API_KEY='your_api_key_here'")
            return
        
        print("🚀 Starting Enhanced DeepSeek Agent Test (Standalone)")
        print("=" * 60)
        
        agent = DeepSeekAgent(api_key)
        
        # Create sample responses
        print("📝 Creating sample dream-inspired responses...")
        responses = create_sample_responses()
        
        print(f"✅ Created {len(responses)} sample responses")
        print("\nSample responses:")
        for response in responses[:3]:  # Show first 3
            print(f"  Q{response.question_number}: {response.selected_option} - {response.question_text[:50]}...")
        
        # Generate preferences
        print("\n🤖 Generating user preferences with DeepSeek...")
        user_id = "test-user"
        preferences = agent.generate_user_preferences(user_id, responses)
        
        print("\n✨ Generated User Preferences:")
        print(f"  Travel Style: {preferences.travel_style}")
        print(f"  Preferred Activities: {', '.join(preferences.preferred_activities)}")
        print(f"  Accommodation: {preferences.accommodation_preference}")
        print(f"  Budget Priority: {preferences.budget_priority}")
        print(f"  Pace Preference: {preferences.pace_preference}")
        print(f"  Food Preference: {preferences.food_preference}")
        print(f"  Social Preference: {preferences.social_preference}")
        print(f"  Adventure Level: {preferences.adventure_level}")
        print(f"  Cultural Interest: {preferences.cultural_interest}")
        
        # Suggest locations
        print("\n🌍 Suggesting travel locations...")
        locations = agent.suggest_travel_locations(preferences)
        print(f"✅ Found {len(locations)} suggested locations")
        
        if locations:
            print("\n📍 Top Suggested Locations:")
            for i, location in enumerate(locations[:3], 1):
                print(f"  {i}. {location.get('name', 'Unknown')} - {location.get('description', 'No description')[:100]}...")
                if 'activities' in location:
                    print(f"     Activities: {len(location['activities'].get('main_attractions', []))} attractions found")
        
        # Generate sample itinerary
        if locations:
            print("\n📅 Generating sample itinerary...")
            sample_location = locations[0].get("name", "Kyoto")
            itinerary = agent.generate_itinerary(sample_location, preferences)
            
            print(f"\n🎯 Sample Itinerary for {sample_location}:")
            print("-" * 60)
            print(itinerary.get("itinerary", "Unable to generate"))
        
        print("\n✅ Enhanced DeepSeek Agent test completed successfully!")
        print("\n💡 To test with different responses, modify the 'sample_choices' in create_sample_responses()")

if __name__ == "__main__":
    main() 