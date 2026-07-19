import json
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.table import Table

console = Console()

class FashionPreferenceCollector:
    def __init__(self):
        self.preferences = {}
    
    def collect_preferences(self):
        """Collect fashion preferences by asking questions one by one"""
        console.print(Panel.fit(
            "🎨 Fashion Preference Collector 🎨\n\n"
            "I'll ask you a series of questions to understand your fashion needs "
            "and preferences. Your answers will help me provide better recommendations!",
            title="Welcome",
            style="bold magenta"
        ))
        
        # Question 1: Budget
        self.preferences['budget_range'] = Prompt.ask(
            "\n💰 What is your budget range for clothing?",
            default="moderate"
        )
        
        # Question 2: Occasion
        console.print("\n📅 What is the main occasion or function?")
        console.print("Options: casual, party, office, wedding")
        self.preferences['occasion'] = Prompt.ask(
            "Occasion",
            choices=["casual", "party", "office", "wedding"],
            default="casual"
        )
        
        # Question 3: Style
        console.print("\n👔 What clothing style do you prefer?")
        console.print("Options: minimal, streetwear, formal, sporty")
        self.preferences['style'] = Prompt.ask(
            "Style",
            choices=["minimal", "streetwear", "formal", "sporty"],
            default="casual"
        )
        
        # Question 4: Height
        self.preferences['height'] = Prompt.ask(
            "\n📏 What is your height?",
            default="average"
        )
        
        # Question 5: Body type
        console.print("\n💪 What is your body type?")
        console.print("Options: slim, average, athletic, heavy")
        self.preferences['body_type'] = Prompt.ask(
            "Body type",
            choices=["slim", "average", "athletic", "heavy"],
            default="average"
        )
        
        # Question 6: Skin tone
        console.print("\n🎨 What is your skin tone?")
        console.print("Options: light, medium, dark")
        self.preferences['skin_tone'] = Prompt.ask(
            "Skin tone",
            choices=["light", "medium", "dark"],
            default="medium"
        )
        
        # Question 7: Season
        console.print("\n🌸 Which season are you buying for?")
        console.print("Options: summer, winter, spring")
        self.preferences['season'] = Prompt.ask(
            "Season",
            choices=["summer", "winter", "spring"],
            default="all"
        )
        
        # Question 8: Colors
        self.preferences['preferred_colors'] = Prompt.ask(
            "\n🎨 Which colors do you prefer wearing?",
            default="neutral"
        )
        
        # Question 9: Clothing type
        console.print("\n👕 What type of clothing are you currently looking for?")
        console.print("Examples: shirt, hoodie, jacket, shoes, pants, dress, etc.")
        self.preferences['clothing_type'] = Prompt.ask(
            "Clothing type",
            default="any"
        )
        
        return self.preferences
    
    def display_summary(self):
        """Display collected preferences in a formatted table"""
        console.print("\n" + "="*60)
        console.print(Panel.fit(
            "📋 Your Fashion Preferences Summary",
            style="bold green"
        ))
        
        table = Table(title="Collected Preferences")
        table.add_column("Preference", style="cyan", no_wrap=True)
        table.add_column("Answer", style="yellow")
        
        preference_labels = {
            'budget_range': 'Budget Range',
            'occasion': 'Occasion',
            'style': 'Style Preference',
            'height': 'Height',
            'body_type': 'Body Type',
            'skin_tone': 'Skin Tone',
            'season': 'Season',
            'preferred_colors': 'Preferred Colors',
            'clothing_type': 'Clothing Type'
        }
        
        for key, value in self.preferences.items():
            label = preference_labels.get(key, key.replace('_', ' ').title())
            table.add_row(label, value)
        
        console.print(table)
    
    def get_json_output(self):
        """Return preferences as structured JSON"""
        return json.dumps(self.preferences, indent=2)
    
    def confirm_preferences(self):
        """Ask user to confirm if preferences are correct"""
        return Confirm.ask(
            "\n✅ Are these preferences correct?",
            default=True
        )

def main():
    try:
        collector = FashionPreferenceCollector()
        
        # Collect preferences
        preferences = collector.collect_preferences()
        
        # Display summary
        collector.display_summary()
        
        # Confirm preferences
        if collector.confirm_preferences():
            # Output JSON
            console.print("\n" + "="*60)
            console.print(Panel.fit(
                "📄 Your Fashion Preferences (JSON Format)",
                style="bold blue"
            ))
            
            json_output = collector.get_json_output()
            console.print(f"\n{json_output}")
            
            console.print("\n✨ Preferences collected successfully!")
        else:
            console.print("\n❌ Preferences not confirmed. Please run again.")
            
    except KeyboardInterrupt:
        console.print("\n👋 Goodbye!", style="bold yellow")
    except Exception as e:
        console.print(f"\n❌ An error occurred: {e}", style="bold red")

if __name__ == "__main__":
    main()
