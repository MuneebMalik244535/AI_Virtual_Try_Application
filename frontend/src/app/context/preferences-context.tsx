import React, { createContext, useContext, useState } from "react";

export interface UserPreferences {
  budget: number;
  occasion: string;
  season: string;
  colors: string[];
  height: number;
  body_type: string;
  skin_tone: string;
  style_preference: string;
  gender: string;
  user_image?: string;
}

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    budget: 500,
    occasion: "",
    season: "",
    colors: [],
    height: 170,
    body_type: "",
    skin_tone: "",
    style_preference: "",
    gender: "",
  });

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};
