import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { PreferencesProvider, usePreferences } from "../../context/preferences-context";
import { stylistApi } from "../../services/stylistApi";

const LOADING_MESSAGES = [
  "Scanning your style profile...",
  "Matching your body type & skin tone...",
  "Finding in-stock products...",
  "Comparing 1,000+ outfits...",
  "Calculating AI match scores...",
  "Assembling your perfect look...",
];

function ProcessingContent() {
  const navigate = useNavigate();
  const { preferences } = usePreferences();
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1400);

    const progInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 1.5, 95));
    }, 80);

    const process = async () => {
      try {
        const response = await stylistApi.getRecommendations(preferences);
        sessionStorage.setItem("stylistRecommendations", JSON.stringify(response.recommendations));
        setTimeout(() => navigate("/stylist/recommendations"), 1500);
      } catch {
        setTimeout(() => navigate("/stylist/recommendations"), 2000);
      }
    };

    const t = setTimeout(process, 1000);
    return () => { clearInterval(msgInterval); clearInterval(progInterval); clearTimeout(t); };
  }, [navigate, preferences]);

  return (
    <div style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}
      className="flex items-center justify-center p-4 relative overflow-hidden">

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 1,
              height: Math.random() * 4 + 1,
              background: "var(--accent)",
              opacity: Math.random() * 0.3 + 0.1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ y: [0, -30, 0], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
        {/* Large glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 animate-pulse"
          style={{ background: "var(--accent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 animate-pulse"
          style={{ background: "var(--accent)", animationDelay: "1.5s" }} />
      </div>

      <div className="relative z-10 text-center max-w-md">
        {/* Spinning logo */}
        <div className="relative w-28 h-28 mx-auto mb-10">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: "2px solid var(--accent)", opacity: 0.3 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-2 rounded-full"
            style={{ border: "1px solid color-mix(in srgb, var(--accent) 60%, transparent)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "var(--accent)", boxShadow: "0 0 30px var(--accent-glow)" }}>
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                <Sparkles className="w-8 h-8" style={{ color: "var(--accent-text)" }} />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-thin mb-2" style={{ color: "var(--text-primary)" }}>
          Building your <span className="font-bold italic" style={{ color: "var(--accent)" }}>perfect look</span>
        </h2>
        <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>This only takes a moment...</p>

        {/* Cycling messages */}
        <div className="h-7 mb-8 overflow-hidden">
          <motion.p key={messageIndex}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-sm tracking-wider" style={{ color: "var(--text-secondary)" }}>
            {LOADING_MESSAGES[messageIndex]}
          </motion.p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 rounded-full overflow-hidden mb-3" style={{ background: "var(--border-color)" }}>
          <motion.div className="h-full rounded-full transition-all duration-200"
            style={{ width: `${progress}%`, background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)" }} />
        </div>
        <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>{Math.round(progress)}%</span>

        {/* Floating emojis */}
        <div className="flex justify-center gap-6 mt-12">
          {["👔", "👗", "👟", "💍", "👛"].map((emoji, i) => (
            <motion.span key={i} className="text-2xl"
              animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}>
              {emoji}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Processing() {
  return (
    <PreferencesProvider>
      <ProcessingContent />
    </PreferencesProvider>
  );
}
