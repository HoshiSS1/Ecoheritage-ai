/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_KEY?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_OPENWEATHER_API_KEY?: string;
  readonly VITE_OPENWEATHER_LAT?: string;
  readonly VITE_OPENWEATHER_LON?: string;
  readonly VITE_AQI_API_URL?: string;
  readonly VITE_ADMIN_PORTAL_USER?: string;
  readonly VITE_ADMIN_PORTAL_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
