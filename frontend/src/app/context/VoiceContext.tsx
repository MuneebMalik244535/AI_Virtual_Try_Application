import React, { createContext, useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router';

interface VoiceContextType {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();

  const startListening = async () => {
    setError(null);
    setTranscript('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Fallback to audio/webm if the browser supports it
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToBackend(audioBlob);
        
        // Cleanup tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const sendAudioToBackend = async (audioBlob: Blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const response = await fetch('http://localhost:3000/api/voice-shop', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setTranscript(data.text);
        const filters = data.filters;
        
        // Build query string
        const params = new URLSearchParams();
        if (filters.category) params.set('category', filters.category.toLowerCase().replace('-', ''));
        if (filters.color) params.set('color', filters.color.toLowerCase());
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
        if (filters.q) params.set('q', filters.q);

        // Redirect to shop
        navigate(`/shop?${params.toString()}`);
      } else {
        setError(data.message || 'Could not process audio.');
      }
    } catch (err) {
      console.error('Error sending audio to backend:', err);
      setError('Failed to connect to backend voice API.');
    } finally {
      setIsProcessing(false);
      // clear transcript after a delay so user can read it if needed or just clear it
      setTimeout(() => setTranscript(''), 3000); 
    }
  };

  return (
    <VoiceContext.Provider value={{ isListening, isProcessing, transcript, startListening, stopListening, error }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}
