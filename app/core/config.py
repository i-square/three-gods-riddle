import os


class Settings:

    @property
    def openai_api_key(self) -> str:
        return os.getenv("OPENAI_API_KEY", "")

    @property
    def openai_base_url(self) -> str:
        return os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")

    @property
    def openai_model(self) -> str:
        return os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    @property
    def openai_temperature(self) -> float:
        return float(os.getenv("OPENAI_TEMPERATURE", "0.01"))

    @property
    def openai_max_tokens(self) -> int:
        return int(os.getenv("OPENAI_MAX_TOKENS", "4096"))

    @property
    def root_password(self) -> str:
        return os.getenv("ROOT_PASSWORD", "change_me_on_first_login")

    @property
    def secret_key(self) -> str:
        return os.getenv(
            "SECRET_KEY",
            "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7",
        )

    @property
    def algorithm(self) -> str:
        return os.getenv("JWT_ALGORITHM", "HS256")

    @property
    def access_token_expire_minutes(self) -> int:
        return int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    @property
    def debug(self) -> bool:
        return os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")

    @property
    def log_level(self) -> str:
        return os.getenv("LOG_LEVEL", "INFO")

    @property
    def log_format(self) -> str:
        return os.getenv("LOG_FORMAT", "json")

    @property
    def log_file(self) -> str:
        return os.getenv("LOG_FILE", "logs/backend/backend.log")


settings = Settings()
