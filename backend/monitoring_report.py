from rich.console import Console
from typing import Dict, List, Any

console = Console()

class MonitoringReport:
    def __init__(self):
        # Groq pricing
        self.model_pricing = {
            'llama3-8b-8192': {
                'input_cost_per_1k': 0.05,
                'output_cost_per_1k': 0.15,
                'name': 'Llama 3 8B'
            },
            'llama3-70b-8192': {
                'input_cost_per_1k': 0.59,
                'output_cost_per_1k': 0.79,
                'name': 'Llama 3 70B'
            },
            'mixtral-8x7b-32768': {
                'input_cost_per_1k': 0.27,
                'output_cost_per_1k': 0.27,
                'name': 'Mixtral 8x7B'
            },
            'gemma-7b-it': {
                'input_cost_per_1k': 0.07,
                'output_cost_per_1k': 0.07,
                'name': 'Gemma 7B'
            }
        }
    
    def count_tokens(self, text: str) -> int:
        """Estimate token count - roughly 1 token per 4 characters"""
        if not text:
            return 0
        clean_text = ' '.join(text.split())
        return len(clean_text) // 4
    
    def generate_report(self, user_profile: str, product_catalog: List[Dict], ai_response: str, 
                       model_name: str = 'llama3-8b-8192', recommendations_count: int = 0):
        """Generate monitoring report after recommendation request"""
        
        # Get model info
        if model_name not in self.model_pricing:
            model_name = 'llama3-8b-8192'
        
        model_info = self.model_pricing[model_name]
        
        # Count tokens
        input_tokens = self.count_tokens(user_profile)
        
        # Count catalog tokens
        import json
        catalog_json = json.dumps(product_catalog, indent=2)
        catalog_tokens = self.count_tokens(catalog_json)
        
        # System prompt tokens
        system_prompt = self.get_system_prompt()
        system_tokens = self.count_tokens(system_prompt)
        
        # Total input tokens
        total_input_tokens = input_tokens + catalog_tokens + system_tokens
        
        # Output tokens
        output_tokens = self.count_tokens(ai_response)
        
        # Total tokens
        total_tokens = total_input_tokens + output_tokens
        
        # Calculate cost
        input_cost = (total_input_tokens / 1000) * model_info['input_cost_per_1k']
        output_cost = (output_tokens / 1000) * model_info['output_cost_per_1k']
        total_cost = input_cost + output_cost
        
        # Display report
        self.display_report(
            model_info['name'],
            total_input_tokens,
            output_tokens,
            total_tokens,
            total_cost,
            recommendations_count
        )
        
        return {
            'model_name': model_info['name'],
            'input_tokens': total_input_tokens,
            'output_tokens': output_tokens,
            'total_tokens': total_tokens,
            'estimated_cost': total_cost,
            'products_recommended': recommendations_count
        }
    
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
    
    def display_report(self, model_name: str, input_tokens: int, output_tokens: int, 
                      total_tokens: int, estimated_cost: float, products_recommended: int):
        """Display CLI monitoring report in specified format"""
        
        console.print("\n" + "="*30)
        console.print("AI COST REPORT")
        console.print("="*30)
        console.print()
        
        console.print(f"Model Used: {model_name} (Groq)")
        console.print()
        
        console.print(f"Input Tokens: {input_tokens}")
        console.print(f"Output Tokens: {output_tokens}")
        console.print(f"Total Tokens: {total_tokens}")
        console.print()
        
        console.print(f"Estimated Cost: ${estimated_cost:.4f}")
        console.print()
        
        console.print(f"Products Recommended: {products_recommended}")
        console.print()
        
        console.print("="*30)

def main():
    try:
        reporter = MonitoringReport()
        
        # Sample data for demonstration
        user_profile = """The user has a budget of $280 and is looking for party formal for summer. The user has an athletic body type, medium skin tone, and prefers black and blue colors. The user is specifically looking for complete dress perfect for social events and parties."""
        
        product_catalog = [
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

================================"""
        
        # Generate report
        report_data = reporter.generate_report(
            user_profile,
            product_catalog,
            ai_response,
            'llama3-70b-8192',
            2
        )
        
        console.print(f"\n📊 Report data saved: {report_data}")
        
    except Exception as e:
        console.print(f"\n❌ An error occurred: {e}", style="bold red")

if __name__ == "__main__":
    main()
