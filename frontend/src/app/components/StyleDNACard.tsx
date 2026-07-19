import { useRef } from 'react';
import { Share2, Download, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

interface StyleDNAProps {
  preferences: {
    style?: string;
    occasion?: string;
    colors?: string[];
    season?: string;
    body_type?: string;
  };
}

// Maps quiz values to a persona archetype
function computeDNA(pref: StyleDNAProps['preferences']) {
  const styleMap: Record<string, { name: string; emoji: string; tagline: string; traits: string[]; gradient: string }> = {
    minimal: {
      name: 'The Modernist',
      emoji: '⚪',
      tagline: 'Less is always more.',
      traits: ['Clean lines', 'Monochrome palette', 'Quality over quantity'],
      gradient: 'from-neutral-800 to-neutral-600',
    },
    streetwear: {
      name: 'The Urban Rebel',
      emoji: '👟',
      tagline: 'The streets are your runway.',
      traits: ['Bold graphics', 'Oversized silhouettes', 'Limited edition drops'],
      gradient: 'from-violet-700 to-indigo-600',
    },
    formal: {
      name: 'The Power Dresser',
      emoji: '👔',
      tagline: 'Dress for the role you want.',
      traits: ['Tailored suits', 'Signature accessories', 'Commanding presence'],
      gradient: 'from-slate-800 to-blue-900',
    },
    sporty: {
      name: 'The Active Icon',
      emoji: '⚡',
      tagline: 'Performance meets style.',
      traits: ['Technical fabrics', 'Bold colorblocking', 'Function-first design'],
      gradient: 'from-emerald-600 to-teal-500',
    },
    bohemian: {
      name: 'The Free Spirit',
      emoji: '🌻',
      tagline: 'Fashion is self-expression.',
      traits: ['Flowy silhouettes', 'Earthy tones', 'Artisan details'],
      gradient: 'from-amber-500 to-orange-400',
    },
    classic: {
      name: 'The Timeless Icon',
      emoji: '⌚',
      tagline: 'Trends fade. Style endures.',
      traits: ['Wardrobe essentials', 'Investment pieces', 'Heritage brands'],
      gradient: 'from-rose-800 to-pink-700',
    },
  };

  const key = (pref.style || 'minimal').toLowerCase();
  return styleMap[key] || styleMap['minimal'];
}

// Simple DNA bar component
function DNABar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1 text-white/80">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function StyleDNACard({ preferences }: StyleDNAProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dna = computeDNA(preferences);

  // Deterministic pseudo-random values based on preferences
  const hash = (preferences.style || '').length + (preferences.occasion || '').length + (preferences.colors?.length || 0);
  const bars = [
    { label: 'Boldness', value: 40 + ((hash * 13) % 50), color: 'bg-white' },
    { label: 'Elegance', value: 35 + ((hash * 7) % 55), color: 'bg-white/80' },
    { label: 'Comfort', value: 50 + ((hash * 3) % 45), color: 'bg-white/60' },
    { label: 'Trendiness', value: 30 + ((hash * 17) % 60), color: 'bg-white/40' },
  ];

  const handleShare = async () => {
    const text = `I'm "${dna.name}" ${dna.emoji} — ${dna.tagline} Discover your Style DNA at LUXE!`;
    if (navigator.share) {
      await navigator.share({ title: 'My Style DNA — LUXE', text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Style DNA copied to clipboard!');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* The DNA Card */}
      <div
        ref={cardRef}
        className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${dna.gradient} p-8 shadow-2xl`}
        style={{ minHeight: '400px' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: `${80 + i * 40}px`,
                height: `${80 + i * 40}px`,
                top: `${-20 + i * 10}%`,
                right: `${-10 + i * 5}%`,
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="relative z-10 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-white/70" />
            <p className="text-white/70 text-xs tracking-widest uppercase font-semibold">Your Style DNA</p>
          </div>
          <div className="text-6xl mb-3">{dna.emoji}</div>
          <h2 className="text-3xl font-bold text-white mb-1">{dna.name}</h2>
          <p className="text-white/80 text-sm italic">"{dna.tagline}"</p>
        </div>

        {/* Traits */}
        <div className="relative z-10 flex flex-wrap gap-2 mb-6">
          {dna.traits.map((t) => (
            <span
              key={t}
              className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium border border-white/30"
            >
              {t}
            </span>
          ))}
        </div>

        {/* DNA Bars */}
        <div className="relative z-10 space-y-2.5 mb-6">
          {bars.map((b) => (
            <DNABar key={b.label} {...b} />
          ))}
        </div>

        {/* Colors */}
        {preferences.colors && preferences.colors.length > 0 && (
          <div className="relative z-10 flex items-center gap-2">
            <p className="text-white/60 text-xs">Palette:</p>
            {preferences.colors.slice(0, 5).map((c) => (
              <div
                key={c}
                className="w-5 h-5 rounded-full border-2 border-white/50"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        )}

        {/* LUXE brand watermark */}
        <div className="absolute bottom-4 right-6 text-white/20 font-bold text-lg tracking-widest">LUXE AI</div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all hover:scale-105"
          style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}
        >
          <Share2 className="w-4 h-4" />
          Share DNA
        </button>
        <Link
          to="/stylist/upload"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          Get Outfits <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
