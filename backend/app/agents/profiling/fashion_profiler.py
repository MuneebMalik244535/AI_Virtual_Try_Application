import json
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt

console = Console()

class FashionProfiler:
    def __init__(self):
        pass
    
    def json_to_profile(self, preferences_json):
        """Convert JSON preferences to a structured style profile paragraph"""
        try:
            # Parse JSON if it's a string
            if isinstance(preferences_json, str):
                preferences = json.loads(preferences_json)
            else:
                preferences = preferences_json
            
            # Extract preferences with defaults
            budget = preferences.get('budget_range', 'moderate')
            occasion = preferences.get('occasion', 'casual')
            style = preferences.get('style', 'casual')
            height = preferences.get('height', 'average')
            body_type = preferences.get('body_type', 'average')
            skin_tone = preferences.get('skin_tone', 'medium')
            season = preferences.get('season', 'all')
            colors = preferences.get('preferred_colors', 'neutral')
            clothing_type = preferences.get('clothing_type', 'any')
            
            # Format budget
            budget_text = f"${budget}" if budget.replace('.', '', 1).isdigit() else budget
            
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
                if ',' in clothing_type:
                    clothing_text = f"items like {clothing_type}"
                else:
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
            
            purpose = occasion_phrases.get(occasion, 'suitable for the intended occasion')
            
            # Combine all parts
            profile = f"{'. '.join(profile_parts)}. The user is specifically looking for {clothing_text} {purpose}."
            
            return profile
            
        except Exception as e:
            return f"Error generating profile: {e}"
    
    def interactive_profiler(self):
        """Interactive mode that takes JSON input and generates profile"""
        console.print(Panel.fit(
            "🎨 Fashion Profiler 🎨\n\n"
            "I'll convert your fashion preferences into a clear, "
            "structured style profile paragraph.",
            title="Fashion Profiler",
            style="bold magenta"
        ))
        
        console.print("\n📝 Please provide your fashion preferences in JSON format:")
        console.print("Example: {\"budget_range\": \"80\", \"occasion\": \"casual\", ...}")
        
        # Get JSON input
        json_input = Prompt.ask("\nJSON preferences", default="")
        
        if not json_input.strip():
            console.print("❌ No input provided!", style="bold red")
            return
        
        # Generate profile
        profile = self.json_to_profile(json_input)
        
        # Display results
        console.print("\n" + "="*60)
        console.print(Panel.fit(
            "📄 Generated Style Profile",
            style="bold green"
        ))
        
        console.print(f"\n{profile}")
        
        console.print("\n" + "="*60)
        console.print(Panel.fit(
            "✨ Profile generated successfully!",
            style="bold blue"
        ))
    
    def batch_profiler(self, json_file_path):
        """Process multiple profiles from a JSON file"""
        try:
            with open(json_file_path, 'r') as f:
                data = json.load(f)
            
            profiles = []
            
            if isinstance(data, list):
                # Multiple profiles
                for i, preferences in enumerate(data, 1):
                    profile = self.json_to_profile(preferences)
                    profiles.append(f"Profile {i}: {profile}")
            else:
                # Single profile
                profile = self.json_to_profile(data)
                profiles.append(f"Profile: {profile}")
            
            return profiles
            
        except Exception as e:
            return [f"Error processing file: {e}"]

def main():
    try:
        profiler = FashionProfiler()
        
        console.print("🎨 Fashion Profiler Options:")
        console.print("1. Interactive mode (input JSON manually)")
        console.print("2. Process from file")
        
        choice = Prompt.ask(
            "\nChoose option",
            choices=["1", "2"],
            default="1"
        )
        
        if choice == "1":
            profiler.interactive_profiler()
        elif choice == "2":
            file_path = Prompt.ask("Enter JSON file path")
            profiles = profiler.batch_profiler(file_path)
            
            console.print("\n" + "="*60)
            console.print(Panel.fit(
                "📄 Generated Profiles",
                style="bold green"
            ))
            
            for profile in profiles:
                console.print(f"\n{profile}")
                console.print("-" * 40)
            
    except KeyboardInterrupt:
        console.print("\n👋 Goodbye!", style="bold yellow")
    except Exception as e:
        console.print(f"\n❌ An error occurred: {e}", style="bold red")

if __name__ == "__main__":
    main()
