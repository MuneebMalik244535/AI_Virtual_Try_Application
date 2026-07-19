import { useNavigate } from "react-router";
import { Sparkles, User, ShoppingBag, ArrowRight, Zap } from "lucide-react";
import { PreferencesProvider } from "../../context/preferences-context";
import { useEffect, useState } from "react";

const FEATURES = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Personalized Recommendations",
    desc: "AI-curated selections tailored to your unique taste and preferences.",
  },
  {
    icon: <User className="w-6 h-6" />,
    title: "Body & Style Analysis",
    desc: "Outfit picks that complement your body type, skin tone, and aesthetic.",
  },
  {
    icon: <ShoppingBag className="w-6 h-6" />,
    title: "Real Products. Instant Purchase.",
    desc: "Every recommendation is in-stock and available for immediate checkout.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Budget Enforced by AI",
    desc: "The full outfit — shoes, shirt, pants — guaranteed under your budget.",
  },
];

const STATS = [
  { value: "98%", label: "Match Accuracy" },
  { value: "4.2s", label: "Avg. Style Time" },
  { value: "50K+", label: "Outfits Generated" },
  { value: "$0", label: "Styling Fee" },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PreferencesProvider>
      <div style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }} />

          <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Left Content */}
              <div className={`transition-all duration-1000 ${loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-8"
                  style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)", color: "var(--accent)" }}>
                  <Sparkles className="w-3 h-3" /> AI-Powered Personal Stylist
                </div>

                <h1 className="text-6xl lg:text-7xl font-thin tracking-tight leading-none mb-6" style={{ color: "var(--text-primary)" }}>
                  Your perfect
                  <br />
                  <span className="font-bold italic" style={{ color: "var(--accent)" }}>outfit awaits.</span>
                </h1>

                <p className="text-lg leading-relaxed mb-10 max-w-lg font-light" style={{ color: "var(--text-secondary)" }}>
                  Answer 8 quick questions. Our AI analyzes your body type, skin tone, budget, and occasion — then assembles your ideal complete outfit from real in-stock products.
                </p>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-4 mb-10 py-6"
                  style={{ borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
                  {STATS.map((s, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xl font-bold" style={{ color: "var(--accent)" }}>{s.value}</div>
                      <div className="text-[10px] tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate("/stylist/questions")}
                  className="group flex items-center gap-3 px-10 py-5 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:-translate-y-1"
                  style={{ background: "var(--accent)", color: "var(--accent-text)", boxShadow: "0 8px 32px var(--accent-glow)" }}>
                  <Sparkles className="w-5 h-5" />
                  Begin AI Styling
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {/* Right: Image */}
              <div className={`relative transition-all duration-1000 delay-200 ${loaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
                <div className="relative rounded-3xl overflow-hidden"
                  style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px var(--border-color)" }}>
                  <img
                    src="https://images.unsplash.com/photo-1584448033590-3e5e5124f87a?w=800&q=80"
                    alt="AI Fashion Assistant"
                    className="w-full h-[580px] object-cover"
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg-primary) 0%, transparent 50%)" }} />
                </div>

                {/* Floating card 1 */}
                <div className="absolute -bottom-6 -left-6 px-5 py-4 rounded-2xl"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-hover)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: "var(--accent)" }}>
                      <Sparkles className="w-5 h-5" style={{ color: "var(--accent-text)" }} />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>AI Match Score</p>
                      <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>98%</p>
                    </div>
                  </div>
                </div>

                {/* Floating card 2 */}
                <div className="absolute -top-4 -right-4 px-5 py-3 rounded-2xl"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-hover)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
                    <span className="text-xs font-semibold tracking-wider" style={{ color: "var(--text-primary)" }}>AI is Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-24" style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border-color)" }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="h-px w-8" style={{ background: "var(--accent)" }} />
                <span className="text-xs tracking-widest uppercase" style={{ color: "var(--accent)" }}>Process</span>
                <div className="h-px w-8" style={{ background: "var(--accent)" }} />
              </div>
              <h2 className="text-4xl font-thin" style={{ color: "var(--text-primary)" }}>
                Styled in <span className="font-bold italic">4 simple steps</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-6 relative">
              {["Fill Your Preferences", "AI Analyzes Your Style", "Finds Real Products", "Get Your Look"].map((step, i) => (
                <div key={i} className="relative text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold transition-all"
                    style={{ background: "var(--accent)", color: "var(--accent-text)" }}>
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{step}</h3>
                  {i < 3 && (
                    <div className="hidden md:block absolute top-7 left-3/4 w-1/2 h-px"
                      style={{ background: "var(--border-hover)" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURE CARDS ── */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8" style={{ background: "var(--accent)" }} />
                <span className="text-xs tracking-widest uppercase" style={{ color: "var(--accent)" }}>Why Choose Us</span>
              </div>
              <h2 className="text-4xl font-thin" style={{ color: "var(--text-primary)" }}>
                Built for <span className="font-bold italic">real results</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURES.map((f, i) => (
                <div key={i} className="p-7 rounded-2xl group cursor-default transition-all duration-300 hover:-translate-y-1"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-color)")}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all group-hover:scale-110"
                    style={{ background: "color-mix(in srgb, var(--accent) 15%, transparent)", color: "var(--accent)" }}>
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 text-center" style={{ borderTop: "1px solid var(--border-color)" }}>
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-4xl font-thin mb-6" style={{ color: "var(--text-primary)" }}>
              Ready to meet your <span className="font-bold italic" style={{ color: "var(--accent)" }}>perfect outfit?</span>
            </h2>
            <button
              onClick={() => navigate("/stylist/questions")}
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{ background: "var(--accent)", color: "var(--accent-text)", boxShadow: "0 8px 32px var(--accent-glow)" }}>
              <Sparkles className="w-5 h-5" />
              Start Free Styling Session
            </button>
          </div>
        </section>
      </div>
    </PreferencesProvider>
  );
}
