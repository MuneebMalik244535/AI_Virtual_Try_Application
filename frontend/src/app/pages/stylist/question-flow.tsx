import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { PreferencesProvider, usePreferences } from "../../context/preferences-context";
import { Slider } from "../../components/ui/slider";
import { motion, AnimatePresence } from "motion/react";
import { StyleDNACard } from "../../components/StyleDNACard";

const COLORS = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Gray", value: "#808080" },
  { name: "Navy", value: "#001F3F" },
  { name: "Beige", value: "#F5F5DC" },
  { name: "Brown", value: "#8B4513" },
  { name: "Burgundy", value: "#800020" },
  { name: "Olive", value: "#808000" },
  { name: "Pink", value: "#FFC0CB" },
];

const OCCASIONS = [
  { id: "casual", label: "Casual Daily", icon: "👕", description: "Everyday comfort" },
  { id: "office", label: "Work/Office", icon: "💼", description: "Professional look" },
  { id: "party", label: "Party/Night Out", icon: "🎉", description: "Evening style" },
  { id: "wedding", label: "Special Event", icon: "💍", description: "Formal occasions" },
  { id: "date", label: "Date Night", icon: "🌹", description: "Romantic look" },
  { id: "sport", label: "Sports/Active", icon: "⚽", description: "Athletic wear" },
];

const SEASONS = [
  { id: "spring", label: "Spring", icon: "🌸", temp: "Mild weather" },
  { id: "summer", label: "Summer", icon: "☀️", temp: "Hot weather" },
  { id: "autumn", label: "Fall", icon: "🍂", temp: "Cool weather" },
  { id: "winter", label: "Winter", icon: "❄️", temp: "Cold weather" },
];

const BODY_TYPES = [
  { id: "athletic", label: "Athletic", description: "Muscular build" },
  { id: "pear", label: "Pear", description: "Wider hips" },
  { id: "apple", label: "Apple", description: "Wider midsection" },
  { id: "hourglass", label: "Hourglass", description: "Balanced proportions" },
  { id: "rectangle", label: "Rectangle", description: "Straight figure" },
];

const SKIN_TONES = [
  { id: "fair", label: "Fair", color: "#FFE4C4" },
  { id: "light", label: "Light", color: "#E3BC9A" },
  { id: "medium", label: "Medium", color: "#C68642" },
  { id: "olive", label: "Olive", color: "#8D5524" },
  { id: "tan", label: "Tan", color: "#A0785A" },
  { id: "deep", label: "Deep", color: "#51341A" },
];

const STYLES = [
  { id: "minimal", label: "Minimal", emoji: "⚪", description: "Clean and simple" },
  { id: "streetwear", label: "Streetwear", emoji: "👟", description: "Urban and trendy" },
  { id: "formal", label: "Formal", emoji: "👔", description: "Professional and elegant" },
  { id: "sporty", label: "Sporty", emoji: "⚽", description: "Athletic and casual" },
  { id: "bohemian", label: "Bohemian", emoji: "🌻", description: "Free-spirited" },
  { id: "classic", label: "Classic", emoji: "⌚", description: "Timeless pieces" },
];

const GENDERS = [
  { id: "women", label: "Women's Fashion" },
  { id: "men", label: "Men's Fashion" },
  { id: "unisex", label: "Unisex" },
];

function OptionButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="p-5 rounded-2xl border-2 transition-all duration-200 text-left hover:-translate-y-0.5"
      style={{
        background: selected ? "var(--accent)" : "var(--bg-card)",
        borderColor: selected ? "var(--accent)" : "var(--border-color)",
        color: selected ? "var(--accent-text)" : "var(--text-primary)",
        boxShadow: selected ? "0 4px 20px var(--accent-glow)" : "none",
      }}>
      {children}
    </button>
  );
}

function QuestionFlowContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const { preferences, updatePreferences } = usePreferences();
  const navigate = useNavigate();
  const totalSteps = 8;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const [showDNA, setShowDNA] = useState(false);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Show Style DNA card before navigating away
      setShowDNA(true);
    }
  };

  const handleBack = () => {
    if (showDNA) { setShowDNA(false); return; }
    if (currentStep > 0) setCurrentStep(currentStep - 1);
    else navigate("/stylist");
  };

  const questions = [
    {
      title: "What's your budget range?",
      subtitle: "We'll find the perfect complete outfit within this amount",
      component: (
        <div className="space-y-10">
          <div className="text-center py-6">
            <div className="text-7xl font-thin mb-2" style={{ color: "var(--accent)" }}>${preferences.budget}</div>
            <p className="text-sm tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>Total outfit budget</p>
          </div>
          <Slider value={[preferences.budget]} onValueChange={(v) => updatePreferences({ budget: v[0] })}
            min={50} max={2000} step={50} className="w-full" />
          <div className="flex justify-between text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
            <span>$50 Budget</span><span>$2000 Luxury</span>
          </div>
        </div>
      ),
    },
    {
      title: "What's the occasion?",
      subtitle: "Choose the primary purpose for your outfit",
      component: (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {OCCASIONS.map((o) => (
            <OptionButton key={o.id} selected={preferences.occasion === o.id} onClick={() => updatePreferences({ occasion: o.id })}>
              <div className="text-3xl mb-2">{o.icon}</div>
              <div className="font-semibold text-sm mb-1">{o.label}</div>
              <div className="text-xs opacity-70">{o.description}</div>
            </OptionButton>
          ))}
        </div>
      ),
    },
    {
      title: "Which season?",
      subtitle: "Select the current season you're dressing for",
      component: (
        <div className="grid grid-cols-2 gap-3">
          {SEASONS.map((s) => (
            <OptionButton key={s.id} selected={preferences.season === s.id} onClick={() => updatePreferences({ season: s.id })}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="font-semibold text-sm mb-1">{s.label}</div>
              <div className="text-xs opacity-70">{s.temp}</div>
            </OptionButton>
          ))}
        </div>
      ),
    },
    {
      title: "Preferred colors?",
      subtitle: "Select all colors you love to wear",
      component: (
        <div className="grid grid-cols-3 gap-3">
          {COLORS.map((c) => (
            <button key={c.value} onClick={() => {
              const isSelected = preferences.colors.includes(c.value);
              updatePreferences({ colors: isSelected ? preferences.colors.filter((x) => x !== c.value) : [...preferences.colors, c.value] });
            }}
              className="p-3 rounded-2xl border-2 transition-all duration-200"
              style={{
                background: "var(--bg-card)",
                borderColor: preferences.colors.includes(c.value) ? "var(--accent)" : "var(--border-color)",
                boxShadow: preferences.colors.includes(c.value) ? "0 0 12px var(--accent-glow)" : "none",
              }}>
              <div className="w-full h-12 rounded-xl mb-2" style={{ backgroundColor: c.value, border: c.value === "#FFFFFF" ? "1px solid rgba(255,255,255,0.3)" : "none" }} />
              <div className="text-xs font-medium text-center" style={{ color: "var(--text-primary)" }}>{c.name}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "What's your height?",
      subtitle: "Helps us find the perfect fit and proportions",
      component: (
        <div className="space-y-10">
          <div className="text-center py-6">
            <div className="text-7xl font-thin mb-2" style={{ color: "var(--accent)" }}>{preferences.height}<span className="text-3xl ml-1">cm</span></div>
            <p className="text-sm tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              {Math.floor(preferences.height / 30.48)}'{Math.round((preferences.height / 30.48) % 12 * 12 / 12)}"
            </p>
          </div>
          <Slider value={[preferences.height]} onValueChange={(v) => updatePreferences({ height: v[0] })} min={140} max={210} step={1} className="w-full" />
          <div className="flex justify-between text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
            <span>140cm / 4'7"</span><span>210cm / 6'11"</span>
          </div>
        </div>
      ),
    },
    {
      title: "Your body type?",
      subtitle: "Choose your shape for better fitting recommendations",
      component: (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {BODY_TYPES.map((t) => (
            <OptionButton key={t.id} selected={preferences.body_type === t.id} onClick={() => updatePreferences({ body_type: t.id })}>
              <div className="font-semibold text-sm mb-1">{t.label}</div>
              <div className="text-xs opacity-70">{t.description}</div>
            </OptionButton>
          ))}
        </div>
      ),
    },
    {
      title: "Your skin tone?",
      subtitle: "We'll match colors that truly complement you",
      component: (
        <div className="grid grid-cols-3 gap-3">
          {SKIN_TONES.map((t) => (
            <button key={t.id} onClick={() => updatePreferences({ skin_tone: t.id })}
              className="p-4 rounded-2xl border-2 flex flex-col items-center transition-all duration-200"
              style={{
                background: "var(--bg-card)",
                borderColor: preferences.skin_tone === t.id ? "var(--accent)" : "var(--border-color)",
                boxShadow: preferences.skin_tone === t.id ? "0 0 16px var(--accent-glow)" : "none",
              }}>
              <div className="w-14 h-14 rounded-full mb-3 shadow-lg" style={{ backgroundColor: t.color }} />
              <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{t.label}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Your style preference?",
      subtitle: "What's your personal fashion identity?",
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {STYLES.map((s) => (
              <OptionButton key={s.id} selected={preferences.style_preference === s.id} onClick={() => updatePreferences({ style_preference: s.id })}>
                <div className="text-3xl mb-2">{s.emoji}</div>
                <div className="font-semibold text-sm mb-1">{s.label}</div>
                <div className="text-xs opacity-70">{s.description}</div>
              </OptionButton>
            ))}
          </div>
          <div className="pt-6" style={{ borderTop: "1px solid var(--border-color)" }}>
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>Gender preference</p>
            <div className="flex gap-3">
              {GENDERS.map((g) => (
                <button key={g.id} onClick={() => updatePreferences({ gender: g.id })}
                  className="flex-1 py-3 rounded-xl border-2 text-xs font-semibold tracking-wider transition-all"
                  style={{
                    background: preferences.gender === g.id ? "var(--accent)" : "var(--bg-card)",
                    borderColor: preferences.gender === g.id ? "var(--accent)" : "var(--border-color)",
                    color: preferences.gender === g.id ? "var(--accent-text)" : "var(--text-secondary)",
                  }}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  const q = questions[currentStep];

  return (
    <div style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}
      className="flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-3xl">

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: "var(--accent)" }} />
              <span className="text-xs tracking-widest uppercase font-bold" style={{ color: "var(--accent)" }}>
                Step {currentStep + 1} of {totalSteps}
              </span>
            </div>
            <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>{Math.round(progress)}%</span>
          </div>
          {/* Progress bar */}
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border-color)" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "var(--accent)" }} />
          </div>
          {/* Step dots */}
          <div className="flex gap-2 mt-3">
            {[...Array(totalSteps)].map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{ background: i <= currentStep ? "var(--accent)" : "var(--border-color)" }} />
            ))}
          </div>
        </div>

        {/* Style DNA Reveal Screen */}
      <AnimatePresence>
        {showDNA && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'var(--bg-primary)' }}
          >
            <div className="w-full max-w-md">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  <p className="text-sm font-bold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>Style Profile Generated</p>
                </div>
                <h1 className="text-3xl font-thin" style={{ color: 'var(--text-primary)' }}>Your Style DNA</h1>
              </div>
              <StyleDNACard preferences={{
                style: preferences.style_preference,
                occasion: preferences.occasion,
                colors: preferences.colors,
                season: preferences.season,
                body_type: preferences.body_type,
              }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Quiz Card */}
        <div className="rounded-3xl p-8 md:p-12"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", boxShadow: "0 40px 80px rgba(0,0,0,0.3)" }}>
          <AnimatePresence mode="wait">
            <motion.div key={currentStep}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}>
              <h2 className="text-3xl font-thin mb-2" style={{ color: "var(--text-primary)" }}>
                {q.title}
              </h2>
              {q.subtitle && <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>{q.subtitle}</p>}
              <div className="my-8">{q.component}</div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-10 pt-6" style={{ borderTop: "1px solid var(--border-color)" }}>
            <button onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all"
              style={{ border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-color)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}>
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all hover:-translate-y-0.5"
              style={{ background: "var(--accent)", color: "var(--accent-text)", boxShadow: "0 4px 16px var(--accent-glow)" }}>
              {currentStep === totalSteps - 1 ? "Generate My Outfits" : "Continue"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuestionFlow() {
  return (
    <PreferencesProvider>
      <QuestionFlowContent />
    </PreferencesProvider>
  );
}
