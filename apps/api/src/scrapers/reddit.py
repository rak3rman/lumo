#!/usr/bin/env python3
"""
Reddit Scraper for Lumo Travel Recommendations
Gets authentic local tips and insights from travel communities
"""

import requests
import json
import time
from typing import Dict, List, Any
import re

class RedditScraper:
    def __init__(self):
        self.base_url = "https://www.reddit.com"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Travel-related subreddits
        self.travel_subreddits = [
            'travel', 'JapanTravel', 'VisitingIceland', 'bali', 'indonesia',
            'ThailandTourism', 'Vietnam', 'MexicoCity', 'EuropeTravel',
            'backpacking', 'solotravel', 'digitalnomad'
        ]
    
    def search_local_tips(self, location: str) -> List[Dict[str, Any]]:
        """
        Search for local tips and insights about a location
        """
        tips = []
        
        # Clean location name for search
        location_clean = location.split(',')[0].strip()  # Get city name only
        
        for subreddit in self.travel_subreddits:
            try:
                # Search in specific subreddit
                search_url = f"{self.base_url}/r/{subreddit}/search.json"
                params = {
                    'q': location_clean,
                    'restrict_sr': 'on',
                    'sort': 'relevance',
                    't': 'year'
                }
                
                response = requests.get(search_url, headers=self.headers, params=params)
                response.raise_for_status()
                
                data = response.json()
                
                if 'data' in data and 'children' in data['data']:
                    for post in data['data']['children'][:5]:  # Get top 5 posts
                        post_data = post['data']
                        
                        # Extract useful information
                        tip = {
                            'title': post_data.get('title', ''),
                            'content': post_data.get('selftext', '')[:500],  # First 500 chars
                            'url': f"https://reddit.com{post_data.get('permalink', '')}",
                            'score': post_data.get('score', 0),
                            'subreddit': subreddit,
                            'created_utc': post_data.get('created_utc', 0)
                        }
                        
                        # Only include if it has meaningful content
                        if len(tip['content']) > 50 and tip['score'] > 5:
                            tips.append(tip)
                
                time.sleep(1)  # Be respectful to Reddit's API
                
            except Exception as e:
                print(f"Error searching r/{subreddit} for {location}: {e}")
                continue
        
        # Sort by relevance (score and recency)
        tips.sort(key=lambda x: (x['score'], x['created_utc']), reverse=True)
        
        return tips[:10]  # Return top 10 tips
    
    def get_location_insights(self, location: str) -> Dict[str, Any]:
        """
        Get comprehensive local insights for a location
        """
        tips = self.search_local_tips(location)
        
        # Categorize tips
        categorized_tips = {
            'food': [],
            'accommodation': [],
            'transportation': [],
            'attractions': [],
            'general': []
        }
        
        for tip in tips:
            content_lower = tip['content'].lower()
            
            if any(word in content_lower for word in ['restaurant', 'food', 'eat', 'dining', 'cafe']):
                categorized_tips['food'].append(tip)
            elif any(word in content_lower for word in ['hotel', 'hostel', 'accommodation', 'stay', 'lodging']):
                categorized_tips['accommodation'].append(tip)
            elif any(word in content_lower for word in ['transport', 'bus', 'train', 'metro', 'subway']):
                categorized_tips['transportation'].append(tip)
            elif any(word in content_lower for word in ['attraction', 'visit', 'see', 'temple', 'museum']):
                categorized_tips['attractions'].append(tip)
            else:
                categorized_tips['general'].append(tip)
        
        return {
            "location": location,
            "insights": categorized_tips,
            "source": "Reddit",
            "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S")
        }
    
    def get_events_info(self, location: str) -> List[Dict[str, Any]]:
        """
        Get information about local events and festivals
        """
        events = []
        
        # Search for event-related posts
        location_clean = location.split(',')[0].strip()
        
        for subreddit in ['travel', 'JapanTravel', 'VisitingIceland', 'bali']:
            try:
                search_url = f"{self.base_url}/r/{subreddit}/search.json"
                params = {
                    'q': f"{location_clean} festival event",
                    'restrict_sr': 'on',
                    'sort': 'relevance',
                    't': 'year'
                }
                
                response = requests.get(search_url, headers=self.headers, params=params)
                response.raise_for_status()
                
                data = response.json()
                
                if 'data' in data and 'children' in data['data']:
                    for post in data['data']['children'][:3]:
                        post_data = post['data']
                        
                        # Look for event information in the content
                        content = post_data.get('selftext', '')
                        title = post_data.get('title', '')
                        
                        # Extract potential event names and dates
                        event_info = self._extract_event_info(title, content)
                        
                        if event_info:
                            events.append({
                                'name': event_info['name'],
                                'dates': event_info['dates'],
                                'description': event_info['description'],
                                'source': f"Reddit r/{subreddit}",
                                'url': f"https://reddit.com{post_data.get('permalink', '')}"
                            })
                
                time.sleep(1)
                
            except Exception as e:
                print(f"Error searching events for {location} in r/{subreddit}: {e}")
                continue
        
        return events
    
    def _extract_event_info(self, title: str, content: str) -> Dict[str, str]:
        """
        Extract event information from Reddit post content
        """
        # Simple pattern matching for events
        import re
        
        # Look for date patterns
        date_patterns = [
            r'(\w+ \d{1,2})',  # Month Day
            r'(\d{1,2}/\d{1,2})',  # MM/DD
            r'(\w+ \d{4})',  # Month Year
        ]
        
        dates = []
        for pattern in date_patterns:
            matches = re.findall(pattern, content)
            dates.extend(matches)
        
        # Look for festival/event keywords
        event_keywords = ['festival', 'event', 'celebration', 'ceremony', 'matsuri', 'hanami']
        
        event_name = ""
        for keyword in event_keywords:
            if keyword in content.lower():
                # Try to extract the event name
                lines = content.split('\n')
                for line in lines:
                    if keyword in line.lower():
                        event_name = line.strip()
                        break
                break
        
        if event_name and dates:
            return {
                'name': event_name,
                'dates': ', '.join(dates[:2]),  # First 2 dates found
                'description': content[:200] + '...' if len(content) > 200 else content
            }
        
        return None

def main():
    """Test the Reddit scraper"""
    scraper = RedditScraper()
    
    # Test with a few locations
    test_locations = ["Kyoto, Japan", "Reykjavik, Iceland", "Bali, Indonesia"]
    
    for location in test_locations:
        print(f"\n🔍 Searching Reddit insights for {location}...")
        
        # Get local insights
        insights = scraper.get_location_insights(location)
        print(f"Found insights in {len(insights['insights']['general'])} categories")
        
        # Show some food tips
        if insights['insights']['food']:
            print(f"🍽️  Food tips: {len(insights['insights']['food'])} found")
            for tip in insights['insights']['food'][:2]:
                print(f"  - {tip['title'][:50]}...")
        
        # Get events
        events = scraper.get_events_info(location)
        print(f"🎉 Events: {len(events)} found")
        for event in events[:2]:
            print(f"  - {event['name']} ({event['dates']})")
        
        time.sleep(3)  # Be respectful

if __name__ == "__main__":
    main() 