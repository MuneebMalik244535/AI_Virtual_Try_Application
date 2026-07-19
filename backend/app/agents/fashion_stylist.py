import re
from typing import List, Dict, Any
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

console = Console()

class FashionStylist:
    def __init__(self, products: List[Dict[str, Any]]):
        self.products = products
        self.style_keywords = {
            'casual': ['casual', 'relaxed', 'comfortable', 'everyday', 'weekend'],
            'formal': ['formal', 'business', 'professional', 'work', 'office', 'dressy'],
            'sport': ['sport', 'athletic', 'active', 'gym', 'running', 'workout'],
            'classic': ['classic', 'timeless', 'traditional', 'elegant'],
            'modern': ['modern', 'contemporary', 'trendy', 'fashionable'],
            'summer': ['summer', 'warm', 'hot', 'beach', 'vacation'],
            'winter': ['winter', 'cold', 'warm', 'cozy', 'snow'],
            'versatile': ['versatile', 'flexible', 'all-occasion', 'multi-purpose']
        }
    
    def analyze_user_profile(self, profile_text: str) -> List[str]:
        """Extract style preferences from user profile"""
        profile_lower = profile_text.lower()
        detected_styles = []
        
        for style, keywords in self.style_keywords.items():
            if any(keyword in profile_lower for keyword in keywords):
                detected_styles.append(style)
        
        return detected_styles if detected_styles else ['casual']  # Default to casual
    
    def calculate_match_score(self, product: Dict[str, Any], user_styles: List[str]) -> float:
        """Calculate how well a product matches user preferences"""
        score = 0.0
        product_tags_str = product.get('style_tags', '')
        product_tags = product_tags_str.split(',') if product_tags_str else []
        
        # Direct style tag matches
        for style in user_styles:
            if style in product_tags:
                score += 2.0
        
        # Partial matches in description
        description = product.get('description', '').lower()
        for style in user_styles:
            keywords = self.style_keywords.get(style, [])
            if any(keyword in description for keyword in keywords):
                score += 1.0
        
        # Category relevance bonus
        category = product.get('category', '').lower()
        if 'sport' in user_styles and category in ['shoes', 'athletic']:
            score += 1.0
        elif 'formal' in user_styles and category in ['jackets', 'dresses', 'shirts']:
            score += 1.0
        elif 'casual' in user_styles and category in ['t-shirts', 'jeans', 'sneakers']:
            score += 1.0
        
        return score
    
    def recommend_outfits(self, user_profile: str) -> List[Dict[str, Any]]:
        """Recommend products based on user profile"""
        console.print(Panel.fit("🎨 Analyzing Your Style Profile...", style="bold blue"))
        
        user_styles = self.analyze_user_profile(user_profile)
        console.print(f"📝 Detected styles: {', '.join(user_styles).title()}")
        
        # Calculate scores for all products
        scored_products = []
        for product in self.products:
            score = self.calculate_match_score(product, user_styles)
            if score > 0:  # Only include products with some match
                product['match_score'] = score
                scored_products.append(product)
        
        # Sort by score and take top 5
        scored_products.sort(key=lambda x: x['match_score'], reverse=True)
        recommendations = scored_products[:5]
        
        return recommendations
    
    def display_recommendations(self, recommendations: List[Dict[str, Any]]):
        """Display recommendations in a beautiful format"""
        if not recommendations:
            console.print(Panel.fit(
                "❌ No suitable products found in the catalog.",
                title="No Matches",
                style="bold red"
            ))
            return
        
        console.print(Panel.fit(
            f"🌟 Found {len(recommendations)} perfect matches for you!",
            style="bold green"
        ))
        
        table = Table(title="Your Personalized Recommendations")
        table.add_column("Product Name", style="cyan", no_wrap=True)
        table.add_column("Price", style="yellow", justify="right")
        table.add_column("Why It Fits", style="green")
        
        for product in recommendations:
            name = product.get('name', 'Unknown')
            price = f"${product.get('price', 0):.2f}"
            
            # Generate personalized reason
            tags_str = product.get('style_tags', '')
            tags = tags_str.split(',') if tags_str else []
            category = product.get('category', '')
            
            if 'formal' in tags:
                reason = f"Perfect for professional settings - {category}"
            elif 'casual' in tags:
                reason = f"Great for everyday comfort - {category}"
            elif 'versatile' in tags:
                reason = f"Works for multiple occasions - {category}"
            else:
                reason = f"Matches your style preferences - {category}"
            
            table.add_row(name, price, reason)
        
        console.print(table)
        
        # Show product details
        console.print("\n📋 Detailed Product Information:")
        for i, product in enumerate(recommendations, 1):
            tags_str = product.get('style_tags', '')
            tags_list = tags_str.split(',') if tags_str else []
            
            panel_content = f"""
**Brand:** {product.get('brand', 'Unknown')}
**Color:** {product.get('color', 'N/A')}
**Size:** {product.get('size', 'N/A')}
**Description:** {product.get('description', 'No description')}
**Style Tags:** {', '.join(tags_list)}
**Match Score:** {product.get('match_score', 0):.1f}/5.0
            """
            
            console.print(Panel(
                panel_content.strip(),
                title=f"🛍️ {i}. {product.get('name', 'Unknown')}",
                border_style="blue"
            ))
