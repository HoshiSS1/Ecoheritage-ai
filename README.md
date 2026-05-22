<div align="center">

# 🌿 EcoHeritage AI

### _Nền tảng AI kết hợp Di sản Y học Cổ truyền Việt Nam_

[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.14-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Demo trực tuyến](https://ecoheritage.vn/) · [Báo lỗi](../../issues) · [Đề xuất tính năng](../../issues)

</div>

---

## 📖 Giới thiệu

**EcoHeritage AI** là nền tảng web thông minh kết hợp **trí tuệ nhân tạo (Gemini AI)** với **kho tàng y học cổ truyền Việt Nam**, tập trung vào khu vực **Đà Nẵng**. Ứng dụng cung cấp:

- 🌡️ **Dashboard Môi trường** — Theo dõi AQI, UV, gió, độ ẩm real-time với cảnh báo sức khỏe
- 🌿 **Kho Bài thuốc Dân gian** — 20+ công thức chi tiết (nguyên liệu, bước làm, lợi ích, keywords)
- 🗺️ **Bản đồ Di sản** — 12+ địa điểm thực tế tại Đà Nẵng với tọa độ GPS, cây thuốc, đánh giá
- 🤖 **Chatbot AI** — Lương y số tư vấn sức khỏe dựa trên y học cổ truyền
- 👤 **Hồ sơ Cá nhân** — Quản lý thành tựu, bộ sưu tập, bảo mật tài khoản
- ⚙️ **Admin Portal** — Quản trị nội dung di sản, bài thuốc, người dùng, phản hồi

---

## 🖼️ Screenshots

> _Coming soon — Các ảnh chụp màn hình chính sẽ được bổ sung tại đây._

---

## 🏗️ Kiến trúc & Công nghệ

### Frontend (SPA)

| Công nghệ | Mục đích |
|---|---|
| [React 18](https://react.dev/) | UI Library |
| [TypeScript 5.5](https://www.typescriptlang.org/) | Type-safe codebase |
| [Vite 6.3](https://vite.dev/) | Build tool & Dev server |
| [Tailwind CSS 4.1](https://tailwindcss.com/) | Utility-first CSS |
| [React Router 7](https://reactrouter.com/) | Client-side routing |
| [shadcn/ui + Radix UI](https://ui.shadcn.com/) | Accessible component library |
| [Motion (Framer)](https://motion.dev/) | Animations & transitions |
| [Recharts](https://recharts.org/) | Biểu đồ môi trường |
| [Leaflet + React Leaflet](https://react-leaflet.js.org/) | Bản đồ tương tác |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Gemini AI SDK](https://ai.google.dev/) | Chat AI / Lương y số |
| [Sonner](https://sonner.emilkowal.dev/) | Toast notifications |

### Backend (API Server)

| Công nghệ | Mục đích |
|---|---|
| [Express.js 4](https://expressjs.com/) | REST API server |
| [Prisma 5](https://www.prisma.io/) | ORM & database toolkit |
| [SQL Server](https://www.microsoft.com/sql-server) | Relational database |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe backend |

### Deploy & Infra

| Dịch vụ | Mục đích |
|---|---|
| [Vercel](https://vercel.com/) | Frontend hosting (SPA rewrite) |
| [OpenWeatherMap API](https://openweathermap.org/api) | Dữ liệu AQI / thời tiết real-time |
| [Google OAuth](https://developers.google.com/identity) | Đăng nhập bằng Google |

---

## 📂 Cấu trúc Dự án

```
📦 EcoHeritage-AI
┣ 📜 index.html                  # Entry point HTML
┣ 📜 vite.config.ts              # Vite + Tailwind + React config
┣ 📜 package.json                # Dependencies & scripts
┣ 📜 vercel.json                 # Vercel SPA rewrite rules
┣ 📜 tsconfig.json               # TypeScript config
┣ 📜 .env.local                  # Environment variables (🔒 không push)
┣ 📜 .gitignore
┣ 📜 .cursorrules                # AI coding rules
┣ 📂 docs/
┃ ┗ 📜 CONTRIBUTING.md           # Hướng dẫn đóng góp cho team
┣ 📂 public/                     # Static assets (favicon, images)
┣ 📂 src/
┃ ┣ 📜 main.tsx                  # React entry
┃ ┣ 📂 app/
┃ ┃ ┣ 📜 App.tsx                 # Root component + routing
┃ ┃ ┣ 📜 data.ts                 # Dữ liệu bài thuốc (remedies)
┃ ┃ ┣ 📜 heritageData.ts         # Dữ liệu di sản / địa điểm
┃ ┃ ┣ 📂 components/             # Shared UI components
┃ ┃ ┃ ┣ 📜 Navbar.tsx            # Navigation bar + dropdown "Kho tàng"
┃ ┃ ┃ ┣ 📜 Hero.tsx              # Landing hero section
┃ ┃ ┃ ┣ 📜 Footer.tsx            # Global footer
┃ ┃ ┃ ┣ 📜 AuthModal.tsx         # Login/Register modal
┃ ┃ ┃ ┣ 📜 HeritageMap.tsx       # Leaflet map component
┃ ┃ ┃ ┣ 📜 ChatWidget → widgets/ # AI chat widget (Gemini)
┃ ┃ ┃ ┣ 📂 ui/                   # shadcn/ui primitives
┃ ┃ ┃ ┗ ...                      # Các component khác
┃ ┃ ┣ 📂 pages/                  # Route pages
┃ ┃ ┃ ┣ 📜 HomePage.tsx          # Trang chủ + Dashboard AQI
┃ ┃ ┃ ┣ 📜 HeritagePage.tsx      # Kho bài thuốc dân gian
┃ ┃ ┃ ┣ 📜 HeritageMapPage.tsx   # Bản đồ di sản + dược liệu
┃ ┃ ┃ ┣ 📜 ProfilePage.tsx       # Hồ sơ cá nhân
┃ ┃ ┃ ┣ 📜 AdminPortalPage.tsx   # Admin portal entry
┃ ┃ ┃ ┗ 📂 admin/                # Admin modules
┃ ┃ ┃   ┣ 📜 DashboardSection    # Thống kê tổng quan
┃ ┃ ┃   ┣ 📜 HeritageCMS         # CRUD bài thuốc
┃ ┃ ┃   ┣ 📜 LocationCMS         # CRUD địa điểm di sản
┃ ┃ ┃   ┣ 📜 FeedbackSection     # Quản lý phản hồi
┃ ┃ ┃   ┣ 📜 UsersSection        # Quản lý người dùng
┃ ┃ ┃   ┗ 📜 VaultSection        # Kho lưu trữ
┃ ┃ ┣ 📂 utils/                  # Utility functions
┃ ┃ ┃ ┣ 📜 airQuality.ts         # AQI calculation & API
┃ ┃ ┃ ┣ 📜 avatarUtils.ts        # Avatar generation
┃ ┃ ┃ ┗ 📜 crypto.ts             # Password hashing
┃ ┃ ┗ 📂 widgets/
┃ ┃   ┗ 📜 ChatWidget.tsx        # Gemini AI chatbot
┃ ┣ 📂 components/               # Global shared components
┃ ┣ 📂 styles/                   # Global CSS
┃ ┗ 📂 types/                    # TypeScript type definitions
┗ 📂 server/                     # Backend API
  ┣ 📜 package.json
  ┣ 📂 src/
  ┃ ┗ 📜 index.ts                # Express server entry
  ┗ 📂 prisma/
    ┣ 📜 schema.prisma            # Database models (User, Heritage, Remedy, Review)
    ┗ 📜 seed.js                  # Seed data
```

---

## 🚀 Cài đặt & Chạy

### Yêu cầu hệ thống

- **Node.js** ≥ 18
- **npm** ≥ 9 hoặc **pnpm**
- **SQL Server** (cho backend — tùy chọn)

### 1. Clone dự án

```bash
git clone https://github.com/HoshiSS1/Ecoheritage-ai.git
cd Ecoheritage-ai
```

### 2. Cấu hình biến môi trường

Tạo file `.env.local` ở thư mục gốc:

```env
# AI
VITE_GEMINI_KEY=your_gemini_api_key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Weather / AQI
VITE_AQI_API_URL=https://api.openweathermap.org/data/2.5
VITE_OPENWEATHER_API_KEY=your_openweather_key
VITE_OPENWEATHER_LAT=16.0544
VITE_OPENWEATHER_LON=108.2022

# Admin Portal
VITE_ADMIN_PORTAL_USER=admin
VITE_ADMIN_PORTAL_PASSWORD=your_admin_password
```

### 3. Cài đặt dependencies & chạy

```bash
# Frontend
npm install
npm run dev
```

```bash
# Backend (tùy chọn — trong thư mục server/)
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev
```

```bash
# Hoặc chạy cả 2 cùng lúc
npm run dev:all
```

### 4. Truy cập

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3000](http://localhost:3000) _(nếu chạy server)_

---

## 🛤️ Routes chính

| Route | Trang | Mô tả |
|---|---|---|
| `/` | HomePage | Dashboard AQI + Landing |
| `/heritage` | HeritagePage | Kho bài thuốc dân gian |
| `/heritage/map` | HeritageMapPage | Bản đồ di sản & dược liệu |
| `/profile` | ProfilePage | Hồ sơ cá nhân |
| `/admin-portal` | AdminPortalPage | Quản trị hệ thống |

---

## 📊 Database Schema

```
User (1) ──── (N) Review (N) ──── (1) Heritage (1) ──── (N) Remedy
```

4 models chính: **User**, **Heritage**, **Remedy**, **Review** — quan hệ qua Prisma ORM trên SQL Server.

---

## 🧪 Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy frontend dev server (Vite) |
| `npm run build` | Build production bundle |
| `npm run dev:all` | Chạy frontend + backend song song |

---

## 📝 Đóng góp

Xem [CONTRIBUTING.md](docs/CONTRIBUTING.md) để biết luật chơi khi đóng góp code vào dự án.

---

## 📄 Giấy phép & Ghi nhận

- Dự án sử dụng giấy phép **MIT**
- Xem [ATTRIBUTIONS.md](ATTRIBUTIONS.md) để biết nguồn gốc các thư viện/assets sử dụng

---

## 👥 Nhóm phát triển

**BestStudent VKU** — Đại học Công nghệ thông tin và Truyền thông Việt - Hàn (VKU), Đà Nẵng

---

<div align="center">

_Được xây dựng với 💚 bởi BestStudent VKU — Kết nối Công nghệ hiện đại với Di sản Y học Việt Nam_

</div>
