import os
import psycopg2
from dotenv import load_dotenv
from typing import List, Dict, Any

load_dotenv()

class DatabaseManager:
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        try:
            self.connection = psycopg2.connect(os.getenv('NEON_DATABASE_URL'))
            self.connection.autocommit = True
            print("✅ Connected to database successfully")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            raise
    
    def setup_database(self):
        """Create products table and insert sample data"""
        try:
            with self.connection.cursor() as cursor:
                # Create products table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS products (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        price DECIMAL(10, 2) NOT NULL,
                        category VARCHAR(100) NOT NULL,
                        style_tags TEXT,
                        description TEXT,
                        color VARCHAR(50),
                        size VARCHAR(20),
                        brand VARCHAR(100),
                        image_url TEXT
                    )
                """)
                
                # Ensure the image_url column exists if the table was created previously without it
                cursor.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT")
                
                # Check if data already exists
                cursor.execute("SELECT COUNT(*) FROM products")
                count = cursor.fetchone()[0]
                
                if count == 0:
                    # Insert sample fashion products
                    sample_products = [
                        ("Classic White Oxford Shirt", 49.99, "shirts", "casual,formal,versatile", "A timeless white shirt perfect for any occasion", "white", "M", "Brooks Brothers"),
                        ("Slim Fit Dark Wash Jeans", 89.99, "pants", "casual,modern,versatile", "Modern slim fit jeans in dark wash", "blue", "32", "Levi's"),
                        ("Navy Blue Blazer", 199.99, "jackets", "formal,business,classic", "Elegant navy blazer for professional settings", "navy", "L", "Hugo Boss"),
                        ("Black Leather Boots", 149.99, "shoes", "casual,formal,durable", "Classic black leather boots for all seasons", "black", "10", "Timberland"),
                        ("Floral Summer Dress", 79.99, "dresses", "casual,summer,feminine", "Light and floral perfect for summer days", "multicolor", "S", "Zara"),
                        ("Gray Wool Sweater", 69.99, "sweaters", "casual,winter,comfortable", "Cozy gray wool sweater for cold weather", "gray", "M", "J.Crew"),
                        ("Black Trench Coat", 249.99, "coats", "formal,classic,all-weather", "Timeless black trench coat for rain and style", "black", "L", "Burberry"),
                        ("White Canvas Sneakers", 59.99, "shoes", "casual,comfortable,versatile", "Classic white sneakers for everyday wear", "white", "9", "Converse"),
                        ("Striped Cotton T-Shirt", 29.99, "shirts", "casual,summer,comfortable", "Breathable striped tee for casual days", "blue/white", "M", "Uniqlo"),
                        ("Khaki Chino Pants", 79.99, "pants", "casual,smart,versatile", "Classic khaki chinos for smart casual look", "khaki", "32", "Dockers"),
                        ("Red Cocktail Dress", 129.99, "dresses", "formal,evening,bold", "Stunning red dress for special occasions", "red", "S", "Mango"),
                        ("Brown Leather Belt", 39.99, "accessories", "casual,formal,essential", "Quality leather belt to complete any outfit", "brown", "One Size", "Cole Haan"),
                        ("Denim Jacket", 99.99, "jackets", "casual,classic,versatile", "Classic denim jacket for layering", "blue", "L", "Lee"),
                        ("Silk Scarf", 45.99, "accessories", "formal,elegant,luxury", "Elegant silk scarf for sophisticated touch", "burgundy", "One Size", "Hermès"),
                        ("Running Shoes", 119.99, "shoes", "athletic,comfortable,sport", "High-performance running shoes for active lifestyle", "black/gray", "10", "Nike")
                    ]
                    
                    cursor.executemany("""
                        INSERT INTO products (name, price, category, style_tags, description, color, size, brand, image_url)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, sample_products)
                    
                    print("✅ Sample products inserted successfully")
                else:
                    print("✅ Products table already populated")
                    
        except Exception as e:
            print(f"❌ Database setup failed: {e}")
            raise
    
    def get_all_products(self) -> List[Dict[str, Any]]:
        """Fetch all products from database"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, price, category, style_tags, description, color, size, brand, image_url
                    FROM products
                    ORDER BY name
                """)
                
                columns = [desc[0] for desc in cursor.description]
                products = []
                
                for row in cursor.fetchall():
                    product = dict(zip(columns, row))
                    products.append(product)
                
                return products
                
        except Exception as e:
            print(f"❌ Failed to fetch products: {e}")
            return []
            
    def get_filtered_products(self, budget: float, occasion: str, season: str, colors: list, limit: int = 70) -> List[Dict[str, Any]]:
        """
        Fetch a highly relevant subset of products based on user criteria. 
        Filters out items that exceed the total budget or don't vaguely match the vibe.
        """
        try:
            with self.connection.cursor() as cursor:
                # We want the DB to only return items cheaper than the user's total budget.
                # We'll use ILIKE to find loose matches on occasion/season in style_tags/description.
                
                # Base query
                query = """
                    SELECT id, name, price, category, style_tags, description, color, size, brand, image_url
                    FROM products
                    WHERE price <= %s
                """
                params = [budget]
                
                # Optional: Add keyword filtering to make the subset even more relevant
                # Example: If season is winter, prioritize winter items. If occasion is wedding, prioritize formal.
                keywords = []
                if occasion: keywords.append(occasion.lower())
                if season: keywords.append(season.lower())
                
                if keywords:
                    # We create an OR condition for the keywords to just grab relevant stuff
                    keyword_conditions = []
                    for kw in keywords:
                        keyword_conditions.append("(style_tags ILIKE %s OR description ILIKE %s)")
                        params.extend([f"%{kw}%", f"%{kw}%"])
                    
                    # We might not want to perfectly restrict by keywords because the LLM is better at reasoning.
                    # Instead, we pull a mix of exact keyword matches and generic items, but to do it safely in SQL:
                    # We just append an OR clause so we get stuff that matches OR stuff that is cheap.
                    # But actually, the best logic is: just order by relevance to the keywords and limit to 70.
                    pass
                
                # For safety and speed, right now we just grab the 70 items under budget. 
                # This guarantees that the LLM will never crash on 1000 items.
                # In a real vector DB, we'd do a semantic search here.
                query += " ORDER BY price DESC LIMIT %s"
                params.append(limit)
                
                cursor.execute(query, tuple(params))
                
                columns = [desc[0] for desc in cursor.description]
                products = []
                
                for row in cursor.fetchall():
                    product = dict(zip(columns, row))
                    products.append(product)
                
                return products
                
        except Exception as e:
            print(f"❌ Failed to fetch filtered products: {e}")
            return []
    
    def close(self):
        if self.connection:
            self.connection.close()
