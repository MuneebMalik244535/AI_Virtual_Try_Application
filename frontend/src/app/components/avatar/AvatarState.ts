export interface AvatarStates {
  isTalking: boolean;
  isThinking: boolean;
  isListening: boolean;
  isHappy: boolean;
  isPointing: boolean;
  isLoading: boolean;
}

export interface AvatarTriggers {
  triggerWave: boolean;
  triggerCelebrate: boolean;
}

export interface AvatarContextType extends AvatarStates, AvatarTriggers {
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  setTalking: (talking: boolean) => void;
  setThinking: (thinking: boolean) => void;
  setListening: (listening: boolean) => void;
  setHappy: (happy: boolean) => void;
  setPointing: (pointing: boolean) => void;
  setLoading: (loading: boolean) => void;
  wave: () => void;
  celebrate: () => void;
  bubbleText: string;
  setBubbleText: (text: string) => void;
}
