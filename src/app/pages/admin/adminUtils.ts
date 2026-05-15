import { FormEvent } from "react";
import { toast } from "sonner";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Types ───────────────────────────────────────────────
export type AdminSectionId =
  | "overview"
  | "heritage"
  | "locations"
  | "feedback"
  | "users";

export type ApiProvider = "openweather" | "iqair";
export type FeedbackSource = "user" | "seeded";
export type FeedbackStatus = "published" | "pending";

export interface RemedyRecord {
  id: string;
  name: string;
  category: string;
  ingredients: string;
  method: string;
  doctorNote: string;
  benefits: string;
  description: string;
  status: "published" | "draft";
  imageBase64?: string;
  updatedAt: string;
}

export interface FeedbackRecord {
  id: string;
  author: string;
  authorEmail?: string;
  remedyUsed: string;
  content: string;
  satisfaction: number;
  source: FeedbackSource;
  status: FeedbackStatus;
  category?: "web" | "heritage";
  isFeatured?: boolean;
  isRead?: boolean;
  createdAt: string;
}

export interface ClimateSettings {
  provider: ApiProvider;
  openWeatherKey: string;
  iqAirKey: string;
  lat: string;
  lon: string;
}

export interface ClimateTrendPoint {
  label: string;
  pm25: number;
  aqi: number;
  timestamp: number;
}

export interface ClimateSnapshot {
  aqi: number;
  pm25: number;
  source: "live" | "fallback";
  updatedAt: string;
  statusLabel: string;
  statusTone: string;
  advisory: string;
  trend: ClimateTrendPoint[];
}

export interface LocationRecord {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  status: string;
  level: string;
  herbs: string;
  regulations: string;
  type: string;
  color: string;
  imageBase64?: string;
  image?: string;
  isVisible?: boolean;
  history?: string;
  bestTime?: string;
  contact?: string;
  updatedAt: string;
}

// ─── Constants ───────────────────────────────────────────
export const DATA_VERSION = "1.2.1"; // Update this when making breaking changes to data structure
export const ADMIN_SESSION_KEY = "ecoheritage_admin_session_v" + DATA_VERSION;
export const REMEDIES_STORAGE_KEY = "ecoheritage_admin_remedies_v" + DATA_VERSION;
export const FEEDBACK_STORAGE_KEY = "ecoheritage_admin_feedback_v" + DATA_VERSION;
export const LOCATIONS_STORAGE_KEY = "ecoheritage_admin_locations_v" + DATA_VERSION;
export const CLIMATE_CACHE_STORAGE_KEY = "ecoheritage_admin_climate_cache_v" + DATA_VERSION;
export const VERSION_CHECK_KEY = "ecoheritage_data_version";

export const ADMIN_USERNAME =
  import.meta.env.VITE_ADMIN_PORTAL_USER || "admin";
export const ADMIN_PASSWORD =
  import.meta.env.VITE_ADMIN_PORTAL_PASSWORD || "ecoheritage-admin";
export const DEFAULT_AQI_API_URL =
  import.meta.env.VITE_AQI_API_URL || "https://api.openweathermap.org/data/2.5";
export const DEFAULT_OPENWEATHER_KEY =
  import.meta.env.VITE_OPENWEATHER_API_KEY || "";
export const DEFAULT_LAT =
  import.meta.env.VITE_OPENWEATHER_LAT || "16.0544";
export const DEFAULT_LON =
  import.meta.env.VITE_OPENWEATHER_LON || "108.2022";

export const shellCardClass =
  "rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] transition-all duration-500 overflow-hidden relative group/card";

// ─── Utility Functions ───────────────────────────────────
export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatHourLabel(timestamp: number) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000));
}

export function getStatusFromAqi(aqi: number) {
  // Chuẩn hóa nhãn theo chỉ số thực tế (Dành cho AQI US hoặc AQI scaled 0-100)
  if (aqi <= 50) return { label: "Tốt", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200", key: 'good' };
  if (aqi <= 100) return { label: "Trung bình", tone: "bg-amber-50 text-amber-700 ring-amber-200", key: 'moderate' };
  if (aqi <= 150) return { label: "Kém", tone: "bg-orange-50 text-orange-700 ring-orange-200", key: 'unhealthy' };
  if (aqi <= 200) return { label: "Rất kém", tone: "bg-rose-50 text-rose-700 ring-rose-200", key: 'very_unhealthy' };
  return { label: "Nguy hại", tone: "bg-purple-50 text-purple-700 ring-purple-200", key: 'hazardous' };
}

export function buildClimateAdvice(aqi: number, pm25: number) {
  if (aqi > 200 || pm25 >= 75) {
    return "Chất lượng không khí Nguy hại. Khẩn cấp: Không nên ra ngoài. Sử dụng máy lọc không khí và uống nước lá Sen thanh lọc phổi.";
  }
  if (aqi > 150 || pm25 >= 55) {
    return "Không khí Rất kém. Khuyến nghị người dân hạn chế ra ngoài, đeo khẩu trang chuyên dụng. Bổ sung trà Atiso đỏ để hỗ trợ hô hấp.";
  }
  if (aqi > 100 || pm25 >= 35) {
    return "Không khí Kém. Nhóm người nhạy cảm nên ở trong nhà. Khuyên dùng trà Gừng mật ong để làm ấm và sạch đường hô hấp.";
  }
  if (aqi > 50 || pm25 >= 15) {
    return "Không khí Trung bình. Những người nhạy cảm nên hạn chế hoạt động mạnh ngoài trời. Bổ sung vitamin C từ cam, bưởi.";
  }
  return "Không khí Tuyệt vời! Đây là thời điểm lý tưởng để tập luyện dưỡng sinh và hít thở sâu giữa thiên nhiên Đà Nẵng.";
}

export function loadStoredState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Lỗi parse storage cho key ${key}:`, e);
    return fallback;
  }
}

/**
 * IT Expert Unified Sync Helper
 * Đảm bảo mọi form đều gởi dữ liệu theo một chuẩn duy nhất
 */
export function saveAdminFeedback(record: Partial<FeedbackRecord>) {
  try {
    const storageKey = FEEDBACK_STORAGE_KEY;
    // IT Expert Fix: Load current OR initialize with seed if empty to prevent data loss
    const raw = localStorage.getItem(storageKey);
    let feedback: FeedbackRecord[] = [];
    
    if (raw) {
      try {
        feedback = JSON.parse(raw);
      } catch (e) {
        console.error("Lỗi parse feedback trong saveAdminFeedback:", e);
        feedback = [];
      }
    }
    
    const newRecord: FeedbackRecord = {
      id: record.id || `fb-${Date.now()}`,
      author: record.author || "Ẩn danh",
      authorEmail: record.authorEmail || "",
      remedyUsed: record.remedyUsed || "Nền tảng",
      content: record.content || "",
      satisfaction: record.satisfaction || 5,
      source: record.source || "user",
      status: record.status || "pending",
      category: record.category || "web",
      isFeatured: !!record.isFeatured,
      isRead: false,
      createdAt: record.createdAt || new Date().toISOString()
    };

    feedback.unshift(newRecord);
    localStorage.setItem(storageKey, JSON.stringify(feedback));
    
    // Dispatch events for ALL tabs and components
    window.dispatchEvent(new Event("storage_sync")); 
    window.dispatchEvent(new StorageEvent("storage", { key: storageKey }));
    
    return newRecord;
  } catch (e) {
    console.error("Lỗi chí mạng gởi feedback Admin:", e);
    return null;
  }
}

export function loadAdminSession(): boolean {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.authenticated === true;
  } catch {
    return false;
  }
}

export function getDefaultClimateSettings(): ClimateSettings {
  return {
    provider: "openweather",
    openWeatherKey: import.meta.env.VITE_OPENWEATHER_API_KEY || DEFAULT_OPENWEATHER_KEY,
    iqAirKey: "",
    lat: import.meta.env.VITE_OPENWEATHER_LAT || DEFAULT_LAT,
    lon: import.meta.env.VITE_OPENWEATHER_LON || DEFAULT_LON,
  };
}

export function createFallbackClimateSnapshot(): ClimateSnapshot {
  const now = Date.now();
  const trend: ClimateTrendPoint[] = Array.from({ length: 8 }, (_, i) => ({
    label: formatHourLabel(Math.floor(now / 1000) - (7 - i) * 3600),
    pm25: 12 + Math.random() * 6,
    aqi: 40,
    timestamp: Math.floor(now / 1000) - (7 - i) * 3600,
  }));

  return {
    aqi: 40,
    pm25: 14.2,
    source: "fallback",
    updatedAt: new Date().toISOString(),
    statusLabel: "Tốt",
    statusTone: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    advisory: buildClimateAdvice(1, 14.2),
    trend,
  };
}

// ─── Image Compression ───────────────────────────────────
export function compressImage(
  file: File,
  maxWidth = 600,
  maxHeight = 600,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh quá lớn (>5MB). Vui lòng chọn ảnh nhỏ hơn.");
      reject(new Error("File too large"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Scale down proportionally
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL("image/jpeg", quality);
        resolve(compressed);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
