"""
DatabaseManager – primary interface to the Neon PostgreSQL database.

Handles connection lifecycle, schema setup, and all product/log queries
used by the FastAPI routes.
"""

import os
import psycopg2
from dotenv import load_dotenv
from typing import List, Dict, Any

load_dotenv()


class DatabaseManager:
    def __init__(self):
        self.connection = None
        self.connect()

    def connect(self) -> None:
        """Open a connection to the Neon PostgreSQL database."""
        try:
            self.connection = psycopg2.connect(os.getenv("NEON_DATABASE_URL"))
            self.connection.autocommit = True
            print("✅ Connected to database successfully")
        except Exception as exc:
            print(f"❌ Database connection failed: {exc}")
            raise

    # ------------------------------------------------------------------
    # Schema setup
    # ------------------------------------------------------------------

    def setup_database(self) -> None:
        """Create the products, ai_logs, and free_trials tables if absent."""
        try:
            with self.connection.cursor() as cursor:
                # Products table
                cursor.execute(
                    """
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
                    """
                )
                # Ensure image_url column exists on older tables
                cursor.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT")

                # AI usage logs
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS ai_logs (
                        id SERIAL PRIMARY KEY,
                        user_id VARCHAR(100) DEFAULT 'anonymous',
                        action VARCHAR(100) NOT NULL,
                        cost DECIMAL(10, 6) DEFAULT 0.0015,
                        tokens INT DEFAULT 1500,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )

                # Free trial tracking
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS free_trials (
                        id SERIAL PRIMARY KEY,
                        user_id VARCHAR(100) NOT NULL,
                        active BOOLEAN DEFAULT TRUE,
                        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )

                # Seed sample data if table is empty
                cursor.execute("SELECT COUNT(*) FROM products")
                if cursor.fetchone()[0] == 0:
                    self._insert_sample_products(cursor)
                    print("✅ Sample products inserted successfully")
                else:
                    print("✅ Products table already populated")

        except Exception as exc:
            print(f"❌ Database setup failed: {exc}")
            raise

    def _insert_sample_products(self, cursor) -> None:
        """Insert the default sample product catalogue."""
        sample_products = [
            ("Classic White Oxford Shirt", 49.99, "shirts", "casual,formal,versatile",
             "A timeless white shirt perfect for any occasion", "white", "M", "Brooks Brothers"),
            ("Slim Fit Dark Wash Jeans", 89.99, "pants", "casual,modern,versatile",
             "Modern slim fit jeans in dark wash", "blue", "32", "Levi's"),
            ("Navy Blue Blazer", 199.99, "jackets", "formal,business,classic",
             "Elegant navy blazer for professional settings", "navy", "L", "Hugo Boss"),
            ("Black Leather Boots", 149.99, "shoes", "casual,formal,durable",
             "Classic black leather boots for all seasons", "black", "10", "Timberland"),
            ("Floral Summer Dress", 79.99, "dresses", "casual,summer,feminine",
             "Light and floral perfect for summer days", "multicolor", "S", "Zara"),
            ("Gray Wool Sweater", 69.99, "sweaters", "casual,winter,comfortable",
             "Cozy gray wool sweater for cold weather", "gray", "M", "J.Crew"),
            ("Black Trench Coat", 249.99, "coats", "formal,classic,all-weather",
             "Timeless black trench coat for rain and style", "black", "L", "Burberry"),
            ("White Canvas Sneakers", 59.99, "shoes", "casual,comfortable,versatile",
             "Classic white sneakers for everyday wear", "white", "9", "Converse"),
            ("Striped Cotton T-Shirt", 29.99, "shirts", "casual,summer,comfortable",
             "Breathable striped tee for casual days", "blue/white", "M", "Uniqlo"),
            ("Khaki Chino Pants", 79.99, "pants", "casual,smart,versatile",
             "Classic khaki chinos for smart casual look", "khaki", "32", "Dockers"),
            ("Red Cocktail Dress", 129.99, "dresses", "formal,evening,bold",
             "Stunning red dress for special occasions", "red", "S", "Mango"),
            ("Brown Leather Belt", 39.99, "accessories", "casual,formal,essential",
             "Quality leather belt to complete any outfit", "brown", "One Size", "Cole Haan"),
            ("Denim Jacket", 99.99, "jackets", "casual,classic,versatile",
             "Classic denim jacket for layering", "blue", "L", "Lee"),
            ("Silk Scarf", 45.99, "accessories", "formal,elegant,luxury",
             "Elegant silk scarf for sophisticated touch", "burgundy", "One Size", "Hermès"),
            ("Running Shoes", 119.99, "shoes", "athletic,comfortable,sport",
             "High-performance running shoes for active lifestyle", "black/gray", "10", "Nike"),
        ]
        cursor.executemany(
            """
            INSERT INTO products (name, price, category, style_tags, description, color, size, brand, image_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            [(*p, None) for p in sample_products],
        )

    # ------------------------------------------------------------------
    # Product queries
    # ------------------------------------------------------------------

    def get_all_products(self) -> List[Dict[str, Any]]:
        """Fetch all products from the database ordered by name."""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, name, price, category, style_tags, description, color, size, brand, image_url
                    FROM products
                    ORDER BY name
                    """
                )
                columns = [desc[0] for desc in cursor.description]
                return [dict(zip(columns, row)) for row in cursor.fetchall()]
        except Exception as exc:
            print(f"❌ Failed to fetch products: {exc}")
            return []

    def get_filtered_products(
        self,
        budget: float,
        occasion: str,
        season: str,
        colors: list,
        limit: int = 70,
    ) -> List[Dict[str, Any]]:
        """
        Fetch a budget-filtered subset of products for the recommendation engine.

        Pre-filters by price so the LLM never receives items above the user's
        total budget, capping the result at `limit` items to control token cost.
        In a production vector-DB setup this query would be replaced by a
        semantic similarity search.
        """
        try:
            with self.connection.cursor() as cursor:
                query = """
                    SELECT id, name, price, category, style_tags, description, color, size, brand, image_url
                    FROM products
                    WHERE price <= %s
                    ORDER BY price DESC
                    LIMIT %s
                """
                params = [budget, limit]
                cursor.execute(query, tuple(params))

                columns = [desc[0] for desc in cursor.description]
                products = []
                for row in cursor.fetchall():
                    product = dict(zip(columns, row))
                    products.append(product)
                return products

        except Exception as exc:
            print(f"❌ Failed to fetch filtered products: {exc}")
            return []

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def close(self) -> None:
        """Close the database connection."""
        if self.connection:
            self.connection.close()
