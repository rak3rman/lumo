#!/usr/bin/env python3
"""
Wikipedia Scraper for Lumo Travel Recommendations
Gets real attraction data from Wikipedia pages
"""

import requests
import json
import time
from typing import Dict, List, Any
from bs4 import BeautifulSoup
import re

class WikipediaScraper:
    def __init__(self):
        self.base_url = "https://en.wikipedia.org"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        
        # Fallback attraction data for common destinations
        self.fallback_attractions = {
            "Kyoto, Japan": [
                {
                    "name": "Fushimi Inari Shrine",
                    "url": "https://en.wikipedia.org/wiki/Fushimi_Inari-taisha",
                    "description": "Famous shrine with thousands of torii gates"
                },
                {
                    "name": "Arashiyama Bamboo Grove",
                    "url": "https://en.wikipedia.org/wiki/Arashiyama",
                    "description": "Serene bamboo forest path"
                },
                {
                    "name": "Kinkaku-ji (Golden Pavilion)",
                    "url": "https://en.wikipedia.org/wiki/Kinkaku-ji",
                    "description": "Stunning golden temple"
                },
                {
                    "name": "Ginkaku-ji (Silver Pavilion)",
                    "url": "https://en.wikipedia.org/wiki/Ginkaku-ji",
                    "description": "Beautiful temple with moss garden"
                },
                {
                    "name": "Nijo Castle",
                    "url": "https://en.wikipedia.org/wiki/Nij%C5%8D_Castle",
                    "description": "Historic castle with nightingale floors"
                }
            ],
            "Reykjavik, Iceland": [
                {
                    "name": "Blue Lagoon",
                    "url": "https://en.wikipedia.org/wiki/Blue_Lagoon_(geothermal_spa)",
                    "description": "Famous geothermal spa"
                },
                {
                    "name": "Golden Circle",
                    "url": "https://en.wikipedia.org/wiki/Golden_Circle_(Iceland)",
                    "description": "Geysers, waterfalls, and national park"
                },
                {
                    "name": "Hallgrimskirkja",
                    "url": "https://en.wikipedia.org/wiki/Hallgr%C3%ADmskirkja",
                    "description": "Iconic church with city views"
                },
                {
                    "name": "Harpa Concert Hall",
                    "url": "https://en.wikipedia.org/wiki/Harpa_(concert_hall)",
                    "description": "Modern glass concert hall"
                },
                {
                    "name": "Northern Lights",
                    "url": "https://en.wikipedia.org/wiki/Aurora",
                    "description": "Aurora borealis viewing"
                }
            ],
            "Bali, Indonesia": [
                {
                    "name": "Ubud Sacred Monkey Forest",
                    "url": "https://en.wikipedia.org/wiki/Ubud_Monkey_Forest",
                    "description": "Temple complex with monkeys"
                },
                {
                    "name": "Tegallalang Rice Terraces",
                    "url": "https://en.wikipedia.org/wiki/Tegallalang_Rice_Terraces",
                    "description": "Stunning rice paddies"
                },
                {
                    "name": "Tanah Lot Temple",
                    "url": "https://en.wikipedia.org/wiki/Tanah_Lot",
                    "description": "Sea temple on rock formation"
                },
                {
                    "name": "Uluwatu Temple",
                    "url": "https://en.wikipedia.org/wiki/Uluwatu_Temple",
                    "description": "Cliff-top temple with ocean views"
                },
                {
                    "name": "Mount Batur",
                    "url": "https://en.wikipedia.org/wiki/Mount_Batur",
                    "description": "Active volcano with sunrise hikes"
                }
            ]
        }
    
    def search_attractions(self, location: str) -> List[Dict[str, Any]]:
        """
        Search for attractions in a location using Wikipedia
        """
        try:
            # Clean location name for Wikipedia search
            location_clean = location.split(',')[0].strip()  # Just the city name
            search_url = f"{self.base_url}/wiki/{location_clean.replace(' ', '_')}"
            
            print(f"🔍 Searching Wikipedia for: {location_clean}")
            
            response = requests.get(search_url, headers=self.headers, timeout=15)
            
            if response.status_code != 200:
                print(f"⚠️  Wikipedia page not found for {location_clean}, using fallback data")
                return self.fallback_attractions.get(location, [])
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for attractions in the main content
            attractions = []
            
            # Find the main content area
            content = soup.find('div', {'id': 'mw-content-text'})
            if not content:
                print(f"⚠️  No content found for {location_clean}, using fallback data")
                return self.fallback_attractions.get(location, [])
            
            # Look for links that might be attractions
            links = content.find_all('a')
            
            for link in links:
                title = link.get_text(strip=True)
                href = link.get('href', '')
                
                if title and href and len(title) > 3 and href.startswith('/wiki/'):
                    # Check if it's a relevant attraction
                    if self._is_attraction(title, location_clean):
                        url = self.base_url + href
                        attractions.append({
                            'name': title,
                            'url': url,
                            'description': self._get_attraction_description(url),
                            'source': 'Wikipedia'
                        })
            
            # If we found real results, use them
            if attractions:
                print(f"✅ Found {len(attractions)} attractions via Wikipedia")
                return attractions[:10]  # Limit to top 10
            
            # Fallback to curated data
            print(f"⚠️  No Wikipedia results found for {location}, using fallback data")
            return self.fallback_attractions.get(location, [])
            
        except Exception as e:
            print(f"❌ Error searching attractions for {location}: {e}")
            print(f"Using fallback data for {location}")
            return self.fallback_attractions.get(location, [])
    
    def _is_attraction(self, title: str, location: str) -> bool:
        """
        Check if a Wikipedia link is a relevant attraction
        """
        # Keywords that indicate attraction/tourist content
        attraction_keywords = [
            'temple', 'shrine', 'castle', 'palace', 'museum', 'park', 'garden',
            'monument', 'landmark', 'tower', 'bridge', 'square', 'market',
            'cathedral', 'church', 'mosque', 'fortress', 'ruins', 'shrine',
            'sanctuary', 'pagoda', 'monastery', 'abbey', 'basilica'
        ]
        
        # Keywords that indicate it's NOT an attraction
        exclude_keywords = [
            'airport', 'station', 'hotel', 'restaurant', 'school', 'university',
            'hospital', 'bank', 'office', 'company', 'corporation', 'district',
            'prefecture', 'region', 'province', 'country', 'island', 'mountain',
            'river', 'lake', 'sea', 'ocean', 'bay', 'gulf', 'strait'
        ]
        
        title_lower = title.lower()
        
        # Check for exclusion keywords first
        for keyword in exclude_keywords:
            if keyword in title_lower:
                return False
        
        # Check for attraction keywords
        for keyword in attraction_keywords:
            if keyword in title_lower:
                return True
        
        # If it mentions the location and seems like a place, include it
        if location.lower() in title_lower and len(title) > 5:
            return True
        
        return False
    
    def _get_attraction_description(self, url: str) -> str:
        """
        Get brief description of an attraction from its Wikipedia page
        """
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            if response.status_code != 200:
                return "Popular attraction in the area"
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Try to find the first paragraph
            content = soup.find('div', {'id': 'mw-content-text'})
            if content:
                paragraphs = content.find_all('p')
                for p in paragraphs:
                    text = p.get_text(strip=True)
                    if len(text) > 50 and not text.startswith('This article'):
                        return text[:200] + "..." if len(text) > 200 else text
            
            return "Popular attraction in the area"
            
        except Exception as e:
            print(f"Error getting description for {url}: {e}")
            return "Popular attraction in the area"
    
    def search_local_insights(self, location: str) -> List[Dict[str, Any]]:
        """
        Search for local insights from Wikipedia
        """
        try:
            location_clean = location.split(',')[0].strip()
            search_url = f"{self.base_url}/wiki/{location_clean.replace(' ', '_')}"
            
            response = requests.get(search_url, headers=self.headers, timeout=15)
            
            if response.status_code != 200:
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            insights = []
            
            # Look for sections about culture, history, or local customs
            content = soup.find('div', {'id': 'mw-content-text'})
            if content:
                sections = content.find_all(['h2', 'h3'])
                
                for section in sections:
                    section_text = section.get_text().lower()
                    if any(keyword in section_text for keyword in ['culture', 'history', 'custom', 'tradition', 'local', 'heritage']):
                        # Get the next few paragraphs after this section
                        next_elem = section.find_next_sibling()
                        if next_elem and next_elem.name == 'p':
                            text = next_elem.get_text(strip=True)
                            if len(text) > 100:
                                insights.append({
                                    'source': 'Wikipedia',
                                    'tip': f"{section.get_text()}: {text[:150]}..."
                                })
            
            return insights[:5]  # Limit to top 5 insights
            
        except Exception as e:
            print(f"Error searching local insights for {location}: {e}")
            return []
    
    def get_location_attractions(self, location: str) -> Dict[str, Any]:
        """
        Get comprehensive attraction data for a location
        """
        attractions = self.search_attractions(location)
        local_insights = self.search_local_insights(location)
        
        return {
            "location": location,
            "attractions": attractions,
            "local_insights": local_insights,
            "source": "Wikipedia (with fallback)",
            "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S")
        }

def main():
    """Test the scraper"""
    scraper = WikipediaScraper()
    
    # Test with a few locations
    test_locations = ["Kyoto, Japan", "Reykjavik, Iceland", "Bali, Indonesia"]
    
    for location in test_locations:
        print(f"\n🔍 Searching attractions for {location}...")
        result = scraper.get_location_attractions(location)
        print(f"Found {len(result['attractions'])} attractions")
        print(f"Found {len(result['local_insights'])} local insights")
        
        for i, attraction in enumerate(result['attractions'][:3], 1):
            print(f"  {i}. {attraction['name']}")
            print(f"     URL: {attraction['url']}")
            print(f"     Description: {attraction['description'][:100]}...")
        
        if result['local_insights']:
            print(f"\n  Local Insights:")
            for insight in result['local_insights'][:2]:
                print(f"    - {insight['tip']}")
        
        time.sleep(2)  # Be respectful to the server

if __name__ == "__main__":
    main() 