import React, { lazy, Suspense } from 'react';
import { useAvatar } from './useAvatar';
import { MascotAssistant } from '../MascotAssistant';

// Lazy-load Rive wrapper to avoid loading heavy canvas libs on initial render
const MascotRiveWrapper = lazy(() =>
  import('../MascotRiveWrapper').then((module) => ({ default: module.MascotRiveWrapper }))
);

interface AvatarProps {
  size?: number | string;
  className?: string;
  useRiveEngine?: boolean;
}

export function Avatar({ size = 200, className = '', useRiveEngine = false }: AvatarProps) {
  const avatar = useAvatar();

  return (
    <div className={`relative flex items-center justify-center overflow-visible ${className}`}>
      {useRiveEngine ? (
        <Suspense fallback={
          <MascotAssistant
            size={size}
            isTalking={avatar.isTalking}
            isThinking={avatar.isThinking}
            isListening={avatar.isListening}
            isHappy={avatar.isHappy}
            isPointing={avatar.isPointing}
            isLoading={avatar.isLoading}
            triggerWave={avatar.triggerWave}
            triggerCelebrate={avatar.triggerCelebrate}
          />
        }>
          <MascotRiveWrapper
            size={size}
            isTalking={avatar.isTalking}
            isThinking={avatar.isThinking}
            isListening={avatar.isListening}
            isHappy={avatar.isHappy}
            isPointing={avatar.isPointing}
            isLoading={avatar.isLoading}
            triggerWave={avatar.triggerWave}
            triggerCelebrate={avatar.triggerCelebrate}
          />
        </Suspense>
      ) : (
        <MascotAssistant
          size={size}
          isTalking={avatar.isTalking}
          isThinking={avatar.isThinking}
          isListening={avatar.isListening}
          isHappy={avatar.isHappy}
          isPointing={avatar.isPointing}
          isLoading={avatar.isLoading}
          triggerWave={avatar.triggerWave}
          triggerCelebrate={avatar.triggerCelebrate}
        />
      )}
    </div>
  );
}
export default Avatar;
