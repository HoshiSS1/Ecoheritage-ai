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
  | "feedback"
  | "climate"
  | "users";

export type ApiProvider = "openweather" | "iqair";
export type FeedbackSource = "user" | "seeded";
export type FeedbackStatus = "published" | "pending";

export interface RemedyRecord {
  id: string;
  name: string;
  ingredients: string;
  method: string;
  doctorNote: string;
  imageBase64?: string;
  updatedAt: string;
}

export interface FeedbackRecord {
  id: string;
  author: string;
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

// ─── Constants ───────────────────────────────────────────
export const ADMIN_SESSION_KEY = "ecoheritage_admin_session";
export const REMEDIES_STORAGE_KEY = "ecoheritage_admin_remedies";
export const FEEDBACK_STORAGE_KEY = "ecoheritage_admin_feedback";
export const CLIMATE_SETTINGS_STORAGE_KEY = "ecoheritage_admin_climate_settings";
export const CLIMATE_CACHE_STORAGE_KEY = "ecoheritage_admin_climate_cache";

export const ADMIN_USERNAME =
  import.meta.env.VITE_ADMIN_PORTAL_USER || "admin";
export const ADMIN_PASSWORD =
  import.meta.env.VITE_ADMIN_PORTAL_PASSWORD || "ecoheritage-admin";
export const DEFAULT_AQI_API_URL =
  import.meta.env.VITE_AQI_API_URL || "https://api.openweathermap.org/data/2.5";
export const DEFAULT_OPENWEATHER_KEY =
  import.meta.env.VITE_OPENWEATHER_API_KEY || "ad985e6b3d6f0c414479a1e1873d9c7c";
export const DEFAULT_LAT =
  import.meta.env.VITE_OPENWEATHER_LAT || "16.0544";
export const DEFAULT_LON =
  import.meta.env.VITE_OPENWEATHER_LON || "108.2022";

export const shellCardClass =
  "rounded-3xl border border-slate-200/60 bg-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.12)] hover:shadow-[0_30px_70px_-25px_rgba(15,23,42,0.18)] transition-all duration-500";

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
  return { label: "Nguy hại", tone: "bg-rose-50 text-rose-700 ring-rose-200", key: 'hazardous' };
}

export function buildClimateAdvice(aqi: number, pm25: number) {
  if (aqi > 150 || pm25 >= 55) {
    return "Chất lượng không khí đang ở mức đáng lo ngại. Khuyến nghị người dân hạn chế ra ngoài và đeo khẩu trang N95 khi di chuyển. Uống trà atiso đỏ để thanh lọc.";
  }
  if (aqi > 50 || pm25 >= 25) {
    return "Không khí ở mức trung bình. Những người nhạy cảm nên hạn chế hoạt động ngoài trời kéo dài. Bổ sung vitamin C và trà gừng mật ong.";
  }
  return "Không khí rất tốt! Đây là thời điểm lý tưởng để hoạt động ngoài trời, tập yoga hoặc thiền định giữa thiên nhiên. Tận hưởng bầu không khí Đà Nẵng.";
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
    
    // BACKUP: Save to ecoheritage_reviews as well to prevent data loss
    try {
      const publicRaw = localStorage.getItem("ecoheritage_reviews");
      const publicReviews = publicRaw ? JSON.parse(publicRaw) : [];
      publicReviews.unshift({
        id: newRecord.id,
        author: newRecord.author,
        comment: newRecord.content,
        rating: newRecord.satisfaction,
        date: newRecord.createdAt,
        remedyId: newRecord.category === "heritage" ? "heritage-general" : "web-general"
      });
      localStorage.setItem("ecoheritage_reviews", JSON.stringify(publicReviews));
    } catch (e) {
      console.error("Lỗi lưu backup public review:", e);
    }
    
    // Dispatch events for ALL tabs and components
    window.dispatchEvent(new Event("storage_sync")); 
    window.dispatchEvent(new StorageEvent("storage", { key: storageKey }));
    
    console.log("IT Expert: Đã lưu feedback mới vào 2 kho:", newRecord.id);
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
    openWeatherKey: DEFAULT_OPENWEATHER_KEY,
    iqAirKey: "",
    lat: DEFAULT_LAT,
    lon: DEFAULT_LON,
  };
}

export function createFallbackClimateSnapshot(): ClimateSnapshot {
  const now = Date.now();
  const trend: ClimateTrendPoint[] = Array.from({ length: 8 }, (_, i) => ({
    label: formatHourLabel(Math.floor(now / 1000) - (7 - i) * 3600),
    pm25: 12 + Math.random() * 6,
    aqi: 1,
    timestamp: Math.floor(now / 1000) - (7 - i) * 3600,
  }));

  return {
    aqi: 1,
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
