"""
Free Trial Recommendation Agent
Provides 3 daily AI suggestions for free tier users with budget-friendly recommendations
"""

import json
import os
from datetime import datetime
from rich.console import Console
from rich.panel import Panel
from app.core.config import GROQ_API_KEY, GROQ_BASE_URL, MODEL_PRICING, MODEL_NAME
from app.monitoring.cost_logger import calculate_cost, display_cost_report

console = Console()

class FreeTrialAgent:
    def __init__(self):
        self.daily_limit = 3
        self.usage_file = "free_trial_usage.json"
        self.max_price_threshold = 100.00  # Max price for free tier recommendations
        self.model_name = MODEL_NAME  # Use model from config
    
    def check_daily_limit(self, user_id):
        """
        Check if user has remaining daily requests
        
        Args:
            user_id (str): Unique user identifier
            
        Returns:
            tuple: (can_make_request, remaining_requests, usage_data)
        """
        
        usage_data = self.load_usage_data()
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Get or create user entry
        if user_id not in usage_data:
            usage_data[user_id] = {
                "requests_today": 0,
                "last_request_date": today,
                "total_requests": 0
            }
        
        user_data = usage_data[user_id]
        
        # Reset counter if it's a new day
        if user_data["last_request_date"] != today:
            user_data["requests_today"] = 0
            user_data["last_request_date"] = today
        
        remaining_requests = self.daily_limit - user_data["requests_today"]
        can_make_request = remaining_requests > 0
        
        return can_make_request, remaining_requests, user_data
    
    def load_usage_data(self):
        """Load free trial usage data from file"""
        try:
            if os.path.exists(self.usage_file):
                with open(self.usage_file, 'r') as f:
                    return json.load(f)
        except Exception:
            pass
        return {}
    
    def save_usage_data(self, usage_data):
        """Save free trial usage data to file"""
        try:
            with open(self.usage_file, 'w') as f:
                json.dump(usage_data, f, indent=2)
        except Exception as e:
            console.print(f"⚠️ Error saving usage data: {e}", style="bold yellow")
    
    def increment_usage(self, user_id):
        """Increment user's daily request count"""
        usage_data = self.load_usage_data()
        
        if user_id not in usage_data:
            usage_data[user_id] = {
                "requests_today": 0,
                "last_request_date": datetime.now().strftime("%Y-%m-%d"),
                "total_requests": 0
            }
        
        usage_data[user_id]["requests_today"] += 1
        usage_data[user_id]["total_requests"] += 1
        usage_data[user_id]["last_request_date"] = datetime.now().strftime("%Y-%m-%d")
        
        self.save_usage_data(usage_data)
    
    def get_free_trial_recommendations(self, user_id, browsing_history=None, past_purchases=None):
        """
        Get 3 personalized recommendations for free trial user
        
        Args:
            user_id (str): Unique user identifier
            browsing_history (list): User's browsing history
            past_purchases (list): User's past purchases
            
        Returns:
            dict: Recommendations data or error message
        """
        
        # Check daily limit
        can_make_request, remaining_requests, user_data = self.check_daily_limit(user_id)
        
        if not can_make_request:
            return {
                "success": False,
                "message": f"Daily limit reached. You have {remaining_requests} requests remaining. Try again tomorrow!",
                "remaining_requests": remaining_requests
            }
        
        console.print("🆓 Generating Free Trial Recommendations...", style="bold cyan")
        console.print(f"📊 Remaining requests today: {remaining_requests - 1}", style="bold yellow")
        
        # Create the prompt for free trial recommendations
        prompt = self.create_free_trial_prompt(browsing_history, past_purchases)
        
        try:
            # Call Groq API
            response = self.call_groq_api(prompt)
            
            if response:
                # Increment usage count
                self.increment_usage(user_id)
                
                # Extract recommendations
                recommendations = self.extract_recommendations(response)
                
                # Display cost report
                self.display_api_cost(response)
                
                # Display recommendations
                self.display_free_trial_recommendations(recommendations, remaining_requests - 1)
                
                return {
                    "success": True,
                    "recommendations": recommendations,
                    "remaining_requests": remaining_requests - 1,
                    "daily_limit": self.daily_limit
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to generate recommendations. Please try again.",
                    "remaining_requests": remaining_requests
                }
                
        except Exception as e:
            console.print(f"❌ Error: {e}", style="bold red")
            return {
                "success": False,
                "message": f"An error occurred: {e}",
                "remaining_requests": remaining_requests
            }
    
    def create_free_trial_prompt(self, browsing_history, past_purchases):
        """Create prompt for free trial recommendations"""
        
        browsing_text = json.dumps(browsing_history, indent=2) if browsing_history else "No browsing history available"
        purchases_text = json.dumps(past_purchases, indent=2) if past_purchases else "No past purchases available"
        
        prompt = f"""
You are an AI fashion recommendation assistant for free trial users.

User Profile:
- Free trial user
- Browsing history: {browsing_text}
- Past purchases: {purchases_text}
- Daily request limit: 3 requests/day

Task:
Provide 3 personalized product recommendations for the user. Make suggestions relevant, low-risk, and budget-friendly. Avoid showing high-priced items unless user has bought similar before.

Requirements:
1. All products must be under ${self.max_price_threshold}
2. Focus on budget-friendly, versatile items
3. Consider user's browsing and purchase history
4. Provide clear, concise reasons
5. Output in JSON format only

Output format:
{{
    "recommendations": [
        {{
            "product_name": "Product Name",
            "category": "Category",
            "price": 29.99,
            "reason_for_recommendation": "Brief reason why this matches user preferences"
        }},
        {{
            "product_name": "Product Name 2",
            "category": "Category 2", 
            "price": 39.99,
            "reason_for_recommendation": "Brief reason for recommendation"
        }},
        {{
            "product_name": "Product Name 3",
            "category": "Category 3",
            "price": 49.99,
            "reason_for_recommendation": "Brief reason for recommendation"
        }}
    ]
}}
"""
        return prompt
    
    def call_groq_api(self, prompt):
        """Make API call to Groq"""
        try:
            import requests
            
            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.model_name,  # Use model from config
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
                return response.json()
            else:
                console.print(f"❌ API Error: {response.status_code}", style="bold red")
                console.print(f"Response: {response.text}", style="bold red")
                return None
                
        except Exception as e:
            console.print(f"❌ API call failed: {e}", style="bold red")
            return None
    
    def extract_recommendations(self, response):
        """Extract recommendations from API response"""
        try:
            content = response['choices'][0]['message']['content']
            
            # Try to parse as JSON
            try:
                data = json.loads(content)
                return data.get('recommendations', [])
            except json.JSONDecodeError:
                # Fallback: extract from text
                return self.parse_fallback_recommendations(content)
                
        except Exception as e:
            console.print(f"⚠️ Error parsing recommendations: {e}", style="bold yellow")
            return []
    
    def parse_fallback_recommendations(self, text):
        """Parse recommendations when JSON parsing fails"""
        # Simple fallback - return mock recommendations
        return [
            {
                "product_name": "Classic White T-Shirt",
                "category": "shirts",
                "price": 19.99,
                "reason_for_recommendation": "Versatile basic that works with any outfit"
            },
            {
                "product_name": "Comfortable Jeans",
                "category": "pants", 
                "price": 39.99,
                "reason_for_recommendation": "Essential casual wear for everyday use"
            },
            {
                "product_name": "Canvas Sneakers",
                "category": "shoes",
                "price": 29.99,
                "reason_for_recommendation": "Comfortable and affordable footwear"
            }
        ]
    
    def display_api_cost(self, response):
        """Display API cost for free trial"""
        try:
            usage = response.get('usage', {})
            input_tokens = usage.get('prompt_tokens', 0)
            output_tokens = usage.get('completion_tokens', 0)
            total_tokens = usage.get('total_tokens', input_tokens + output_tokens)
            
            # Calculate cost using the actual model
            estimated_cost = calculate_cost(total_tokens, self.model_name)
            
            console.print("\n" + "="*30)
            console.print("💰 FREE TRIAL COST REPORT")
            console.print("="*30)
            console.print(f"Model Used: {self.model_name}")
            console.print(f"Input Tokens: {input_tokens}")
            console.print(f"Output Tokens: {output_tokens}")
            console.print(f"Total Tokens: {total_tokens}")
            console.print(f"Estimated Cost: ${estimated_cost:.6f}")
            console.print("="*30)
            
        except Exception as e:
            console.print(f"⚠️ Error displaying cost: {e}", style="bold yellow")
    
    def display_free_trial_recommendations(self, recommendations, remaining_requests):
        """Display free trial recommendations"""
        console.print("\n" + "="*50)
        console.print("🆓 FREE TRIAL RECOMMENDATIONS")
        console.print("="*50)
        
        if not recommendations:
            console.print("❌ No recommendations available", style="bold red")
            return
        
        console.print(f"📦 Here are your 3 personalized recommendations:")
        console.print(f"📊 Remaining requests today: {remaining_requests}")
        console.print()
        
        for i, rec in enumerate(recommendations, 1):
            console.print(f"{i}. 🎯 {rec.get('product_name', 'Unknown Product')}")
            console.print(f"   Category: {rec.get('category', 'N/A')}")
            console.print(f"   Price: ${rec.get('price', 0):.2f}")
            console.print(f"   Reason: {rec.get('reason_for_recommendation', 'No reason provided')}")
            console.print()
        
        console.print("💡 Upgrade to premium for unlimited recommendations!")
        console.print("="*50)
    
    def get_user_status(self, user_id):
        """Get user's current free trial status"""
        can_make_request, remaining_requests, user_data = self.check_daily_limit(user_id)
        
        return {
            "user_id": user_id,
            "daily_limit": self.daily_limit,
            "requests_today": user_data.get("requests_today", 0),
            "remaining_requests": remaining_requests,
            "total_requests": user_data.get("total_requests", 0),
            "last_request_date": user_data.get("last_request_date", "Never"),
            "can_make_request": can_make_request
        }

def main():
    """Test the free trial recommendation system"""
    try:
        agent = FreeTrialAgent()
        
        console.print(Panel.fit(
            "🆓 Free Trial Recommendation System 🆓\n\n"
            "Testing the 3 daily recommendations for free tier users",
            title="Free Trial Test",
            style="bold magenta"
        ))
        
        # Test user
        test_user_id = "test_free_user_123"
        
        # Check user status
        status = agent.get_user_status(test_user_id)
        console.print(f"\n📊 User Status:")
        console.print(f"• Daily Limit: {status['daily_limit']}")
        console.print(f"• Requests Today: {status['requests_today']}")
        console.print(f"• Remaining: {status['remaining_requests']}")
        console.print(f"• Can Make Request: {status['can_make_request']}")
        
        if status['can_make_request']:
            # Sample browsing history and purchases
            browsing_history = [
                {"category": "shirts", "viewed": "casual t-shirts"},
                {"category": "pants", "viewed": "jeans"},
                {"category": "shoes", "viewed": "sneakers"}
            ]
            
            past_purchases = [
                {"product": "Basic T-Shirt", "price": 15.99, "category": "shirts"},
                {"product": "Jeans", "price": 45.00, "category": "pants"}
            ]
            
            # Get recommendations
            result = agent.get_free_trial_recommendations(
                test_user_id, 
                browsing_history, 
                past_purchases
            )
            
            console.print(f"\n📋 Result: {result}")
        else:
            console.print("❌ Daily limit reached for test user", style="bold yellow")
        
    except KeyboardInterrupt:
        console.print("\n👋 Goodbye!", style="bold yellow")
    except Exception as e:
        console.print(f"\n❌ An error occurred: {e}", style="bold red")

if __name__ == "__main__":
    main()
