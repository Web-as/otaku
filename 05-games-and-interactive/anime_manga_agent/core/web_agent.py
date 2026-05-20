"""
Web Agent Module
================

Provides web browsing capabilities to the agent, allowing it to search for information on the internet.
"""

import os
import json
import requests
from typing import Dict, List, Optional, Any

class WebAgent:
    """An agent that can browse the web to find information."""

    def __init__(self, config: Dict[str, Any]):
        """Initialize the web agent with a configuration."""
        self.config = config.get("web_agent", {})
        self.api_key = (
            os.environ.get("BROWSERUSE_API_KEY")
            or os.environ.get("ANIME_MANGA_WEB_AGENT_API_KEY")
            or self.config.get("api_key")
        )
        self.search_url = self.config.get("search_url", "https://api.example.com/search")
        # Never prompt in runtime/server contexts. If key is missing,
        # search_web returns a clear error payload.

    def get_api_key_from_user(self) -> str:
        """Prompt the user for the API key and save it to the config."""
        print("Web browsing API key is not configured.")
        api_key = input("Please enter your API key: ")
        self.config["api_key"] = api_key
        self.save_config()
        return api_key

    def save_config(self):
        """Save the updated configuration to config.json."""
        config_path = os.path.join(os.path.dirname(__file__), "..", "config.json")
        with open(config_path, 'r+') as f:
            full_config = json.load(f)
            full_config["web_agent"] = self.config
            f.seek(0)
            json.dump(full_config, f, indent=2)
            f.truncate()

    def search_web(self, query: str) -> Dict[str, Any]:
        """Search the web for a given query."""
        if not self.api_key:
            return {"error": "API key is not configured."}

        headers = {"Authorization": f"Bearer {self.api_key}"}
        params = {"q": query}

        try:
            response = requests.get(self.search_url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}

    def get_latest_news(self, topic: str) -> Dict[str, Any]:
        """Get the latest news on a specific topic."""
        return self.search_web(f"latest news on {topic}")

    def find_recommendations(self, query: str) -> Dict[str, Any]:
        """Find recommendations for a given query."""
        return self.search_web(f"recommendations for {query}")
