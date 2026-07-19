import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Sparkles, ShoppingCart, ArrowLeft, Check, X, Info, Star } from "lucide-react";
import { PreferencesProvider } from "../../context/preferences-context";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../../context/CartContext";

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

const MOCK: Product[] = [
  { id: 1, name: "Elegant Summer Dress", price: 129, matchScore: 98, reason: "Perfect match for your style preference and occasion.", description: "A flowing summer dress made from premium breathable fabric. Features elegant cut and timeless design.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["White", "Beige", "Navy"], image: "https://images.unsplash.com/photo-1759769349088-318caabda8a1?w=800&q=80" },
  { id: 2, name: "Premium Business Suit", price: 449, matchScore: 94, reason: "Matches your budget and body type perfectly.", description: "Tailored business suit crafted from Italian wool. Modern fit with classic appeal.", sizes: ["S", "M", "L", "XL"], colors: ["Black", "Navy", "Charcoal"], image: "https://images.unsplash.com/photo-1768696082783-4313d98341ae?w=800&q=80" },
  { id: 3, name: "Casual Chic Outfit", price: 189, matchScore: 92, reason: "Complements your color preferences and season choice.", description: "Modern casual ensemble perfect for everyday wear. Comfortable yet stylish.", sizes: ["XS", "S", "M", "L"], colors: ["Beige", "White", "Olive"], image: "https://images.unsplash.com/photo-1699346480386-3d79555e7e0b?w=800&q=80" },
  { id: 4, name: "Urban Streetwear Set", price: 279, matchScore: 89, reason: "Aligns with your style aesthetic and preferences.", description: "Contemporary streetwear combining comfort with urban style. Premium quality materials.", sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Black", "Navy", "Olive"], image: "https://images.unsplash.com/photo-1628302321078-b08b62f61c92?w=800&q=80" },
  { id: 5, name: "Evening Party Dress", price: 359, matchScore: 87, reason: "Sophisticated choice matching your occasion needs.", description: "Elegant evening dress designed to make a statement. Perfect for special occasions.", sizes: ["XS", "S", "M", "L"], colors: ["Black", "Burgundy", "Navy"], image: "https://images.unsplash.com/photo-1770344327399-0f5bb1f93756?w=800&q=80" },
  { id: 6, name: "Winter Coat Collection", price: 489, matchScore: 85, reason: "Ideal for your season selection and climate needs.", description: "Premium winter coat with superior insulation. Combines warmth with modern design.", sizes: ["S", "M", "L", "XL"], colors: ["Black", "Beige", "Navy"], image: "https://images.unsplash.com/photo-1760533091973-1262bf57d244?w=800&q=80" },
];

function MatchRing({ score }: { score: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--border-color)" strokeWidth="3" />
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--accent)" strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease", filter: "drop-shadow(0 0 4px var(--accent))" }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: "var(--accent)" }}>{score}%</span>
    </div>
  );
}

function RecommendationsContent() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("stylistRecommendations");
      if (stored) {
        const parsed = JSON.parse(stored);
        setProducts(parsed.map((item: any, i: number) => ({
          id: item.id || i + 1,
          name: item.name || item.title || `Outfit ${i + 1}`,
          price: item.price || 99,
          image: item.image || item.imageUrl || MOCK[i % MOCK.length].image,
          matchScore: item.matchScore || item.match_score || Math.floor(Math.random() * 20) + 80,
          reason: item.reason || item.recommendation_reason || "Perfect match for your style",
          description: item.description || "A beautiful piece that matches your preferences",
          sizes: item.sizes || ["XS", "S", "M", "L", "XL"],
          colors: item.colors || ["Black", "White", "Navy"],
        })));
      } else {
        setProducts(MOCK);
      }
    } catch { setProducts(MOCK); }
    setTimeout(() => setLoaded(true), 200);
  }, []);

  const handleAdd = (p: Product) => {
    addToCart({ id: String(p.id), name: p.name, price: p.price, image: p.image, category: "AI Recommended", rating: 5, reviews: 0 });
    setAddedIds((prev) => [...prev, p.id]);
  };

  const openModal = (p: Product) => {
    setSelected(p);
    setSelectedSize(p.sizes[0]);
    setSelectedColor(p.colors[0]);
  };

  return (
    <div style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "var(--accent)" }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 pt-28 relative">

        {/* Header */}
        <div className="mb-14">
          <button onClick={() => navigate("/stylist")}
            className="flex items-center gap-2 text-xs tracking-widest uppercase mb-8 transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
            <ArrowLeft className="w-4 h-4" /> Start Over
          </button>

          <div className={`transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8" style={{ background: "var(--accent)" }} />
              <span className="text-xs tracking-widest uppercase" style={{ color: "var(--accent)" }}>AI Generated</span>
            </div>
            <h1 className="text-5xl font-thin mb-3" style={{ color: "var(--text-primary)" }}>
              Your Styled <span className="font-bold italic" style={{ color: "var(--accent)" }}>Outfits</span>
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              {products.length} AI-curated looks, perfectly matched to your preferences
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 30 }}
              transition={{ delay: i * 0.1 }}>
              <div className="rounded-2xl overflow-hidden group transition-all duration-500 hover:-translate-y-1"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-hover)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-color)")}>

                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Match badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md"
                    style={{ background: "rgba(0,0,0,0.6)", border: "1px solid var(--border-hover)" }}>
                    <Sparkles className="w-3 h-3" style={{ color: "var(--accent)" }} />
                    <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>{p.matchScore}% Match</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  {/* Name + match ring */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{p.name}</h3>
                      <div className="text-xl font-bold" style={{ color: "var(--accent)" }}>${p.price}</div>
                    </div>
                    <MatchRing score={p.matchScore} />
                  </div>

                  {/* Stars */}
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3 h-3" style={{ color: j < 5 ? "var(--accent)" : "transparent", fill: j < 5 ? "var(--accent)" : "transparent" }} />
                    ))}
                  </div>

                  {/* AI reason */}
                  <div className="flex items-start gap-2 p-3 rounded-xl mb-4"
                    style={{ background: "color-mix(in srgb, var(--accent) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)" }}>
                    <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{p.reason}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={() => openModal(p)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all"
                      style={{ border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-color)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}>
                      Details
                    </button>
                    <button onClick={() => handleAdd(p)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5"
                      style={{
                        background: addedIds.includes(p.id) ? "#16a34a" : "var(--accent)",
                        color: "var(--accent-text)",
                        boxShadow: `0 4px 12px ${addedIds.includes(p.id) ? "rgba(22,163,74,0.3)" : "var(--accent-glow)"}`,
                      }}>
                      {addedIds.includes(p.id) ? <><Check className="w-3.5 h-3.5" /> Added</> : <><ShoppingCart className="w-3.5 h-3.5" /> Add to Bag</>}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 backdrop-blur-md" style={{ background: "var(--overlay)" }}
              onClick={() => setSelected(null)} />
            <motion.div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-hover)", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>

              <button onClick={() => setSelected(null)}
                className="absolute top-5 right-5 z-10 p-2 rounded-full transition-colors"
                style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}>
                <X className="w-5 h-5" />
              </button>

              <div className="grid md:grid-cols-2">
                {/* Image */}
                <div className="relative aspect-[3/4] md:aspect-auto rounded-t-3xl md:rounded-l-3xl overflow-hidden">
                  <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md"
                    style={{ background: "rgba(0,0,0,0.6)", border: "1px solid var(--border-hover)" }}>
                    <Sparkles className="w-3 h-3" style={{ color: "var(--accent)" }} />
                    <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>{selected.matchScore}% Match</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-8 flex flex-col">
                  <div className="flex-1">
                    <h2 className="text-3xl font-thin mb-1" style={{ color: "var(--text-primary)" }}>{selected.name}</h2>
                    <div className="text-3xl font-bold mb-4" style={{ color: "var(--accent)" }}>${selected.price}</div>

                    <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>{selected.description}</p>

                    {/* AI reason */}
                    <div className="flex items-start gap-3 p-4 rounded-2xl mb-6"
                      style={{ background: "color-mix(in srgb, var(--accent) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)" }}>
                      <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
                      <div>
                        <p className="text-xs font-bold tracking-wider uppercase mb-1" style={{ color: "var(--accent)" }}>Why AI Picked This</p>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{selected.reason}</p>
                      </div>
                    </div>

                    {/* Size */}
                    <div className="mb-5">
                      <label className="block text-xs tracking-widest uppercase mb-3 font-bold" style={{ color: "var(--text-muted)" }}>Size</label>
                      <div className="flex gap-2 flex-wrap">
                        {selected.sizes.map((s) => (
                          <button key={s} onClick={() => setSelectedSize(s)}
                            className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                            style={{
                              background: selectedSize === s ? "var(--accent)" : "var(--bg-card)",
                              color: selectedSize === s ? "var(--accent-text)" : "var(--text-secondary)",
                              border: `1px solid ${selectedSize === s ? "var(--accent)" : "var(--border-color)"}`,
                            }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color */}
                    <div className="mb-8">
                      <label className="block text-xs tracking-widest uppercase mb-3 font-bold" style={{ color: "var(--text-muted)" }}>Color</label>
                      <div className="flex gap-2 flex-wrap">
                        {selected.colors.map((c) => (
                          <button key={c} onClick={() => setSelectedColor(c)}
                            className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                            style={{
                              background: selectedColor === c ? "var(--accent)" : "var(--bg-card)",
                              color: selectedColor === c ? "var(--accent-text)" : "var(--text-secondary)",
                              border: `1px solid ${selectedColor === c ? "var(--accent)" : "var(--border-color)"}`,
                            }}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { handleAdd(selected); setSelected(null); }}
                    className="w-full py-4 rounded-2xl text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    style={{ background: "var(--accent)", color: "var(--accent-text)", boxShadow: "0 8px 24px var(--accent-glow)" }}>
                    <ShoppingCart className="w-5 h-5" /> Add to Bag — ${selected.price}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
