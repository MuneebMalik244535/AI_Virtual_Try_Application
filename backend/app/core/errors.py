"""
User-safe error messages and helpers.

Logs full exception details internally; only returns generic, actionable
messages to API clients. Never exposes stack traces or internal details.
"""

from __future__ import annotations

import json
import re
from typing import Any

from app.core.exceptions import (
    AppError,
    ConfigurationError,
    DatabaseError,
    LLMError,
    MalformedAIResponseError,
    ProfileBuildError,
    RecommendationError,
    ValidationError,
)

# Safe messages shown to end users
USER_MESSAGES = {
    "generic": "Something went wrong. Please try again later.",
    "llm_unavailable": "The AI service is temporarily unavailable. Please try again later.",
    "database_unavailable": "We're having trouble accessing product data. Please try again later.",
    "invalid_input": "Some of the information provided is invalid. Please check your input and try again.",
    "malformed_ai_response": "We couldn't interpret the AI response. Please try again.",
    "configuration_error": "The service is not properly configured. Please contact support.",
    "profile_build_failed": "We couldn't build your style profile. Please try again.",
    "recommendation_failed": "We couldn't generate recommendations right now. Please try again.",
    "search_failed": "Your search could not be completed. Please try again.",
    "voice_processing_failed": "We couldn't process your voice command. Please try again.",
    "chat_unavailable": "I'm having trouble right now. Please try again!",
    "outfit_failed": "We couldn't complete your outfit. Please try again.",
    "admin_unavailable": "This admin feature is temporarily unavailable. Please try again later.",
}


def get_user_message(exc: Exception) -> str:
    """Map an exception to a safe, user-facing message."""
    if isinstance(exc, AppError) and exc.user_message:
        return exc.user_message

    if isinstance(exc, ConfigurationError):
        return USER_MESSAGES["configuration_error"]
    if isinstance(exc, ValidationError):
        return USER_MESSAGES["invalid_input"]
    if isinstance(exc, MalformedAIResponseError):
        return USER_MESSAGES["malformed_ai_response"]
    if isinstance(exc, LLMError):
        return USER_MESSAGES["llm_unavailable"]
    if isinstance(exc, DatabaseError):
        return USER_MESSAGES["database_unavailable"]
    if isinstance(exc, ProfileBuildError):
        return USER_MESSAGES["profile_build_failed"]
    if isinstance(exc, RecommendationError):
        return USER_MESSAGES["recommendation_failed"]

    # Pydantic / JSON decode — treat as bad input or malformed AI output
    exc_name = type(exc).__name__
    if exc_name in ("ValidationError", "RequestValidationError"):
        return USER_MESSAGES["invalid_input"]
    if exc_name == "JSONDecodeError":
        return USER_MESSAGES["malformed_ai_response"]

    return USER_MESSAGES["generic"]


def log_exception(logger, event_type: str, exc: Exception, **context) -> str:
    """
    Log the full error for operators and return a safe user message.
    Never includes stack traces in the return value.
    """
    logger.error(
        f"{event_type}: {type(exc).__name__}",
        event_type=event_type,
        error=str(exc),
        error_type=type(exc).__name__,
        **context,
    )
    return get_user_message(exc)


def parse_ai_json(raw: str) -> Any:
    """
    Parse JSON from an LLM response, stripping common markdown wrappers.

    Raises:
        MalformedAIResponseError: When the content is not valid JSON.
    """
    cleaned = raw.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise MalformedAIResponseError(
            "AI returned invalid JSON",
            user_message=USER_MESSAGES["malformed_ai_response"],
            detail=str(exc),
        ) from exc
