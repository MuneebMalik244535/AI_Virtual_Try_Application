"""
Configuration file for AI Fashion Stylist CLI
Contains API settings, model configuration, and pricing information
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Groq API Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "gsk_your_api_key_here")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"

# Model Configuration
MODEL_NAME = os.getenv("GROQ_MODEL", "llama3-8b-8192")
PROFILE_MODEL = os.getenv("GROQ_MODEL", "llama3-8b-8192")
RECOMMENDATION_MODEL = os.getenv("GROQ_MODEL", "llama3-8b-8192")

# Pricing (per million tokens) - Updated Groq pricing
MODEL_PRICING = {
    "llama3-8b-8192": 0.05,  # $0.05 per million tokens
    "llama3-70b-8192": 0.59,  # $0.59 per million tokens
    "mixtral-8x7b-32768": 0.27,  # $0.27 per million tokens
    "gemma-7b-it": 0.07,  # $0.07 per million tokens
    "qwen/qwen3-32b": 0.40,  # $0.40 per million tokens (for the model in .env)
}

# Database Configuration
DATABASE_URL = os.getenv("NEON_DATABASE_URL", "postgresql://neondb_owner:npg_DY7Vv8WhJOMi@ep-little-mud-ai7rvo11-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")

# Application Settings
MAX_RECOMMENDATIONS = 5
MOCK_DATA_IF_DB_FAILS = True

# CLI Settings
CLI_COLORS = {
    "header": "magenta",
    "question": "cyan",
    "answer": "white",
    "success": "green",
    "warning": "yellow",
    "error": "red"
}

# API Settings
API_TIMEOUT = 30
MAX_RETRIES = 3
