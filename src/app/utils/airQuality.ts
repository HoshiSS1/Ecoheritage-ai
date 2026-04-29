const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "ad985e6b3d6f0c414479a1e1873d9c7c";
const DEFAULT_LAT = import.meta.env.VITE_OPENWEATHER_LAT || "16.0544"; 
const DEFAULT_LON = import.meta.env.VITE_OPENWEATHER_LON || "108.2022";
const BASE_URL = import.meta.env.VITE_AQI_API_URL || "https://api.openweathermap.org/data/2.5";

export interface AirQualityData {
  aqi: number;
  pm25: number;
  status: 'good' | 'moderate' | 'unhealthy' | 'hazardous';
  description: string;
  uvIndex: number;
  humidity: number;
  windSpeed: number;
}

export async function fetchAirQuality(): Promise<AirQualityData> {
  try {
    // 1. Fetch Pollution
    const pollRes = await fetch(
      `${BASE_URL}/air_pollution?lat=${DEFAULT_LAT}&lon=${DEFAULT_LON}&appid=${API_KEY}`
    );
    
    // 2. Fetch Weather (Humidity, Wind)
    const weatherRes = await fetch(
      `${BASE_URL}/weather?lat=${DEFAULT_LAT}&lon=${DEFAULT_LON}&units=metric&appid=${API_KEY}`
    );

    const pollData = await pollRes.json();
    const weatherData = await weatherRes.json();

    const currentPoll = pollData.list[0];
    const aqi = currentPoll.main.aqi; // 1-5
    const pm25 = currentPoll.components.pm2_5;
    
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const uvIndex = 8; // Fallback for UV (as standard API needs OneCall which is paid/restricted)

    // --- Dynamic AQI Logic ---
    let aqiStatus: AirQualityData['status'] = 'good';
    let aqiDesc = "";
    if (aqi <= 2) {
      aqiStatus = 'good';
      aqiDesc = "Hôm nay Đà Nẵng thật trong lành! Hãy hít thở sâu và tận hưởng khí trời.";
    } else if (aqi === 3) {
      aqiStatus = 'moderate';
      aqiDesc = "Không khí ở mức trung bình. Những người nhạy cảm nên hạn chế hoạt động ngoài trời.";
    } else {
      aqiStatus = 'unhealthy';
      aqiDesc = "Chất lượng không khí kém. Hãy đeo khẩu trang và bảo vệ hệ hô hấp.";
    }

    return { 
      aqi, 
      pm25, 
      status: aqiStatus, 
      description: aqiDesc,
      uvIndex,
      humidity,
      windSpeed
    };
  } catch (error) {
    console.error("Weather Fetch Error:", error);
    return {
      aqi: 2,
      pm25: 15,
      status: 'good',
      description: "Đang cập nhật dữ liệu nhịp thở thành phố...",
      uvIndex: 5,
      humidity: 65,
      windSpeed: 3.5
    };
  }
}
