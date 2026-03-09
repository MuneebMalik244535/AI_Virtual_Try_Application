"""
Profile Builder module for AI Fashion Stylist CLI
Converts user answers into a style profile paragraph using LLM
"""

import json
import os
from rich.console import Console
from rich.panel import Panel
from config import GROQ_API_KEY, GROQ_BASE_URL, PROFILE_MODEL
from cost_logger import log_api_call

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
        # Call Groq API
        response = call_groq_api(prompt, PROFILE_MODEL)
        
        if response:
            # Extract the profile from response
            profile = extract_profile_from_response(response)
            
            console.print("\n" + "="*50)
            console.print(Panel.fit(
                "📄 Generated Style Profile",
                style="bold green"
            ))
            console.print(f"\n{profile}")
            console.print("="*50)
            
            return profile
        else:
            # Fallback to simple profile generation
            return generate_fallback_profile(answers)
            
    except Exception as e:
        console.print(f"⚠️ Error generating profile: {e}", style="bold yellow")
        return generate_fallback_profile(answers)

def call_groq_api(prompt, model):
    """
    Make API call to Groq
    
    Args:
        prompt (str): The prompt to send
        model (str): Model name to use
        
    Returns:
        dict: API response
    """
    
    try:
        import requests
        
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 4000
        }
        
        response = requests.post(
            f"{GROQ_BASE_URL}/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            # Log the API call for cost tracking
            log_api_call(result, model, prompt)
            
            return result
        else:
            console.print(f"❌ API Error: {response.status_code}", style="bold red")
            return None
            
    except Exception as e:
        console.print(f"❌ API call failed: {e}", style="bold red")
        return None

def extract_profile_from_response(response):
    """
    Extract the profile paragraph from API response
    
    Args:
        response (dict): API response
        
    Returns:
        str: Profile paragraph
    """
    
    try:
        content = response['choices'][0]['message']['content']
        # Clean up the response
        profile = content.strip().replace('"', '')
        return profile
    except (KeyError, IndexError):
        return "Profile generation failed. Please try again."

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
