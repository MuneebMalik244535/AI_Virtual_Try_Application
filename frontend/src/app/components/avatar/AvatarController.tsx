import React, { useEffect } from 'react';
import { useAvatar } from './useAvatar';
import { Avatar } from './Avatar';
import { AvatarBubble } from './AvatarBubble';
import { MessageCircle } from 'lucide-react';

export function AvatarController() {
  const { 
    isChatOpen, 
    setChatOpen, 
    wave, 
    triggerWave, 
    setBubbleText,
    isHappy
  } = useAvatar();

  // Play wave animation and show welcome bubble on first visit of the session
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedAvatar');
    if (!hasVisited) {
      const welcomeTimer = setTimeout(() => {
        wave();
        setBubbleText("Hi! I'm LUXE, your AI style assistant! 👗✨");
        sessionStorage.setItem('hasVisitedAvatar', 'true');
        
        // Clear speech bubble after 4.5 seconds
        const clearTimer = setTimeout(() => {
          setBubbleText('');
        }, 4500);
        
        return () => clearTimeout(clearTimer);
      }, 1500);
      
      return () => clearTimeout(welcomeTimer);
    }
  }, [wave, setBubbleText]);

  // When clicking the trigger, toggle the chat widget
  const handleToggle = () => {
    setChatOpen(!isChatOpen);
  };

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 flex flex-col items-center transition-all duration-500 origin-bottom-right ${
        isChatOpen ? 'scale-75 opacity-0 pointer-events-none' : 'scale-100 opacity-100 pointer-events-auto'
      }`}
    >
      {/* Tooltip Thought Bubble */}
      <AvatarBubble />

      {/* Floating Mascot Avatar Container */}
      <div 
        onClick={handleToggle}
        onMouseEnter={() => {
          // Trigger wave on hover if not already waving
          if (!triggerWave) {
            wave();
          }
        }}
        className="w-20 h-20 mb-[-12px] cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300 filter drop-shadow-md select-none"
      >
        <Avatar
          size={80}
          useRiveEngine={false} // Use optimized lightweight SVG fallback by default
        />
      </div>

      {/* Main Trigger Button */}
      <button
        onClick={handleToggle}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer relative"
        style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
        aria-label="Open AI Stylist chat"
      >
        <MessageCircle className="w-6 h-6 animate-pulse" />
        
        {/* Pulse Ring Indicator */}
        <span
          className="absolute inset-0 rounded-full animate-ping pointer-events-none"
          style={{ border: '2px solid var(--accent)', opacity: 0.4 }}
        />

        {/* Small Sparkle Badge */}
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
          <span className="text-[10px]">✨</span>
        </span>
      </button>
    </div>
  );
}
export default AvatarController;
