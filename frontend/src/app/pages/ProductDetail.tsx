import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { products, reviews } from '../data/products';
import { useCart } from '../context/CartContext';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { Heart, Star, Minus, Plus, Truck, RefreshCcw, Shield, Check, Sparkles, Loader2, X, ShoppingBag } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

interface OutfitItem {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url: string;
  reason: string;
}

export function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [outfitLoading, setOutfitLoading] = useState(false);
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);
  const [showOutfitModal, setShowOutfitModal] = useState(false);

  const completeOutfit = async () => {
    setOutfitLoading(true);
    setShowOutfitModal(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/complete-outfit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: product!.name,
          product_category: product!.category,
          product_price: product!.price,
          occasion: 'casual',
        }),
      });
      const data = await res.json();
      setOutfitItems(data.outfit || []);
    } catch {
      setOutfitItems([]);
    } finally {
      setOutfitLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link to="/shop" className="text-black underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert('Please select a color');
      return;
    }
    addToCart(product, quantity, selectedSize, selectedColor);
    alert('Added to cart!');
  };

  const handleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-2 text-sm text-neutral-600">
          <Link to="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-black">Shop</Link>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-neutral-100 mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden bg-neutral-100 cursor-pointer border-2 border-transparent hover:border-black transition-colors"
                >
                  <img
                    src={product.image}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <span className="text-sm text-neutral-500">{product.category}</span>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-black text-black'
                        : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-neutral-600">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xl text-neutral-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-neutral-600 mb-6">{product.description}</p>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Color:</span>
                  <span className="text-sm text-neutral-600">{selectedColor || 'Select a color'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-md text-sm transition-colors ${
                        selectedColor === color
                          ? 'bg-black text-white border-black'
                          : 'border-neutral-300 hover:border-black'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Size:</span>
                  <button className="text-sm text-neutral-600 underline hover:no-underline">
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-md text-sm transition-colors ${
                        selectedSize === size
                          ? 'bg-black text-white border-black'
                          : 'border-neutral-300 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <span className="font-medium block mb-3">Quantity:</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-neutral-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-neutral-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-neutral-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mb-4">
              <Button onClick={handleAddToCart} size="lg" fullWidth>
                Add to Cart
              </Button>
              <button
                onClick={handleWishlist}
                className="p-4 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`}
                />
              </button>
            </div>

            {/* Complete the Outfit AI button */}
            <button
              onClick={completeOutfit}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-md border-2 border-dashed font-semibold text-sm transition-all hover:bg-neutral-50 mb-8"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
            >
              <Sparkles className="w-4 h-4" />
              ✨ Complete the Outfit with AI
            </button>

            {/* Features */}
            <div className="border-t border-neutral-200 pt-6 space-y-4">
              <div className="flex items-start space-x-3">
                <Truck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-sm text-neutral-600">On orders over $100</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <RefreshCcw className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Easy Returns</p>
                  <p className="text-sm text-neutral-600">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Secure Payment</p>
                  <p className="text-sm text-neutral-600">100% secure transactions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <div className="border-b border-neutral-200">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-4 border-b-2 transition-colors ${
                  activeTab === 'description'
                    ? 'border-black'
                    : 'border-transparent text-neutral-600 hover:text-black'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-4 border-b-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-black'
                    : 'border-transparent text-neutral-600 hover:text-black'
                }`}
              >
                Reviews ({product.reviews})
              </button>
            </div>
          </div>

          <div className="py-8">
            {activeTab === 'description' ? (
              <div>
                <h3 className="font-semibold mb-4">Product Features</h3>
                <ul className="space-y-2">
                  {product.features?.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-neutral-200 pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{review.userName}</p>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-black text-black'
                                  : 'text-neutral-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-neutral-500">{review.date}</span>
                    </div>
                    <p className="text-neutral-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Complete the Outfit Modal */}
      {showOutfitModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowOutfitModal(false)} />
          <div
            className="relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--bg-primary)', maxHeight: '80vh', overflowY: 'auto' }}
          >
            {/* Header */}
            <div className="sticky top-0 px-6 py-5 flex items-center justify-between z-10" style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  Complete the Outfit
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI picked these to match your {product?.name}</p>
              </div>
              <button onClick={() => setShowOutfitModal(false)} className="p-2 rounded-full hover:bg-neutral-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {outfitLoading ? (
                <div className="flex flex-col items-center py-12 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--accent)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI is curating your complete look…</p>
                </div>
              ) : outfitItems.length === 0 ? (
                <p className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>Couldn't generate a look. Please try again!</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {outfitItems.map((item) => (
                    <Link key={item.id} to={`/product/${item.id}`} onClick={() => setShowOutfitModal(false)}
                      className="group rounded-2xl overflow-hidden border transition-transform hover:scale-105"
                      style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}
                    >
                      <div className="w-full h-36 overflow-hidden bg-neutral-100">
                        <img src={item.image_url || `https://picsum.photos/seed/${item.id}/200/200`} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-semibold line-clamp-2 mb-1" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                        <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>${item.price.toFixed(2)}</p>
                        <p className="text-[10px] mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{item.reason}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {!outfitLoading && outfitItems.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <Button onClick={() => setShowOutfitModal(false)}>
                    <ShoppingBag className="w-4 h-4 mr-2 inline" />
                    Shop the Full Look
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
