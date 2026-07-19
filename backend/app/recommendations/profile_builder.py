"""
Profile builder – converts user Q&A answers into a style-profile paragraph.

Uses the Groq LLM (via the centralised groq_client) with a fallback to a
template-based paragraph when the API is unavailable.
Migrated from the flat profile_builder.py with no functional changes.
"""

from rich.console import Console
from rich.panel import Panel

from app.core.config import PROFILE_MODEL
from app.llm.groq_client import call_groq, extract_text
from app.prompts.templates import build_profile_prompt

console = Console()


def build_style_profile(answers: dict) -> str:
    """
    Convert user answers into a LLM-generated style profile paragraph.

    Args:
        answers: Dict of user Q&A (budget, occasion, style, height, body_type,
                 skin_tone, season, preferred_colors, clothing_type).

    Returns:
        A descriptive paragraph summarising the user's fashion needs.
    """
    console.print("\n🎨 Generating your personal style profile...", style="bold cyan")

    prompt = build_profile_prompt(answers)

    try:
        response = call_groq(prompt, PROFILE_MODEL)
        profile = extract_text(response).strip().replace('"', "")

        console.print("\n" + "=" * 50)
        console.print(Panel.fit("📄 Generated Style Profile", style="bold green"))
        console.print(f"\n{profile}")
        console.print("=" * 50)

        return profile

    except Exception as exc:
        console.print(f"⚠️  Error generating profile: {exc}", style="bold yellow")
        return _generate_fallback_profile(answers)


def _generate_fallback_profile(answers: dict) -> str:
    """
    Template-based fallback profile used when the LLM is unavailable.

    Args:
        answers: User Q&A dict.

    Returns:
        A simple one-paragraph profile string.
    """
    budget = answers.get("budget", "moderate")
    occasion = answers.get("occasion", "casual")
    style = answers.get("style", "casual")
    body_type = answers.get("body_type", "average")
    skin_tone = answers.get("skin_tone", "medium")
    season = answers.get("season", "all")
    colors = answers.get("preferred_colors", "neutral")
    clothing_type = answers.get("clothing_type", "any")

    return (
        f"The user has a budget of {budget} and is looking for {occasion} {style} for {season}. "
        f"The user has an {body_type} body type, {skin_tone} skin tone, and prefers {colors} colors. "
        f"The user is specifically looking for {clothing_type} suitable for their needs."
    )
