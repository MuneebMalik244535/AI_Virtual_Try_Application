import { Link } from 'react-router';
import { ProductCard } from '../components/ProductCard';
import { WeatherBanner } from '../components/WeatherBanner';
import { products, categories } from '../data/products';
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export function Homepage() {
  const featuredProducts = products.slice(0, 8);
  const trendingProducts = products.filter((p) => p.rating >= 4.5).slice(0, 4);
  const heroSection = useInView(0.05);
  const featuresSection = useInView(0.2);
  const categoriesSection = useInView(0.1);
  const featuredSection = useInView(0.1);
  const aiSection = useInView(0.2);
  const trendingSection = useInView(0.1);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handle = (e: MouseEvent) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }} className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out"
          style={{ transform: `translate(${mousePos.x * -12}px, ${mousePos.y * -12}px) scale(1.05)` }}
        >
          <img src="/hero-banner.png" alt="Luxury Fashion" className="w-full h-full object-cover object-center opacity-60" />
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, var(--overlay) 30%, transparent)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 50%)' }} />

        {/* Glow orbs */}
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl animate-pulse opacity-20" style={{ background: 'var(--accent)' }} />
        <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full blur-3xl animate-pulse opacity-10" style={{ background: 'var(--accent)', animationDelay: '1.5s' }} />

        <div
          ref={heroSection.ref}
          className={`relative z-10 max-w-7xl mx-auto px-6 lg:px-8 transition-all duration-1000 ${heroSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px w-12" style={{ background: 'var(--accent)' }} />
              <span className="text-sm font-light tracking-[0.3em] uppercase" style={{ color: 'var(--accent)' }}>New Collection 2025</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-thin tracking-tight leading-none mb-6" style={{ color: 'var(--text-primary)' }}>
              Dress.<br />
              <span className="font-semibold italic">Designed<br />for You.</span>
            </h1>
            <p className="text-lg font-light leading-relaxed mb-10 max-w-md" style={{ color: 'var(--text-secondary)' }}>
              Let our AI understand your style, body, and budget — then build your perfect outfit from scratch.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/stylist" className="group flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:gap-5"
                style={{ background: 'var(--accent)', color: 'var(--accent-text)', boxShadow: '0 4px 24px var(--accent-glow)' }}>
                <Sparkles className="w-4 h-4" /> Style with AI
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/shop" className="flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-300"
                style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}>
                Browse Collection
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Scroll</span>
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        </div>
      </section>

      {/* ── LIVE WEATHER STYLIST BANNER ── */}
      <WeatherBanner />

      {/* ── FEATURES BAR ── */}
      <section ref={featuresSection.ref}
        className={`py-12 transition-all duration-700 ${featuresSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: '🚚', title: 'Free Shipping', sub: 'On orders over $100' },
              { icon: '🔒', title: 'Secure Payment', sub: '100% safe transactions' },
              { icon: '🔄', title: 'Easy Returns', sub: '30-day return policy' },
              { icon: '✨', title: 'AI Styling', sub: 'Personalized for you' },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3 group">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{f.icon}</span>
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI STYLIST CTA ── */}
      <section ref={aiSection.ref}
        className={`py-32 relative overflow-hidden transition-all duration-1000 ${aiSection.inView ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 70%)' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--accent), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--accent), transparent)' }} />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs tracking-widest uppercase mb-8"
            style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', color: 'var(--accent)' }}>
            <Sparkles className="w-3 h-3" /> AI-Powered
          </div>
          <h2 className="text-5xl md:text-6xl font-thin mb-6" style={{ color: 'var(--text-primary)' }}>
            Your Personal<br />
            <span className="font-semibold italic" style={{ color: 'var(--accent)' }}>Fashion Genius</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-12 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Tell us your budget, occasion, skin tone, and body type. Our AI will build a complete, perfectly matched outfit — guaranteed within your budget.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-14">
            {['Sets a total budget limit', 'Matches your skin tone', 'Occasion-aware styling', 'Full outfit in one click'].map((feat, i) => (
              <div key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                {feat}
              </div>
            ))}
          </div>
          <Link to="/stylist"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full text-sm font-bold tracking-wider uppercase transition-all duration-300 hover:-translate-y-1"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)', boxShadow: '0 8px 32px var(--accent-glow)' }}>
            <Sparkles className="w-5 h-5" /> Try AI Stylist Now — Free
          </Link>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section ref={categoriesSection.ref}
        className={`py-24 transition-all duration-1000 ${categoriesSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8" style={{ background: 'var(--accent)' }} />
              <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--accent)' }}>Explore</span>
            </div>
            <h2 className="text-4xl font-thin" style={{ color: 'var(--text-primary)' }}>Shop by <span className="font-semibold italic">Category</span></h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((category, i) => (
              <Link key={category.id} to={`/shop?category=${category.id}`} className="group relative aspect-square rounded-2xl overflow-hidden" style={{ animationDelay: `${i * 100}ms` }}>
                <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/60 transition-all duration-500" />
                <div className="absolute inset-0 flex items-end p-4">
                  <span className="text-white font-medium text-sm group-hover:mb-1 transition-all duration-300">{category.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section ref={featuredSection.ref}
        className={`py-24 transition-all duration-1000 ${featuredSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-end mb-14">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8" style={{ background: 'var(--accent)' }} />
                <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--accent)' }}>Curated</span>
              </div>
              <h2 className="text-4xl font-thin" style={{ color: 'var(--text-primary)' }}>Featured <span className="font-semibold italic">Picks</span></h2>
            </div>
            <Link to="/shop" className="text-sm flex items-center gap-2 transition-colors" style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <section className="py-6 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden min-h-[400px] flex items-center">
          <img src="https://images.unsplash.com/photo-1604506847073-4a8e18e07d92?w=1200&q=80" alt="Sale" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, var(--overlay) 50%, transparent)' }} />
          <div className="relative px-12 py-16">
            <span className="text-xs tracking-widest uppercase mb-3 block" style={{ color: 'var(--accent)' }}>Limited Time</span>
            <h2 className="text-5xl font-thin text-white mb-3">Winter <span className="font-bold italic">Sale</span></h2>
            <p className="text-white/60 text-lg mb-8">Up to 50% off on selected items</p>
            <Link to="/shop?sale=true" className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold tracking-wider uppercase transition-all duration-300"
              style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
              Shop Sale <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRENDING ── */}
      <section ref={trendingSection.ref}
        className={`py-24 transition-all duration-1000 ${trendingSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-14 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-8" style={{ background: 'var(--accent)' }} />
              <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--accent)' }}>Hot Right Now</span>
              <div className="h-px w-8" style={{ background: 'var(--accent)' }} />
            </div>
            <h2 className="text-4xl font-thin" style={{ color: 'var(--text-primary)' }}>Trending <span className="font-semibold italic">This Week</span></h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trendingProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-24" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-8" style={{ background: 'var(--accent)' }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--accent)' }}>Stay in Style</span>
            <div className="h-px w-8" style={{ background: 'var(--accent)' }} />
          </div>
          <h2 className="text-4xl font-thin mb-4" style={{ color: 'var(--text-primary)' }}>Join the <span className="font-semibold italic">Inner Circle</span></h2>
          <p className="mb-10" style={{ color: 'var(--text-muted)' }}>Exclusive drops, style guides, and AI outfit ideas delivered to your inbox.</p>
          <form className="flex gap-3 max-w-md mx-auto">
            <input type="email" placeholder="your@email.com"
              className="flex-1 px-5 py-4 rounded-full text-sm focus:outline-none"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            <button type="submit" className="px-6 py-4 rounded-full text-sm font-bold tracking-wider uppercase transition-all"
              style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
              Join
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
