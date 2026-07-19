"""
Gamified Free Trial & Purchase Unlock System
Encourages free users to spend $50 to unlock 10 AI requests/day for 30 days
"""

import json
import os
from datetime import datetime, timedelta
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from app.core.config import GROQ_API_KEY, GROQ_BASE_URL, MODEL_PRICING, MODEL_NAME
from app.monitoring.cost_logger import calculate_cost

console = Console()

class GamifiedUnlockSystem:
    def __init__(self):
        self.unlock_threshold = 50.00  # $50 spending threshold
        self.unlock_duration_days = 30  # 30 days of premium access
        self.premium_daily_requests = 10  # 10 requests per day when unlocked
        self.unlock_file = "gamified_unlocks.json"
        self.model_name = MODEL_NAME
    
    def load_unlock_data(self):
        """Load unlock data from file"""
        try:
            if os.path.exists(self.unlock_file):
                with open(self.unlock_file, 'r') as f:
                    return json.load(f)
        except Exception:
            pass
        return {}
    
    def save_unlock_data(self, unlock_data):
        """Save unlock data to file"""
        try:
            with open(self.unlock_file, 'w') as f:
                json.dump(unlock_data, f, indent=2)
        except Exception as e:
            console.print(f"⚠️ Error saving unlock data: {e}", style="bold yellow")
    
    def check_unlock_status(self, user_id):
        """Check if user has premium access unlocked"""
        unlock_data = self.load_unlock_data()
        
        if user_id not in unlock_data:
            return {
                "is_premium": False,
                "remaining_days": 0,
                "daily_requests": 3,  # Free tier limit
                "expires_on": None
            }
        
        user_unlock = unlock_data[user_id]
        expires_on = datetime.fromisoformat(user_unlock["expires_on"])
        today = datetime.now()
        
        if today > expires_on:
            # Unlock expired, remove it
            del unlock_data[user_id]
            self.save_unlock_data(unlock_data)
            return {
                "is_premium": False,
                "remaining_days": 0,
                "daily_requests": 3,
                "expires_on": None
            }
        
        remaining_days = (expires_on - today).days + 1
        
        return {
            "is_premium": True,
            "remaining_days": remaining_days,
            "daily_requests": self.premium_daily_requests,
            "expires_on": expires_on.strftime("%Y-%m-%d")
        }
    
    def calculate_monthly_spending(self, user_id, past_purchases):
        """Calculate user's spending for current month"""
        today = datetime.now()
        current_month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        monthly_total = 0.0
        monthly_purchases = []
        
        for purchase in past_purchases:
            try:
                purchase_date = datetime.fromisoformat(purchase.get("date", "1970-01-01"))
                if purchase_date >= current_month_start:
                    price = float(purchase.get("price", 0))
                    monthly_total += price
                    monthly_purchases.append(purchase)
            except (ValueError, TypeError):
                continue
        
        return monthly_total, monthly_purchases
    
    def generate_gamified_message(self, user_id, user_profile, cart_items=None):
        """
        Generate gamified message to encourage $50 spending
        
        Args:
            user_id (str): User identifier
            user_profile (dict): User profile data
            cart_items (list): Items in user's cart
            
        Returns:
            dict: Gamified message with recommendations
        """
        
        # Check current unlock status
        unlock_status = self.check_unlock_status(user_id)
        
        if unlock_status["is_premium"]:
            return {
                "success": True,
                "message": f"🎉 You already have premium access! You have {unlock_status['remaining_days']} days left with {unlock_status['daily_requests']} AI requests per day.",
                "highlight_items": [],
                "is_premium": True,
                "remaining_days": unlock_status["remaining_days"]
            }
        
        # Calculate monthly spending
        past_purchases = user_profile.get("past_month_purchase", [])
        if isinstance(past_purchases, str):
            past_purchases = []
        
        monthly_spending, monthly_purchases = self.calculate_monthly_spending(user_id, past_purchases)
        
        # Get cart total
        cart_total = float(user_profile.get("current_cart_total", 0))
        
        # Calculate remaining amount needed
        remaining_needed = max(0, self.unlock_threshold - monthly_spending - cart_total)
        
        # Create the gamified prompt
        prompt = self.create_gamified_prompt(
            user_profile,
            monthly_spending,
            cart_total,
            remaining_needed,
            cart_items or []
        )
        
        try:
            # Call Groq API
            response = self.call_groq_api(prompt)
            
            if response:
                # Extract message and recommendations
                result = self.extract_gamified_response(response)
                
                # Add additional context
                result.update({
                    "monthly_spending": monthly_spending,
                    "cart_total": cart_total,
                    "remaining_needed": remaining_needed,
                    "unlock_threshold": self.unlock_threshold,
                    "is_premium": False
                })
                
                # Display cost
                self.display_api_cost(response)
                
                # Display gamified message
                self.display_gamified_message(result)
                
                return result
            else:
                return self.get_fallback_message(monthly_spending, cart_total, remaining_needed)
                
        except Exception as e:
            console.print(f"❌ Error generating gamified message: {e}", style="bold red")
            return self.get_fallback_message(monthly_spending, cart_total, remaining_needed)
    
    def create_gamified_prompt(self, user_profile, monthly_spending, cart_total, remaining_needed, cart_items):
        """Create prompt for gamified message generation"""
        
        requests_today = int(user_profile.get("daily_requests_used", 0))
        
        prompt = f"""
Generate a gamified AI message for a fashion e-commerce user.

User Profile:
- User Type: Free
- Past Month Purchase: ${monthly_spending:.2f}
- Current Cart Total: ${cart_total:.2f}
- Daily Requests Used: {requests_today}/3
- Remaining Needed for Unlock: ${remaining_needed:.2f}

Cart Items:
{json.dumps(cart_items, indent=2) if cart_items else "No items in cart"}

Instruction:
Encourage the user to spend at least ${self.unlock_threshold:.2f} this month to unlock 10 AI recommendations/day for 30 days. Use a friendly, motivating tone. Suggest specific items from their cart that could help reach the threshold.

Requirements:
1. Be encouraging and motivational
2. Show progress toward the $50 goal
3. Highlight the benefits of unlocking (10x more daily requests)
4. Suggest specific cart items that would help reach the threshold
5. Create urgency and excitement
6. Use emojis and engaging language

Output Format:
{{
    "message": "Exciting, motivating message about unlocking premium access",
    "highlight_items": [
        {{
            "product_name": "Product Name",
            "price": 29.99,
            "reason_for_recommendation": "Why this item helps reach the goal"
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
                "model": self.model_name,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.8,  # More creative for gamification
                "max_tokens": 800
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
                return None
                
        except Exception as e:
            console.print(f"❌ API call failed: {e}", style="bold red")
            return None
    
    def extract_gamified_response(self, response):
        """Extract gamified message and recommendations from API response"""
        try:
            content = response['choices'][0]['message']['content']
            
            # Try to parse as JSON
            try:
                data = json.loads(content)
                return data
            except json.JSONDecodeError:
                # Fallback: extract from text
                return self.parse_fallback_gamified_response(content)
                
        except Exception as e:
            console.print(f"⚠️ Error parsing gamified response: {e}", style="bold yellow")
            return {"message": "🎉 Unlock premium access today!", "highlight_items": []}
    
    def parse_fallback_gamified_response(self, text):
        """Parse gamified response when JSON parsing fails"""
        return {
            "message": "🎉 You're so close to unlocking premium access! Spend just a little more to get 10 AI recommendations per day for 30 days!",
            "highlight_items": [
                {
                    "product_name": "Stylish Accessory",
                    "price": 19.99,
                    "reason_for_recommendation": "Perfect addition to complete your look"
                }
            ]
        }
    
    def get_fallback_message(self, monthly_spending, cart_total, remaining_needed):
        """Get fallback gamified message"""
        progress = (monthly_spending + cart_total) / self.unlock_threshold * 100
        
        return {
            "success": True,
            "message": f"🎯 You're {progress:.1f}% of the way there! Spend ${remaining_needed:.2f} more to unlock 10 AI requests/day for 30 days! 🚀",
            "highlight_items": [],
            "monthly_spending": monthly_spending,
            "cart_total": cart_total,
            "remaining_needed": remaining_needed,
            "unlock_threshold": self.unlock_threshold,
            "is_premium": False
        }
    
    def display_api_cost(self, response):
        """Display API cost for gamified message"""
        try:
            usage = response.get('usage', {})
            input_tokens = usage.get('prompt_tokens', 0)
            output_tokens = usage.get('completion_tokens', 0)
            total_tokens = usage.get('total_tokens', input_tokens + output_tokens)
            
            estimated_cost = calculate_cost(total_tokens, self.model_name)
            
            console.print("\n" + "="*30)
            console.print("💰 GAMIFICATION COST REPORT")
            console.print("="*30)
            console.print(f"Model Used: {self.model_name}")
            console.print(f"Input Tokens: {input_tokens}")
            console.print(f"Output Tokens: {output_tokens}")
            console.print(f"Total Tokens: {total_tokens}")
            console.print(f"Estimated Cost: ${estimated_cost:.6f}")
            console.print("="*30)
            
        except Exception as e:
            console.print(f"⚠️ Error displaying cost: {e}", style="bold yellow")
    
    def display_gamified_message(self, result):
        """Display the gamified message with visual elements"""
        console.print("\n" + "="*60)
        console.print("🎮 GAMIFIED UNLOCK CHALLENGE")
        console.print("="*60)
        
        # Progress bar
        progress = (result["monthly_spending"] + result["cart_total"]) / result["unlock_threshold"]
        filled_bars = int(progress * 20)
        empty_bars = 20 - filled_bars
        
        console.print(f"📊 Progress to Premium Unlock:")
        console.print(f"│{'█' * filled_bars}{'░' * empty_bars}│ {progress*100:.1f}%")
        console.print(f"💰 Spent: ${result['monthly_spending'] + result['cart_total']:.2f} / ${result['unlock_threshold']:.2f}")
        console.print(f"🎯 Need: ${result['remaining_needed']:.2f} more")
        
        console.print(f"\n{result['message']}")
        
        if result.get("highlight_items"):
            console.print(f"\n🛍️ Suggested Items to Reach Goal:")
            for item in result["highlight_items"]:
                console.print(f"• {item.get('product_name', 'Unknown')} - ${item.get('price', 0):.2f}")
                console.print(f"  {item.get('reason_for_recommendation', 'Great choice!')}")
        
        console.print(f"\n🎁 Unlock Benefits:")
        console.print(f"• 10 AI recommendations per day (vs 3 free)")
        console.print(f"• 30 days of premium access")
        console.print(f"• Personalized fashion advice")
        console.print(f"• Priority support")
        
        console.print("="*60)
    
    def unlock_premium(self, user_id, purchase_amount):
        """
        Unlock premium access for user when they reach the threshold
        
        Args:
            user_id (str): User identifier
            purchase_amount (float): Amount spent in qualifying purchase
        """
        
        unlock_data = self.load_unlock_data()
        
        # Calculate new unlock date
        new_expiry = datetime.now() + timedelta(days=self.unlock_duration_days)
        
        # Update or create unlock record
        if user_id in unlock_data:
            # Extend existing access
            current_expiry = datetime.fromisoformat(unlock_data[user_id]["expires_on"])
            if current_expiry > datetime.now():
                new_expiry = current_expiry + timedelta(days=self.unlock_duration_days)
        
        unlock_data[user_id] = {
            "unlocked_on": datetime.now().isoformat(),
            "expires_on": new_expiry.isoformat(),
            "unlock_purchase_amount": purchase_amount,
            "total_spent": purchase_amount
        }
        
        self.save_unlock_data(unlock_data)
        
        console.print(Panel.fit(
            f"🎉 PREMIUM UNLOCKED! 🎉\n\n"
            f"You now have 10 AI recommendations per day for {self.unlock_duration_days} days!\n"
            f"Expires: {new_expiry.strftime('%Y-%m-%d')}",
            title="Premium Access Unlocked",
            style="bold green"
        ))
        
        return True

def main():
    """Test the gamified unlock system"""
    try:
        system = GamifiedUnlockSystem()
        
        console.print(Panel.fit(
            "🎮 Gamified Free Trial & Purchase Unlock System 🎮\n\n"
            "Encouraging users to spend $50 to unlock premium AI recommendations",
            title="Gamification Test",
            style="bold magenta"
        ))
        
        # Test user
        test_user_id = "test_gamified_user"
        
        # Test user profile
        user_profile = {
            "user_type": "free",
            "past_month_purchase": [
                {"date": "2026-03-05", "product": "T-Shirt", "price": 25.99},
                {"date": "2026-03-10", "product": "Jeans", "price": 35.99}
            ],
            "current_cart_total": 15.00,
            "daily_requests_used": 2
        }
        
        # Sample cart items
        cart_items = [
            {"name": "Casual Shirt", "price": 22.99, "category": "shirts"},
            {"name": "Stylish Belt", "price": 15.99, "category": "accessories"},
            {"name": "Fashion Sneakers", "price": 45.99, "category": "shoes"}
        ]
        
        # Generate gamified message
        result = system.generate_gamified_message(test_user_id, user_profile, cart_items)
        
        console.print(f"\n📋 Generated Result:")
        console.print(f"Success: {result.get('success', False)}")
        console.print(f"Is Premium: {result.get('is_premium', False)}")
        console.print(f"Monthly Spending: ${result.get('monthly_spending', 0):.2f}")
        console.print(f"Cart Total: ${result.get('cart_total', 0):.2f}")
        console.print(f"Remaining Needed: ${result.get('remaining_needed', 0):.2f}")
        
        # Test unlock functionality
        console.print(f"\n🔓 Testing unlock with $60 purchase...")
        system.unlock_premium(test_user_id, 60.00)
        
        # Check unlock status
        status = system.check_unlock_status(test_user_id)
        console.print(f"\n📊 Unlock Status:")
        console.print(f"Is Premium: {status['is_premium']}")
        console.print(f"Remaining Days: {status['remaining_days']}")
        console.print(f"Daily Requests: {status['daily_requests']}")
        
    except KeyboardInterrupt:
        console.print("\n👋 Goodbye!", style="bold yellow")
    except Exception as e:
        console.print(f"\n❌ An error occurred: {e}", style="bold red")

if __name__ == "__main__":
    main()
