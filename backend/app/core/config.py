"""
Configuration settings for the AI Fashion Stylist API.
All environment variables and application constants are centralised here.
"""

import os
from dotenv import load_dotenv

from app.core.exceptions import ConfigurationError
from app.core.errors import USER_MESSAGES

load_dotenv()

_PLACEHOLDER_GROQ_KEY = "gsk_your_api_key_here"

# ---------------------------------------------------------------------------
# Groq API
# ---------------------------------------------------------------------------
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", _PLACEHOLDER_GROQ_KEY)
GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"

# ---------------------------------------------------------------------------
# Model configuration
# ---------------------------------------------------------------------------
MODEL_NAME: str = os.getenv("GROQ_MODEL", "llama3-8b-8192")
PROFILE_MODEL: str = os.getenv("GROQ_MODEL", "llama3-8b-8192")
RECOMMENDATION_MODEL: str = os.getenv("GROQ_MODEL", "llama3-8b-8192")

# Pricing per million tokens (Groq, as of 2024)
MODEL_PRICING: dict = {
    "llama3-8b-8192": 0.05,
    "llama3-70b-8192": 0.59,
    "mixtral-8x7b-32768": 0.27,
    "gemma-7b-it": 0.07,
    "qwen/qwen3-32b": 0.40,
}

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
DATABASE_URL: str = os.getenv("NEON_DATABASE_URL", "")

# ---------------------------------------------------------------------------
# Application settings
# ---------------------------------------------------------------------------
MAX_RECOMMENDATIONS: int = 5
MOCK_DATA_IF_DB_FAILS: bool = True

# ---------------------------------------------------------------------------
# CLI colour palette
# ---------------------------------------------------------------------------
CLI_COLORS: dict = {
    "header": "magenta",
    "question": "cyan",
    "answer": "white",
    "success": "green",
    "warning": "yellow",
    "error": "red",
}

# ---------------------------------------------------------------------------
# API settings
# ---------------------------------------------------------------------------
API_TIMEOUT: int = 30
MAX_RETRIES: int = 3

# ---------------------------------------------------------------------------
# Deployment settings
# ---------------------------------------------------------------------------
ALLOWED_ORIGINS: list[str] = [
    origin.strip()
    for origin in os.getenv("BACKEND_ALLOWED_ORIGINS", "*").split(",")
    if origin.strip()
]


def validate_environment() -> None:
    """
    Validate required environment variables at startup.

    Raises:
        ConfigurationError: If a required variable is missing or placeholder.
    """
    missing: list[str] = []

    if not GROQ_API_KEY or GROQ_API_KEY == _PLACEHOLDER_GROQ_KEY:
        missing.append("GROQ_API_KEY")

    if not DATABASE_URL:
        missing.append("NEON_DATABASE_URL")

    if missing:
        raise ConfigurationError(
            f"Missing required environment variables: {', '.join(missing)}",
            user_message=USER_MESSAGES["configuration_error"],
            detail=f"missing={missing}",
        )
