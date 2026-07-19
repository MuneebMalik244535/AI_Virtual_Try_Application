import { UserPreferences } from '../context/preferences-context';

const API_BASE_URL = 'http://localhost:3000';

export interface StylistRequest {
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

export interface StylistResponse {
  recommendations: any[];
  success: boolean;
  message?: string;
}

export const stylistApi = {
  async getRecommendations(preferences: UserPreferences): Promise<StylistResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stylist/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences as StylistRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting stylist recommendations:', error);
      throw error;
    }
  }
};
