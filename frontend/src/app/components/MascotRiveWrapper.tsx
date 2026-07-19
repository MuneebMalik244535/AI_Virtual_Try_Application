import React, { useEffect } from 'react';
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from '@rive-app/react-canvas';

interface MascotRiveWrapperProps {
  src?: string;
  stateMachineName?: string;
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

export function MascotRiveWrapper({
  src = '/mascot_character.riv',
  stateMachineName = 'MascotStateMachine',
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
}: MascotRiveWrapperProps) {
  
  // Initialize Rive canvas
  const { rive, RiveComponent } = useRive({
    src,
    stateMachines: stateMachineName,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  // Get state machine inputs from Rive runtime
  const talkingInput = useStateMachineInput(rive, stateMachineName, 'isTalking');
  const thinkingInput = useStateMachineInput(rive, stateMachineName, 'isThinking');
  const listeningInput = useStateMachineInput(rive, stateMachineName, 'isListening');
  const happyInput = useStateMachineInput(rive, stateMachineName, 'isHappy');
  const pointingInput = useStateMachineInput(rive, stateMachineName, 'isPointing');
  const loadingInput = useStateMachineInput(rive, stateMachineName, 'isLoading');
  const waveTrigger = useStateMachineInput(rive, stateMachineName, 'triggerWave');
  const celebrateTrigger = useStateMachineInput(rive, stateMachineName, 'triggerCelebrate');

  // Sync isTalking input
  useEffect(() => {
    if (talkingInput) {
      talkingInput.value = isTalking;
    }
  }, [isTalking, talkingInput]);

  // Sync isThinking input
  useEffect(() => {
    if (thinkingInput) {
      thinkingInput.value = isThinking;
    }
  }, [isThinking, thinkingInput]);

  // Sync isListening input
  useEffect(() => {
    if (listeningInput) {
      listeningInput.value = isListening;
    }
  }, [isListening, listeningInput]);

  // Sync isHappy input
  useEffect(() => {
    if (happyInput) {
      happyInput.value = isHappy;
    }
  }, [isHappy, happyInput]);

  // Sync isPointing input
  useEffect(() => {
    if (pointingInput) {
      pointingInput.value = isPointing;
    }
  }, [isPointing, pointingInput]);

  // Sync isLoading input
  useEffect(() => {
    if (loadingInput) {
      loadingInput.value = isLoading;
    }
  }, [isLoading, loadingInput]);

  // Sync triggerWave trigger
  useEffect(() => {
    if (triggerWave && waveTrigger) {
      waveTrigger.fire();
    }
  }, [triggerWave, waveTrigger]);

  // Sync triggerCelebrate trigger
  useEffect(() => {
    if (triggerCelebrate && celebrateTrigger) {
      celebrateTrigger.fire();
    }
  }, [triggerCelebrate, celebrateTrigger]);

  return (
    <div 
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <RiveComponent className="w-full h-full" />
    </div>
  );
}
