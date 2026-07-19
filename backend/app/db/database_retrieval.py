import json
import os
import psycopg2
from dotenv import load_dotenv
from typing import List, Dict, Any
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

load_dotenv()

console = Console()

class DatabaseRetrievalAgent:
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        """Connect to the database"""
        try:
            self.connection = psycopg2.connect(os.getenv('NEON_DATABASE_URL'))
            self.connection.autocommit = True
            console.print("✅ Connected to database successfully")
        except Exception as e:
            console.print(f"❌ Database connection failed: {e}")
            raise
    
    def fetch_all_products(self) -> List[Dict[str, Any]]:
        """Fetch all products from database"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, category, price, color, style_tags, description
                    FROM products
                    ORDER BY name
                    LIMIT 20
                """)
                
                products = []
                for row in cursor.fetchall():
                    product = {
                        'product_id': row[0],
                        'product_name': row[1],
                        'product_category': row[2],
                        'product_price': float(row[3]),
                        'product_color': row[4],
                        'product_style': row[5] if row[5] else 'casual',
                        'product_description': row[6]
                    }
                    products.append(product)
                
                return products
                
        except Exception as e:
            console.print(f"❌ Failed to fetch products: {e}")
            return []
    
    def fetch_products_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Fetch products by specific category"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, category, price, color, style_tags, description
                    FROM products
                    WHERE category ILIKE %s
                    ORDER BY name
                    LIMIT 20
                """, (f"%{category}%",))
                
                products = []
                for row in cursor.fetchall():
                    product = {
                        'product_id': row[0],
                        'product_name': row[1],
                        'product_category': row[2],
                        'product_price': float(row[3]),
                        'product_color': row[4],
                        'product_style': row[5] if row[5] else 'casual',
                        'product_description': row[6]
                    }
                    products.append(product)
                
                return products
                
        except Exception as e:
            console.print(f"❌ Failed to fetch products by category: {e}")
            return []
    
    def fetch_products_by_style(self, style: str) -> List[Dict[str, Any]]:
        """Fetch products by style tags"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, category, price, color, style_tags, description
                    FROM products
                    WHERE style_tags ILIKE %s
                    ORDER BY name
                    LIMIT 20
                """, (f"%{style}%",))
                
                products = []
                for row in cursor.fetchall():
                    product = {
                        'product_id': row[0],
                        'product_name': row[1],
                        'product_category': row[2],
                        'product_price': float(row[3]),
                        'product_color': row[4],
                        'product_style': row[5] if row[5] else 'casual',
                        'product_description': row[6]
                    }
                    products.append(product)
                
                return products
                
        except Exception as e:
            console.print(f"❌ Failed to fetch products by style: {e}")
            return []
    
    def fetch_products_by_price_range(self, min_price: float = 0, max_price: float = 1000) -> List[Dict[str, Any]]:
        """Fetch products within a price range"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, name, category, price, color, style_tags, description
                    FROM products
                    WHERE price BETWEEN %s AND %s
                    ORDER BY price
                    LIMIT 20
                """, (min_price, max_price))
                
                products = []
                for row in cursor.fetchall():
                    product = {
                        'product_id': row[0],
                        'product_name': row[1],
                        'product_category': row[2],
                        'product_price': float(row[3]),
                        'product_color': row[4],
                        'product_style': row[5] if row[5] else 'casual',
                        'product_description': row[6]
                    }
                    products.append(product)
                
                return products
                
        except Exception as e:
            console.print(f"❌ Failed to fetch products by price range: {e}")
            return []
    
    def format_products_as_json(self, products: List[Dict[str, Any]]) -> str:
        """Format products as JSON for recommendation agent"""
        return json.dumps(products, indent=2)
    
    def display_products_table(self, products: List[Dict[str, Any]]):
        """Display products in a formatted table"""
        if not products:
            console.print("❌ No products found!", style="bold red")
            return
        
        table = Table(title="Product Database Results")
        table.add_column("ID", style="cyan", width=6)
        table.add_column("Name", style="magenta", width=25)
        table.add_column("Category", style="green", width=12)
        table.add_column("Price", style="yellow", width=8)
        table.add_column("Color", style="blue", width=10)
        table.add_column("Style", style="red", width=15)
        
        for product in products:
            table.add_row(
                str(product['product_id']),
                product['product_name'][:24] + "..." if len(product['product_name']) > 24 else product['product_name'],
                product['product_category'],
                f"${product['product_price']:.2f}",
                product['product_color'],
                product['product_style'][:14] + "..." if len(product['product_style']) > 14 else product['product_style']
            )
        
        console.print(table)
    
    def display_json_output(self, products: List[Dict[str, Any]]):
        """Display JSON output for recommendation agent"""
        console.print("\n" + "="*60)
        console.print(Panel.fit(
            "📄 JSON Output (for Recommendation Agent)",
            style="bold blue"
        ))
        
        json_output = self.format_products_as_json(products)
        console.print(f"\n{json_output}")
        
        console.print(f"\n📊 Retrieved {len(products)} products from database")

def main():
    try:
        console.print(Panel.fit(
            "🗄️ Database Retrieval Agent 🗄️\n\n"
            "I'll fetch relevant product data from the store database "
            "and format it as JSON for the recommendation agent.",
            title="Database Retrieval Agent",
            style="bold magenta"
        ))
        
        agent = DatabaseRetrievalAgent()
        
        console.print("\n🔍 Retrieval Options:")
        console.print("1. Fetch all products")
        console.print("2. Fetch by category")
        console.print("3. Fetch by style")
        console.print("4. Fetch by price range")
        
        choice = input("\nChoose option (1-4): ").strip()
        
        products = []
        
        if choice == "1":
            products = agent.fetch_all_products()
        elif choice == "2":
            category = input("Enter category: ").strip()
            products = agent.fetch_products_by_category(category)
        elif choice == "3":
            style = input("Enter style: ").strip()
            products = agent.fetch_products_by_style(style)
        elif choice == "4":
            min_price = float(input("Enter minimum price: ").strip() or "0")
            max_price = float(input("Enter maximum price: ").strip() or "1000")
            products = agent.fetch_products_by_price_range(min_price, max_price)
        else:
            console.print("❌ Invalid choice!", style="bold red")
            return
        
        # Display results
        agent.display_products_table(products)
        agent.display_json_output(products)
        
        agent.connection.close()
        
    except KeyboardInterrupt:
        console.print("\n👋 Goodbye!", style="bold yellow")
    except Exception as e:
        console.print(f"\n❌ An error occurred: {e}", style="bold red")

if __name__ == "__main__":
    main()
