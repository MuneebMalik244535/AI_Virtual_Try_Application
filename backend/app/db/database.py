import os
import psycopg2
from dotenv import load_dotenv
from typing import List, Dict, Any

from app.core.errors import DatabaseError, USER_MESSAGES
from app.logging.structured_logger import logger

load_dotenv()

class DatabaseManager:
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        database_url = os.getenv('NEON_DATABASE_URL')
        if not database_url:
            logger.error(
                "Database configuration missing",
                event_type="database_configuration_error",
                env_var="NEON_DATABASE_URL",
            )
            raise DatabaseError(
                "Missing database configuration",
                user_message=USER_MESSAGES["database_unavailable"],
            )

        try:
            self.connection = psycopg2.connect(database_url)
            self.connection.autocommit = True
            logger.info(
                "Connected to database successfully",
                event_type="database_connection",
            )
        except Exception as exc:
            logger.error(
                "Database connection failed",
                event_type="database_error",
                error=str(exc),
            )
            raise DatabaseError(
                "Database connection failed",
                user_message=USER_MESSAGES["database_unavailable"],
                detail=str(exc),
            ) from exc
    
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
                
                # Create ai_logs table for tracking unit economics
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS ai_logs (
                        id SERIAL PRIMARY KEY,
                        user_id VARCHAR(100) DEFAULT 'anonymous',
                        action VARCHAR(100) NOT NULL,
                        cost DECIMAL(10, 6) DEFAULT 0.0015,
                        tokens INT DEFAULT 1500,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)

                # Create free_trials table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS free_trials (
                        id SERIAL PRIMARY KEY,
                        user_id VARCHAR(100) NOT NULL,
                        active BOOLEAN DEFAULT TRUE,
                        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
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
        Filters out items that exceed the total budget and uses loose matching
        to retrieve a more relevant candidate set for the AI recommender.
        """
        try:
            with self.connection.cursor() as cursor:
                query = """
                    SELECT id, name, price, category, style_tags, description, color, size, brand, image_url
                    FROM products
                    WHERE price <= %s
                """
                params = [budget]
                filters = []

                if season:
                    filters.append("(style_tags ILIKE %s OR description ILIKE %s)")
                    params.extend([f"%{season}%", f"%{season}%"])

                cleaned_colors = [c.strip() for c in colors if isinstance(c, str) and c.strip()]
                if cleaned_colors:
                    color_clauses = []
                    for color in cleaned_colors[:5]:
                        color_clauses.append("(color ILIKE %s OR style_tags ILIKE %s OR description ILIKE %s)")
                        params.extend([f"%{color}%", f"%{color}%", f"%{color}%"])
                    filters.append("(" + " OR ".join(color_clauses) + ")")

                if filters:
                    query += " AND " + " AND ".join(filters)

                query += " ORDER BY price DESC LIMIT %s"
                params.append(limit)

                cursor.execute(query, tuple(params))

                columns = [desc[0] for desc in cursor.description]
                products = [dict(zip(columns, row)) for row in cursor.fetchall()]

                logger.debug(
                    "Filtered products query executed",
                    event_type="database_query",
                    budget=budget,
                    season=season,
                    colors=cleaned_colors,
                    returned=len(products),
                )

                return products

        except Exception as exc:
            logger.error(
                "Failed to fetch filtered products",
                event_type="database_error",
                error=str(exc),
                budget=budget,
                season=season,
                colors=colors,
            )
            return []
    
    def close(self):
        if self.connection:
            self.connection.close()
