import json
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from typing import Dict, Any

console = Console()

class TokenMonitor:
    def __init__(self):
        # Groq pricing (approximate as of 2024)
        self.pricing = {
            'input_cost_per_1k': 0.05,  # $0.05 per 1K input tokens
            'output_cost_per_1k': 0.15,  # $0.15 per 1K output tokens
        }
    
    def count_tokens(self, text: str) -> int:
        """Estimate token count - roughly 1 token per 4 characters for English text"""
        if not text:
            return 0
        
        # Remove extra whitespace and count characters
        clean_text = ' '.join(text.split())
        # Rough estimation: ~4 characters per token for English
        return len(clean_text) // 4
    
    def count_json_tokens(self, data: Any) -> int:
        """Count tokens in JSON data"""
        if isinstance(data, str):
            return self.count_tokens(data)
        elif isinstance(data, (dict, list)):
            json_str = json.dumps(data, indent=2)
            return self.count_tokens(json_str)
        else:
            return self.count_tokens(str(data))
    
    def analyze_request(self, user_style_profile: str, product_catalog_input: list, ai_response: str):
        """Analyze token usage for a complete AI recommendation request"""
        console.print(Panel.fit(
            "🔍 AI System Token Monitor 🔍\n\n"
            "Analyzing token usage and cost for AI recommendation request...",
            title="Token Monitor",
            style="bold magenta"
        ))
        
        # Count input tokens
        profile_tokens = self.count_tokens(user_style_profile)
        catalog_tokens = sum(self.count_json_tokens(product) for product in product_catalog_input)
        system_prompt_tokens = self.count_tokens(self.get_system_prompt())
        
        input_tokens = profile_tokens + catalog_tokens + system_prompt_tokens
        
        # Count output tokens
        output_tokens = self.count_tokens(ai_response)
        
        # Calculate total
        total_tokens = input_tokens + output_tokens
        
        # Calculate costs
        input_cost = (input_tokens / 1000) * self.pricing['input_cost_per_1k']
        output_cost = (output_tokens / 1000) * self.pricing['output_cost_per_1k']
        total_cost = input_cost + output_cost
        
        # Display results
        self.display_report(
            input_tokens, 
            output_tokens, 
            total_tokens,
            input_cost,
            output_cost,
            total_cost,
            profile_tokens,
            catalog_tokens,
            system_prompt_tokens
        )
    
    def get_system_prompt(self) -> str:
        """Get the system prompt used for recommendations"""
        return """You are an AI fashion stylist recommendation engine.

Inputs you will receive:
1. User Style Profile
2. Product Catalog fetched from database

Instructions:
* Carefully analyze the user profile.
* Compare the profile with the available product catalog.
* Select the most suitable products.

Rules:
* Only recommend products that exist in the provided catalog.
* Do NOT create new clothing items.
* Maximum 5 recommendations.

Output Format:
Recommended Products:
1. Product Name:
   Price:
   Reason:
Explain briefly why each product matches the user's style, body type, season, and budget."""
    
    def display_report(self, input_tokens: int, output_tokens: int, total_tokens: int,
                      input_cost: float, output_cost: float, total_cost: float,
                      profile_tokens: int, catalog_tokens: int, system_prompt_tokens: int):
        """Display comprehensive token usage report"""
        console.print("\n" + "="*40)
        console.print("TOKEN USAGE REPORT")
        console.print("="*40)
        
        # Main token counts
        console.print(f"\nInput Tokens: {input_tokens:,}")
        console.print(f"Output Tokens: {output_tokens:,}")
        console.print(f"Total Tokens: {total_tokens:,}")
        
        # Cost estimate
        console.print("\n" + "="*40)
        console.print("APPROXIMATE COST ESTIMATE")
        console.print("="*40)
        console.print(f"Input Cost: ${input_cost:.4f}")
        console.print(f"Output Cost: ${output_cost:.4f}")
        console.print(f"Total Cost: ${total_cost:.4f}")
        
        # Detailed breakdown
        console.print("\n" + "="*40)
        console.print("DETAILED BREAKDOWN")
        console.print("="*40)
        
        table = Table(title="Input Token Breakdown")
        table.add_column("Component", style="cyan")
        table.add_column("Tokens", style="yellow", justify="right")
        table.add_column("Percentage", style="green", justify="right")
        
        table.add_row("User Profile", f"{profile_tokens:,}", f"{(profile_tokens/input_tokens)*100:.1f}%")
        table.add_row("Product Catalog", f"{catalog_tokens:,}", f"{(catalog_tokens/input_tokens)*100:.1f}%")
        table.add_row("System Prompt", f"{system_prompt_tokens:,}", f"{(system_prompt_tokens/input_tokens)*100:.1f}%")
        table.add_row("Total Input", f"{input_tokens:,}", "100.0%")
        
        console.print(table)
        
        # Notes
        console.print("\n" + "="*40)
        console.print("NOTES")
        console.print("="*40)
        
        # Determine which part consumed most tokens
        if catalog_tokens > profile_tokens and catalog_tokens > system_prompt_tokens:
            main_consumer = "Product catalog consumed the most tokens due to detailed product information including names, prices, colors, styles, and descriptions for each item."
        elif profile_tokens > system_prompt_tokens:
            main_consumer = "User profile consumed the most tokens, likely due to detailed style preferences, body type information, and specific requirements."
        else:
            main_consumer = "System prompt consumed the most tokens due to detailed instructions and formatting requirements for the recommendation engine."
        
        console.print(f"📊 {main_consumer}")
        
        # Additional insights
        console.print(f"\n💡 Additional Insights:")
        console.print(f"• Average cost per recommendation: ${total_cost/5:.4f}")
        console.print(f"• Tokens per product: {catalog_tokens/len([1]) if catalog_tokens > 0 else 0:.0f}")
        console.print(f"• Output efficiency: {output_tokens/input_tokens:.2f} (output/input ratio)")
        
        # Cost optimization tips
        console.print(f"\n💰 Cost Optimization Tips:")
        if catalog_tokens > 1000:
            console.print(f"• Consider filtering product catalog to reduce input tokens")
        if output_tokens > 500:
            console.print(f"• Response could be more concise to reduce output tokens")
        if total_cost > 0.10:
            console.print(f"• Total cost is relatively high - consider optimization")
        else:
            console.print(f"• Cost is reasonable for this type of recommendation")

def main():
    try:
        monitor = TokenMonitor()
        
        # Sample data for demonstration
        user_style_profile = """The user has a budget of $280 and is looking for party formal for summer. The user has an athletic body type, medium skin tone, and prefers black and blue colors. The user is specifically looking for complete dress perfect for social events and parties."""
        
        product_catalog_input = [
            {
                "product_id": 11,
                "product_name": "Red Cocktail Dress",
                "product_category": "dresses",
                "product_price": 129.99,
                "product_color": "red",
                "product_style": "formal,evening,bold",
                "product_description": "Stunning red dress for special occasions"
            },
            {
                "product_id": 3,
                "product_name": "Navy Blue Blazer",
                "product_category": "jackets",
                "product_price": 199.99,
                "product_color": "navy",
                "product_style": "formal,business,classic",
                "product_description": "Elegant navy blazer for professional settings"
            },
            {
                "product_id": 7,
                "product_name": "Black Trench Coat",
                "product_category": "coats",
                "product_price": 249.99,
                "product_color": "black",
                "product_style": "formal,classic,all-weather",
                "product_description": "Timeless black trench coat for rain and style"
            }
        ]
        
        ai_response = """================================
AI STYLIST RECOMMENDATIONS
================================

1️⃣ Red Cocktail Dress
Price: $129.99
Reason: Fits your $280 budget. Matches your formal style preference. Ideal for party events

2️⃣ Navy Blue Blazer
Price: $199.99
Reason: Fits your $280 budget. Matches your formal style preference. Ideal for party events

3️⃣ Black Trench Coat
Price: $249.99
Reason: Fits your $280 budget. Matches your formal style preference. Ideal for party events

================================"""
        
        # Analyze the request
        monitor.analyze_request(user_style_profile, product_catalog_input, ai_response)
        
    except KeyboardInterrupt:
        console.print("\n👋 Goodbye!", style="bold yellow")
    except Exception as e:
        console.print(f"\n❌ An error occurred: {e}", style="bold red")

if __name__ == "__main__":
    main()
