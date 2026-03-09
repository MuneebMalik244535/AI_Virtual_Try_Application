import json
import uuid
from datetime import datetime
from typing import Dict, List, Any
from rich.console import Console
from rich.panel import Panel

console = Console()

class RecommendationLogger:
    def __init__(self):
        self.pricing = {
            'llama3-8b-8192': {'input_cost_per_1k': 0.05, 'output_cost_per_1k': 0.15},
            'llama3-70b-8192': {'input_cost_per_1k': 0.59, 'output_cost_per_1k': 0.79},
            'mixtral-8x7b-32768': {'input_cost_per_1k': 0.27, 'output_cost_per_1k': 0.27},
            'gemma-7b-it': {'input_cost_per_1k': 0.07, 'output_cost_per_1k': 0.07}
        }
    
    def calculate_cost(self, input_tokens: int, output_tokens: int, model_name: str) -> float:
        """Calculate cost based on model pricing"""
        if model_name not in self.pricing:
            model_name = 'llama3-8b-8192'
        
        pricing = self.pricing[model_name]
        input_cost = (input_tokens / 1000) * pricing['input_cost_per_1k']
        output_cost = (output_tokens / 1000) * pricing['output_cost_per_1k']
        return input_cost + output_cost
    
    def log_recommendation_session(self, 
                                 user_id: str = None,
                                 questions_answers: Dict[str, str] = None,
                                 profile_generated: str = None,
                                 products_fetched: List[Dict] = None,
                                 tokens_used: Dict[str, int] = None,
                                 model_name: str = 'llama3-70b-8192',
                                 recommendations: List[Dict] = None) -> Dict[str, Any]:
        """Log complete recommendation session with all required data points"""
        
        # Generate user_id if not provided
        if not user_id:
            user_id = str(uuid.uuid4())[:8]
        
        # Calculate cost
        if tokens_used:
            input_tokens = tokens_used.get('input_tokens', 0)
            output_tokens = tokens_used.get('output_tokens', 0)
            total_tokens = tokens_used.get('total_tokens', input_tokens + output_tokens)
            cost = self.calculate_cost(input_tokens, output_tokens, model_name)
        else:
            input_tokens = output_tokens = total_tokens = 0
            cost = 0.0
        
        # Create timestamp
        timestamp = datetime.now().isoformat()
        
        # Build log entry
        log_entry = {
            'user_id': user_id,
            'questions_answers': questions_answers or {},
            'profile_generated': profile_generated or "",
            'products_fetched': products_fetched or [],
            'tokens_used': {
                'input_tokens': input_tokens,
                'output_tokens': output_tokens,
                'total_tokens': total_tokens
            },
            'cost': cost,
            'model_used': model_name,
            'recommendations': recommendations or [],
            'timestamp': timestamp
        }
        
        return log_entry
    
    def display_cost_report(self, input_tokens: int, output_tokens: int, total_tokens: int, 
                          model_name: str, cost: float):
        """Display the cost report in the specified format"""
        console.print("\n" + "="*30)
        console.print("AI COST REPORT")
        console.print("="*30)
        console.print(f"Model Used: {model_name}")
        console.print(f"Input Tokens: {input_tokens}")
        console.print(f"Output Tokens: {output_tokens}")
        console.print(f"Total Tokens: {total_tokens}")
        console.print(f"Estimated Cost: ${cost:.5f}")
        console.print("="*30)
    
    def display_recommendations(self, recommendations: List[Dict]):
        """Display recommendations in the specified format"""
        console.print("\nAI STYLIST RECOMMENDATIONS")
        console.print()
        
        for i, rec in enumerate(recommendations, 1):
            console.print(f"{i}. {rec.get('name', 'Unknown Product')}")
            console.print(f"Price: ${rec.get('price', 0)}")
            console.print(f"Reason: {rec.get('reason', 'No reason provided')}")
            console.print()
    
    def save_log_to_file(self, log_entry: Dict[str, Any], filename: str = "recommendation_logs.json"):
        """Save log entry to file"""
        try:
            with open(filename, 'a') as f:
                json.dump(log_entry, f, indent=2)
                f.write('\n')
            console.print(f"📝 Log saved to {filename}")
        except Exception as e:
            console.print(f"❌ Failed to save log: {e}")
    
    def display_summary(self, log_entry: Dict[str, Any]):
        """Display summary of the logged session"""
        console.print("\n" + "="*40)
        console.print("SESSION SUMMARY")
        console.print("="*40)
        console.print(f"User ID: {log_entry['user_id']}")
        console.print(f"Model: {log_entry['model_used']}")
        console.print(f"Products Fetched: {len(log_entry['products_fetched'])}")
        console.print(f"Recommendations: {len(log_entry['recommendations'])}")
        console.print(f"Total Cost: ${log_entry['cost']:.5f}")
        console.print(f"Timestamp: {log_entry['timestamp']}")
        console.print("="*40)

def main():
    try:
        logger = RecommendationLogger()
        
        console.print("📝 AI Recommendation Session Logger")
        console.print("Simulating a complete recommendation session...")
        
        # Sample data
        user_id = "user_12345"
        
        questions_answers = {
            "budget_range": "$200",
            "occasion": "casual",
            "style": "streetwear",
            "height": "5'10\"",
            "body_type": "athletic",
            "skin_tone": "medium",
            "season": "winter",
            "preferred_colors": "black and gray",
            "clothing_type": "hoodies and jackets"
        }
        
        profile_generated = """The user has a budget of $200 and is looking for casual streetwear for winter. The user has an athletic body type, medium skin tone, and prefers black and gray colors. The user is specifically looking for hoodies and jackets suitable for daily casual wear."""
        
        products_fetched = [
            {
                "product_id": 1,
                "product_name": "Black Casual Hoodie",
                "product_category": "hoodies",
                "product_price": 45.00,
                "product_color": "black",
                "product_style": "casual,streetwear,winter",
                "product_description": "Comfortable black hoodie for streetwear style"
            },
            {
                "product_id": 2,
                "product_name": "Slim Fit Denim Jacket",
                "product_category": "jackets",
                "product_price": 60.00,
                "product_color": "blue",
                "product_style": "casual,slim,versatile",
                "product_description": "Modern slim fit denim jacket"
            }
        ]
        
        tokens_used = {
            "input_tokens": 620,
            "output_tokens": 210,
            "total_tokens": 830
        }
        
        model_name = "llama3-70b-8192"
        
        recommendations = [
            {
                "name": "Black Casual Hoodie",
                "price": 45,
                "reason": "Matches your streetwear style and winter season."
            },
            {
                "name": "Slim Fit Denim Jacket",
                "price": 60,
                "reason": "Works well with your body type and casual occasion."
            }
        ]
        
        # Display recommendations
        logger.display_recommendations(recommendations)
        
        # Calculate and display cost report
        cost = logger.calculate_cost(tokens_used['input_tokens'], tokens_used['output_tokens'], model_name)
        logger.display_cost_report(
            tokens_used['input_tokens'],
            tokens_used['output_tokens'],
            tokens_used['total_tokens'],
            model_name,
            cost
        )
        
        # Log the complete session
        log_entry = logger.log_recommendation_session(
            user_id=user_id,
            questions_answers=questions_answers,
            profile_generated=profile_generated,
            products_fetched=products_fetched,
            tokens_used=tokens_used,
            model_name=model_name,
            recommendations=recommendations
        )
        
        # Display summary
        logger.display_summary(log_entry)
        
        # Save to file
        logger.save_log_to_file(log_entry)
        
        console.print("\n✅ Session logged successfully!")
        
    except KeyboardInterrupt:
        console.print("\n👋 Goodbye!", style="bold yellow")
    except Exception as e:
        console.print(f"\n❌ An error occurred: {e}", style="bold red")

if __name__ == "__main__":
    main()
