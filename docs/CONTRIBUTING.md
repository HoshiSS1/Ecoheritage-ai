# 🤝 Hướng dẫn Đóng góp — EcoHeritage AI

Cảm ơn bạn đã quan tâm đến EcoHeritage AI! Tài liệu này là **"luật chơi"** giúp anh em trong team làm việc nhất quán, hiệu quả và vui vẻ.

---

## 📋 Mục lục

- [Trước khi bắt đầu](#-trước-khi-bắt-đầu)
- [Quy trình làm việc](#-quy-trình-làm-việc)
- [Branch & Commit](#-branch--commit)
- [Pull Request](#-pull-request)
- [Code Standards](#-code-standards)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Chạy & Kiểm tra](#-chạy--kiểm-tra)
- [Những điều KHÔNG nên làm](#-những-điều-không-nên-làm)
- [Liên hệ & Hỗ trợ](#-liên-hệ--hỗ-trợ)

---

## 🔰 Trước khi bắt đầu

### 1. Clone & Setup

```bash
git clone https://github.com/HoshiSS1/Ecoheritage-ai.git
cd Ecoheritage-ai
npm install
```

### 2. Tạo file `.env.local`

Copy nội dung từ team leader hoặc tham khảo [README.md](../README.md#2-cấu-hình-biến-môi-trường). **KHÔNG tự tạo API key riêng** trừ khi được cho phép.

### 3. Chạy dev server

```bash
npm run dev        # Frontend only
npm run dev:all    # Frontend + Backend
```

### 4. Đọc hiểu codebase

- Đọc [README.md](../README.md) để hiểu kiến trúc tổng quan
- Đọc [.cursorrules](../.cursorrules) để nắm quy ước code
- Xem qua [TODO.md](../TODO.md) để biết công việc đang triển khai

---

## 🔄 Quy trình làm việc

Chúng ta dùng quy trình **Feature Branch Workflow**:

```
main (production-ready)
  └── feature/ten-tinh-nang   ← Tạo branch mới từ main
        └── Commit → Commit → Commit
              └── Push → Tạo PR → Review → Merge vào main
```

### Từng bước cụ thể

```bash
# 1. Cập nhật main mới nhất
git checkout main
git pull origin main

# 2. Tạo branch mới
git checkout -b feature/ten-tinh-nang

# 3. Code & commit thường xuyên
git add .
git commit -m "feat(component): mô tả thay đổi"

# 4. Push lên remote
git push origin feature/ten-tinh-nang

# 5. Tạo Pull Request trên GitHub
# 6. Chờ review → fix feedback → merge
```

---

## 🌿 Branch & Commit

### Đặt tên Branch

| Prefix | Khi nào dùng | Ví dụ |
|---|---|---|
| `feature/` | Thêm tính năng mới | `feature/search-remedies` |
| `fix/` | Sửa bug | `fix/navbar-mobile-overflow` |
| `refactor/` | Tái cấu trúc code | `refactor/admin-form-shell` |
| `docs/` | Cập nhật tài liệu | `docs/update-readme` |
| `style/` | Chỉnh CSS / UI | `style/profile-responsive` |
| `hotfix/` | Sửa nóng production | `hotfix/auth-crash` |

### Commit Message

Theo format [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <mô tả ngắn gọn>
```

**Types hợp lệ:**

| Type | Ý nghĩa |
|---|---|
| `feat` | Thêm feature mới |
| `fix` | Sửa bug |
| `refactor` | Refactor code (không đổi behavior) |
| `style` | Chỉnh CSS, format code (không đổi logic) |
| `docs` | Cập nhật tài liệu |
| `chore` | Config, dependencies, build scripts |
| `test` | Thêm/sửa test |
| `perf` | Cải thiện hiệu năng |

**Ví dụ tốt:**
```
feat(heritage-map): thêm popup chi tiết khi click marker
fix(auth): sửa lỗi Google OAuth redirect loop
refactor(admin): tách toolbar thành component riêng
style(navbar): chỉnh dropdown animation mượt hơn
docs(readme): bổ sung hướng dẫn setup backend
```

**Ví dụ XẤU — TRÁNH:**
```
❌ update code
❌ fix bug
❌ wip
❌ asdkfjaskdf
❌ commit cuối ngày
```

---

## 📬 Pull Request

### Tạo PR

Khi tạo Pull Request trên GitHub, điền đầy đủ thông tin:

```markdown
## 📌 Mô tả
<!-- PR này làm gì? Tại sao? -->

## 🔧 Thay đổi chính
- [ ] File 1: mô tả thay đổi
- [ ] File 2: mô tả thay đổi

## 📸 Screenshots (nếu có thay đổi UI)
<!-- Paste ảnh trước/sau -->

## ✅ Checklist
- [ ] Code chạy được (`npm run dev`)
- [ ] Build thành công (`npm run build`)
- [ ] Đã test trên mobile & desktop
- [ ] Không có lỗi TypeScript
- [ ] Commit messages đúng format
```

### Review Rules

- **Tối thiểu 1 approval** trước khi merge
- Reviewer kiểm tra: logic đúng, code sạch, UI khớp design, không break existing features
- Author phải fix hết feedback trước khi merge
- **Squash merge** vào main để giữ history sạch

---

## 📐 Code Standards

### TypeScript — Bắt buộc

```typescript
// ✅ TỐT
interface HeritageCardProps {
  name: string;
  description: string;
  rating?: number;
}

export function HeritageCard({ name, description, rating }: HeritageCardProps) {
  return <div>...</div>;
}

// ❌ XẤU
export function HeritageCard(props: any) {
  return <div>...</div>;
}
```

### React Component

```typescript
// ✅ TỐT — Function component + typed props
interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

export function SearchBar({ placeholder = "Tìm kiếm...", onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    onSearch(query.trim());
  };

  return (
    <div className="flex items-center gap-2">
      <input
        className="rounded-lg border px-4 py-2"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSubmit}>Tìm</button>
    </div>
  );
}
```

### Styling — Tailwind CSS

```tsx
// ✅ TỐT — Dùng Tailwind classes + cn() để merge
import { cn } from "@/lib/utils";

<div className={cn(
  "rounded-xl bg-white/80 backdrop-blur p-6 shadow-lg",
  "transition-all duration-300 hover:shadow-xl",
  isActive && "ring-2 ring-emerald-500"
)} />

// ❌ XẤU — Inline styles
<div style={{ borderRadius: 12, padding: 24, backgroundColor: "white" }} />
```

### Ngôn ngữ

| Vị trí | Ngôn ngữ |
|---|---|
| Variable, function, class names | Tiếng Anh |
| Comments kỹ thuật | Tiếng Anh |
| UI text (labels, buttons, messages) | Tiếng Việt |
| Commit messages | Tiếng Anh type + Tiếng Việt mô tả |
| Documentation | Tiếng Việt |

---

## 📁 Cấu trúc thư mục

Đặt file đúng chỗ — xem chi tiết trong [.cursorrules](../.cursorrules#3-cấu-trúc-thư-mục--quy-tắc-đặt-file).

**Tóm tắt nhanh:**

| Loại file | Đặt ở đâu |
|---|---|
| Component dùng chung | `src/app/components/` |
| Page component | `src/app/pages/[TenPage]Page.tsx` |
| Admin module | `src/app/pages/admin/[TenModule].tsx` |
| Custom hook | `src/app/hooks/use[Ten].ts` |
| Utility function | `src/app/utils/[ten].ts` |
| Type definitions | `src/types/[domain].ts` |
| shadcn/ui primitives | `src/app/components/ui/` *(KHÔNG sửa trực tiếp)* |

---

## 🧪 Chạy & Kiểm tra

### Trước khi tạo PR, đảm bảo:

```bash
# 1. Code chạy được
npm run dev

# 2. Build không lỗi
npm run build

# 3. Kiểm tra các route chính
# /              → HomePage
# /heritage      → HeritagePage
# /heritage/map  → HeritageMapPage
# /profile       → ProfilePage
# /admin-portal  → AdminPortalPage
```

### Kiểm tra thủ công

- [ ] Navbar hoạt động đúng (desktop dropdown + mobile menu)
- [ ] Responsive: test trên 375px (mobile), 768px (tablet), 1440px (desktop)
- [ ] Dark mode không bị vỡ layout
- [ ] Form inputs: font-size đủ lớn, placeholder rõ ràng
- [ ] Không có console errors/warnings

---

## 🚫 Những điều KHÔNG nên làm

| ❌ KHÔNG | ✅ THAY VÌ |
|---|---|
| Push thẳng vào `main` | Tạo branch → PR → Review → Merge |
| Commit file `.env` / `.env.local` | Thêm vào `.gitignore` (đã có sẵn) |
| Dùng `any` type trong TypeScript | Dùng `unknown` rồi narrow type |
| Viết inline CSS styles | Dùng Tailwind CSS classes |
| Thêm thư viện mới không hỏi team | Discuss trong group chat trước |
| Sửa file trong `components/ui/` | Báo team leader nếu cần customize |
| Commit message "fix bug", "update" | Dùng Conventional Commits format |
| Hardcode API keys / secrets | Dùng environment variables |
| Xóa comments/code người khác | Hỏi trước hoặc ghi chú trong PR |

---

## 🆘 Liên hệ & Hỗ trợ

- **Gặp lỗi khi setup?** → Hỏi trong nhóm chat team
- **Không chắc code nên đặt ở đâu?** → Xem [.cursorrules](../.cursorrules) hoặc hỏi team leader
- **Muốn đề xuất feature mới?** → Tạo Issue trên GitHub với label `enhancement`
- **Phát hiện bug?** → Tạo Issue trên GitHub với label `bug` + steps to reproduce

---

<div align="center">

**Happy coding! 🌿**

_"Code sạch, commit chuẩn, review kỹ — ship nhanh mà không sợ bug"_

— Team BestStudent VKU

</div>
