import { Link } from 'react-router';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { useStyleEvolution } from '../context/StyleEvolutionContext';
import { useRef, useCallback } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const { trackEvent } = useStyleEvolution();
  const inWishlist = isInWishlist(product.id);
  const hoverStart = useRef<number>(0);

  const handleMouseEnter = useCallback(() => {
    hoverStart.current = Date.now();
  }, []);

  const handleMouseLeave = useCallback(() => {
    const duration = Date.now() - hoverStart.current;
    if (duration > 300) { // only track if >300ms — ignore accidental passes
      trackEvent({
        productId: String(product.id),
        productName: product.name,
        category: product.category,
        action: 'hover',
        duration,
        page: window.location.pathname,
      });
    }
  }, [product, trackEvent]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    trackEvent({
      productId: String(product.id),
      productName: product.name,
      category: product.category,
      action: 'click',
      duration: 0,
      page: window.location.pathname,
    });
  };

  const handleCardClick = () => {
    trackEvent({
      productId: String(product.id),
      productName: product.name,
      category: product.category,
      action: 'click',
      duration: 0,
      page: window.location.pathname,
    });
  };

  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <Link to={`/product/${product.id}`} className="group block" onClick={handleCardClick}>
      <div
        className="rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        onMouseEnter={e => {
          handleMouseEnter();
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={e => {
          handleMouseLeave();
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
      >
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
          <img
            src={product.image} alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {discountPct && (
            <div className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider"
              style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
              -{discountPct}%
            </div>
          )}

          <button onClick={handleWishlistClick}
            className="absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300"
            style={{
              background: inWishlist ? 'rgba(220,50,50,0.2)' : 'rgba(0,0,0,0.4)',
              border: `1px solid ${inWishlist ? 'rgba(220,50,50,0.5)' : 'rgba(255,255,255,0.2)'}`,
              opacity: inWishlist ? 1 : undefined,
            }}>
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-400 text-red-400' : 'text-white'}`} />
          </button>

          <button onClick={handleAddToCart}
            className="absolute bottom-0 left-0 right-0 py-3 px-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
            <ShoppingCart className="w-3.5 h-3.5" /> Add to Bag
          </button>
        </div>

        <div className="p-4">
          <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>{product.category}</div>
          <h3 className="text-sm font-medium line-clamp-1 mb-2" style={{ color: 'var(--text-primary)' }}>{product.name}</h3>
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5"
                  style={{ color: i < Math.floor(product.rating) ? 'var(--accent)' : 'var(--border-color)', fill: i < Math.floor(product.rating) ? 'var(--accent)' : 'transparent' }} />
              ))}
            </div>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>({product.reviews})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
