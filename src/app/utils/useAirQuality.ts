import { useState, useEffect } from 'react';
import { fetchAirQuality, AirQualityData } from '../utils/airQuality';

export function useAirQuality() {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);

  const updateAQI = async () => {
    setLoading(true);
    try {
      const freshData = await fetchAirQuality();
      setData(freshData);
      localStorage.setItem('ecoheritage_aqi_cache_v3', JSON.stringify({
        data: freshData,
        timestamp: Date.now()
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const cached = localStorage.getItem('ecoheritage_aqi_cache_v3');
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 15 * 60 * 1000) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }
    } catch {
      localStorage.removeItem('ecoheritage_aqi_cache_v3');
    }
    updateAQI();
  }, []);

  return { data, loading, refresh: updateAQI };
}
