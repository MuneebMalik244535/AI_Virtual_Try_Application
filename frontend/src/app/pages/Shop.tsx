import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router';
import { ProductCard } from '../components/ProductCard';
import { products, categories } from '../data/products';
import { filterProducts } from '../utils/filter'
import { ChevronDown, SlidersHorizontal, X, Sparkles, ArrowRight, Search, Loader2, Zap } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

interface NLProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  color: string;
  brand: string;
  image_url: string;
}

const PAGE_DATA: Record<string, { title: string; subtitle: string; banner: string }> = {
  men: {
    title: 'Men\'s Collection',
    subtitle: 'Precision tailoring meets modern edge. Curated for the confident man.',
    banner: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
  },
  women: {
    title: 'Women\'s Collection',
    subtitle: 'Effortless elegance for every occasion. Designed for the woman who moves the world.',
    banner: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=80',
  },
  sale: {
    title: 'Season Sale',
    subtitle: 'Premium styles at unmissable prices. Up to 50% off selected items.',
    banner: 'https://images.unsplash.com/photo-1604506847073-4a8e18e07d92?w=1200&q=80',
  },
  default: {
    title: 'All Collections',
    subtitle: 'Every piece in our catalog, filtered and sorted to match your taste.',
    banner: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80',
  },
};

export function Shop() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const saleParam = searchParams.get('sale');
  const colorParam = searchParams.get('color') || '';
  const maxPriceParam = searchParams.get('maxPrice');
  const qParam = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>(colorParam ? [colorParam] : []);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPriceParam ? parseInt(maxPriceParam) : 500]);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // NL search state
  const [nlQuery, setNlQuery] = useState('');
  const [nlLoading, setNlLoading] = useState(false);
  const [nlResults, setNlResults] = useState<NLProduct[] | null>(null);
  const [nlFiltersUsed, setNlFiltersUsed] = useState<Record<string, unknown> | null>(null);

  const handleNLSearch = async () => {
    if (!nlQuery.trim()) return;
    setNlLoading(true);
    setNlResults(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: nlQuery }),
      });
      const data = await res.json();
      if (data.success) {
        setNlResults(data.results);
        setNlFiltersUsed(data.filters_used);
      }
    } catch {
      setNlResults([]);
    } finally {
      setNlLoading(false);
    }
  };

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);
  useEffect(() => { if (categoryParam) setSelectedCategory(categoryParam); else setSelectedCategory(''); }, [categoryParam]);
  useEffect(() => { if (colorParam) setSelectedColors([colorParam]); else setSelectedColors([]); }, [colorParam]);
  useEffect(() => { if (maxPriceParam) setPriceRange([0, parseInt(maxPriceParam)]); else setPriceRange([0, 500]); }, [maxPriceParam]);

  const pageKey = saleParam ? 'sale' : (categoryParam === 'men' || categoryParam === 'women') ? categoryParam : 'default';
  const pageData = PAGE_DATA[pageKey];

  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach((p) => p.sizes?.forEach((s) => sizes.add(s)));
    return Array.from(sizes);
  }, []);

  const allColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach((p) => p.colors?.forEach((c) => colors.add(c)));
    return Array.from(colors);
  }, []);

  const filteredProducts = useMemo(() => {
    return filterProducts(products, {
      sale: !!saleParam,
      category: selectedCategory,
      sizes: selectedSizes,
      colors: selectedColors,
      q: qParam,
      priceRange,
      sortBy,
    })
  }, [selectedCategory, selectedSizes, selectedColors, priceRange, sortBy, saleParam, qParam]);

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  const toggleColor = (color: string) =>
    setSelectedColors((prev) => prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]);
  const clearFilters = () => { setSelectedCategory(''); setSelectedSizes([]); setSelectedColors([]); setPriceRange([0, 500]); };
  const hasActive = selectedCategory || selectedSizes.length > 0 || selectedColors.length > 0 || priceRange[1] < 500;

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--accent)' }}>Category</h3>
        <div className="space-y-2">
          {[{ id: '', name: 'All Products' }, ...categories].map((cat) => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all"
                style={{ borderColor: selectedCategory === cat.id ? 'var(--accent)' : 'var(--border-color)', background: selectedCategory === cat.id ? 'var(--accent)' : 'transparent' }}>
                {selectedCategory === cat.id && <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-text)' }} />}
              </div>
              <input type="radio" name="category" checked={selectedCategory === cat.id} onChange={() => setSelectedCategory(cat.id)} className="sr-only" />
              <span className="text-sm transition-colors" style={{ color: selectedCategory === cat.id ? 'var(--accent)' : 'var(--text-secondary)' }}>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <h3 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--accent)' }}>Size</h3>
        <div className="grid grid-cols-3 gap-2">
          {allSizes.map((size) => (
            <button key={size} onClick={() => toggleSize(size)}
              className="py-2 rounded-lg text-xs font-medium tracking-wider transition-all duration-200"
              style={{
                background: selectedSizes.includes(size) ? 'var(--accent)' : 'transparent',
                color: selectedSizes.includes(size) ? 'var(--accent-text)' : 'var(--text-secondary)',
                border: `1px solid ${selectedSizes.includes(size) ? 'var(--accent)' : 'var(--border-color)'}`,
              }}>
              {size}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <h3 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--accent)' }}>Color</h3>
        <div className="space-y-2">
          {allColors.map((color) => (
            <label key={color} className="flex items-center gap-3 cursor-pointer">
              <div className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                style={{ borderColor: selectedColors.includes(color) ? 'var(--accent)' : 'var(--border-color)', background: selectedColors.includes(color) ? 'var(--accent)' : 'transparent' }}>
                {selectedColors.includes(color) && <span style={{ color: 'var(--accent-text)', fontSize: '8px', fontWeight: 'bold' }}>✓</span>}
              </div>
              <input type="checkbox" checked={selectedColors.includes(color)} onChange={() => toggleColor(color)} className="sr-only" />
              <span className="text-sm capitalize" style={{ color: selectedColors.includes(color) ? 'var(--accent)' : 'var(--text-secondary)' }}>{color}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <h3 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--accent)' }}>Price Range</h3>
        <input type="range" min="0" max="500" step="10" value={priceRange[1]}
          onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
          className="w-full" style={{ accentColor: 'var(--accent)' }} />
        <div className="flex justify-between text-xs mt-2">
          <span style={{ color: 'var(--text-muted)' }}>$0</span>
          <span className="font-semibold" style={{ color: 'var(--accent)' }}>Up to ${priceRange[1]}</span>
        </div>
      </div>

      {hasActive && (
        <button onClick={clearFilters} className="w-full py-3 rounded-full text-xs tracking-widest uppercase transition-all"
          style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}>
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>

      {/* Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={pageData.banner} alt={pageData.title} className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-primary), rgba(0,0,0,0.3))' }} />
        <div className={`absolute inset-0 flex flex-col justify-end px-8 lg:px-16 pb-10 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8" style={{ background: 'var(--accent)' }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--accent)' }}>{saleParam ? 'Limited Time' : 'Collection'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-thin text-white">
            {pageData.title.split(' ')[0]} <span className="font-bold italic">{pageData.title.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-sm mt-2 max-w-xl" style={{ color: 'rgba(255,255,255,0.5)' }}>{pageData.subtitle}</p>
        </div>
      </div>

      {/* AI nudge bar */}
      <div style={{ borderBottom: '1px solid var(--border-color)', background: 'color-mix(in srgb, var(--accent) 5%, transparent)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Not sure what to pick? Let our AI build your complete outfit.</span>
          </div>
          <Link to="/stylist" className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase transition-colors"
            style={{ color: 'var(--accent)' }}>
            Try AI Stylist <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 🔍 AI Natural Language Search Bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8">
        <div className="relative">
          <div className="flex items-center gap-3 p-1 rounded-2xl border-2 transition-all"
            style={{ borderColor: nlResults !== null ? 'var(--accent)' : 'var(--border-color)', background: 'var(--bg-secondary)' }}>
            <div className="flex items-center gap-2 pl-4">
              <Zap className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
              <span className="text-xs font-bold tracking-widest uppercase hidden sm:block" style={{ color: 'var(--accent)' }}>AI Search</span>
            </div>
            <input
              type="text"
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNLSearch()}
              placeholder='Try: "light blue summer dress under $150" or "cozy winter jacket for office"'
              className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-neutral-400"
              style={{ color: 'var(--text-primary)' }}
            />
            {nlResults !== null && (
              <button onClick={() => { setNlResults(null); setNlQuery(''); setNlFiltersUsed(null); }}
                className="p-2 rounded-lg hover:bg-neutral-100 transition" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            )}
            <button onClick={handleNLSearch} disabled={!nlQuery.trim() || nlLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all disabled:opacity-40 hover:scale-105"
              style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
              {nlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          {/* NL Results Panel */}
          {nlResults !== null && (
            <div className="mt-3 rounded-2xl border p-6" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {nlResults.length} AI results for "{nlQuery}"
                  </p>
                  {nlFiltersUsed && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {Object.entries(nlFiltersUsed).filter(([, v]) => v && (!Array.isArray(v) || v.length > 0)).map(([k, v]) => (
                        <span key={k} className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                          {k}: {Array.isArray(v) ? (v as string[]).join(', ') : String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {nlResults.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No products found. Try a different description!</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {nlResults.map((p) => (
                    <Link key={p.id} to={`/product/${p.id}`}
                      className="group rounded-xl overflow-hidden border transition-transform hover:scale-105"
                      style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
                      <div className="w-full h-32 overflow-hidden bg-neutral-100">
                        <img src={p.image_url || `https://picsum.photos/seed/${p.id}/200/200`} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-semibold line-clamp-2" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                        <p className="text-xs font-bold mt-1" style={{ color: 'var(--accent)' }}>${p.price.toFixed(2)}</p>
                        {p.brand && <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.brand}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Controls */}
        <div className="flex items-center justify-between mb-8 pb-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-full text-xs tracking-widest uppercase transition-all"
              style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <SlidersHorizontal className="w-4 h-4" />
              Filters {hasActive && <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>!</span>}
            </button>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{filteredProducts.length} items</span>
          </div>

          <div className="relative">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none text-xs tracking-widest uppercase px-5 py-2.5 pr-10 rounded-full focus:outline-none transition-colors cursor-pointer"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-56 flex-shrink-0">
            <div className="sticky top-24">
              <FilterContent />
            </div>
          </aside>

          {/* Mobile Drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'var(--overlay)' }} onClick={() => setShowFilters(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-80 p-8 overflow-y-auto" style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-color)' }}>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-sm font-bold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>Filters</h2>
                  <button onClick={() => setShowFilters(false)} className="p-2 rounded-full transition-colors" style={{ color: 'var(--text-muted)' }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <FilterContent />
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="flex-1" ref={gridRef}>
            {filteredProducts.length > 0 ? (
              <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 transition-all duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ border: '1px solid var(--border-color)' }}>
                  <SlidersHorizontal className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
                </div>
                <h3 className="text-xl font-thin mb-2" style={{ color: 'var(--text-primary)' }}>No items found</h3>
                <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters.</p>
                <button onClick={clearFilters} className="px-8 py-3 rounded-full text-xs tracking-widest uppercase transition-all"
                  style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
