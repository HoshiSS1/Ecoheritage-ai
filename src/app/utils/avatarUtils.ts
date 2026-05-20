// ── Danh sách tên tác giả góp ý hệ thống đã có sẵn (seeded) ──
// Chỉ các tên này mới được giữ nguyên ảnh chân dung randomuser.me gốc
const SEEDED_NAMES = new Set([
  "Chú Tuấn (Hải Châu)",
  "Chị Mai Lan",
  "Thanh Trúc",
  "Người lớn tuổi",
  "Khách du lịch",
  "Minh Toàn",
  "Lê Thị Hồng",
  "Nguyễn Văn Tèo",
  "Thanh Hằng",
  "Minh Tuấn",
  "Bà Sáu",
  "Hoàng Nam",
  "Anh Đức",
  "Ngọc Lan",
  "Chị Mai",
  "Bác Hùng",
  "Văn Phú",
  "Thùy Linh",
  "Gia Bảo",
  "Diệu Hương",
]);

// ── Bảng gradient sang trọng cho monogram SVG ──
const MONOGRAM_GRADIENTS = [
  ['#059669', '#10b981', '#34d399'], // Emerald
  ['#0d9488', '#14b8a6', '#2dd4bf'], // Teal
  ['#0891b2', '#06b6d4', '#22d3ee'], // Cyan
  ['#7c3aed', '#8b5cf6', '#a78bfa'], // Violet
  ['#b45309', '#d97706', '#f59e0b'], // Amber
  ['#0369a1', '#0284c7', '#0ea5e9'], // Sky
];

/**
 * Sinh data-URI SVG monogram chữ cái đầu với gradient sang trọng
 */
function generateMonogramSvg(name: string): string {
  const initial = (name.trim()[0] || 'K').toUpperCase();
  
  // Hash tên để chọn gradient ổn định
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradientIndex = Math.abs(hash) % MONOGRAM_GRADIENTS.length;
  const [c1, c2, c3] = MONOGRAM_GRADIENTS[gradientIndex];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="50%" stop-color="${c2}"/>
        <stop offset="100%" stop-color="${c3}"/>
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="64" fill="url(#g)"/>
    <text x="64" y="64" text-anchor="middle" dominant-baseline="central"
          font-family="Inter,system-ui,sans-serif" font-weight="700"
          font-size="52" fill="white" opacity="0.95">${initial}</text>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Lấy đường dẫn ảnh đại diện.
 * - Nếu người dùng đã tải avatar tùy chỉnh → trả về ảnh đã lưu.
 * - Nếu tên thuộc SEEDED_NAMES và KHÔNG có email → giữ nguyên ảnh randomuser.me gốc (bảo tồn dữ liệu seed).
 * - Các trường hợp còn lại (tài khoản mới, khách vãng lai) → trả về monogram SVG mặc định.
 */
export function getAvatarUrl(name: string, email?: string): string {
  // 1. Kiểm tra ảnh đã lưu tùy chỉnh
  if (email) {
    const saved = localStorage.getItem(`avatar_${email}`);
    if (saved) return saved;
  }
  const savedByName = localStorage.getItem(`avatar_${name}`);
  if (savedByName) return savedByName;

  // 2. Nếu là tên seeded và KHÔNG có email → bảo tồn ảnh chân dung cũ
  if (!email && SEEDED_NAMES.has(name)) {
    return getSeededPortrait(name);
  }

  // 3. Mọi trường hợp khác → Monogram SVG mặc định
  return generateMonogramSvg(name);
}

/**
 * Trả về ảnh chân dung randomuser.me gốc CHỈ cho các tên seeded.
 * Giữ nguyên 100% logic cũ để bảo tồn giao diện hiện có.
 */
function getSeededPortrait(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('chú') || lowerName.includes('ông') || lowerName.includes('bác trai')) {
    return 'https://randomuser.me/api/portraits/men/78.jpg';
  }
  if (lowerName.includes('cô') || lowerName.includes('bà') || lowerName.includes('bác gái') || lowerName.includes('người lớn tuổi')) {
    return 'https://randomuser.me/api/portraits/women/68.jpg';
  }
  if (lowerName.includes('chị') || lowerName.includes('lan') || lowerName.includes('trúc') || lowerName.includes('nữ') || lowerName.includes('anh')) {
    if (lowerName.includes('trúc')) return 'https://randomuser.me/api/portraits/women/44.jpg';
    if (lowerName.includes('lan')) return 'https://randomuser.me/api/portraits/women/32.jpg';
    return 'https://randomuser.me/api/portraits/women/24.jpg';
  }
  if (lowerName.includes('toàn') || lowerName.includes('hoàng') || lowerName.includes('nam') || lowerName.includes('anh trai')) {
    if (lowerName.includes('toàn')) return 'https://randomuser.me/api/portraits/men/32.jpg';
    if (lowerName.includes('hoàng')) return 'https://randomuser.me/api/portraits/men/46.jpg';
    return 'https://randomuser.me/api/portraits/men/22.jpg';
  }
  if (lowerName.includes('khách') || lowerName.includes('du lịch')) {
    return 'https://randomuser.me/api/portraits/men/86.jpg';
  }

  // Deterministic fallback cho seeded names không khớp keyword
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const id = Math.abs(hash % 99);
  const gender = hash % 2 === 0 ? 'men' : 'women';
  return `https://randomuser.me/api/portraits/${gender}/${id}.jpg`;
}
