"""
DatabaseRetrievalAgent – CLI-oriented database retrieval utility.

Provides typed query methods (by category, style, price range) used by
the CLI tools. The FastAPI routes use DatabaseManager directly.
"""

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

    def connect(self) -> None:
        """Connect to the Neon PostgreSQL database."""
        try:
            self.connection = psycopg2.connect(os.getenv("NEON_DATABASE_URL"))
            self.connection.autocommit = True
            console.print("✅ Connected to database successfully")
        except Exception as exc:
            console.print(f"❌ Database connection failed: {exc}")
            raise

    # ------------------------------------------------------------------
    # Query helpers
    # ------------------------------------------------------------------

    def _rows_to_products(self, rows) -> List[Dict[str, Any]]:
        """Map raw DB rows to the product dict schema used by agents."""
        products = []
        for row in rows:
            products.append(
                {
                    "product_id": row[0],
                    "product_name": row[1],
                    "product_category": row[2],
                    "product_price": float(row[3]),
                    "product_color": row[4],
                    "product_style": row[5] if row[5] else "casual",
                    "product_description": row[6],
                }
            )
        return products

    _SELECT_COLS = "id, name, category, price, color, style_tags, description"

    def fetch_all_products(self) -> List[Dict[str, Any]]:
        """Fetch all products from database (capped at 20 for CLI usage)."""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(
                    f"SELECT {self._SELECT_COLS} FROM products ORDER BY name LIMIT 20"
                )
                return self._rows_to_products(cursor.fetchall())
        except Exception as exc:
            console.print(f"❌ Failed to fetch products: {exc}")
            return []

    def fetch_products_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Fetch products matching a given category (case-insensitive)."""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(
                    f"SELECT {self._SELECT_COLS} FROM products WHERE category ILIKE %s ORDER BY name LIMIT 20",
                    (f"%{category}%",),
                )
                return self._rows_to_products(cursor.fetchall())
        except Exception as exc:
            console.print(f"❌ Failed to fetch products by category: {exc}")
            return []

    def fetch_products_by_style(self, style: str) -> List[Dict[str, Any]]:
        """Fetch products whose style_tags contain the given keyword."""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(
                    f"SELECT {self._SELECT_COLS} FROM products WHERE style_tags ILIKE %s ORDER BY name LIMIT 20",
                    (f"%{style}%",),
                )
                return self._rows_to_products(cursor.fetchall())
        except Exception as exc:
            console.print(f"❌ Failed to fetch products by style: {exc}")
            return []

    def fetch_products_by_price_range(
        self, min_price: float = 0, max_price: float = 1000
    ) -> List[Dict[str, Any]]:
        """Fetch products within a given price range."""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(
                    f"SELECT {self._SELECT_COLS} FROM products WHERE price BETWEEN %s AND %s ORDER BY price LIMIT 20",
                    (min_price, max_price),
                )
                return self._rows_to_products(cursor.fetchall())
        except Exception as exc:
            console.print(f"❌ Failed to fetch products by price range: {exc}")
            return []

    # ------------------------------------------------------------------
    # Formatters / display helpers
    # ------------------------------------------------------------------

    def format_products_as_json(self, products: List[Dict[str, Any]]) -> str:
        """Serialise the product list to a formatted JSON string."""
        return json.dumps(products, indent=2)

    def display_products_table(self, products: List[Dict[str, Any]]) -> None:
        """Render a Rich table of retrieved products."""
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

        for p in products:
            name = p["product_name"]
            style = p["product_style"]
            table.add_row(
                str(p["product_id"]),
                (name[:24] + "...") if len(name) > 24 else name,
                p["product_category"],
                f"${p['product_price']:.2f}",
                p["product_color"],
                (style[:14] + "...") if len(style) > 14 else style,
            )

        console.print(table)

    def display_json_output(self, products: List[Dict[str, Any]]) -> None:
        """Print a JSON block ready for consumption by the recommendation agent."""
        console.print("\n" + "=" * 60)
        console.print(
            Panel.fit("📄 JSON Output (for Recommendation Agent)", style="bold blue")
        )
        console.print(f"\n{self.format_products_as_json(products)}")
        console.print(f"\n📊 Retrieved {len(products)} products from database")

    def close(self) -> None:
        """Close the database connection."""
        if self.connection:
            self.connection.close()
