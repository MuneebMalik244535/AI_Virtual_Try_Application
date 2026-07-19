import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LEGS_PATHS,
  LEFT_ARM_PATHS,
  RIGHT_ARM_PATHS,
  BODY_PATHS,
  HEAD_PATHS,
  MOUTH_PATHS,
  LEFT_EYE_PATHS,
  RIGHT_EYE_PATHS
} from './MascotAssistantPaths';

interface MascotAssistantProps {
  isTalking?: boolean;
  isThinking?: boolean;
  isListening?: boolean;
  isHappy?: boolean;
  isPointing?: boolean;
  isLoading?: boolean;
  triggerWave?: boolean;
  triggerCelebrate?: boolean;
  className?: string;
  size?: number | string;
}

export function MascotAssistant({
  isTalking = false,
  isThinking = false,
  isListening = false,
  isHappy = false,
  isPointing = false,
  isLoading = false,
  triggerWave = false,
  triggerCelebrate = false,
  className = '',
  size = 200,
}: MascotAssistantProps) {
  // Trigger state management
  const [isWaving, setIsWaving] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  // Blinking and random eye movement states
  const [isBlinking, setIsBlinking] = useState(false);
  const [eyeShift, setEyeShift] = useState({ x: 0, y: 0 });

  // Handle triggerWave prop change
  useEffect(() => {
    if (triggerWave) {
      setIsWaving(true);
      const timer = setTimeout(() => setIsWaving(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [triggerWave]);

  // Handle triggerCelebrate prop change
  useEffect(() => {
    if (triggerCelebrate) {
      setIsCelebrating(true);
      const timer = setTimeout(() => setIsCelebrating(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [triggerCelebrate]);

  // Periodic Blinking (blink for 100ms every 3.5 - 6.5s)
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    
    const triggerBlink = () => {
      setIsBlinking(true);
      const closeTimer = setTimeout(() => {
        setIsBlinking(false);
        scheduleNextBlink();
      }, 120);
      return () => clearTimeout(closeTimer);
    };

    const scheduleNextBlink = () => {
      const delay = 3500 + Math.random() * 3000;
      blinkTimeout = setTimeout(triggerBlink, delay);
    };

    scheduleNextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Periodic Random Eye Movement (only during idle)
  useEffect(() => {
    if (isThinking || isListening || isPointing) return;

    const interval = setInterval(() => {
      // 30% chance to shift eyes when idle
      if (Math.random() < 0.4) {
        const dx = (Math.random() - 0.5) * 12; // -6 to 6
        const dy = (Math.random() - 0.5) * 6;  // -3 to 3
        setEyeShift({ x: dx, y: dy });
      } else {
        setEyeShift({ x: 0, y: 0 }); // return to center
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isThinking, isListening, isPointing]);

  // Priority mapping for overall state machine
  let currentState = 'idle';
  if (isCelebrating) currentState = 'celebrate';
  else if (isWaving) currentState = 'wave';
  else if (isLoading) currentState = 'loading';
  else if (isThinking) currentState = 'thinking';
  else if (isTalking) currentState = 'talking';
  else if (isListening) currentState = 'listening';
  else if (isPointing) currentState = 'pointing';
  else if (isHappy) currentState = 'happy';

  // Determine eye shifts based on state overrides
  let activeEyeShift = eyeShift;
  if (currentState === 'thinking') {
    activeEyeShift = { x: 3, y: -12 }; // Look up
  } else if (currentState === 'pointing') {
    activeEyeShift = { x: -14, y: 4 }; // Look left (towards points)
  } else if (currentState === 'listening') {
    activeEyeShift = { x: 0, y: 0 }; // Focus center
  }

  // --- Animation Variants ---

  // Floating wrapper motion
  const containerVariants = {
    idle: {
      y: [0, -6, 0],
      transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
    },
    thinking: {
      y: [0, -3, 0],
      transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
    },
    listening: {
      y: [0, -4, 0],
      transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
    },
    talking: {
      y: [0, -5, 2, -5, 0],
      transition: { repeat: Infinity, duration: 3.5, ease: "easeInOut" }
    },
    loading: {
      y: [0, -4, 0],
      scale: [1, 1.01, 1],
      transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
    },
    wave: {
      y: [0, -4, 0],
      transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
    },
    happy: {
      y: [0, -8, 0],
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
    },
    celebrate: {
      y: [0, -35, 0, -5, -35, 0],
      transition: { duration: 1.5, ease: "easeInOut" }
    },
    pointing: {
      y: [0, -4, 0],
      transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
    }
  };

  // Breathing Body Variants
  const bodyVariants = {
    idle: {
      scaleY: [1, 1.015, 1],
      scaleX: [1, 1.008, 1],
      transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
    },
    talking: {
      scaleY: [1, 1.025, 0.98, 1.025, 1],
      transition: { repeat: Infinity, duration: 1.8, ease: "easeInOut" }
    },
    thinking: {
      scaleY: [1, 1.008, 1],
      scaleX: [1, 1.004, 1],
      transition: { repeat: Infinity, duration: 3.5, ease: "easeInOut" }
    },
    loading: {
      scale: [1, 1.015, 1],
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
    },
    celebrate: {
      scaleY: [1, 0.85, 1.1, 0.95, 1],
      transition: { duration: 1.5 }
    }
  };

  // Breathing Head Variants
  const headVariants = {
    idle: {
      y: [0, -1.5, 0],
      rotate: 0,
      transition: { repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.2 }
    },
    thinking: {
      y: -3,
      rotate: -7, // Tilt head upward slightly to the left
      transition: { type: 'spring', stiffness: 80 }
    },
    listening: {
      y: 0,
      rotate: 8, // Attentive side tilt
      transition: { type: 'spring', stiffness: 90 }
    },
    talking: {
      y: [0, 2, -1, 2, 0],
      rotate: [0, -1.5, 1.5, -1.5, 0],
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
    },
    happy: {
      y: [0, -3, 0],
      rotate: [0, 3, -3, 0],
      transition: { repeat: Infinity, duration: 1.2 }
    },
    celebrate: {
      y: [0, -6, 2, 0],
      rotate: [0, 5, -5, 5, 0],
      transition: { duration: 1.5 }
    },
    wave: {
      y: 0,
      rotate: 4,
      transition: { type: 'spring', stiffness: 100 }
    },
    pointing: {
      y: 0,
      rotate: -3,
      transition: { type: 'spring', stiffness: 80 }
    }
  };

  // Left Arm (on the left side: X < 360)
  const leftArmVariants = {
    idle: {
      rotate: [0, 3, 0],
      transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
    },
    thinking: {
      rotate: 125, // Touch/scratch head
      x: 35,
      y: -50,
      transition: { type: 'spring', stiffness: 120 }
    },
    pointing: {
      rotate: 65, // Point to the left (recommendation cards side)
      x: -25,
      y: -10,
      transition: { type: 'spring', stiffness: 100 }
    },
    talking: {
      rotate: [0, 8, -5, 8, 0],
      transition: { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
    },
    celebrate: {
      rotate: [0, 48, 18, 48, 18, 0], // Clap loop
      x: [0, 25, 5, 25, 5, 0],
      transition: { duration: 1.5 }
    },
    happy: {
      rotate: 35, // Thumb up / excited arm pose
      x: -5,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  // Right Arm (on the right side: X > 660)
  const rightArmVariants = {
    idle: {
      rotate: [0, -3, 0],
      transition: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }
    },
    wave: {
      rotate: [0, -95, -70, -95, -70, -95, 0], // Big friendly wave
      x: [0, -20, -10, -20, -10, -20, 0],
      y: [0, -15, -5, -15, -5, -15, 0],
      transition: { duration: 2.2, ease: "easeInOut" }
    },
    talking: {
      rotate: [0, -7, 6, -7, 0],
      transition: { repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.3 }
    },
    celebrate: {
      rotate: [0, -48, -18, -48, -18, 0], // Clap loop synced
      x: [0, -25, -5, -25, -5, 0],
      transition: { duration: 1.5 }
    },
    happy: {
      rotate: -35,
      x: 5,
      transition: { type: 'spring', stiffness: 100 }
    },
    pointing: {
      rotate: -15,
      transition: { type: 'spring', stiffness: 80 }
    }
  };

  // Mouth Variants
  const mouthVariants = {
    idle: {
      scaleY: 1,
      scaleX: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    talking: {
      scaleY: [1, 0.3, 1.4, 0.5, 1.2, 0.4, 1.1, 0.3, 1],
      scaleX: [1, 1.1, 0.9, 1.1, 1],
      transition: { repeat: Infinity, duration: 0.75, ease: "linear" }
    },
    wave: {
      scaleY: 1.2,
      scaleX: 1.25,
      y: -2,
      transition: { type: 'spring', stiffness: 120 }
    },
    happy: {
      scaleY: 1.3,
      scaleX: 1.3,
      y: -3,
      transition: { type: 'spring', stiffness: 120 }
    },
    celebrate: {
      scaleY: 1.4,
      scaleX: 1.35,
      y: -4,
      transition: { type: 'spring', stiffness: 120 }
    },
    thinking: {
      scaleY: 0.85,
      scaleX: 0.9,
      y: 1,
      transition: { type: 'spring', stiffness: 100 }
    },
    listening: {
      scaleY: 0.95,
      scaleX: 1.05,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  // Eye Scale (Blinking)
  const eyeBlinkScale = isBlinking ? 0.05 : 1;

  // Custom glows and dropshadows during Loading state
  const loadingFilter = currentState === 'loading'
    ? 'drop-shadow(0 0 16px rgba(254, 219, 34, 0.65))'
    : 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))';

  return (
    <div 
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <motion.div
        className="w-full h-full"
        variants={containerVariants}
        animate={currentState}
        style={{ filter: loadingFilter, transition: 'filter 0.5s ease-in-out' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1024 1024"
          width="100%"
          height="100%"
          style={{ overflow: 'visible', shapeRendering: 'geometricPrecision' }}
        >
          {/* 1. Legs Group */}
          <g id="legs" className="mascot-part" style={{ transformOrigin: '512px 750px' }}>
            {LEGS_PATHS.map((path, i) => (
              <path key={`legs-${i}`} {...path} />
            ))}
          </g>

          {/* 2. Left Arm Group */}
          <motion.g
            id="left_arm"
            className="mascot-part"
            style={{ transformOrigin: '350px 540px' }}
            variants={leftArmVariants}
            animate={currentState}
          >
            {LEFT_ARM_PATHS.map((path, i) => (
              <path key={`left-arm-${i}`} {...path} />
            ))}
          </motion.g>

          {/* 3. Right Arm Group */}
          <motion.g
            id="right_arm"
            className="mascot-part"
            style={{ transformOrigin: '674px 540px' }}
            variants={rightArmVariants}
            animate={currentState}
          >
            {RIGHT_ARM_PATHS.map((path, i) => (
              <path key={`right-arm-${i}`} {...path} />
            ))}
          </motion.g>

          {/* 4. Body Group */}
          <motion.g
            id="body"
            className="mascot-part"
            style={{ transformOrigin: '512px 550px' }}
            variants={bodyVariants}
            animate={currentState}
          >
            {BODY_PATHS.map((path, i) => (
              <path key={`body-${i}`} {...path} />
            ))}
          </motion.g>

          {/* 5. Head Group (contains face parts for nesting) */}
          <motion.g
            id="head"
            className="mascot-part"
            style={{ transformOrigin: '512px 330px' }}
            variants={headVariants}
            animate={currentState}
          >
            {/* Main Head Base paths */}
            {HEAD_PATHS.map((path, i) => (
              <path key={`head-${i}`} {...path} />
            ))}

            {/* 6. Mouth Group (nested inside head) */}
            <motion.g
              id="mouth"
              className="mascot-part"
              style={{ transformOrigin: '512px 385px' }}
              variants={mouthVariants}
              animate={currentState}
            >
              {MOUTH_PATHS.map((path, i) => (
                <path key={`mouth-${i}`} {...path} />
              ))}
            </motion.g>

            {/* 7. Left Eye Group (nested inside head) */}
            <motion.g
              id="left_eye"
              className="mascot-part"
              style={{ transformOrigin: '415px 325px' }}
              animate={{
                scaleY: eyeBlinkScale,
                x: activeEyeShift.x,
                y: activeEyeShift.y,
              }}
              transition={{
                scaleY: { duration: 0.08, ease: "easeInOut" },
                x: { type: 'spring', stiffness: 120, damping: 14 },
                y: { type: 'spring', stiffness: 120, damping: 14 }
              }}
            >
              {LEFT_EYE_PATHS.map((path, i) => (
                <path key={`left-eye-${i}`} {...path} />
              ))}
            </motion.g>

            {/* 8. Right Eye Group (nested inside head) */}
            <motion.g
              id="right_eye"
              className="mascot-part"
              style={{ transformOrigin: '609px 325px' }}
              animate={{
                scaleY: eyeBlinkScale,
                x: activeEyeShift.x,
                y: activeEyeShift.y,
              }}
              transition={{
                scaleY: { duration: 0.08, ease: "easeInOut" },
                x: { type: 'spring', stiffness: 120, damping: 14 },
                y: { type: 'spring', stiffness: 120, damping: 14 }
              }}
            >
              {RIGHT_EYE_PATHS.map((path, i) => (
                <path key={`right-eye-${i}`} {...path} />
              ))}
            </motion.g>
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}
