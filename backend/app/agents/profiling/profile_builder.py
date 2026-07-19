"""
Profile Builder module for AI Fashion Stylist CLI
Converts user answers into a style profile paragraph using LLM
"""

import json
from rich.console import Console
from rich.panel import Panel
from app.core.config import PROFILE_MODEL
from app.core.exceptions import AppError
from app.llm.groq_client import call_groq, extract_text
from app.logging.structured_logger import logger

console = Console()

def build_style_profile(answers):
    """
    Convert user answers dictionary into a style profile paragraph using LLM
    
    Args:
        answers (dict): Dictionary containing user answers
        
    Returns:
        str: Generated style profile paragraph
    """
    
    console.print("\n🎨 Generating your personal style profile...", style="bold cyan")
    
    # Create the prompt for the LLM
    prompt = f"""
You are a fashion profiling assistant. Convert the user's answers into a clear and structured style profile paragraph.

User Answers:
{json.dumps(answers, indent=2)}

The profile should summarize:
* Budget
* Occasion
* Preferred style
* Height
* Body type
* Skin tone
* Season
* Color preference
* Clothing category

Write the output in a short paragraph that describes the user's fashion needs clearly.

Example format:
"The user has a budget of $80 and is looking for casual streetwear for summer. The user has an athletic body type, medium skin tone, and prefers black and neutral colors. The user is specifically looking for hoodies or t-shirts suitable for daily casual wear."
"""
    
    try:
        response = call_groq(prompt, PROFILE_MODEL)
        profile = extract_text(response).strip().replace('"', "")

        console.print("\n" + "="*50)
        console.print(Panel.fit(
            "📄 Generated Style Profile",
            style="bold green"
        ))
        console.print(f"\n{profile}")
        console.print("="*50)

        return profile

    except AppError:
        raise
    except Exception as exc:
        logger.error(
            "Profile generation failed",
            event_type="profile_error",
            error=str(exc),
        )
        console.print(f"⚠️ Error generating profile: {exc}", style="bold yellow")
        return generate_fallback_profile(answers)

def generate_fallback_profile(answers):
    """
    Generate a simple profile without LLM
    
    Args:
        answers (dict): User answers
        
    Returns:
        str: Simple profile paragraph
    """
    
    budget = answers.get('budget', 'moderate')
    occasion = answers.get('occasion', 'casual')
    style = answers.get('style', 'casual')
    body_type = answers.get('body_type', 'average')
    skin_tone = answers.get('skin_tone', 'medium')
    season = answers.get('season', 'all')
    colors = answers.get('preferred_colors', 'neutral')
    clothing_type = answers.get('clothing_type', 'any')
    
    profile = f"""The user has a budget of {budget} and is looking for {occasion} {style} for {season}. 
The user has an {body_type} body type, {skin_tone} skin tone, and prefers {colors} colors. 
The user is specifically looking for {clothing_type} suitable for their needs."""
    
    return profile
