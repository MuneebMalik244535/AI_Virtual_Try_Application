"""
Database Agent module for AI Fashion Stylist CLI
Fetches products from Neon database or provides mock data
"""

import os
import psycopg2
from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel
from app.core.config import DATABASE_URL, MOCK_DATA_IF_DB_FAILS

console = Console()

def fetch_products():
    """
    Fetch available products from Neon database
    If database connection fails, return mock data
    
    Returns:
        list: List of product dictionaries
    """
    
    console.print("\n🗄️ Fetching products from database...", style="bold cyan")
    
    try:
        # Try to connect to database
        products = fetch_from_database()
        
        if products:
            console.print(f"✅ Successfully fetched {len(products)} products from database", style="bold green")
            return products
        else:
            console.print("⚠️ No products found in database", style="bold yellow")
            return get_mock_products()
            
    except Exception as e:
        console.print(f"⚠️ Database connection failed: {e}", style="bold yellow")
        console.print("🔄 Using mock product data instead", style="bold cyan")
        return get_mock_products()

def fetch_from_database():
    """
    Fetch products from Neon database
    
    Returns:
        list: List of product dictionaries or None if failed
    """
    
    try:
        connection = psycopg2.connect(DATABASE_URL)
        connection.autocommit = True
        
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, name, price, category, description, color, style_tags
                FROM products
                ORDER BY name
                LIMIT 20
            """)
            
            products = []
            for row in cursor.fetchall():
                product = {
                    'id': row[0],
                    'name': row[1],
                    'price': float(row[2]),
                    'category': row[3],
                    'description': row[4],
                    'color': row[5],
                    'style_tags': row[6] if row[6] else 'casual'
                }
                products.append(product)
            
            connection.close()
            return products
            
    except Exception as e:
        console.print(f"Database error: {e}", style="bold red")
        return None

def get_mock_products():
    """
    Generate mock product data when database is not available
    
    Returns:
        list: List of mock product dictionaries
    """
    
    console.print("📦 Using mock product catalog", style="bold cyan")
    
    mock_products = [
        {
            'id': 1,
            'name': 'Classic White Oxford Shirt',
            'price': 49.99,
            'category': 'shirts',
            'description': 'A timeless white shirt perfect for any occasion',
            'color': 'white',
            'style_tags': 'casual,formal,versatile'
        },
        {
            'id': 2,
            'name': 'Slim Fit Dark Wash Jeans',
            'price': 89.99,
            'category': 'pants',
            'description': 'Modern slim fit jeans in dark wash',
            'color': 'blue',
            'style_tags': 'casual,modern,versatile'
        },
        {
            'id': 3,
            'name': 'Navy Blue Blazer',
            'price': 199.99,
            'category': 'jackets',
            'description': 'Elegant navy blazer for professional settings',
            'color': 'navy',
            'style_tags': 'formal,business,classic'
        },
        {
            'id': 4,
            'name': 'Black Leather Boots',
            'price': 149.99,
            'category': 'shoes',
            'description': 'Classic black leather boots for all seasons',
            'color': 'black',
            'style_tags': 'casual,formal,durable'
        },
        {
            'id': 5,
            'name': 'Floral Summer Dress',
            'price': 79.99,
            'category': 'dresses',
            'description': 'Light and floral perfect for summer days',
            'color': 'multicolor',
            'style_tags': 'casual,summer,feminine'
        },
        {
            'id': 6,
            'name': 'Gray Wool Sweater',
            'price': 69.99,
            'category': 'sweaters',
            'description': 'Cozy gray wool sweater for cold weather',
            'color': 'gray',
            'style_tags': 'casual,winter,comfortable'
        },
        {
            'id': 7,
            'name': 'Black Trench Coat',
            'price': 249.99,
            'category': 'coats',
            'description': 'Timeless black trench coat for rain and style',
            'color': 'black',
            'style_tags': 'formal,classic,all-weather'
        },
        {
            'id': 8,
            'name': 'White Canvas Sneakers',
            'price': 59.99,
            'category': 'shoes',
            'description': 'Classic white sneakers for everyday wear',
            'color': 'white',
            'style_tags': 'casual,comfortable,versatile'
        },
        {
            'id': 9,
            'name': 'Striped Cotton T-Shirt',
            'price': 29.99,
            'category': 'shirts',
            'description': 'Breathable striped tee for casual days',
            'color': 'blue/white',
            'style_tags': 'casual,summer,comfortable'
        },
        {
            'id': 10,
            'name': 'Khaki Chino Pants',
            'price': 79.99,
            'category': 'pants',
            'description': 'Classic khaki chinos for smart casual look',
            'color': 'khaki',
            'style_tags': 'casual,smart,versatile'
        },
        {
            'id': 11,
            'name': 'Red Cocktail Dress',
            'price': 129.99,
            'category': 'dresses',
            'description': 'Stunning red dress for special occasions',
            'color': 'red',
            'style_tags': 'formal,evening,bold'
        },
        {
            'id': 12,
            'name': 'Brown Leather Belt',
            'price': 39.99,
            'category': 'accessories',
            'description': 'Quality leather belt to complete any outfit',
            'color': 'brown',
            'style_tags': 'casual,formal,essential'
        },
        {
            'id': 13,
            'name': 'Denim Jacket',
            'price': 99.99,
            'category': 'jackets',
            'description': 'Classic denim jacket for layering',
            'color': 'blue',
            'style_tags': 'casual,classic,versatile'
        },
        {
            'id': 14,
            'name': 'Silk Scarf',
            'price': 45.99,
            'category': 'accessories',
            'description': 'Elegant silk scarf for sophisticated touch',
            'color': 'burgundy',
            'style_tags': 'formal,elegant,luxury'
        },
        {
            'id': 15,
            'name': 'Running Shoes',
            'price': 119.99,
            'category': 'shoes',
            'description': 'High-performance running shoes for active lifestyle',
            'color': 'black/gray',
            'style_tags': 'athletic,comfortable,sport'
        },
        {
            'id': 16,
            'name': 'Black Street Hoodie',
            'price': 45.00,
            'category': 'hoodies',
            'description': 'Comfortable black hoodie for streetwear style',
            'color': 'black',
            'style_tags': 'casual,streetwear,winter'
        },
        {
            'id': 17,
            'name': 'Slim Fit Denim Jacket',
            'price': 60.00,
            'category': 'jackets',
            'description': 'Modern slim fit denim jacket',
            'color': 'blue',
            'style_tags': 'casual,slim,versatile'
        },
        {
            'id': 18,
            'name': 'White Minimal Shirt',
            'price': 35.00,
            'category': 'shirts',
            'description': 'Clean minimal white shirt',
            'color': 'white',
            'style_tags': 'minimal,casual,versatile'
        },
        {
            'id': 19,
            'name': 'Sporty Running Shorts',
            'price': 25.00,
            'category': 'shorts',
            'description': 'Athletic running shorts for active lifestyle',
            'color': 'black',
            'style_tags': 'sport,athletic,comfortable'
        },
        {
            'id': 20,
            'name': 'Elegant Party Dress',
            'price': 89.99,
            'category': 'dresses',
            'description': 'Beautiful dress for party occasions',
            'color': 'navy',
            'style_tags': 'party,formal,elegant'
        }
    ]
    
    return mock_products

def display_product_summary(products):
    """
    Display a summary of fetched products
    
    Args:
        products (list): List of product dictionaries
    """
    
    console.print(f"\n📊 Product Catalog Summary:")
    console.print(f"• Total products: {len(products)}")
    
    # Count by category
    categories = {}
    for product in products:
        category = product['category']
        categories[category] = categories.get(category, 0) + 1
    
    console.print("• By category:")
    for category, count in sorted(categories.items()):
        console.print(f"  - {category}: {count}")
    
    # Price range
    prices = [p['price'] for p in products]
    min_price = min(prices)
    max_price = max(prices)
    console.print(f"• Price range: ${min_price:.2f} - ${max_price:.2f}")
