"""
Custom application exceptions.

Provides a typed hierarchy so callers can catch specific error categories
without depending on third-party library exceptions directly.
"""


class AppError(Exception):
    """Base exception for all application errors."""

    def __init__(self, message: str, user_message: str = "", detail: str = ""):
        self.message = message
        self.user_message = user_message
        self.detail = detail
        super().__init__(message)


class DatabaseError(AppError):
    """Raised when a database operation fails (connection, query, etc.)."""


class LLMError(AppError):
    """Raised when an LLM / Groq API call fails or returns an unexpected result."""


class ProfileBuildError(AppError):
    """Raised when the user style-profile cannot be generated."""


class RecommendationError(AppError):
    """Raised when the recommendation pipeline encounters an unrecoverable error."""


class FreeTierLimitError(AppError):
    """Raised when a free-tier user exceeds their daily request quota."""


class ValidationError(AppError):
    """Raised when input data fails application-level validation."""


class ConfigurationError(AppError):
    """Raised when required environment variables or config are missing."""


class MalformedAIResponseError(AppError):
    """Raised when an LLM response cannot be parsed into the expected format."""
