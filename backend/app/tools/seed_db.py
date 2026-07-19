import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

PRODUCTS = [
    # -- SHIRTS (15) ------------------------------------------------------
    ("Classic White Oxford Shirt", 49.99, "shirts", "formal,casual,versatile,office,spring,summer", "A timeless button-down Oxford shirt crafted from 100% premium cotton. Features a regular fit, barrel cuffs, and a spread collar. Perfect for layering under a blazer or wearing open-collar on weekends.", "white", "M", "Brooks Brothers", "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80"),
    ("Navy Blue Polo Shirt", 39.99, "shirts", "sporty,casual,summer,preppy", "Classic pique cotton polo with a two-button placket and ribbed collar. Moisture-wicking fabric keeps you comfortable in warm weather.", "navy", "M", "Ralph Lauren", "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=80"),
    ("Black V-Neck Tee", 19.99, "shirts", "casual,minimal,everyday,summer", "Soft jersey cotton v-neck tee with a slightly relaxed fit. An everyday essential that pairs effortlessly with jeans, chinos, or joggers.", "black", "L", "H&M", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80"),
    ("Linen Button-Down Shirt", 55.00, "shirts", "casual,summer,breathable,beach,vacation", "Lightweight 100% linen shirt designed for hot weather. Features a slightly relaxed fit, chest pocket, and pearlescent buttons.", "beige", "M", "Zara", "https://images.unsplash.com/photo-1594938298603-c8148c4b1e5e?w=600&q=80"),
    ("Plaid Flannel Shirt", 45.99, "shirts", "casual,winter,rugged,layering,autumn", "Classic buffalo plaid flannel shirt in a brushed cotton blend. Relaxed fit with button-down collar and double chest pockets.", "red/black", "XL", "L.L.Bean", "https://images.unsplash.com/photo-1603251578711-3290ca1a0187?w=600&q=80"),
    ("Denim Shirt", 65.00, "shirts", "casual,versatile,layering,spring,autumn", "Light-medium wash denim shirt with a classic button placket. Wear it open over a tee, buttoned up with chinos, or tied at the waist.", "blue", "L", "Levi's", "https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=600&q=80"),
    ("Silk Blouse", 89.99, "shirts", "formal,elegant,office,party,luxury", "Fluid 100% silk blouse with a relaxed drape, V-neckline, and hidden button placket. Pairs with tailored trousers or slim jeans.", "ivory", "S", "Everlane", "https://images.unsplash.com/photo-1551163943-3f7253a97a04?w=600&q=80"),
    ("White Graphic Print Tee", 24.99, "shirts", "casual,streetwear,summer,youth", "100% combed ring-spun cotton tee with a bold graphic print on the chest. Relaxed unisex fit. A streetwear staple.", "white", "M", "Supreme", "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80"),
    ("Oversized Fleece Hoodie", 59.99, "shirts", "casual,streetwear,winter,autumn,lounge", "Ultra-soft 320 GSM fleece hoodie with kangaroo pocket and adjustable drawstring. Perfect for lounging or layering.", "charcoal", "XL", "Champion", "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80"),
    ("Striped Breton Top", 34.99, "shirts", "casual,nautical,spring,summer,classic", "Classic French Breton stripe jersey top with a boat neckline and long sleeves. Made from lightweight cotton-modal blend.", "blue/white", "S", "Saint James", "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80"),
    ("Men's Henley Shirt", 36.99, "shirts", "casual,autumn,winter,comfortable,smart", "Waffle-knit Henley shirt with a 3-button placket. Slim fit from soft cotton-polyester blend. Effortlessly stylish for weekends.", "slate grey", "M", "Gap", "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80"),
    ("Men's Chambray Shirt", 52.00, "shirts", "casual,summer,smart,office", "Soft chambray shirt with button-down collar. Lightweight weave ideal for warm days. Wear tucked in or out.", "light blue", "L", "J.Crew", "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80"),
    ("Women's Wrap Blouse", 47.00, "shirts", "office,elegant,spring,summer,feminine", "Flowy wrap-front blouse with fluted sleeves and a V-neckline. Made from crinkle-finish georgette.", "dusty rose", "S", "& Other Stories", "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&q=80"),
    ("Ribbed Tank Top", 18.99, "shirts", "casual,summer,minimal,athletic,layering", "Fitted ribbed cotton tank top with a scoop neck. Wear alone in summer or under a blazer.", "white", "XS", "ASOS", "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80"),
    ("Men's Oxford Button-Down Blue", 54.99, "shirts", "office,casual,smart,versatile,spring", "Light blue Oxford weave shirt with classic button-down collar. Regular fit with rounded hem.", "light blue", "M", "Brooks Brothers", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80"),

    # -- JEANS (6) --------------------------------------------------------
    ("Slim Fit Dark Wash Jeans", 89.99, "jeans", "casual,modern,versatile,smart,autumn,winter", "Dark indigo slim-fit jeans with a mid-rise waist and tapered leg. Made from stretch denim for all-day comfort.", "dark blue", "32", "Levi's", "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80"),
    ("Light Wash Mom Jeans", 75.00, "jeans", "casual,retro,streetwear,spring,summer", "High-waisted mom jeans in a vintage light wash with natural fading. Relaxed through the hip with a straight crop leg.", "light blue", "28", "Levi's", "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=600&q=80"),
    ("Black Skinny Jeans", 69.99, "jeans", "casual,edgy,versatile,party,autumn", "Sleek black skinny jeans in mid-rise cut. High-stretch denim for a second-skin feel.", "black", "30", "Topshop", "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80"),
    ("Straight-Fit Raw Denim Jeans", 110.00, "jeans", "casual,rugged,minimal,autumn,streetwear", "Selvedge raw denim in a classic straight cut. Unsanforized denim that fades uniquely over time.", "dark indigo", "32", "Nudie Jeans", "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80"),
    ("Women's Flared Jeans", 79.00, "jeans", "retro,casual,spring,summer,trendy", "High-waist flared jeans in a mid-blue wash. The 70s silhouette modernised for today.", "mid blue", "27", "Free People", "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=600&q=80"),
    ("Distressed Boyfriend Jeans", 72.00, "jeans", "casual,streetwear,summer,relaxed,youth", "Relaxed boyfriend-cut jeans with authentic distressing at the knees. A cool, effortless everyday look.", "medium blue", "29", "Madewell", "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80"),

    # -- PANTS (8) --------------------------------------------------------
    ("Wide Leg Linen Trousers", 85.00, "pants", "formal,elegant,summer,smart,trendy", "Relaxed-fit wide-leg trousers in breathable linen-viscose blend. High waist and pressed front pleats.", "sand", "S", "Arket", "https://images.unsplash.com/photo-1594938298603-c8148c4b1e5e?w=600&q=80"),
    ("Khaki Chino Pants", 79.99, "pants", "smart,casual,versatile,office,spring", "Slim-fit cotton chinos with flat front and slash pockets. A wardrobe must-have bridging casual and formal.", "khaki", "32", "Dockers", "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80"),
    ("Black Formal Trousers", 95.00, "pants", "formal,office,elegant,tailored,winter", "Tailored straight-leg trousers in fine wool-blend. Mid-rise with a flat front and side pockets.", "black", "34", "Hugo Boss", "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&q=80"),
    ("Olive Cargo Pants", 65.99, "pants", "streetwear,casual,utility,autumn,outdoors", "Relaxed-fit cargo pants with six utility pockets and drawstring waist. Durable ripstop cotton fabric.", "olive", "32", "Carhartt", "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80"),
    ("Gray Slim Joggers", 45.00, "pants", "sporty,casual,lounge,winter,athletic", "Slim-fit cotton-blend joggers with drawstring waist and ribbed cuffs. Soft and flexible.", "gray", "L", "Nike", "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&q=80"),
    ("Floral Midi Skirt", 55.00, "pants", "casual,feminine,summer,spring,boho", "Flowing floral-print midi skirt in lightweight chiffon with elasticated waistband.", "multicolor", "S", "Zara", "https://images.unsplash.com/photo-1566206091558-7f218b696731?w=600&q=80"),
    ("White Linen Shorts", 39.99, "pants", "casual,summer,beach,vacation,minimal", "Relaxed-fit linen-cotton shorts with drawstring waist and two side pockets.", "white", "M", "Uniqlo", "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80"),
    ("Pleated Culottes", 60.00, "pants", "formal,trendy,elegant,office,spring", "High-waisted culottes with front box pleats in ponte fabric. Modern silhouette for the office or evening.", "navy", "M", "& Other Stories", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80"),

    # -- JACKETS (12) -----------------------------------------------------
    ("Navy Slim-Fit Blazer", 199.99, "jackets", "formal,business,classic,office,smart", "Single-breasted slim-fit blazer in lightweight navy wool-blend. Notch lapels and two-button fastening.", "navy", "L", "Hugo Boss", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80"),
    ("Classic Denim Jacket", 99.99, "jackets", "casual,classic,versatile,spring,autumn", "Medium-wash denim jacket with classic fit and button front. A true wardrobe icon.", "medium blue", "L", "Levi's", "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&q=80"),
    ("Black Leather Biker Jacket", 299.99, "jackets", "edgy,streetwear,casual,autumn,winter,classic", "Genuine black lambskin leather biker jacket with asymmetric zip and quilted shoulder panels.", "black", "M", "AllSaints", "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80"),
    ("Olive Bomber Jacket", 120.00, "jackets", "casual,streetwear,autumn,layering,minimal", "Lightweight nylon bomber with ribbed collar, cuffs, and hem. The ultimate transitional layer.", "olive", "L", "Alpha Industries", "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&q=80"),
    ("Fleece Zip-Up Jacket", 85.00, "jackets", "sporty,outdoor,winter,cozy,casual", "100% recycled polyester fleece zip-up with stand collar and two hand pockets.", "gray", "XL", "Patagonia", "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&q=80"),
    ("Brown Tweed Blazer", 249.00, "jackets", "formal,vintage,smart,winter,autumn,british", "Heritage tweed blazer in warm brown with classic fit and elbow patches.", "brown", "M", "Harris Tweed", "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=80"),
    ("Women's Pastel Pink Blazer", 145.00, "jackets", "office,trendy,spring,feminine,smart", "Oversized single-button blazer in soft pastel pink crepe fabric. A fashion-forward piece.", "pink", "S", "Mango", "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80"),
    ("Quilted Puffer Vest", 79.00, "jackets", "casual,outdoor,autumn,layering,sporty", "Lightweight quilted vest with stand collar and front zip. Perfect for active lifestyles.", "black", "M", "The North Face", "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&q=80"),
    ("Cropped Moto Jacket", 165.00, "jackets", "edgy,streetwear,casual,autumn,feminine", "Cropped faux-leather moto jacket with zip details and asymmetric front closure.", "tan", "XS", "Zara", "https://images.unsplash.com/photo-1548624313-0396a54b7373?w=600&q=80"),
    ("Men's Waterproof Rain Jacket", 110.00, "jackets", "outdoor,casual,spring,waterproof,sporty", "Packable waterproof rain jacket with hood and taped seams.", "yellow", "M", "Columbia", "https://images.unsplash.com/photo-1592878849122-facb97ed9d4f?w=600&q=80"),
    ("Velvet Evening Blazer", 189.00, "jackets", "party,luxury,formal,evening,winter", "Rich velvet single-breasted blazer with peak lapels. A statement piece for evening events.", "burgundy", "M", "Ted Baker", "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80"),
    ("Striped Rugby Jacket", 95.00, "jackets", "casual,sporty,spring,preppy,streetwear", "Bold striped rugby zip-up jacket with ribbed collar and cuffs. A retro-sporty statement.", "red/navy/white", "L", "Polo Ralph Lauren", "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=600&q=80"),

    # -- COATS (8) --------------------------------------------------------
    ("Classic Black Trench Coat", 249.99, "coats", "formal,classic,all-weather,autumn,spring,elegant", "Double-breasted trench coat with storm flap, epaulettes, and a belted waist. Water-resistant cotton shell.", "black", "L", "Burberry", "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80"),
    ("Camel Wool Overcoat", 219.00, "coats", "formal,winter,elegant,classic,smart", "Tailored single-breasted overcoat in premium wool-cashmere blend. Mid-length with notch lapels.", "camel", "M", "Hugo Boss", "https://images.unsplash.com/photo-1483118714900-540cf339fd46?w=600&q=80"),
    ("Navy Insulated Puffer Coat", 160.00, "coats", "casual,winter,sporty,warm,practical", "600-fill power down puffer coat with fixed hood and zip hand pockets. Warm to -20C.", "navy", "L", "The North Face", "https://images.unsplash.com/photo-1548624313-0396a54b7373?w=600&q=80"),
    ("Charcoal Peacoat", 175.00, "coats", "smart,winter,classic,formal,casual", "Heritage double-breasted peacoat in thick wool blend. Six oversized buttons and wide lapels.", "charcoal", "XL", "J.Crew", "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80"),
    ("Olive Parka with Faux-Fur Hood", 210.00, "coats", "casual,winter,warm,streetwear,sporty", "Long-length insulated parka with detachable faux-fur hood and fleece-lined interior.", "olive", "M", "Canada Goose", "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600&q=80"),
    ("Women's Belted Wool Coat", 235.00, "coats", "elegant,formal,winter,feminine,classic", "Oversized double-faced wool coat with wrap front and tie belt. Minimal, sculptural design.", "ecru", "S", "Max Mara", "https://images.unsplash.com/photo-1548624313-0396a54b7373?w=600&q=80"),
    ("Plaid Checked Overcoat", 195.00, "coats", "fashion,trendy,winter,formal,smart", "Statement overcoat in bold glen-plaid check with tailored fit and two-button fastening.", "brown/black", "M", "Marks & Spencer", "https://images.unsplash.com/photo-1512327536842-5aa37d1ba3e3?w=600&q=80"),
    ("Sherpa-Lined Denim Coat", 135.00, "coats", "casual,winter,cozy,streetwear,rustic", "Heavy denim coat with warm sherpa lining. Relaxed fit with hidden button placket.", "light blue", "L", "Wrangler", "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&q=80"),

    # -- DRESSES (10) -----------------------------------------------------
    ("Floral Wrap Dress", 79.99, "dresses", "casual,feminine,summer,spring,boho,date", "Flowy wrap-front dress in vibrant floral print on lightweight viscose. V-neckline and self-tie waist.", "multicolor", "S", "Reformation", "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80"),
    ("Red Satin Cocktail Dress", 139.99, "dresses", "formal,party,evening,bold,luxury", "Figure-skimming midi in rich cherry-red satin with cowl neckline and subtle side slit.", "red", "S", "BCBG Max Azria", "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600&q=80"),
    ("Little Black Dress", 99.00, "dresses", "formal,classic,party,versatile,evening", "Sleeveless sheath dress in stretch crepe. Round neckline and concealed back zip.", "black", "M", "DKNY", "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80"),
    ("Emerald Maxi Wrap Dress", 110.00, "dresses", "casual,elegant,summer,vacation,boho", "Flowing maxi in deep emerald with wrap-over bodice and flutter sleeves.", "emerald", "M", "ASOS", "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80"),
    ("Camel Knit Midi Dress", 89.00, "dresses", "casual,autumn,winter,comfortable,minimal", "Fitted ribbed-knit midi dress with turtleneck and long sleeves in wool-acrylic blend.", "camel", "M", "Everlane", "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80"),
    ("White Broderie Sundress", 72.00, "dresses", "casual,summer,beach,boho,feminine", "Relaxed sundress in white broderie anglaise cotton with scalloped hem and adjustable straps.", "white", "XS", "H&M", "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80"),
    ("Plisse Pleated Midi Dress", 115.00, "dresses", "trendy,party,spring,summer,elegant", "Lightweight plisse dress in vivid tangerine with mock-neck and sleeveless cut.", "orange", "S", "Zara", "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80"),
    ("Denim Shirt Dress", 85.00, "dresses", "casual,everyday,spring,summer,relaxed", "Relaxed denim shirt dress with button-through front and tie belt.", "light blue", "M", "Rails", "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=600&q=80"),
    ("Black Velvet Party Dress", 149.00, "dresses", "party,evening,luxury,winter,festive", "Sultry black velvet mini with square neckline and puff sleeves. Commands attention.", "black", "S", "ASOS Design", "https://images.unsplash.com/photo-1590400616432-bd4cd65e82ee?w=600&q=80"),
    ("Striped Shirt Dress", 68.00, "dresses", "casual,summer,nautical,classic,smart", "Navy-and-white stripe shirt dress with half-button front and side belt.", "navy/white", "M", "Tommy Hilfiger", "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80"),

    # -- SWEATERS (8) -----------------------------------------------------
    ("Gray Merino Crewneck Sweater", 95.00, "sweaters", "smart,casual,winter,minimal,versatile", "Classic crewneck in 100% Merino wool. Fine gauge with ribbed cuffs. Layer under a coat or over a shirt.", "mid gray", "M", "Everlane", "https://images.unsplash.com/photo-1584811644165-33828f53b5c3?w=600&q=80"),
    ("Navy Cashmere Crewneck", 195.00, "sweaters", "luxury,winter,formal,smart,gift", "Two-ply Grade-A cashmere crewneck. Immeasurably soft with natural temperature-regulating properties.", "navy", "L", "Johnstons of Elgin", "https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=600&q=80"),
    ("Cream Chunky Knit Cardigan", 89.00, "sweaters", "casual,winter,cozy,lounge,layering", "Oversized cardigan in thick chunky-knit with open front and patch pockets.", "cream", "S", "Zara", "https://images.unsplash.com/photo-1551048632-24e444b48a3e?w=600&q=80"),
    ("Black Turtleneck Sweater", 75.00, "sweaters", "smart,winter,minimal,elegant,versatile", "Fitted turtleneck in soft Merino-acrylic blend. A chic base for any winter outfit.", "black", "M", "Uniqlo", "https://images.unsplash.com/photo-1602810316693-3667c854239a?w=600&q=80"),
    ("Fair Isle Jumper", 110.00, "sweaters", "casual,winter,festive,classic,heritage", "Traditional Fair Isle lambswool jumper with crew neck and contrast geometric motifs.", "multicolor", "M", "Jaeger", "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&q=80"),
    ("Lilac Cropped Mohair Sweater", 85.00, "sweaters", "trendy,casual,feminine,winter,party", "Boxy cropped sweater in fluffy mohair-wool blend. Style with high-waisted skirts.", "lilac", "XS", "& Other Stories", "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=600&q=80"),
    ("Striped Rugby Polo Sweater", 69.00, "sweaters", "casual,sporty,autumn,preppy,classic", "Cotton rugby polo with bold block stripes and ribbed collar.", "green/cream/red", "L", "Polo Ralph Lauren", "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=600&q=80"),
    ("Caramel Cable-Knit Sweater", 80.00, "sweaters", "casual,autumn,winter,cozy,heritage", "Aran-style cable-knit sweater in warm caramel. Heavyweight cotton-wool blend.", "caramel", "L", "Barbour", "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?w=600&q=80"),

    # -- SNEAKERS (8) -----------------------------------------------------
    ("Classic White Leather Sneakers", 89.99, "sneakers", "casual,minimal,versatile,smart,everyday", "Clean white leather low-top sneakers with cushioned sole and tonal laces. The ultimate minimalist sneaker.", "white", "42", "Common Projects", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"),
    ("Nike Air Force 1 07", 100.00, "sneakers", "streetwear,casual,sporty,iconic,everyday", "The iconic Nike Air Force 1 in all-white leather. Perforated toe box and encapsulated Air cushioning.", "white", "43", "Nike", "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&q=80"),
    ("Black High-Top Converse", 70.00, "sneakers", "casual,retro,streetwear,iconic,versatile", "Classic All Star high-top in black canvas. Vulcanised rubber sole and metal toe cap.", "black", "41", "Converse", "https://images.unsplash.com/photo-1607522370275-f6d4f8eff1c7?w=600&q=80"),
    ("Adidas Stan Smith Sneakers", 90.00, "sneakers", "casual,minimal,preppy,tennis,classic", "The legendary Stan Smith in white leather with contrasting green heel tab.", "white/green", "42", "Adidas", "https://images.unsplash.com/photo-1585514260525-b700ff7e0ce2?w=600&q=80"),
    ("White Running Shoes", 119.99, "sneakers", "athletic,sporty,running,everyday,casual", "Responsive DNA LOFT foam cushioning with engineered mesh upper for breathability.", "white/gray", "42", "Brooks", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"),
    ("Air Jordan 1 Mid Sneakers", 130.00, "sneakers", "streetwear,sporty,iconic,casual,collectors", "Mid-top basketball sneaker with perforated toe box and Air-Sole unit.", "black/red", "44", "Nike", "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&q=80"),
    ("Vans Old Skool Skate Shoes", 65.00, "sneakers", "streetwear,casual,skate,youth,classic", "Classic Vans Old Skool in black canvas with the iconic side stripe. Waffle rubber outsole.", "black/white", "42", "Vans", "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80"),
    ("New Balance 574 Sneakers", 85.00, "sneakers", "casual,retro,sporty,everyday,comfortable", "The iconic 574 silhouette with ENCAP midsole cushioning. A timeless trainer.", "grey/white", "43", "New Balance", "https://images.unsplash.com/photo-1556906781-9a412961d28e?w=600&q=80"),

    # -- SHOES (7) --------------------------------------------------------
    ("Black Leather Oxford Shoes", 155.00, "shoes", "formal,office,elegant,business,classic", "Genuine calf-leather Oxfords with cap-toe and Goodyear-welted sole. The gold standard of dress footwear.", "black", "43", "Allen Edmonds", "https://images.unsplash.com/photo-1614252234496-8e18d2eb6e61?w=600&q=80"),
    ("Tan Leather Loafers", 125.00, "shoes", "smart,casual,summer,preppy,elegant", "Slip-on leather loafers with penny strap and stacked heel. Made from smooth vegetable-tanned leather.", "tan", "42", "Gucci", "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80"),
    ("Timberland 6-Inch Boots", 180.00, "shoes", "casual,rugged,winter,outdoor,iconic", "Original wheat nubuck 6-inch boot with padded collar and waterproof construction.", "wheat", "43", "Timberland", "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&q=80"),
    ("Black Chelsea Boots", 165.00, "shoes", "smart,casual,minimal,autumn,winter", "Sleek black leather Chelsea boots with elastic side panel and block heel.", "black", "41", "Dr. Martens", "https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=600&q=80"),
    ("Gold Strappy Heeled Sandals", 95.00, "shoes", "formal,party,summer,feminine,elegant", "Open-toe heeled sandals with delicate crossover straps and metallic finish.", "gold", "38", "Steve Madden", "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80"),
    ("Knee-High Leather Boots", 210.00, "shoes", "elegant,autumn,winter,feminine,bold", "Smooth black leather knee-high boots with pointed toe and inside zip.", "black", "39", "Stuart Weitzman", "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&q=80"),
    ("Brown Suede Desert Boots", 99.00, "shoes", "casual,smart,spring,autumn,minimal", "Original suede crepe-soled desert boot in warm tan. Two-eyelet lace-up.", "tan", "43", "Clarks Originals", "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80"),

    # -- ACCESSORIES (10) -------------------------------------------------
    ("Brown Leather Dress Belt", 45.00, "accessories", "formal,casual,essential,versatile", "Full-grain leather belt with polished pin buckle. The essential finishing touch for any outfit.", "brown", "One Size", "Cole Haan", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"),
    ("Ray-Ban Aviator Sunglasses", 165.00, "accessories", "casual,summer,iconic,classic,travel", "The iconic gold-metal frame with green G-15 polarised lenses. UV400 protection.", "gold/green", "One Size", "Ray-Ban", "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80"),
    ("Black Leather Crossbody Bag", 199.00, "accessories", "casual,chic,everyday,minimal,smart", "Structured pebbled leather crossbody with top zip closure and adjustable strap.", "black", "One Size", "Coach", "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80"),
    ("Minimalist Silver Watch", 145.00, "accessories", "formal,minimal,elegant,gift,smart", "Clean minimalist analogue watch with silver-tone case and genuine leather strap.", "silver/black", "One Size", "Daniel Wellington", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"),
    ("Silk Printed Scarf", 55.00, "accessories", "formal,elegant,luxury,gift,feminine", "Pure silk twill scarf with vivid equestrian print and hand-rolled edges.", "burgundy/gold", "One Size", "Hermes Style", "https://images.unsplash.com/photo-1591367003147-bc0b1c2b3c26?w=600&q=80"),
    ("Gray Wool Beanie", 25.00, "accessories", "casual,winter,cozy,streetwear,essential", "Dense-knit fold-up beanie in 100% Merino wool. Warm and minimal.", "gray", "One Size", "Carhartt", "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&q=80"),
    ("Canvas Weekend Tote Bag", 35.00, "accessories", "casual,everyday,travel,utility,minimal", "Heavy-duty waxed canvas tote with leather handles and interior zip pocket.", "navy", "One Size", "L.L.Bean", "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80"),
    ("Gold Hoop Earrings", 29.00, "accessories", "casual,elegant,feminine,everyday,gift", "Medium-sized gold-plated hoop earrings with hinged clasp. Lightweight and comfortable.", "gold", "One Size", "Missoma", "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80"),
    ("Slim Leather Card Holder Wallet", 49.00, "accessories", "minimal,formal,smart,everyday,gift", "Slim bifold card holder in full-grain leather with six card slots and cash pocket.", "black", "One Size", "Bellroy", "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80"),
    ("Classic Silk Tie", 39.00, "accessories", "formal,office,elegant,classic,gift", "Woven silk tie in classic medallion jacquard pattern. 7cm blade width for Windsor knot.", "navy/gold", "One Size", "Brooks Brothers", "https://images.unsplash.com/photo-1589756823695-278bc923f962?w=600&q=80"),
]


def seed_database():
    conn = None
    try:
        conn = psycopg2.connect(os.getenv("NEON_DATABASE_URL"))
        conn.autocommit = True

        with conn.cursor() as cursor:
            print("Dropping old products table...")
            cursor.execute("DROP TABLE IF EXISTS products CASCADE;")

            print("Creating products table...")
            cursor.execute("""
                CREATE TABLE products (
                    id          SERIAL PRIMARY KEY,
                    name        VARCHAR(255) NOT NULL,
                    price       DECIMAL(10, 2) NOT NULL,
                    category    VARCHAR(100) NOT NULL,
                    style_tags  TEXT,
                    description TEXT,
                    color       VARCHAR(100),
                    size        VARCHAR(20),
                    brand       VARCHAR(100),
                    image_url   TEXT
                )
            """)

            print(f"Inserting {len(PRODUCTS)} products...")
            cursor.executemany("""
                INSERT INTO products (name, price, category, style_tags, description, color, size, brand, image_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, PRODUCTS)

            cursor.execute("SELECT COUNT(*) FROM products")
            count = cursor.fetchone()[0]
            print(f"\nSuccessfully seeded {count} products!")

            cursor.execute("SELECT category, COUNT(*) FROM products GROUP BY category ORDER BY COUNT(*) DESC")
            print("\nCategory breakdown:")
            for row in cursor.fetchall():
                print(f"  {row[0]:15s} -> {row[1]} products")

    except Exception as e:
        print(f"Seeding failed: {e}")
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    seed_database()
