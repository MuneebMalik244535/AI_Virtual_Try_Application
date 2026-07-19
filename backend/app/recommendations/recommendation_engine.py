import json
from typing import Dict, List, Any
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()

class FashionRecommendationEngine:
    def __init__(self):
        self.style_keywords = {
            'casual': ['casual', 'relaxed', 'comfortable', 'everyday', 'weekend'],
            'formal': ['formal', 'business', 'professional', 'work', 'office', 'dressy'],
            'sport': ['sport', 'athletic', 'active', 'gym', 'running', 'workout'],
            'classic': ['classic', 'timeless', 'traditional', 'elegant'],
            'modern': ['modern', 'contemporary', 'trendy', 'fashionable'],
            'summer': ['summer', 'warm', 'hot', 'beach', 'vacation'],
            'winter': ['winter', 'cold', 'warm', 'cozy', 'snow'],
            'versatile': ['versatile', 'flexible', 'all-occasion', 'multi-purpose'],
            'minimal': ['minimal', 'simple', 'clean', 'basic'],
            'streetwear': ['streetwear', 'urban', 'trendy', 'casual'],
            'party': ['party', 'evening', 'night', 'celebration']
        }
    
    def parse_user_profile(self, profile_text: str) -> Dict[str, Any]:
        """Parse user profile text into structured preferences"""
        profile_lower = profile_text.lower()
        
        preferences = {
            'budget': 1000,  # Default high budget
            'occasion': 'casual',
            'style': 'casual',
            'height': 'average',
            'body_type': 'average',
            'skin_tone': 'medium',
            'season': 'all',
            'colors': 'neutral',
            'clothing_type': 'any'
        }
        
        # Extract budget
        import re
        budget_match = re.search(r'\$(\d+)', profile_text)
        if budget_match:
            preferences['budget'] = int(budget_match.group(1))
        
        # Extract occasion
        for occasion in ['casual', 'party', 'office', 'wedding']:
            if occasion in profile_lower:
                preferences['occasion'] = occasion
                break
        
        # Extract style
        for style in ['minimal', 'streetwear', 'formal', 'sporty', 'classic', 'modern']:
            if style in profile_lower:
                preferences['style'] = style
                break
        
        # Extract body type
        for body_type in ['slim', 'average', 'athletic', 'heavy']:
            if body_type in profile_lower:
                preferences['body_type'] = body_type
                break
        
        # Extract season
        for season in ['summer', 'winter', 'spring']:
            if season in profile_lower:
                preferences['season'] = season
                break
        
        # Extract colors
        colors_match = re.search(r'prefers? ([^.]*) colors?', profile_lower)
        if colors_match:
            preferences['colors'] = colors_match.group(1).strip()
        
        # Extract clothing type
        clothing_match = re.search(r'looking for ([^.]*?) (suitable|perfect|appropriate)', profile_lower)
        if clothing_match:
            preferences['clothing_type'] = clothing_match.group(1).strip()
        
        return preferences
    
    def calculate_match_score(self, product: Dict[str, Any], preferences: Dict[str, Any]) -> float:
        """Calculate how well a product matches user preferences"""
        score = 0.0
        
        # Budget match (0-2 points)
        if product['product_price'] <= preferences['budget']:
            score += 2.0
        elif product['product_price'] <= preferences['budget'] * 1.2:
            score += 1.0
        
        # Occasion match (0-2 points)
        product_style = product['product_style'].lower()
        if preferences['occasion'] == 'formal' and 'formal' in product_style:
            score += 2.0
        elif preferences['occasion'] == 'casual' and 'casual' in product_style:
            score += 2.0
        elif preferences['occasion'] == 'party' and ('evening' in product_style or 'formal' in product_style):
            score += 2.0
        
        # Style match (0-2 points)
        if preferences['style'] in product_style:
            score += 2.0
        elif preferences['style'] == 'sporty' and 'sport' in product_style:
            score += 2.0
        elif preferences['style'] == 'minimal' and 'classic' in product_style:
            score += 1.0
        
        # Season match (0-1 point)
        if preferences['season'] in product_style:
            score += 1.0
        elif preferences['season'] == 'all':
            score += 0.5
        
        # Color preference (0-1 point)
        product_color = product['product_color'].lower()
        user_colors = preferences['colors'].lower()
        if any(color in product_color for color in user_colors.split(' and ')):
            score += 1.0
        
        # Category match (0-1 point)
        if preferences['clothing_type'] != 'any':
            clothing_type = preferences['clothing_type'].lower()
            product_category = product['product_category'].lower()
            product_name = product['product_name'].lower()
            
            if clothing_type in product_category or clothing_type in product_name:
                score += 1.0
        
        # Body type consideration (0-1 point)
        if preferences['body_type'] == 'athletic' and ('slim' in product_name.lower() or 'fit' in product_name.lower()):
            score += 1.0
        elif preferences['body_type'] == 'slim' and 'slim' in product_name.lower():
            score += 1.0
        
        return score
    
    def generate_recommendation_reason(self, product: Dict[str, Any], preferences: Dict[str, Any]) -> str:
        """Generate a personalized reason for recommendation"""
        reasons = []
        
        # Budget reason
        if product['product_price'] <= preferences['budget']:
            reasons.append(f"Fits your ${preferences['budget']} budget")
        
        # Style reason
        product_style = product['product_style'].lower()
        if preferences['style'] in product_style:
            reasons.append(f"Matches your {preferences['style']} style preference")
        
        # Occasion reason
        if preferences['occasion'] == 'formal' and 'formal' in product_style:
            reasons.append("Perfect for formal occasions")
        elif preferences['occasion'] == 'casual' and 'casual' in product_style:
            reasons.append("Great for casual wear")
        elif preferences['occasion'] == 'party' and ('evening' in product_style or 'formal' in product_style):
            reasons.append("Ideal for party events")
        
        # Season reason
        if preferences['season'] in product_style:
            reasons.append(f"Perfect for {preferences['season']}")
        
        # Color reason
        product_color = product['product_color'].lower()
        user_colors = preferences['colors'].lower()
        if any(color in product_color for color in user_colors.split(' and ')):
            reasons.append(f"Matches your {preferences['colors']} color preference")
        
        # Body type reason
        if preferences['body_type'] == 'athletic':
            reasons.append("Suitable for athletic body type")
        elif preferences['body_type'] == 'slim' and 'slim' in product['product_name'].lower():
            reasons.append("Designed for slim body types")
        
        # Category reason
        if preferences['clothing_type'] != 'any':
            reasons.append(f"Matches your need for {preferences['clothing_type']}")
        
        return ". ".join(reasons[:3]) if reasons else "Matches your general preferences"
    
    def generate_recommendations(self, user_profile: str, product_catalog: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate personalized recommendations"""
        console.print(Panel.fit(
            "🤖 Analyzing User Profile & Product Catalog...",
            style="bold blue"
        ))
        
        # Parse user preferences
        preferences = self.parse_user_profile(user_profile)
        console.print(f"📝 Parsed preferences: {preferences}")
        
        # Calculate scores for all products
        scored_products = []
        for product in product_catalog:
            score = self.calculate_match_score(product, preferences)
            if score > 0:  # Only include products with some match
                product['match_score'] = score
                product['recommendation_reason'] = self.generate_recommendation_reason(product, preferences)
                scored_products.append(product)
        
        # Sort by score and take top 5
        scored_products.sort(key=lambda x: x['match_score'], reverse=True)
        recommendations = scored_products[:5]
        
        return recommendations
    
    def display_recommendations(self, recommendations: List[Dict[str, Any]]):
        """Display recommendations in clean CLI format"""
        if not recommendations:
            console.print("❌ No suitable products found in the catalog.", style="bold red")
            return
        
        console.print("\n" + "="*32)
        console.print("AI STYLIST RECOMMENDATIONS")
        console.print("="*32)
        console.print()
        
        emoji_numbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"]
        
        for i, product in enumerate(recommendations, 1):
            emoji = emoji_numbers[i-1] if i <= 5 else f"{i}."
            console.print(f"{emoji} {product['product_name']}")
            console.print(f"Price: ${product['product_price']:.2f}")
            console.print(f"Reason: {product['recommendation_reason']}")
            console.print()
        
        console.print("="*32)
    
    def format_as_json(self, recommendations: List[Dict[str, Any]]) -> str:
        """Format recommendations as JSON"""
        formatted = []
        for product in recommendations:
            formatted.append({
                'product_name': product['product_name'],
                'price': product['product_price'],
                'reason': product['recommendation_reason'],
                'match_score': product['match_score']
            })
        return json.dumps(formatted, indent=2)

def main():
    try:
        console.print(Panel.fit(
            "🤖 AI Fashion Stylist Recommendation Engine 🤖\n\n"
            "I'll analyze user profiles and product catalogs to generate "
            "personalized fashion recommendations.",
            title="Recommendation Engine",
            style="bold magenta"
        ))
        
        engine = FashionRecommendationEngine()
        
        # Sample user profile
        console.print("\n📝 Enter User Style Profile:")
        console.print("Example: 'The user has a budget of $280 and is looking for party formal for summer...'")
        
        user_profile = input("User Profile: ").strip()
        if not user_profile:
            user_profile = "The user has a budget of $280 and is looking for party formal for summer. The user has an athletic body type, medium skin tone, and prefers black and blue colors. The user is specifically looking for complete dress perfect for social events and parties."
        
        # Sample product catalog (in real use, this would come from database)
        sample_catalog = [
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
            },
            {
                "product_id": 14,
                "product_name": "Silk Scarf",
                "product_category": "accessories",
                "product_price": 45.99,
                "product_color": "burgundy",
                "product_style": "formal,elegant,luxury",
                "product_description": "Elegant silk scarf for sophisticated touch"
            },
            {
                "product_id": 1,
                "product_name": "Classic White Oxford Shirt",
                "product_category": "shirts",
                "product_price": 49.99,
                "product_color": "white",
                "product_style": "casual,formal,versatile",
                "product_description": "A timeless white shirt perfect for any occasion"
            }
        ]
        
        # Generate recommendations
        recommendations = engine.generate_recommendations(user_profile, sample_catalog)
        
        # Display results
        engine.display_recommendations(recommendations)
        
        console.print("\n" + "="*60)
        console.print(Panel.fit(
            "📄 JSON Output",
            style="bold blue"
        ))
        
        json_output = engine.format_as_json(recommendations)
        console.print(f"\n{json_output}")
        
    except KeyboardInterrupt:
        console.print("\n👋 Goodbye!", style="bold yellow")
    except Exception as e:
        console.print(f"\n❌ An error occurred: {e}", style="bold red")

if __name__ == "__main__":
    main()
