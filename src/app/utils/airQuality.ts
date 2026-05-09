const DEFAULT_LAT = import.meta.env.VITE_OPENWEATHER_LAT || "16.0544";
const DEFAULT_LON = import.meta.env.VITE_OPENWEATHER_LON || "108.2022";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

export interface AirQualityData {
  aqi: number;
  pm25: number;
  status: "good" | "moderate" | "unhealthy" | "hazardous";
  statusLabel: string;
  description: string;
  uvIndex: number;
  humidity: number;
  windSpeed: number;
  updatedAt: string;
  source: "live" | "fallback";
}

export interface EnvironmentTrendPoint {
  time: string;
  timestamp: string;
  aqi: number;
  uv: number;
  humidity: number;
  pm25: number;
}

function buildUrl(base: string, params: Record<string, string>) {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Environment API failed: ${response.status}`);
  }
  return response.json();
}

export function getAqiStatus(aqi: number): Pick<AirQualityData, "status" | "statusLabel" | "description"> {
  if (aqi <= 50) {
    return {
      status: "good",
      statusLabel: "Tốt",
      description: "Không khí đang ở mức tốt. Đây là thời điểm phù hợp cho các hoạt động ngoài trời nhẹ.",
    };
  }

  if (aqi <= 100) {
    return {
      status: "moderate",
      statusLabel: "Trung bình",
      description: "Không khí ở mức trung bình. Người nhạy cảm nên theo dõi triệu chứng hô hấp khi ở ngoài trời lâu.",
    };
  }

  if (aqi <= 150) {
    return {
      status: "unhealthy",
      statusLabel: "Kém với nhóm nhạy cảm",
      description: "Nhóm nhạy cảm nên hạn chế vận động mạnh ngoài trời và cân nhắc dùng khẩu trang lọc bụi mịn.",
    };
  }

  return {
    status: "hazardous",
    statusLabel: "Không lành mạnh",
    description: "Không khí đang kém. Nên giảm thời gian ngoài trời, đóng cửa và dùng máy lọc không khí nếu có.",
  };
}

function fallbackNow(): AirQualityData {
  const hr = new Date().getHours();
  // Realistic UV index by hour if live data fails (roughly)
  let uv = 0;
  if (hr >= 6 && hr <= 17) {
    uv = hr >= 10 && hr <= 14 ? 7.5 : 3.2;
  }
  
  return {
    aqi: 42,
    pm25: 14.5,
    ...getAqiStatus(42),
    uvIndex: uv,
    humidity: 72,
    windSpeed: 2.8,
    updatedAt: new Date().toISOString(),
    source: "fallback",
  };
}

export async function fetchAirQuality(signal?: AbortSignal): Promise<AirQualityData> {
  try {
    const airUrl = buildUrl(AIR_QUALITY_URL, {
      latitude: DEFAULT_LAT,
      longitude: DEFAULT_LON,
      current: "us_aqi,pm2_5,uv_index",
      timezone: "Asia/Bangkok",
    });

    const weatherUrl = buildUrl(WEATHER_URL, {
      latitude: DEFAULT_LAT,
      longitude: DEFAULT_LON,
      current: "relative_humidity_2m,wind_speed_10m",
      wind_speed_unit: "ms",
      timezone: "Asia/Bangkok",
    });

    const [air, weather] = await Promise.all([
      fetchJson<any>(airUrl, signal),
      fetchJson<any>(weatherUrl, signal),
    ]);

    const aqi = Math.round(Number(air.current?.us_aqi ?? 0));
    const pm25 = Number(Number(air.current?.pm2_5 ?? 0).toFixed(1));
    // If UV index is 0 because it's night, we keep it 0. But if it's 0 during the day, we might have a data gap.
    const uvIndexRaw = Number(air.current?.uv_index ?? 0);
    const uvIndex = Number(uvIndexRaw.toFixed(1));
    const humidity = Math.round(Number(weather.current?.relative_humidity_2m ?? 0));
    const windSpeed = Number(Number(weather.current?.wind_speed_10m ?? 0).toFixed(1));
    const status = getAqiStatus(aqi);

    return {
      aqi,
      pm25,
      ...status,
      uvIndex,
      humidity,
      windSpeed,
      updatedAt: air.current?.time || weather.current?.time || new Date().toISOString(),
      source: "live",
    };
  } catch (error) {
    console.error("Environment fetch error:", error);
    return fallbackNow();
  }
}

export async function fetchEnvironmentTrend(signal?: AbortSignal): Promise<EnvironmentTrendPoint[]> {
  const airUrl = buildUrl(AIR_QUALITY_URL, {
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LON,
    hourly: "us_aqi,pm2_5,uv_index",
    past_hours: "24",
    forecast_hours: "1",
    timezone: "Asia/Bangkok",
  });

  const weatherUrl = buildUrl(WEATHER_URL, {
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LON,
    hourly: "relative_humidity_2m",
    past_hours: "24",
    forecast_hours: "1",
    timezone: "Asia/Bangkok",
  });

  const [air, weather] = await Promise.all([
    fetchJson<any>(airUrl, signal),
    fetchJson<any>(weatherUrl, signal),
  ]);

  const humidityByTime = new Map<string, number>();
  (weather.hourly?.time || []).forEach((time: string, index: number) => {
    humidityByTime.set(time, Math.round(Number(weather.hourly.relative_humidity_2m?.[index] ?? 0)));
  });

  return (air.hourly?.time || [])
    .map((time: string, index: number) => ({
      timestamp: time,
      time: new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date(time)),
      aqi: Math.round(Number(air.hourly.us_aqi?.[index] ?? 0)),
      pm25: Number(Number(air.hourly.pm2_5?.[index] ?? 0).toFixed(1)),
      uv: Number(Number(air.hourly.uv_index?.[index] ?? 0).toFixed(1)),
      humidity: humidityByTime.get(time) ?? 0,
    }))
    .filter((point: EnvironmentTrendPoint) => point.aqi > 0 || point.humidity > 0)
    .filter((_: EnvironmentTrendPoint, index: number) => index % 2 === 0)
    .slice(-12);
}
