import React, { createContext, useState, useCallback } from 'react';
import { AvatarContextType } from './AvatarState';

export const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setChatOpen] = useState(false);
  const [isTalking, setTalking] = useState(false);
  const [isThinking, setThinking] = useState(false);
  const [isListening, setListening] = useState(false);
  const [isHappy, setHappy] = useState(false);
  const [isPointing, setPointing] = useState(false);
  const [isLoading, setLoading] = useState(false);
  
  const [triggerWave, setTriggerWave] = useState(false);
  const [triggerCelebrate, setTriggerCelebrate] = useState(false);

  const [bubbleText, setBubbleText] = useState('');

  const wave = useCallback(() => {
    setTriggerWave(true);
    setTimeout(() => setTriggerWave(false), 2200);
  }, []);

  const celebrate = useCallback(() => {
    setTriggerCelebrate(true);
    setTimeout(() => setTriggerCelebrate(false), 3000);
  }, []);

  return (
    <AvatarContext.Provider
      value={{
        isChatOpen,
        setChatOpen,
        isTalking,
        setTalking,
        isThinking,
        setThinking,
        isListening,
        setListening,
        isHappy,
        setHappy,
        isPointing,
        setPointing,
        isLoading,
        setLoading,
        triggerWave,
        triggerCelebrate,
        wave,
        celebrate,
        bubbleText,
        setBubbleText,
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
}
