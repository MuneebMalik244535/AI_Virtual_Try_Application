import { useState, useEffect } from 'react';

// Wttr.in API types
interface WttrData {
  current_condition: [{
    temp_C: string;
    weatherDesc: [{ value: string }];
  }];
}

// Our curated "Style Moods"
export type StyleMood = 'EXTREME_HEAT' | 'WARM_CASUAL' | 'MILD_BREEZE' | 'COLD_LAYERS' | 'RAIN_READY' | 'DEFAULT';

export interface WeatherStylistState {
  city: string | null;
  temperature: number | null;
  condition: string | null;
  styleMood: StyleMood;
  loading: boolean;
  error: string | null;
}

const CACHE_KEY = 'v1_weather_stylist_cache';
const CACHE_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

export function useWeatherStylist(targetCity: string = "Karachi") {
  const [state, setState] = useState<WeatherStylistState>({
    city: null,
    temperature: null,
    condition: null,
    styleMood: 'DEFAULT',
    loading: true,
    error: null,
  });

  // Rule Engine: Maps raw weather data into a curated Fashion Edit
  const determineStyleMood = (temp: number, condition: string): StyleMood => {
    const isRaining = condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('drizzle') || condition.toLowerCase().includes('thunderstorm') || condition.toLowerCase().includes('shower');
    
    if (isRaining) return 'RAIN_READY';
    if (temp >= 33) return 'EXTREME_HEAT';
    if (temp >= 24 && temp < 33) return 'WARM_CASUAL';
    if (temp >= 15 && temp < 24) return 'MILD_BREEZE';
    if (temp < 15) return 'COLD_LAYERS';
    
    return 'DEFAULT';
  };

  useEffect(() => {
    let isMounted = true;

    const fetchCityAndWeather = async () => {
      try {
        let cityToUse = targetCity;
        
        // 1. Fetch user's IP-based city if no specific targetCity is provided (or if it's the default Karachi)
        // We use ipapi.co as it's free and requires no key for client-side evaluation
        if (!targetCity || targetCity === "Karachi") {
             const ipRes = await fetch('https://ipapi.co/json/');
             if (ipRes.ok) {
                 const ipData = await ipRes.json();
                 if (ipData.city) {
                     cityToUse = ipData.city;
                 }
             }
        }

        // 2. Fetch Weather for that city
        const res = await fetch(`https://wttr.in/${cityToUse}?format=j1`);
        if (!res.ok) throw new Error('Weather API request failed');

        const data: WttrData = await res.json();
        const current = data.current_condition[0];
        
        const finalTemp = parseInt(current.temp_C, 10);
        const description = current.weatherDesc[0].value;
        const mood = determineStyleMood(finalTemp, description);

        const newState: WeatherStylistState = {
          city: cityToUse,
          temperature: finalTemp,
          condition: description,
          styleMood: mood,
          loading: false,
          error: null,
        };

        if (isMounted) {
          setState(newState);
          // Cache the result (using the determined city) to save API calls
          localStorage.setItem(`${CACHE_KEY}_${cityToUse}`, JSON.stringify({
            data: newState,
            timestamp: Date.now()
          }));
          // Also set a generic cache so we know we've processed their local weather recently
          localStorage.setItem(`${CACHE_KEY}_local_user`, JSON.stringify({
             city: cityToUse,
             timestamp: Date.now()
          }));
        }
      } catch (err: any) {
        if (isMounted) {
          setState(prev => ({ ...prev, loading: false, error: err.message || 'Failed to fetch weather' }));
        }
      }
    };

    const getLocalWeather = () => {
      // 1. Check if we recently resolved the user's local city
      const localString = localStorage.getItem(`${CACHE_KEY}_local_user`);
      let cityToCheck = targetCity;
      
      if (localString) {
          try {
              const localCache = JSON.parse(localString);
              if (Date.now() - localCache.timestamp < CACHE_EXPIRY_MS) {
                 cityToCheck = localCache.city;
              }
          } catch(e) {}
      }

      // 2. Check full Weather Cache for that specific city
      const cachedString = localStorage.getItem(`${CACHE_KEY}_${cityToCheck}`);
      if (cachedString) {
        try {
          const cache = JSON.parse(cachedString);
          if (Date.now() - cache.timestamp < CACHE_EXPIRY_MS) {
            setState(cache.data);
            return;
          }
        } catch (e) {
          // Ignore cache parse errors
        }
      }

      // 3. Fallback to API call if no cache or expired
      fetchCityAndWeather();
    };

    getLocalWeather();

    return () => {
      isMounted = false;
    };
  }, [targetCity]);

  return state;
}
