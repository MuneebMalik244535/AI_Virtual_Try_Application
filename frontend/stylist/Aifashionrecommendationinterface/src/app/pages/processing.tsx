import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { PreferencesProvider } from "../context/preferences-context";

const LOADING_MESSAGES = [
  "Analyzing your style preferences...",
  "Checking available outfits...",
  "Matching your preferences...",
  "Finding the perfect combinations...",
  "Calculating AI match scores...",
];

export function Processing() {
  const navigate = useNavigate();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1500);

    const redirectTimeout = setTimeout(() => {
      navigate("/recommendations");
    }, 4500);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(redirectTimeout);
    };
  }, [navigate]);

  return (
    <PreferencesProvider>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Background Animated Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-black/5 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center">
          {/* Animated Logo */}
          <motion.div
            className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-8"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 360],
            }}
            transition={{
              scale: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
              rotate: {
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>

          {/* Loading Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-black rounded-full"
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          {/* Messages */}
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="h-8"
          >
            <p className="text-xl text-neutral-700">{LOADING_MESSAGES[messageIndex]}</p>
          </motion.div>

          {/* Progress Bar */}
          <div className="mt-12 max-w-md mx-auto">
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-black"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Floating Fashion Icons */}
          <div className="mt-12 flex justify-center gap-8 text-4xl">
            {["👕", "👗", "👔", "👟"].map((emoji, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                {emoji}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PreferencesProvider>
  );
}
