"""
Centralized Groq LLM client.

Previously the call_groq_api function was duplicated in three separate files
(profile_builder.py, recommendation_agent.py, free_trial_agent.py).
This module provides a single, reusable wrapper used by all agents and routes.
"""

import time
from groq import Groq
from rich.console import Console
from app.core.config import GROQ_API_KEY
from app.core.errors import USER_MESSAGES
from app.logging.logger import log_api_call
from app.logging.structured_logger import logger
from app.core.exceptions import AppError, ConfigurationError, LLMError, MalformedAIResponseError

console = Console()

# ---------------------------------------------------------------------------
# SDK-based client (primary – uses Groq Python SDK)
# ---------------------------------------------------------------------------


def call_groq(
    prompt: str,
    model: str,
    *,
    temperature: float = 0.7,
    max_tokens: int = 4000,
    system_message: str | None = None,
    messages: list | None = None,
    log_cost: bool = True,
) -> dict:
    """
    Make a chat-completion call to Groq and return the raw response dict.

    Supports two calling modes:
    - Simple (prompt only):  pass `prompt` and optionally `system_message`.
    - Full control:          pass a pre-built `messages` list; `prompt` is ignored.

    Args:
        prompt:         User message content (ignored when `messages` is provided).
        model:          Groq model identifier (e.g. "llama-3.3-70b-versatile").
        temperature:    Sampling temperature.
        max_tokens:     Maximum tokens in the completion.
        system_message: Optional system-role message prepended to the conversation.
        messages:       Pre-built message list. If provided, `prompt` is ignored.
        log_cost:       Whether to print a cost report to stdout.

    Returns:
        The response as a dict (result of model_dump()).

    Raises:
        LLMError: If the API call fails.
    """
    start_time = time.time()
    prompt_text = prompt or ""
    if not prompt_text and messages:
        user_messages = [m.get("content", "") for m in messages if m.get("role") == "user"]
        prompt_text = user_messages[-1] if user_messages else str(messages)
    
    # Log prompt
    prompt_tokens = len(prompt_text) // 4  # Rough estimate
    logger.log_ai_prompt(
        model=model,
        prompt=prompt_text,
        prompt_tokens=prompt_tokens
    )
    
    try:
        if not GROQ_API_KEY or GROQ_API_KEY == "gsk_your_api_key_here":
            raise ConfigurationError(
                "GROQ_API_KEY is not configured",
                user_message=USER_MESSAGES["configuration_error"],
            )

        client = Groq(api_key=GROQ_API_KEY)

        if messages is None:
            messages = []
            if system_message:
                messages.append({"role": "system", "content": system_message})
            messages.append({"role": "user", "content": prompt})

        completion = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        result = completion.model_dump()
        response_time_ms = (time.time() - start_time) * 1000

        # Extract response text for logging
        response_text = result.get("choices", [{}])[0].get("message", {}).get("content", "")
        response_tokens = result.get("usage", {}).get("total_tokens", len(response_text) // 4)
        
        # Log response
        logger.log_ai_response(
            model=model,
            response=response_text,
            response_tokens=response_tokens,
            response_time_ms=response_time_ms
        )

        if log_cost:
            log_api_call(result, model, prompt or "")

        return result

    except AppError:
        raise
    except Exception as exc:
        response_time_ms = (time.time() - start_time) * 1000
        logger.log_api_failure(
            api_name="groq",
            error=str(exc),
            model=model,
            response_time_ms=response_time_ms,
        )
        console.print(f"❌ LLM API call failed: {exc}", style="bold red")
        raise LLMError(
            "Groq API call failed",
            user_message=USER_MESSAGES["llm_unavailable"],
            detail=str(exc),
        ) from exc


def extract_text(response: dict) -> str:
    """
    Pull the assistant's text content from a Groq response dict.

    Args:
        response: Dict produced by call_groq().

    Returns:
        The message content string.

    Raises:
        LLMError: If the response structure is unexpected.
    """
    try:
        content = response["choices"][0]["message"]["content"]
        if not content or not content.strip():
            raise MalformedAIResponseError(
                "LLM returned empty content",
                user_message=USER_MESSAGES["malformed_ai_response"],
            )
        return content
    except (KeyError, IndexError, TypeError) as exc:
        raise MalformedAIResponseError(
            "Unexpected LLM response structure",
            user_message=USER_MESSAGES["malformed_ai_response"],
            detail=str(exc),
        ) from exc
