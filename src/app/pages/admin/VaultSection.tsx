import { useState } from "react";
import { Database, MapPin, Search } from "lucide-react";
import { HeritageCMS } from "@/app/pages/admin/HeritageCMS";
import { LocationCMS } from "@/app/pages/admin/LocationCMS";

export function VaultSection() {
  const [activeTab, setActiveTab] = useState<"heritage" | "locations">("heritage");

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Module 2</p>
          <h2 className="mt-2 text-3xl font-black tracking-tighter text-white sm:text-4xl">Kho tàng Di sản</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-emerald-100/60 font-medium italic">"Quản lý chung cả Di sản và Bản đồ dược liệu trong cùng một không gian thao tác cao cấp. Đảm bảo tính toàn vẹn của tri thức y học cổ truyền."</p>
        </div>

        <div className="inline-flex rounded-full bg-white/5 p-1.5 border border-white/10 shadow-lg backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setActiveTab("heritage")}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === "heritage" ? "bg-emerald-500 text-[#051a11] shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "text-emerald-100/40 hover:text-emerald-100"}`}
          >
            <Database className="h-3.5 w-3.5" /> Di sản
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("locations")}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === "locations" ? "bg-emerald-500 text-[#051a11] shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "text-emerald-100/40 hover:text-emerald-100"}`}
          >
            <MapPin className="h-3.5 w-3.5" /> Bản đồ
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-[2rem] border border-white/10 bg-[#0a2e1f]/40 backdrop-blur-2xl shadow-xl p-5 sm:p-6 overflow-hidden relative">
        <div className="absolute right-0 top-0 h-full w-1 bg-emerald-500/50" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 text-emerald-100">
            <div className="rounded-2xl bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20 shadow-lg">
              <Search className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Chế độ xem tập trung</p>
              <p className="text-xs text-emerald-100/40 font-medium">Hệ thống đang hiển thị dữ liệu {activeTab === "heritage" ? "bài thuốc dân gian" : "tọa độ thảo mộc"}.</p>
            </div>
          </div>
          <div className="rounded-xl bg-emerald-500/10 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/20">
            {activeTab === "heritage" ? "Heritage Management Active" : "Geographical Data Active"}
          </div>
        </div>
      </div>

      {activeTab === "heritage" ? <HeritageCMS /> : <LocationCMS />}
    </div>
  );
}
