#!/usr/bin/env python3
"""
Weather Scraper for Lumo Travel Recommendations
Gets current weather conditions and forecasts for travel planning
"""

import requests
import json
import time
from typing import Dict, List, Any
from datetime import datetime, timedelta

class WeatherScraper:
    def __init__(self):
        self.base_url = "https://api.openweathermap.org/data/2.5"
        self.api_key = None  # Set your OpenWeatherMap API key here
        
        # Fallback weather data for common destinations
        self.fallback_weather = {
            "Kyoto, Japan": {
                "current": {"temp": 22, "condition": "Sunny", "humidity": 65},
                "forecast": [
                    {"date": "Today", "high": 25, "low": 18, "condition": "Sunny"},
                    {"date": "Tomorrow", "high": 24, "low": 17, "condition": "Partly Cloudy"},
                    {"date": "Day 3", "high": 26, "low": 19, "condition": "Sunny"}
                ]
            },
            "Reykjavik, Iceland": {
                "current": {"temp": 8, "condition": "Cloudy", "humidity": 80},
                "forecast": [
                    {"date": "Today", "high": 10, "low": 5, "condition": "Cloudy"},
                    {"date": "Tomorrow", "high": 9, "low": 4, "condition": "Rain"},
                    {"date": "Day 3", "high": 11, "low": 6, "condition": "Partly Cloudy"}
                ]
            },
            "Bali, Indonesia": {
                "current": {"temp": 28, "condition": "Sunny", "humidity": 75},
                "forecast": [
                    {"date": "Today", "high": 30, "low": 24, "condition": "Sunny"},
                    {"date": "Tomorrow", "high": 29, "low": 23, "condition": "Partly Cloudy"},
                    {"date": "Day 3", "high": 31, "low": 25, "condition": "Sunny"}
                ]
            }
        }
    
    def get_current_weather(self, location: str) -> Dict[str, Any]:
        """
        Get current weather conditions for a location
        """
        try:
            if not self.api_key:
                # Use fallback data
                return self.fallback_weather.get(location, {
                    "current": {"temp": 20, "condition": "Unknown", "humidity": 70},
                    "forecast": []
                })
            
            # Get coordinates for the location
            coords = self._get_coordinates(location)
            if not coords:
                return self._get_fallback_weather(location)
            
            # Get current weather
            weather_url = f"{self.base_url}/weather"
            params = {
                'lat': coords['lat'],
                'lon': coords['lon'],
                'appid': self.api_key,
                'units': 'metric'
            }
            
            response = requests.get(weather_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "location": location,
                "current": {
                    "temp": data['main']['temp'],
                    "condition": data['weather'][0]['main'],
                    "humidity": data['main']['humidity'],
                    "wind_speed": data['wind']['speed'],
                    "description": data['weather'][0]['description']
                },
                "source": "OpenWeatherMap",
                "scraped_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error getting weather for {location}: {e}")
            return self._get_fallback_weather(location)
    
    def get_weather_forecast(self, location: str, days: int = 5) -> Dict[str, Any]:
        """
        Get weather forecast for a location
        """
        try:
            if not self.api_key:
                # Use fallback data
                fallback = self.fallback_weather.get(location, {})
                return {
                    "location": location,
                    "forecast": fallback.get("forecast", []),
                    "source": "Fallback Data",
                    "scraped_at": datetime.now().isoformat()
                }
            
            # Get coordinates
            coords = self._get_coordinates(location)
            if not coords:
                return self._get_fallback_weather(location)
            
            # Get forecast
            forecast_url = f"{self.base_url}/forecast"
            params = {
                'lat': coords['lat'],
                'lon': coords['lon'],
                'appid': self.api_key,
                'units': 'metric',
                'cnt': days * 8  # 8 readings per day
            }
            
            response = requests.get(forecast_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            # Process forecast data
            forecast = []
            for item in data['list'][:days * 8:8]:  # Get one reading per day
                date = datetime.fromtimestamp(item['dt'])
                forecast.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "high": item['main']['temp_max'],
                    "low": item['main']['temp_min'],
                    "condition": item['weather'][0]['main'],
                    "description": item['weather'][0]['description'],
                    "humidity": item['main']['humidity']
                })
            
            return {
                "location": location,
                "forecast": forecast,
                "source": "OpenWeatherMap",
                "scraped_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error getting forecast for {location}: {e}")
            return self._get_fallback_weather(location)
    
    def get_best_time_to_visit(self, location: str) -> Dict[str, Any]:
        """
        Determine the best time to visit based on weather patterns
        """
        # Get historical weather data or use known patterns
        weather_patterns = {
            "Kyoto, Japan": {
                "best_months": ["March-May", "October-November"],
                "reason": "Cherry blossom season and comfortable temperatures",
                "avoid_months": ["July-August"],
                "avoid_reason": "Hot and humid with typhoon season"
            },
            "Reykjavik, Iceland": {
                "best_months": ["June-August", "September-March"],
                "reason": "Summer for outdoor activities, winter for Northern Lights",
                "avoid_months": ["November-March"],
                "avoid_reason": "Very cold and limited daylight (unless seeking Northern Lights)"
            },
            "Bali, Indonesia": {
                "best_months": ["April-October"],
                "reason": "Dry season with pleasant temperatures",
                "avoid_months": ["November-March"],
                "avoid_reason": "Rainy season with frequent downpours"
            }
        }
        
        pattern = weather_patterns.get(location, {
            "best_months": "Year-round",
            "reason": "Generally good weather throughout the year",
            "avoid_months": "None",
            "avoid_reason": "No major weather concerns"
        })
        
        return {
            "location": location,
            "best_time": pattern["best_months"],
            "reason": pattern["reason"],
            "avoid_time": pattern["avoid_months"],
            "avoid_reason": pattern["avoid_reason"]
        }
    
    def _get_coordinates(self, location: str) -> Dict[str, float]:
        """
        Get coordinates for a location using geocoding
        """
        try:
            if not self.api_key:
                return None
            
            geocode_url = "http://api.openweathermap.org/geo/1.0/direct"
            params = {
                'q': location,
                'limit': 1,
                'appid': self.api_key
            }
            
            response = requests.get(geocode_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            if data:
                return {
                    'lat': data[0]['lat'],
                    'lon': data[0]['lon']
                }
            
            return None
            
        except Exception as e:
            print(f"Error getting coordinates for {location}: {e}")
            return None
    
    def _get_fallback_weather(self, location: str) -> Dict[str, Any]:
        """
        Get fallback weather data
        """
        return {
            "location": location,
            "current": {"temp": 20, "condition": "Unknown", "humidity": 70},
            "forecast": [],
            "source": "Fallback Data",
            "scraped_at": datetime.now().isoformat()
        }

def main():
    """Test the weather scraper"""
    scraper = WeatherScraper()
    
    # Test with a few locations
    test_locations = ["Kyoto, Japan", "Reykjavik, Iceland", "Bali, Indonesia"]
    
    for location in test_locations:
        print(f"\n🌤️  Getting weather for {location}...")
        
        # Get current weather
        current = scraper.get_current_weather(location)
        print(f"Current: {current['current']['temp']}°C, {current['current']['condition']}")
        
        # Get forecast
        forecast = scraper.get_weather_forecast(location)
        print(f"Forecast: {len(forecast['forecast'])} days available")
        
        # Get best time to visit
        best_time = scraper.get_best_time_to_visit(location)
        print(f"Best time: {best_time['best_time']} - {best_time['reason']}")
        
        time.sleep(1)

if __name__ == "__main__":
    main() 