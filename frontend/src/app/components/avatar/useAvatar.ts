import { useContext } from 'react';
import { AvatarContext } from './AvatarProvider';

export function useAvatar() {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
}
