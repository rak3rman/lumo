"""
Scrapers package for Lumo Travel Recommendations
Provides various scrapers for gathering real-time travel data
"""

# Import all scrapers
try:
    from .scraper_manager import ScraperManager
    from .wikipedia import WikipediaScraper
    from .reddit import RedditScraper
    from .weather import WeatherScraper
    from .transportation import TransportationScraper

    __all__ = [
        'ScraperManager',
        'WikipediaScraper',
        'RedditScraper',
        'WeatherScraper',
        'TransportationScraper'
    ]
except ImportError as e:
    print(f"Warning: Could not import all scrapers: {e}")
    __all__ = [] 