"""
Structured application logger.

Wraps the cost-logging and session-reporting logic from the original
cost_logger.py into a single, importable module used by agents and routes.
"""

from rich.console import Console
from app.core.config import MODEL_PRICING

console = Console()


# ---------------------------------------------------------------------------
# Per-call cost helpers
# ---------------------------------------------------------------------------

def calculate_cost(total_tokens: int, model_name: str) -> float:
    """
    Calculate estimated cost based on token usage and model pricing.

    Args:
        total_tokens: Total number of tokens used in the call.
        model_name:   Name of the Groq model used.

    Returns:
        Estimated cost in USD.
    """
    price_per_million = MODEL_PRICING.get(model_name, MODEL_PRICING["llama3-8b-8192"])
    return (total_tokens / 1_000_000) * price_per_million


def display_cost_report(
    model_name: str,
    input_tokens: int,
    output_tokens: int,
    total_tokens: int,
    estimated_cost: float,
) -> None:
    """Display a cost report to stdout via Rich."""
    console.print("\n" + "=" * 30)
    console.print("💰 AI COST REPORT")
    console.print("=" * 30)
    console.print(f"Model Used:      {model_name}")
    console.print(f"Input Tokens:    {input_tokens}")
    console.print(f"Output Tokens:   {output_tokens}")
    console.print(f"Total Tokens:    {total_tokens}")
    console.print(f"Estimated Cost:  ${estimated_cost:.6f}")
    console.print("=" * 30)


def log_api_call(response: dict, model_name: str, prompt: str) -> None:
    """
    Extract token usage from a Groq response dict and emit a cost report.

    Args:
        response:   API response dict (already model_dump()'d).
        model_name: Name of the model used.
        prompt:     The original prompt sent (kept for future audit logging).
    """
    try:
        usage = response.get("usage", {})
        input_tokens = usage.get("prompt_tokens", 0)
        output_tokens = usage.get("completion_tokens", 0)
        total_tokens = usage.get("total_tokens", input_tokens + output_tokens)

        estimated_cost = calculate_cost(total_tokens, model_name)
        display_cost_report(model_name, input_tokens, output_tokens, total_tokens, estimated_cost)

    except Exception as exc:
        console.print(f"⚠️  Error logging API call: {exc}", style="bold yellow")


# ---------------------------------------------------------------------------
# Session-level summary
# ---------------------------------------------------------------------------

def log_session_costs(session_data: dict) -> None:
    """
    Log aggregate costs for an entire CLI session.

    Args:
        session_data: Dict of {call_name: {"cost": float, "tokens": int, "model": str}}.
    """
    console.print("\n" + "=" * 40)
    console.print("📊 SESSION COST SUMMARY")
    console.print("=" * 40)

    total_cost = 0.0
    total_tokens = 0

    for call_name, call_data in session_data.items():
        if isinstance(call_data, dict) and "cost" in call_data:
            cost = call_data["cost"]
            tokens = call_data.get("tokens", 0)
            model = call_data.get("model", "unknown")

            console.print(f"{call_name}:")
            console.print(f"  Model:  {model}")
            console.print(f"  Tokens: {tokens}")
            console.print(f"  Cost:   ${cost:.6f}")
            console.print()

            total_cost += cost
            total_tokens += tokens

    console.print(f"TOTAL SESSION COST:   ${total_cost:.6f}")
    console.print(f"TOTAL TOKENS USED:    {total_tokens}")
    console.print("=" * 40)


# ---------------------------------------------------------------------------
# Utility
# ---------------------------------------------------------------------------

def estimate_prompt_tokens(prompt: str) -> int:
    """
    Rough token-count estimate (~4 chars per token for English text).

    Args:
        prompt: The prompt text.

    Returns:
        Estimated token count.
    """
    clean_text = " ".join(prompt.split())
    return len(clean_text) // 4


def get_cost_efficiency_rating(total_tokens: int, total_cost: float) -> str:
    """
    Return a human-readable efficiency rating for a session.

    Args:
        total_tokens: Total tokens consumed.
        total_cost:   Total cost incurred (USD).

    Returns:
        One of: "Excellent", "Good", "Fair", "High".
    """
    cost_per_token = total_cost / total_tokens if total_tokens > 0 else 0

    if cost_per_token < 0.0000001:
        return "Excellent"
    elif cost_per_token < 0.0000002:
        return "Good"
    elif cost_per_token < 0.0000005:
        return "Fair"
    else:
        return "High"
