import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAvatar } from './useAvatar';

interface AvatarBubbleProps {
  className?: string;
}

export function AvatarBubble({ className = '' }: AvatarBubbleProps) {
  const { bubbleText } = useAvatar();

  return (
    <AnimatePresence>
      {bubbleText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 15 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className={`absolute bottom-full mb-3 right-0 z-50 max-w-[240px] px-4 py-3 rounded-2xl shadow-xl border text-xs font-medium leading-relaxed backdrop-blur-md ${className}`}
          style={{
            background: 'rgba(25, 30, 44, 0.85)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
          }}
        >
          {bubbleText}
          
          {/* Bubble Tail pointing down/right towards the mascot */}
          <div 
            className="absolute top-full right-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px]"
            style={{ borderTopColor: 'rgba(25, 30, 44, 0.85)' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default AvatarBubble;
