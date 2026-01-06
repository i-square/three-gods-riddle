import yaml
import os
from typing import Optional

class Settings:
    def __init__(self):
        self.config = self._load_config()
    
    def _load_config(self):
        config_path = "llm.yaml"
        if not os.path.exists(config_path):
            # Fallback for dev/test if local config missing, or raise error
            # For this project, we assume user followed README.
            # Using template values as default fallback just in case
            return {
                "openai": {
                    "base_url": "https://api.openai.com/v1",
                    "api_key": "mock-key",
                    "model": "gpt-3.5-turbo",
                    "temperature": 0.1
                }
            }
        
        with open(config_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)

    @property
    def openai_api_key(self) -> str:
        return self.config.get("openai", {}).get("api_key", "")

    @property
    def openai_base_url(self) -> str:
        return self.config.get("openai", {}).get("base_url", "https://api.openai.com/v1")
    
    @property
    def openai_model(self) -> str:
        return self.config.get("openai", {}).get("model", "gpt-3.5-turbo")

    @property
    def openai_temperature(self) -> float:
        return self.config.get("openai", {}).get("temperature", 0.1)

    @property
    def secret_key(self) -> str:
        # In prod, this should be in env or yaml. 
        # For this demo, we hardcode a random string.
        return "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"

    @property
    def algorithm(self) -> str:
        return "HS256"

    @property
    def access_token_expire_minutes(self) -> int:
        return 60 * 24 # 1 day

settings = Settings()
