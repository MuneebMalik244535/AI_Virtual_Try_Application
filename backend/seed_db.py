import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# We define 50 diverse products
# Categories: shirts, pants, jackets, shoes, dresses, sweaters, coats, accessories
# We will use picsum.photos for placeholder images to ensure they load properly
PRODUCTS = [
    # Shirts
    ("Classic White Oxford Shirt", 49.99, "shirts", "casual,formal,versatile", "A timeless white shirt perfect for any occasion", "white", "M", "Brooks Brothers", "https://picsum.photos/400/500?random=1"),
    ("Striped Cotton T-Shirt", 29.99, "shirts", "casual,summer,comfortable", "Breathable striped tee for casual days", "blue/white", "M", "Uniqlo", "https://picsum.photos/400/500?random=2"),
    ("Black V-Neck Tee", 19.99, "shirts", "casual,minimal,everyday", "Basic black v-neck for everyday wear", "black", "L", "H&M", "https://picsum.photos/400/500?random=3"),
    ("Linen Button-Down", 55.00, "shirts", "casual,summer,breathable", "Lightweight linen shirt for warm weather", "beige", "M", "Zara", "https://picsum.photos/400/500?random=4"),
    ("Denim Shirt", 65.00, "shirts", "casual,rugged,layering", "Classic denim button-up shirt", "blue", "L", "Levi's", "https://picsum.photos/400/500?random=5"),
    ("Plaid Flannel Shirt", 45.99, "shirts", "casual,winter,cozy", "Soft plaid flannel for colder days", "red/black", "XL", "L.L.Bean", "https://picsum.photos/400/500?random=6"),
    ("Silk Blouse", 89.99, "shirts", "formal,elegant,office", "Elegant silk blouse for professional settings", "ivory", "S", "Everlane", "https://picsum.photos/400/500?random=7"),
    ("Polo Shirt", 39.99, "shirts", "sporty,casual,summer", "Classic pique cotton polo shirt", "navy", "M", "Ralph Lauren", "https://picsum.photos/400/500?random=8"),

    # Pants
    ("Slim Fit Dark Wash Jeans", 89.99, "pants", "casual,modern,versatile", "Modern slim fit jeans in dark wash", "blue", "32", "Levi's", "https://picsum.photos/400/500?random=9"),
    ("Khaki Chino Pants", 79.99, "pants", "casual,smart,versatile", "Classic khaki chinos for smart casual look", "khaki", "32", "Dockers", "https://picsum.photos/400/500?random=10"),
    ("Black Dress Pants", 95.00, "pants", "formal,office,tailored", "Tailored black trousers for formal occasions", "black", "34", "Hugo Boss", "https://picsum.photos/400/500?random=11"),
    ("Gray Joggers", 45.00, "pants", "sporty,casual,lounge", "Comfortable cotton blend joggers", "gray", "L", "Nike", "https://picsum.photos/400/500?random=12"),
    ("Cargo Pants", 65.99, "pants", "streetwear,casual,utility", "Utility cargo pants with multiple pockets", "olive", "32", "Carhartt", "https://picsum.photos/400/500?random=13"),
    ("Wide Leg Trousers", 85.00, "pants", "formal,trendy,office", "Trendy wide leg trousers for a modern look", "navy", "S", "Zara", "https://picsum.photos/400/500?random=14"),
    ("Light Wash Mom Jeans", 75.00, "pants", "casual,retro,streetwear", "Vintage-inspired high waisted mom jeans", "light blue", "28", "Levi's", "https://picsum.photos/400/500?random=15"),

    # Jackets
    ("Navy Blue Blazer", 199.99, "jackets", "formal,business,classic", "Elegant navy blazer for professional settings", "navy", "L", "Hugo Boss", "https://picsum.photos/400/500?random=16"),
    ("Denim Jacket", 99.99, "jackets", "casual,classic,versatile", "Classic denim jacket for layering", "blue", "L", "Lee", "https://picsum.photos/400/500?random=17"),
    ("Black Leather Biker Jacket", 299.99, "jackets", "streetwear,edgy,classic", "Genuine leather biker jacket", "black", "M", "AllSaints", "https://picsum.photos/400/500?random=18"),
    ("Olive Bomber Jacket", 120.00, "jackets", "casual,streetwear,layering", "Lightweight bomber jacket", "olive", "L", "Alpha Industries", "https://picsum.photos/400/500?random=19"),
    ("Fleece Zip-Up Jacket", 85.00, "jackets", "sporty,winter,cozy", "Warm fleece jacket for outdoor activities", "gray", "XL", "Patagonia", "https://picsum.photos/400/500?random=20"),
    ("Tweed Blazer", 249.00, "jackets", "formal,vintage,winter", "Classic tweed blazer for a sophisticated look", "brown", "M", "Brooks Brothers", "https://picsum.photos/400/500?random=21"),

    # Shoes
    ("Black Leather Boots", 149.99, "shoes", "casual,formal,durable", "Classic black leather boots for all seasons", "black", "10", "Timberland", "https://picsum.photos/400/500?random=22"),
    ("White Canvas Sneakers", 59.99, "shoes", "casual,comfortable,versatile", "Classic white sneakers for everyday wear", "white", "9", "Converse", "https://picsum.photos/400/500?random=23"),
    ("Running Shoes", 119.99, "shoes", "athletic,sporty,comfortable", "High-performance running shoes", "black/gray", "10", "Nike", "https://picsum.photos/400/500?random=24"),
    ("Brown Oxford Shoes", 155.00, "shoes", "formal,business,elegant", "Leather oxford shoes for formal outfits", "brown", "9.5", "Cole Haan", "https://picsum.photos/400/500?random=25"),
    ("Slip-On Loafers", 95.00, "shoes", "casual,smart,summer", "Comfortable suede slip-on loafers", "navy", "10", "Clarks", "https://picsum.photos/400/500?random=26"),
    ("High-Top Sneakers", 85.00, "shoes", "streetwear,casual,sporty", "Classic high-top basketball sneakers", "red/white", "11", "Vans", "https://picsum.photos/400/500?random=27"),
    ("Chelsea Boots", 165.00, "shoes", "smart,casual,minimal", "Sleek leather chelsea boots", "black", "10", "Dr. Martens", "https://picsum.photos/400/500?random=28"),

    # Dresses
    ("Floral Summer Dress", 79.99, "dresses", "casual,summer,feminine", "Light and floral perfect for summer days", "multicolor", "S", "Zara", "https://picsum.photos/400/500?random=29"),
    ("Red Cocktail Dress", 129.99, "dresses", "formal,evening,bold", "Stunning red dress for special occasions", "red", "S", "Mango", "https://picsum.photos/400/500?random=30"),
    ("Little Black Dress", 99.00, "dresses", "formal,classic,party", "The essential little black dress", "black", "M", "H&M", "https://picsum.photos/400/500?random=31"),
    ("Maxi Wrap Dress", 110.00, "dresses", "casual,elegant,summer", "Flowy maxi dress with wrap design", "emerald", "M", "ASOS", "https://picsum.photos/400/500?random=32"),
    ("Knit Midi Dress", 85.00, "dresses", "casual,winter,comfortable", "Warm knit midi dress for colder months", "beige", "L", "Everlane", "https://picsum.photos/400/500?random=33"),
    
    # Sweaters
    ("Gray Wool Sweater", 69.99, "sweaters", "casual,winter,comfortable", "Cozy gray wool sweater for cold weather", "gray", "M", "J.Crew", "https://picsum.photos/400/500?random=34"),
    ("Cashmere Crewneck", 150.00, "sweaters", "formal,winter,luxury", "Soft cashmere crewneck sweater", "navy", "L", "Everlane", "https://picsum.photos/400/500?random=35"),
    ("Chunky Knit Cardigan", 89.00, "sweaters", "casual,winter,cozy", "Oversized chunky knit cardigan", "cream", "S", "Zara", "https://picsum.photos/400/500?random=36"),
    ("Turtleneck Sweater", 75.00, "sweaters", "smart,winter,minimal", "Sleek turtleneck sweater for layering", "black", "M", "Uniqlo", "https://picsum.photos/400/500?random=37"),
    ("Striped Pullover", 65.00, "sweaters", "casual,spring,classic", "Cotton striped pullover sweater", "blue/white", "L", "L.L.Bean", "https://picsum.photos/400/500?random=38"),

    # Coats
    ("Black Trench Coat", 249.99, "coats", "formal,classic,all-weather", "Timeless black trench coat for rain and style", "black", "L", "Burberry", "https://picsum.photos/400/500?random=39"),
    ("Wool Overcoat", 199.00, "coats", "formal,winter,elegant", "Warm wool blend overcoat", "camel", "M", "Hugo Boss", "https://picsum.photos/400/500?random=40"),
    ("Puffer Coat", 160.00, "coats", "casual,winter,sporty", "Insulated puffer coat for extreme cold", "navy", "L", "The North Face", "https://picsum.photos/400/500?random=41"),
    ("Peacoat", 175.00, "coats", "smart,winter,classic", "Classic double-breasted peacoat", "charcoal", "XL", "J.Crew", "https://picsum.photos/400/500?random=42"),
    ("Parka with Faux Fur", 210.00, "coats", "casual,winter,warm", "Heavyweight parka with faux fur hood", "olive", "M", "Canada Goose", "https://picsum.photos/400/500?random=43"),

    # Accessories
    ("Brown Leather Belt", 39.99, "accessories", "casual,formal,essential", "Quality leather belt to complete any outfit", "brown", "One Size", "Cole Haan", "https://picsum.photos/400/500?random=44"),
    ("Silk Scarf", 45.99, "accessories", "formal,elegant,luxury", "Elegant silk scarf for sophisticated touch", "burgundy", "One Size", "Hermès", "https://picsum.photos/400/500?random=45"),
    ("Knit Beanie", 25.00, "accessories", "casual,winter,cozy", "Warm knit beanie for winter days", "gray", "One Size", "Carhartt", "https://picsum.photos/400/500?random=46"),
    ("Aviator Sunglasses", 150.00, "accessories", "casual,summer,classic", "Classic aviator sunglasses", "gold/green", "One Size", "Ray-Ban", "https://picsum.photos/400/500?random=47"),
    ("Leather Crossbody Bag", 195.00, "accessories", "casual,accessories,daily", "Premium leather crossbody bag", "black", "One Size", "Coach", "https://picsum.photos/400/500?random=48"),
    ("Minimalist Watch", 125.00, "accessories", "formal,minimal,elegant", "Sleek minimalist analog watch", "silver/black", "One Size", "Daniel Wellington", "https://picsum.photos/400/500?random=49"),
    ("Canvas Tote Bag", 15.00, "accessories", "casual,everyday,utility", "Durable canvas tote bag for groceries and everyday use", "natural", "One Size", "L.L.Bean", "https://picsum.photos/400/500?random=50")
]

def seed_database():
    try:
        conn = psycopg2.connect(os.getenv('NEON_DATABASE_URL'))
        conn.autocommit = True
        
        with conn.cursor() as cursor:
            # 1. Clear existing table
            print("Dropping existing products table...")
            cursor.execute("DROP TABLE IF EXISTS products;")
            
            # 2. Recreate table with image_url column
            print("Creating products table with image_url...")
            cursor.execute("""
                CREATE TABLE products (
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
            
            # 3. Insert the 50 products
            print(f"Inserting {len(PRODUCTS)} new products...")
            cursor.executemany("""
                INSERT INTO products (name, price, category, style_tags, description, color, size, brand, image_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, PRODUCTS)
            
            print("✅ Successfully seeded the database with 50 products!")
            
    except Exception as e:
        print(f"❌ Database seeding failed: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    seed_database()
