"""
Questions module for AI Fashion Stylist CLI
Handles user interaction and collects fashion preferences
"""

from rich.console import Console
from rich.prompt import Prompt
from rich.panel import Panel

console = Console()

def ask_fashion_questions():
    """
    Ask user 9 fashion-related questions and return answers as dictionary
    
    Returns:
        dict: Dictionary containing all user answers
    """
    
    console.print(Panel.fit(
        "👗 AI Fashion Stylist - Personal Style Questions 👗\n\n"
        "Please answer the following questions to help me understand your fashion preferences.",
        title="Fashion Questions",
        style="bold magenta"
    ))
    
    answers = {}
    
    # Question 1: Budget
    console.print("\n1️⃣ What is your clothing budget?", style="bold cyan")
    answers['budget'] = Prompt.ask("Your budget", default="moderate")
    
    # Question 2: Occasion
    console.print("\n2️⃣ What is the main occasion or function?", style="bold cyan")
    console.print("Options: casual, party, office, wedding")
    answers['occasion'] = Prompt.ask(
        "Occasion", 
        choices=["casual", "party", "office", "wedding"], 
        default="casual"
    )
    
    # Question 3: Style
    console.print("\n3️⃣ What clothing style do you prefer?", style="bold cyan")
    console.print("Options: minimal, streetwear, formal, sporty")
    answers['style'] = Prompt.ask(
        "Style", 
        choices=["minimal", "streetwear", "formal", "sporty"], 
        default="casual"
    )
    
    # Question 4: Height
    console.print("\n4️⃣ What is your height?", style="bold cyan")
    answers['height'] = Prompt.ask("Your height", default="average")
    
    # Question 5: Body type
    console.print("\n5️⃣ What is your body type?", style="bold cyan")
    console.print("Options: slim, average, athletic, heavy")
    answers['body_type'] = Prompt.ask(
        "Body type", 
        choices=["slim", "average", "athletic", "heavy"], 
        default="average"
    )
    
    # Question 6: Skin tone
    console.print("\n6️⃣ What is your skin tone?", style="bold cyan")
    console.print("Options: light, medium, dark")
    answers['skin_tone'] = Prompt.ask(
        "Skin tone", 
        choices=["light", "medium", "dark"], 
        default="medium"
    )
    
    # Question 7: Season
    console.print("\n7️⃣ Which season are you buying for?", style="bold cyan")
    console.print("Options: summer, winter, spring")
    answers['season'] = Prompt.ask(
        "Season", 
        choices=["summer", "winter", "spring"], 
        default="all"
    )
    
    # Question 8: Colors
    console.print("\n8️⃣ Which colors do you prefer wearing?", style="bold cyan")
    answers['preferred_colors'] = Prompt.ask("Your preferred colors", default="neutral")
    
    # Question 9: Clothing type
    console.print("\n9️⃣ What type of clothing are you currently looking for?", style="bold cyan")
    console.print("Examples: shirt, hoodie, jacket, shoes, pants, dress, etc.")
    answers['clothing_type'] = Prompt.ask("Clothing type", default="any")
    
    # Display summary
    console.print("\n" + "="*50)
    console.print(Panel.fit(
        "✅ Your answers have been recorded!",
        style="bold green"
    ))
    
    return answers

def display_answers_summary(answers):
    """
    Display a summary of user answers
    
    Args:
        answers (dict): Dictionary containing user answers
    """
    console.print("\n📋 Your Style Preferences Summary:")
    console.print("="*40)
    
    labels = {
        'budget': 'Budget',
        'occasion': 'Occasion',
        'style': 'Style Preference',
        'height': 'Height',
        'body_type': 'Body Type',
        'skin_tone': 'Skin Tone',
        'season': 'Season',
        'preferred_colors': 'Preferred Colors',
        'clothing_type': 'Clothing Type'
    }
    
    for key, value in answers.items():
        label = labels.get(key, key.replace('_', ' ').title())
        console.print(f"• {label}: {value}")
    
    console.print("="*40)
