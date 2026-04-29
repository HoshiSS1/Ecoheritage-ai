import { useState, useEffect } from 'react';
import { fetchAirQuality, AirQualityData } from '../utils/airQuality';

export function useAirQuality() {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);

  const updateAQI = async () => {
    setLoading(true);
    const freshData = await fetchAirQuality();
    setData(freshData);
    setLoading(false);
    localStorage.setItem('ecoheritage_aqi_cache_v2', JSON.stringify({
      data: freshData,
      timestamp: Date.now()
    }));
  };

  useEffect(() => {
    const cached = localStorage.getItem('ecoheritage_aqi_cache_v2');
    if (cached) {
      const { data: cachedData, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 30 * 60 * 1000) {
        setData(cachedData);
        setLoading(false);
        return;
      }
    }
    updateAQI();
  }, []);

  return { data, loading, refresh: updateAQI };
}
