#!/usr/bin/env python3
"""
Scraper Manager for Lumo Travel Recommendations
Combines data from multiple scrapers for comprehensive location information
"""

import time
from typing import Dict, List, Any
from .wikipedia import WikipediaScraper
from .reddit import RedditScraper
from .weather import WeatherScraper
from .transportation import TransportationScraper
import sys
import json

class ScraperManager:
    def __init__(self):
        self.wikipedia_scraper = WikipediaScraper()
        self.reddit_scraper = RedditScraper()
        self.weather_scraper = WeatherScraper()
        self.transportation_scraper = TransportationScraper()
        self.cache = {}
        self.cache_duration = 3600  # 1 hour
    
    def get_comprehensive_location_data(self, location: str) -> Dict[str, Any]:
        """
        Get comprehensive data for a location from all scrapers
        """
        # Check cache first
        cache_key = f"location_{location}"
        if cache_key in self.cache:
            cached_time, cached_data = self.cache[cache_key]
            if time.time() - cached_time < self.cache_duration:
                print(f"📋 Using cached data for {location}")
                return cached_data
        
        print(f"🔍 Scraping comprehensive data for {location}...")
        
        # Get data from all scrapers
        attractions_data = self._get_attractions(location)
        local_insights = self._get_local_insights(location)
        events = self._get_events(location)
        weather = self._get_weather(location)
        transportation = self._get_transportation(location)
        restaurants = self._get_restaurants(location)
        best_time = self._get_best_time(location)
        
        data = {
            "location": location,
            "attractions": attractions_data,
            "local_insights": local_insights,
            "events": events,
            "weather": weather,
            "transportation": transportation,
            "restaurants": restaurants,
            "best_time_to_visit": best_time,
            "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Cache the data
        self.cache[cache_key] = (time.time(), data)
        
        return data
    
    def _get_attractions(self, location: str) -> List[Dict[str, Any]]:
        """Get attractions from Wikipedia"""
        try:
            result = self.wikipedia_scraper.get_location_attractions(location)
            return result.get('attractions', [])
        except Exception as e:
            print(f"Error getting attractions for {location}: {e}")
            return []
    
    def _get_local_insights(self, location: str) -> List[Dict[str, Any]]:
        """Get local insights from Wikipedia and Reddit"""
        insights = []
        
        try:
            # Get from Wikipedia
            wikipedia_result = self.wikipedia_scraper.get_location_attractions(location)
            insights.extend(wikipedia_result.get('local_insights', []))
        except Exception as e:
            print(f"Error getting Wikipedia insights for {location}: {e}")
        
        try:
            # Get from Reddit
            reddit_insights = self.reddit_scraper.search_local_tips(location)
            insights.extend(reddit_insights)
        except Exception as e:
            print(f"Error getting Reddit insights for {location}: {e}")
        
        return insights[:10]  # Limit to top 10 insights
    
    def _get_events(self, location: str) -> List[Dict[str, Any]]:
        """Get events from Reddit"""
        try:
            return self.reddit_scraper.get_events_info(location)
        except Exception as e:
            print(f"Error getting events for {location}: {e}")
            return []
    
    def _get_weather(self, location: str) -> Dict[str, Any]:
        """Get weather information"""
        try:
            current_weather = self.weather_scraper.get_current_weather(location)
            forecast = self.weather_scraper.get_weather_forecast(location)
            
            return {
                "current": current_weather.get('current', {}),
                "forecast": forecast.get('forecast', []),
                "source": current_weather.get('source', 'Unknown')
            }
        except Exception as e:
            print(f"Error getting weather for {location}: {e}")
            return {}
    
    def _get_transportation(self, location: str) -> Dict[str, Any]:
        """Get transportation information"""
        try:
            return self.transportation_scraper.get_transportation_info(location)
        except Exception as e:
            print(f"Error getting transportation for {location}: {e}")
            return {}
    
    def _get_restaurants(self, location: str) -> Dict[str, List[Dict[str, Any]]]:
        """Get restaurant recommendations"""
        try:
            return {
                "local": self.transportation_scraper.get_restaurant_recommendations(location, "local"),
                "casual": self.transportation_scraper.get_restaurant_recommendations(location, "casual")
            }
        except Exception as e:
            print(f"Error getting restaurants for {location}: {e}")
            return {"local": [], "casual": []}
    
    def _get_best_time(self, location: str) -> Dict[str, Any]:
        """Get best time to visit"""
        try:
            return self.weather_scraper.get_best_time_to_visit(location)
        except Exception as e:
            print(f"Error getting best time for {location}: {e}")
            return {}
    
    def get_enhanced_recommendations(self, location: str, user_preferences: Dict) -> Dict[str, Any]:
        """
        Get enhanced recommendations filtered by user preferences
        """
        location_data = self.get_comprehensive_location_data(location)
        
        # Filter attractions by preferences
        filtered_attractions = self._filter_attractions_by_preferences(
            location_data['attractions'], user_preferences
        )
        
        # Filter insights by preferences
        filtered_insights = self._filter_insights_by_preferences(
            location_data['local_insights'], user_preferences
        )
        
        return {
            "location": location,
            "attractions": filtered_attractions,
            "local_insights": filtered_insights,
            "weather": location_data['weather'],
            "transportation": location_data['transportation'],
            "restaurants": location_data['restaurants'],
            "events": location_data['events'],
            "best_time_to_visit": location_data['best_time_to_visit']
        }
    
    def _filter_attractions_by_preferences(self, attractions: List[Dict], preferences: Dict) -> List[Dict]:
        """Filter attractions based on user preferences"""
        if not preferences:
            return attractions
        
        travel_style = preferences.get('travel_style', '').lower()
        preferred_activities = preferences.get('preferred_activities', [])
        
        filtered = []
        for attraction in attractions:
            name = attraction.get('name', '').lower()
            description = attraction.get('description', '').lower()
            
            # Check if attraction matches travel style
            if travel_style == 'cultural' and any(word in name or word in description for word in ['temple', 'shrine', 'museum', 'castle', 'palace']):
                filtered.append(attraction)
            elif travel_style == 'adventure' and any(word in name or word in description for word in ['mountain', 'volcano', 'hike', 'nature', 'park']):
                filtered.append(attraction)
            elif travel_style == 'relaxed' and any(word in name or word in description for word in ['garden', 'spa', 'beach', 'forest']):
                filtered.append(attraction)
            else:
                # Include if it matches any preferred activities
                for activity in preferred_activities:
                    if activity.lower() in name or activity.lower() in description:
                        filtered.append(attraction)
                        break
        
        return filtered if filtered else attractions
    
    def _filter_insights_by_preferences(self, insights: List[Dict], preferences: Dict) -> List[Dict]:
        """Filter insights based on user preferences"""
        if not preferences:
            return insights
        
        travel_style = preferences.get('travel_style', '').lower()
        food_preference = preferences.get('food_preference', '').lower()
        
        filtered = []
        for insight in insights:
            tip = insight.get('tip', '').lower()
            
            # Check if insight matches preferences
            if travel_style == 'cultural' and any(word in tip for word in ['traditional', 'cultural', 'historic']):
                filtered.append(insight)
            elif travel_style == 'adventure' and any(word in tip for word in ['adventure', 'outdoor', 'hiking']):
                filtered.append(insight)
            elif food_preference and any(word in tip for word in ['food', 'restaurant', 'cuisine', 'dining']):
                filtered.append(insight)
            else:
                # Include general tips
                if any(word in tip for word in ['local', 'hidden', 'secret', 'authentic']):
                    filtered.append(insight)
        
        return filtered if filtered else insights
    
    def get_itinerary_data(self, location: str, user_preferences: Dict) -> Dict[str, Any]:
        """Get data for itinerary generation with transportation and timing"""
        location_data = self.get_comprehensive_location_data(location)
        attractions = location_data['attractions'][:5]
        optimal_route = self.transportation_scraper.get_optimal_route(location, attractions)
        
        return {
            "location": location,
            "attractions": attractions,
            "optimal_route": optimal_route,
            "local_insights": location_data['local_insights'],
            "weather": location_data['weather'],
            "transportation": location_data['transportation'],
            "restaurants": location_data['restaurants'],
            "events": location_data['events'],
            "user_preferences": user_preferences,
            "best_time_to_visit": location_data['best_time_to_visit']
        }
    
    def calculate_realistic_itinerary(self, location: str, user_preferences: Dict) -> Dict[str, Any]:
        """Calculate a realistic itinerary with proper timing and logistics"""
        itinerary_data = self.get_itinerary_data(location, user_preferences)
        
        structured_itinerary = {
            "location": location,
            "user_preferences": user_preferences,
            "weather_conditions": itinerary_data['weather'],
            "transportation_info": itinerary_data['transportation'],
            "morning_schedule": self._create_morning_schedule(itinerary_data),
            "afternoon_schedule": self._create_afternoon_schedule(itinerary_data),
            "evening_schedule": self._create_evening_schedule(itinerary_data),
            "total_estimated_cost": self._calculate_total_cost(itinerary_data),
            "travel_tips": self._generate_travel_tips(itinerary_data)
        }
        
        return structured_itinerary
    
    def _create_morning_schedule(self, itinerary_data: Dict) -> List[Dict]:
        """Create morning schedule (6 AM - 12 PM)"""
        attractions = itinerary_data['attractions'][:2]  # Use first 2 attractions
        schedule = []
        
        current_time = 6  # 6 AM start
        
        for i, attraction in enumerate(attractions):
            # Add travel time if not first attraction
            if i > 0:
                travel_time = 30  # Assume 30 minutes travel
                schedule.append({
                    "time": f"{current_time:02d}:00-{current_time + travel_time//60:02d}:{travel_time%60:02d}",
                    "activity": f"Travel to {attraction['name']}",
                    "duration": f"{travel_time} minutes",
                    "type": "travel"
                })
                current_time += travel_time // 60
            
            # Add attraction visit
            visit_duration = 90  # 1.5 hours per attraction
            schedule.append({
                "time": f"{current_time:02d}:00-{current_time + visit_duration//60:02d}:{visit_duration%60:02d}",
                "activity": f"Visit {attraction['name']}",
                "description": attraction.get('description', ''),
                "duration": f"{visit_duration} minutes",
                "type": "attraction"
            })
            current_time += visit_duration // 60
        
        return schedule
    
    def _create_afternoon_schedule(self, itinerary_data: Dict) -> List[Dict]:
        """Create afternoon schedule (12 PM - 6 PM)"""
        attractions = itinerary_data['attractions'][2:4]  # Use next 2 attractions
        restaurants = itinerary_data['restaurants'].get('local', [])
        schedule = []
        
        current_time = 12  # 12 PM start
        
        # Lunch
        if restaurants:
            restaurant = restaurants[0] if restaurants else {"name": "Local restaurant"}
            schedule.append({
                "time": f"{current_time:02d}:00-{current_time + 1:02d}:00",
                "activity": f"Lunch at {restaurant.get('name', 'Local restaurant')}",
                "duration": "1 hour",
                "type": "dining"
            })
            current_time += 1
        
        # Afternoon attractions
        for i, attraction in enumerate(attractions):
            if i > 0:
                travel_time = 30
                schedule.append({
                    "time": f"{current_time:02d}:00-{current_time + travel_time//60:02d}:{travel_time%60:02d}",
                    "activity": f"Travel to {attraction['name']}",
                    "duration": f"{travel_time} minutes",
                    "type": "travel"
                })
                current_time += travel_time // 60
            
            visit_duration = 90
            schedule.append({
                "time": f"{current_time:02d}:00-{current_time + visit_duration//60:02d}:{visit_duration%60:02d}",
                "activity": f"Visit {attraction['name']}",
                "description": attraction.get('description', ''),
                "duration": f"{visit_duration} minutes",
                "type": "attraction"
            })
            current_time += visit_duration // 60
        
        return schedule
    
    def _create_evening_schedule(self, itinerary_data: Dict) -> List[Dict]:
        """Create evening schedule (6 PM - 10 PM)"""
        events = itinerary_data['events']
        restaurants = itinerary_data['restaurants'].get('casual', [])
        schedule = []
        
        current_time = 18  # 6 PM start
        
        # Dinner
        if restaurants:
            restaurant = restaurants[0] if restaurants else {"name": "Local restaurant"}
            schedule.append({
                "time": f"{current_time:02d}:00-{current_time + 1:02d}:00",
                "activity": f"Dinner at {restaurant.get('name', 'Local restaurant')}",
                "duration": "1 hour",
                "type": "dining"
            })
            current_time += 1
        
        # Evening activity
        if events:
            event = events[0]
            schedule.append({
                "time": f"{current_time:02d}:00-{current_time + 2:02d}:00",
                "activity": f"Evening activity: {event.get('name', 'Local event')}",
                "description": event.get('description', ''),
                "duration": "2 hours",
                "type": "event"
            })
        else:
            # Default evening stroll
            schedule.append({
                "time": f"{current_time:02d}:00-{current_time + 1:02d}:00",
                "activity": "Evening stroll and local exploration",
                "description": "Take a peaceful evening walk to experience the local atmosphere",
                "duration": "1 hour",
                "type": "leisure"
            })
        
        return schedule
    
    def _calculate_total_cost(self, itinerary_data: Dict) -> Dict[str, Any]:
        """Calculate estimated total cost for the itinerary"""
        # Rough cost estimates
        costs = {
            "attractions": len(itinerary_data['attractions']) * 15,  # $15 per attraction
            "transportation": 25,  # $25 for day of transport
            "meals": 40,  # $40 for 2 meals
            "total": 0
        }
        costs["total"] = costs["attractions"] + costs["transportation"] + costs["meals"]
        
        return costs
    
    def _generate_travel_tips(self, itinerary_data: Dict) -> List[str]:
        """Generate travel tips based on the itinerary data"""
        tips = []
        
        weather = itinerary_data.get('weather', {})
        if weather.get('current_condition', '').lower() in ['rain', 'snow']:
            tips.append("Bring rain gear or warm clothing for outdoor activities")
        
        transportation = itinerary_data.get('transportation', {})
        if 'public_transport' in transportation.get('available_methods', []):
            tips.append("Public transportation is available and recommended for cost savings")
        
        if itinerary_data.get('local_insights'):
            tips.append("Check local insights for hidden gems and authentic experiences")
        
        tips.append("Book popular attractions in advance to avoid long queues")
        tips.append("Carry local currency for small purchases and tips")
        
        return tips

def main():
    """Test the scraper manager or handle API calls"""
    manager = ScraperManager()
    
    if len(sys.argv) > 1:
        # API call mode
        command = sys.argv[1]
        
        if command == "generate_itinerary":
            if len(sys.argv) > 2:
                try:
                    data = json.loads(sys.argv[2])
                    location = data.get('location')
                    user_preferences = data.get('user_preferences', {})
                    
                    if location:
                        print("🔍 Generating itinerary for:", location)
                        itinerary = manager.calculate_realistic_itinerary(location, user_preferences)
                        print(json.dumps(itinerary))
                    else:
                        print(json.dumps({"error": "Location not provided"}))
                except json.JSONDecodeError:
                    print(json.dumps({"error": "Invalid JSON data"}))
                except Exception as e:
                    print(json.dumps({"error": str(e)}))
            else:
                print(json.dumps({"error": "No data provided"}))
        else:
            print(json.dumps({"error": f"Unknown command: {command}"}))
    else:
        # Test mode
        
        # Test with a location
        location = "Kyoto, Japan"
        print(f"🔍 Testing scraper manager for {location}...")
        
        # Get comprehensive data
        data = manager.get_comprehensive_location_data(location)
        print(f"✅ Got comprehensive data for {location}")
        print(f"  Attractions: {len(data['attractions'])}")
        print(f"  Local insights: {len(data['local_insights'])}")
        print(f"  Events: {len(data['events'])}")
        print(f"  Weather: {data['weather'].get('current_condition', 'Unknown')}")
        
        # Test enhanced recommendations
        user_preferences = {
            "travel_style": "cultural",
            "preferred_activities": ["temple visits", "cultural experiences"],
            "food_preference": "local cuisine"
        }
        
        enhanced_data = manager.get_enhanced_recommendations(location, user_preferences)
        print(f"\n🎯 Enhanced recommendations for cultural traveler:")
        print(f"  Filtered attractions: {len(enhanced_data['attractions'])}")
        print(f"  Filtered insights: {len(enhanced_data['local_insights'])}")
        
        # Test itinerary generation
        itinerary = manager.calculate_realistic_itinerary(location, user_preferences)
        print(f"\n📅 Generated itinerary:")
        print(f"  Morning activities: {len(itinerary['morning_schedule'])}")
        print(f"  Afternoon activities: {len(itinerary['afternoon_schedule'])}")
        print(f"  Evening activities: {len(itinerary['evening_schedule'])}")
        print(f"  Estimated cost: ${itinerary['total_estimated_cost']['total']}")

if __name__ == "__main__":
    main() 