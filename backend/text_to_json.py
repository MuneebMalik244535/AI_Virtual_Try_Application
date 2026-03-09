import json
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt

console = Console()

class TextToJsonConverter:
    def __init__(self):
        self.questions = [
            "What is your budget range for clothing?",
            "What is the main occasion or function? (casual, party, office, wedding)",
            "What clothing style do you prefer? (minimal, streetwear, formal, sporty)",
            "What is your height?",
            "What is your body type? (slim, average, athletic, heavy)",
            "What is your skin tone? (light, medium, dark)",
            "Which season are you buying for? (summer, winter, spring)",
            "Which colors do you prefer wearing?",
            "What type of clothing are you currently looking for? (shirt, hoodie, jacket, shoes etc.)"
        ]
        
        self.json_keys = [
            "budget_range",
            "occasion", 
            "style",
            "height",
            "body_type",
            "skin_tone",
            "season",
            "preferred_colors",
            "clothing_type"
        ]
    
    def collect_text_answers(self):
        """Collect answers from user in normal text format"""
        console.print(Panel.fit(
            "🎝 Fashion Preference Collector 🎝\n\n"
            "I'll ask you some simple questions about your fashion preferences. "
            "Just answer in normal text - I'll convert it to JSON format for you!",
            title="Text to JSON Converter",
            style="bold magenta"
        ))
        
        answers = {}
        
        for i, (question, key) in enumerate(zip(self.questions, self.json_keys), 1):
            console.print(f"\n❓ Question {i}: {question}")
            answer = Prompt.ask("Your answer", default="")
            answers[key] = answer
        
        return answers
    
    def convert_to_json(self, answers):
        """Convert text answers to JSON format"""
        return json.dumps(answers, indent=2)
    
    def generate_style_profile(self, answers):
        """Generate a style profile paragraph from the answers"""
        budget = answers.get('budget_range', 'moderate')
        occasion = answers.get('occasion', 'casual')
        style = answers.get('style', 'casual')
        height = answers.get('height', 'average')
        body_type = answers.get('body_type', 'average')
        skin_tone = answers.get('skin_tone', 'medium')
        season = answers.get('season', 'all')
        colors = answers.get('preferred_colors', 'neutral')
        clothing_type = answers.get('clothing_type', 'any')
        
        # Format budget
        if budget.replace('$', '').replace('.', '').isdigit():
            budget_text = f"${budget}"
        else:
            budget_text = budget
        
        # Build the profile paragraph
        profile_parts = []
        
        # Budget and occasion
        profile_parts.append(f"The user has a budget of {budget_text} and is looking for {occasion} {style} for {season}")
        
        # Physical characteristics
        profile_parts.append(f"The user has an {body_type} body type, {skin_tone} skin tone")
        
        # Height (if meaningful)
        if height and height != 'average':
            profile_parts.append(f"and is {height} in height")
        
        # Color preference
        profile_parts.append(f"and prefers {colors} colors")
        
        # Clothing category
        if clothing_type and clothing_type != 'any':
            clothing_text = f"{clothing_type}"
        else:
            clothing_text = "various clothing items"
        
        # Purpose/occasion detail
        occasion_phrases = {
            'casual': 'suitable for daily casual wear',
            'office': 'appropriate for professional settings',
            'party': 'perfect for social events and parties',
            'wedding': 'ideal for formal wedding occasions'
        }
        
        purpose = occasion_phrases.get(occasion.lower(), 'suitable for the intended occasion')
        
        # Combine all parts
        profile = f"{'. '.join(profile_parts)}. The user is specifically looking for {clothing_text} {purpose}."
        
        return profile
    
    def display_results(self, answers, json_output, profile):
        """Display all results in a formatted way"""
        console.print("\n" + "="*60)
        console.print(Panel.fit(
            "📋 Your Answers Summary",
            style="bold green"
        ))
        
        for i, (key, value) in enumerate(answers.items(), 1):
            console.print(f"{i}. {key.replace('_', ' ').title()}: {value}")
        
        console.print("\n" + "="*60)
        console.print(Panel.fit(
            "📄 JSON Output (for AI agents)",
            style="bold blue"
        ))
        
        console.print(f"\n{json_output}")
        
        console.print("\n" + "="*60)
        console.print(Panel.fit(
            "🎨 Style Profile Paragraph",
            style="bold cyan"
        ))
        
        console.print(f"\n{profile}")

def main():
    try:
        converter = TextToJsonConverter()
        
        # Collect text answers
        answers = converter.collect_text_answers()
        
        # Convert to JSON
        json_output = converter.convert_to_json(answers)
        
        # Generate style profile
        profile = converter.generate_style_profile(answers)
        
        # Display all results
        converter.display_results(answers, json_output, profile)
        
        console.print("\n✨ Conversion completed successfully!")
        
    except KeyboardInterrupt:
        console.print("\n👋 Goodbye!", style="bold yellow")
    except Exception as e:
        console.print(f"\n❌ An error occurred: {e}", style="bold red")

if __name__ == "__main__":
    main()
