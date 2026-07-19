import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Sparkles, ShoppingCart, Info, ArrowLeft, Check } from "lucide-react";
import { PreferencesProvider } from "../context/preferences-context";
import { motion } from "motion/react";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  matchScore: number;
  reason: string;
  description: string;
  sizes: string[];
  colors: string[];
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Elegant Summer Dress",
    price: 129,
    image: "https://images.unsplash.com/photo-1759769349088-318caabda8a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBkcmVzcyUyMGZhc2hpb24lMjBtb2RlbHxlbnwxfHx8fDE3NzI4MjkxODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    matchScore: 98,
    reason: "Perfect match for your style preference and occasion.",
    description: "A flowing summer dress made from premium breathable fabric. Features elegant cut and timeless design.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White", "Beige", "Navy"],
  },
  {
    id: 2,
    name: "Premium Business Suit",
    price: 449,
    image: "https://images.unsplash.com/photo-1768696082783-4313d98341ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3JtYWwlMjBidXNpbmVzcyUyMHN1aXQlMjBmYXNoaW9ufGVufDF8fHx8MTc3MjgyOTE4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    matchScore: 94,
    reason: "Matches your budget and body type perfectly.",
    description: "Tailored business suit crafted from Italian wool. Modern fit with classic appeal.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy", "Charcoal"],
  },
  {
    id: 3,
    name: "Casual Chic Outfit",
    price: 189,
    image: "https://images.unsplash.com/photo-1699346480386-3d79555e7e0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b21hbiUyMGNhc3VhbCUyMG91dGZpdHxlbnwxfHx8fDE3NzI4MjkxODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    matchScore: 92,
    reason: "Complements your color preferences and season choice.",
    description: "Modern casual ensemble perfect for everyday wear. Comfortable yet stylish.",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Beige", "White", "Olive"],
  },
  {
    id: 4,
    name: "Urban Streetwear Set",
    price: 279,
    image: "https://images.unsplash.com/photo-1628302321078-b08b62f61c92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXR3ZWFyJTIwdXJiYW4lMjBvdXRmaXR8ZW58MXx8fHwxNzcyODI5MTg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    matchScore: 89,
    reason: "Aligns with your style aesthetic and preferences.",
    description: "Contemporary streetwear combining comfort with urban style. Premium quality materials.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Navy", "Olive"],
  },
  {
    id: 5,
    name: "Evening Party Dress",
    price: 359,
    image: "https://images.unsplash.com/photo-1770344327399-0f5bb1f93756?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJ0eSUyMGV2ZW5pbmclMjBkcmVzcyUyMGVsZWdhbnR8ZW58MXx8fHwxNzcyODI5MTg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    matchScore: 87,
    reason: "Sophisticated choice matching your occasion needs.",
    description: "Elegant evening dress designed to make a statement. Perfect for special occasions.",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black", "Burgundy", "Navy"],
  },
  {
    id: 6,
    name: "Winter Coat Collection",
    price: 489,
    image: "https://images.unsplash.com/photo-1760533091973-1262bf57d244?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW50ZXIlMjBjb2F0JTIwamFja2V0JTIwZmFzaGlvbnxlbnwxfHx8fDE3NzI4MjkxODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    matchScore: 85,
    reason: "Ideal for your season selection and climate needs.",
    description: "Premium winter coat with superior insulation. Combines warmth with modern design.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Beige", "Navy"],
  },
];

function RecommendationsContent() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [addedToCart, setAddedToCart] = useState<number[]>([]);

  const handleAddToCart = (productId: number) => {
    setAddedToCart([...addedToCart, productId]);
    toast.success("Added to cart!", {
      description: "Item has been added to your shopping cart.",
    });
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0]);
    setSelectedColor(product.colors[0]);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Start Over
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold">Your AI Styled Outfits</h1>
              <p className="text-neutral-600 mt-1">
                Personalized recommendations based on your preferences
              </p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-neutral-200 hover:border-black transition-all group">
                {/* Product Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Match Score Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-black text-white px-3 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {product.matchScore}% Match
                    </Badge>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-2xl font-semibold mb-3">${product.price}</p>
                  
                  {/* Reason */}
                  <div className="flex items-start gap-2 mb-4 p-3 bg-neutral-50 rounded-lg">
                    <Info className="w-4 h-4 text-neutral-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-neutral-600">{product.reason}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-neutral-300"
                      onClick={() => handleViewDetails(product)}
                    >
                      View Details
                    </Button>
                    <Button
                      className={`flex-1 ${
                        addedToCart.includes(product.id)
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-black hover:bg-black/90"
                      } text-white`}
                      onClick={() => handleAddToCart(product.id)}
                    >
                      {addedToCart.includes(product.id) ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Added
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Image */}
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-neutral-100">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-black text-white px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {selectedProduct.matchScore}% Match
                  </Badge>
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-col">
                <div>
                  <h2 className="text-3xl font-semibold mb-2">{selectedProduct.name}</h2>
                  <p className="text-3xl font-semibold mb-4">${selectedProduct.price}</p>
                  
                  <p className="text-neutral-700 mb-6">{selectedProduct.description}</p>

                  {/* AI Recommendation */}
                  <div className="p-4 bg-neutral-50 rounded-lg mb-6">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium mb-1">Why AI Recommended This</p>
                        <p className="text-sm text-neutral-600">{selectedProduct.reason}</p>
                      </div>
                    </div>
                  </div>

                  {/* Size Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Size</label>
                    <div className="flex gap-2">
                      {selectedProduct.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 border-2 rounded-lg transition-all ${
                            selectedSize === size
                              ? "border-black bg-black text-white"
                              : "border-neutral-300 hover:border-black"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <div className="flex gap-2">
                      {selectedProduct.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2 border-2 rounded-lg transition-all ${
                            selectedColor === color
                              ? "border-black bg-black text-white"
                              : "border-neutral-300 hover:border-black"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  className="w-full bg-black text-white hover:bg-black/90 py-6 text-lg mt-auto"
                  onClick={() => {
                    handleAddToCart(selectedProduct.id);
                    setSelectedProduct(null);
                  }}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart - ${selectedProduct.price}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function Recommendations() {
  return (
    <PreferencesProvider>
      <RecommendationsContent />
    </PreferencesProvider>
  );
}
