import { Link } from 'react-router';
import { useWeatherStylist, StyleMood, WeatherStylistState } from '../hooks/useWeatherStylist';
import { CloudRain, Sun, Thermometer, Wind, Cloud } from 'lucide-react';

const MOOD_DATA: Record<StyleMood, { title: string, subtitle: string, bg: string, category: string, icon: React.ReactNode }> = {
  EXTREME_HEAT: {
    title: "The Heatwave Edit",
    subtitle: "Breathable fabrics and effortless silhouettes to beat the heat.",
    bg: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80",
    category: "tshirts",
    icon: <Thermometer className="w-5 h-5 text-orange-500" />
  },
  WARM_CASUAL: {
    title: "The Spring Casual Edit",
    subtitle: "Light layers and vibrant tones for perfect weather.",
    bg: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80",
    category: "shirts",
    icon: <Sun className="w-5 h-5 text-yellow-400" />
  },
  MILD_BREEZE: {
    title: "The Transition Layer Edit",
    subtitle: "Stay sharp as the temperature drops. Premium hoodies and denim.",
    bg: "https://images.unsplash.com/photo-1520975954732-57dd22299614?w=1200&q=80",
    category: "hoodies",
    icon: <Wind className="w-5 h-5 text-blue-300" />
  },
  COLD_LAYERS: {
    title: "The Winter Layering Edit",
    subtitle: "Master the art of warmth with our curated jackets and heavy knits.",
    bg: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
    category: "jackets",
    icon: <Cloud className="w-5 h-5 text-slate-300" />
  },
  RAIN_READY: {
    title: "The Monsoon Edit",
    subtitle: "Don't let the rain dull your style. Water-resistant outerwear.",
    bg: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1200&q=80",
    category: "jackets",
    icon: <CloudRain className="w-5 h-5 text-blue-400" />
  },
  DEFAULT: {
    title: "The Essential Edit",
    subtitle: "Timeless fashion meticulously crafted for everyday perfection.",
    bg: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80",
    category: "men",
    icon: <Sparkles className="w-5 h-5 text-purple-400" />
  }
};

import { Sparkles } from 'lucide-react';

export function WeatherBanner() {
  const { city, temperature, condition, styleMood, loading, error } = useWeatherStylist();

  // We want the banner to ALWAYS show, even if the weather API takes too long or fails.
  // We use the DEFAULT mood as the fallback.
  // If loading or error, we still render the DEFAULT banner so the user isn't stuck waiting for layout shifts.
  const displayMood = (loading || error || styleMood === 'DEFAULT') ? 'DEFAULT' : styleMood;

  const moodData = MOOD_DATA[displayMood];

  return (
    <div className="relative w-full h-[500px] flex md:h-[600px] overflow-hidden group">
      {/* Background Image with Zoom animation */}
      <img
        src={moodData.bg}
        alt="Weather Edit Background"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
      />
      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content Container */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 md:pb-24">
        {/* Live Weather Indicator Pill */}
        <div className="flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-md border border-white/20 w-fit px-4 py-2 rounded-full transform translate-y-4 opacity-0 animate-[fade-in-up_0.8s_ease-out_forwards]">
          {moodData.icon}
          <span className="text-white text-sm font-medium tracking-wide">
            {city ? `${Math.round(temperature || 0)}°C in ${city}` : 'Live Weather Stylist'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-1 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
          {moodData.title}
        </h1>
        
        <p className="text-lg md:text-xl text-stone-200 mb-8 max-w-2xl opacity-0 animate-[fade-in-up_0.8s_ease-out_0.4s_forwards]">
          {moodData.subtitle}
        </p>

        <Link
          to={`/shop?category=${moodData.category}`}
          className="bg-white text-black px-8 py-4 rounded-full font-bold w-fit hover:bg-stone-200 transition-colors opacity-0 animate-[fade-in-up_0.8s_ease-out_0.6s_forwards] flex items-center gap-2"
        >
          Shop The Edit
        </Link>
      </div>
    </div>
  );
}
