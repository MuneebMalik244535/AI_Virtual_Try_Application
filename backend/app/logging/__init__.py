# logging package

from app.logging.structured_logger import (
    StructuredLogger,
    logger,
    log_ai_call,
    log_execution_time,
    log_free_trial_usage,
    log_gamified_unlock,
    log_profile_generation,
    log_recommendation_generation,
)

__all__ = [
    "StructuredLogger",
    "logger",
    "log_ai_call",
    "log_execution_time",
    "log_free_trial_usage",
    "log_gamified_unlock",
    "log_profile_generation",
    "log_recommendation_generation",
]
