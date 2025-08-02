#!/usr/bin/env python3
"""
Transportation Scraper for Lumo Travel Recommendations
Provides realistic travel information and logistics for different cities
"""

import json
import time
from typing import Dict, List, Any

class TransportationScraper:
    def __init__(self):
        # Transportation data for major cities
        self.transportation_data = {
            "Kyoto, Japan": {
                "public_transport": {
                    "bus": {
                        "description": "Extensive bus network covering all major attractions",
                        "cost": "¥230 per ride, ¥500 day pass",
                        "frequency": "Every 10-15 minutes",
                        "operating_hours": "5:00 AM - 11:00 PM",
                        "tips": "Use the Kyoto City Bus for temple visits, buy a day pass for convenience"
                    },
                    "subway": {
                        "description": "Limited subway system, mainly for north-south travel",
                        "cost": "¥210-¥350 depending on distance",
                        "frequency": "Every 5-8 minutes",
                        "operating_hours": "5:30 AM - 11:30 PM",
                        "tips": "Best for traveling between major stations"
                    },
                    "train": {
                        "description": "JR and private railway lines",
                        "cost": "¥140-¥400 depending on distance",
                        "frequency": "Every 10-20 minutes",
                        "operating_hours": "5:00 AM - 12:00 AM",
                        "tips": "JR Pass covers most JR lines, private lines require separate tickets"
                    }
                },
                "walking": {
                    "description": "Many attractions are walkable in central areas",
                    "tips": "Temple districts like Higashiyama are best explored on foot",
                    "safety": "Very safe, well-lit streets"
                },
                "bicycle": {
                    "description": "Popular way to explore Kyoto",
                    "rental_cost": "¥1,000-¥2,000 per day",
                    "tips": "Many hotels offer bicycle rentals, perfect for temple hopping"
                },
                "taxi": {
                    "description": "Available but expensive",
                    "cost": "¥410 base fare, ¥80 per 280m",
                    "tips": "Use for late night or when carrying luggage"
                }
            },
            "Reykjavik, Iceland": {
                "public_transport": {
                    "bus": {
                        "description": "Strætó bus system covers the city and surrounding areas",
                        "cost": "ISK 490 per ride, ISK 1,500 day pass",
                        "frequency": "Every 15-30 minutes",
                        "operating_hours": "6:00 AM - 12:00 AM",
                        "tips": "Download the Strætó app for real-time schedules"
                    }
                },
                "walking": {
                    "description": "Compact city center is very walkable",
                    "tips": "Most attractions in 101 area are within 20 minutes walk",
                    "safety": "Very safe, well-lit even in winter"
                },
                "car_rental": {
                    "description": "Essential for exploring outside Reykjavik",
                    "cost": "ISK 8,000-15,000 per day",
                    "tips": "Book in advance, 4WD recommended for winter"
                },
                "taxi": {
                    "description": "Expensive but available",
                    "cost": "ISK 1,000 base fare, ISK 300 per km",
                    "tips": "Use for airport transfers or late night"
                }
            },
            "Bali, Indonesia": {
                "public_transport": {
                    "bus": {
                        "description": "Limited public bus system",
                        "cost": "IDR 3,500-7,000 per ride",
                        "frequency": "Every 30-60 minutes",
                        "operating_hours": "6:00 AM - 10:00 PM",
                        "tips": "Not very reliable, better to use other options"
                    }
                },
                "walking": {
                    "description": "Limited due to heat and lack of sidewalks",
                    "tips": "Best in Ubud center and beach areas",
                    "safety": "Be cautious at night, stick to well-lit areas"
                },
                "scooter": {
                    "description": "Most popular way to get around",
                    "rental_cost": "IDR 50,000-100,000 per day",
                    "tips": "International license required, wear helmet, be very careful"
                },
                "taxi": {
                    "description": "Blue Bird taxis are reliable",
                    "cost": "IDR 7,000 base fare, IDR 6,500 per km",
                    "tips": "Use Blue Bird app, avoid unmarked taxis"
                },
                "private_driver": {
                    "description": "Popular for day trips",
                    "cost": "IDR 400,000-600,000 per day",
                    "tips": "Book through hotel or reputable tour companies"
                }
            }
        }
    
    def get_transportation_info(self, location: str) -> Dict[str, Any]:
        """
        Get comprehensive transportation information for a location
        """
        return self.transportation_data.get(location, {
            "public_transport": {},
            "walking": {"description": "Check local information", "tips": "Use common sense"},
            "taxi": {"description": "Available in most cities", "cost": "Varies by city"}
        })
    
    def calculate_travel_time(self, location: str, from_location: str, to_location: str, transport_method: str = "walking") -> Dict[str, Any]:
        """
        Calculate realistic travel time between locations
        """
        # Simplified travel time calculations
        travel_times = {
            "Kyoto, Japan": {
                "walking": {"speed": "4 km/h", "description": "Pleasant walking city"},
                "bus": {"speed": "15 km/h", "description": "Frequent stops, traffic"},
                "subway": {"speed": "30 km/h", "description": "Fast between stations"},
                "bicycle": {"speed": "12 km/h", "description": "Popular and efficient"}
            },
            "Reykjavik, Iceland": {
                "walking": {"speed": "4 km/h", "description": "Compact city center"},
                "bus": {"speed": "20 km/h", "description": "Reliable but limited routes"},
                "car": {"speed": "40 km/h", "description": "Fastest option"}
            },
            "Bali, Indonesia": {
                "walking": {"speed": "3 km/h", "description": "Hot and humid"},
                "scooter": {"speed": "25 km/h", "description": "Most popular option"},
                "taxi": {"speed": "20 km/h", "description": "Traffic dependent"},
                "bus": {"speed": "15 km/h", "description": "Limited routes, traffic"}
            }
        }
        
        # More realistic distance calculations based on location types
        distances = {
            "temple_to_temple": 2.5,  # km
            "city_center_to_attraction": 3.0,  # km
            "airport_to_city": 50.0,  # km
            "beach_to_city": 8.0,  # km
            "ubud_attractions": 1.5,  # km - Ubud is compact
            "kuta_to_seminyak": 5.0,  # km
            "kyoto_temple_district": 2.0,  # km - temples are close
            "reykjavik_center": 1.5,  # km - very compact
        }
        
        # Estimate distance based on location types and city
        if "temple" in from_location.lower() or "temple" in to_location.lower():
            if "kyoto" in location.lower():
                estimated_distance = distances["kyoto_temple_district"]
            elif "bali" in location.lower():
                estimated_distance = distances["ubud_attractions"]
            else:
                estimated_distance = distances["temple_to_temple"]
        elif "ubud" in location.lower() or "bali" in location.lower():
            estimated_distance = distances["ubud_attractions"]
        elif "reykjavik" in location.lower():
            estimated_distance = distances["reykjavik_center"]
        elif "kyoto" in location.lower():
            estimated_distance = distances["kyoto_temple_district"]
        else:
            estimated_distance = distances["city_center_to_attraction"]
        
        # Get transport info for location
        transport_info = travel_times.get(location, travel_times["Kyoto, Japan"])
        method_info = transport_info.get(transport_method, transport_info["walking"])
        
        # Calculate travel time
        speed_kmh = float(method_info["speed"].split()[0])
        travel_time_minutes = (estimated_distance / speed_kmh) * 60
        
        # Cap travel time at reasonable limits
        if travel_time_minutes > 45:
            travel_time_minutes = 45  # Max 45 minutes for any journey
        
        return {
            "from": from_location,
            "to": to_location,
            "method": transport_method,
            "distance_km": estimated_distance,
            "travel_time_minutes": round(travel_time_minutes),
            "description": method_info["description"]
        }
    
    def get_optimal_route(self, location: str, activities: List[Dict]) -> List[Dict[str, Any]]:
        """
        Get optimal route between activities with realistic travel times
        """
        if not activities:
            return []
        
        route = []
        current_location = "Starting point"
        
        for i, activity in enumerate(activities):
            if i == 0:
                # First activity - assume starting from hotel/city center
                travel_info = self.calculate_travel_time(
                    location, 
                    "Hotel/City Center", 
                    activity.get("name", "Activity"),
                    "walking"  # Default to walking for first activity
                )
            else:
                # Calculate travel from previous activity
                prev_activity = activities[i-1]
                travel_info = self.calculate_travel_time(
                    location,
                    prev_activity.get("name", "Previous Activity"),
                    activity.get("name", "Activity"),
                    self._get_optimal_transport_method(location, prev_activity, activity)
                )
            
            route.append({
                "activity": activity,
                "travel_to_activity": travel_info
            })
        
        return route
    
    def _get_optimal_transport_method(self, location: str, from_activity: Dict, to_activity: Dict) -> str:
        """
        Determine optimal transport method based on distance and location
        """
        # Simple logic based on location characteristics
        if location == "Kyoto, Japan":
            if "temple" in from_activity.get("name", "").lower() or "temple" in to_activity.get("name", "").lower():
                return "walking"  # Temples are often close together
            else:
                return "bus"  # Bus is most convenient for longer distances
        
        elif location == "Reykjavik, Iceland":
            return "walking"  # Compact city center
        
        elif location == "Bali, Indonesia":
            return "scooter"  # Most popular and efficient
        
        return "walking"  # Default
    
    def get_restaurant_recommendations(self, location: str, cuisine_type: str = "local") -> List[Dict[str, Any]]:
        """
        Get restaurant recommendations with addresses and travel info
        """
        restaurants = {
            "Kyoto, Japan": {
                "local": [
                    {
                        "name": "Ichiran Ramen",
                        "address": "Near Kyoto Station",
                        "cuisine": "Ramen",
                        "price_range": "¥800-¥1,200",
                        "travel_time": "5-10 minutes from station"
                    },
                    {
                        "name": "Gion Sasaki",
                        "address": "Gion District",
                        "cuisine": "Kaiseki",
                        "price_range": "¥20,000-¥30,000",
                        "travel_time": "15 minutes from city center"
                    }
                ],
                "casual": [
                    {
                        "name": "Kyoto Gogyo",
                        "address": "Nishiki Market area",
                        "cuisine": "Ramen",
                        "price_range": "¥1,000-¥1,500",
                        "travel_time": "10 minutes from market"
                    }
                ]
            },
            "Reykjavik, Iceland": {
                "local": [
                    {
                        "name": "Bæjarins Beztu Pylsur",
                        "address": "Tryggvagata 1",
                        "cuisine": "Hot dogs",
                        "price_range": "ISK 450",
                        "travel_time": "5 minutes from city center"
                    },
                    {
                        "name": "Dill Restaurant",
                        "address": "Laugavegur 59",
                        "cuisine": "New Nordic",
                        "price_range": "ISK 15,000-25,000",
                        "travel_time": "10 minutes from city center"
                    }
                ]
            },
            "Bali, Indonesia": {
                "local": [
                    {
                        "name": "Warung Babi Guling Ibu Oka",
                        "address": "Ubud",
                        "cuisine": "Balinese",
                        "price_range": "IDR 25,000-50,000",
                        "travel_time": "10 minutes from Ubud center"
                    },
                    {
                        "name": "Locavore",
                        "address": "Jalan Dewisita, Ubud",
                        "cuisine": "Modern Indonesian",
                        "price_range": "IDR 200,000-400,000",
                        "travel_time": "15 minutes from Ubud center"
                    }
                ]
            }
        }
        
        return restaurants.get(location, {}).get(cuisine_type, [])

def main():
    """Test the transportation scraper"""
    scraper = TransportationScraper()
    
    # Test with a few locations
    test_locations = ["Kyoto, Japan", "Reykjavik, Iceland", "Bali, Indonesia"]
    
    for location in test_locations:
        print(f"\n🚌 Getting transportation info for {location}...")
        
        # Get transportation info
        transport_info = scraper.get_transportation_info(location)
        print(f"Available transport: {list(transport_info.keys())}")
        
        # Test travel time calculation
        travel_time = scraper.calculate_travel_time(
            location, 
            "Fushimi Inari Shrine", 
            "Kinkaku-ji Temple", 
            "bus"
        )
        print(f"Travel time: {travel_time['travel_time_minutes']} minutes via {travel_time['method']}")
        
        # Test restaurant recommendations
        restaurants = scraper.get_restaurant_recommendations(location, "local")
        print(f"Restaurants: {len(restaurants)} local options")
        
        time.sleep(1)

if __name__ == "__main__":
    main() 