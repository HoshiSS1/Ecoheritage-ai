import { traditionalRemedies } from "../../data";
import { HERITAGE_LOCATIONS } from "../../heritageData";
import { createId, buildClimateAdvice, formatHourLabel } from "./adminUtils";
import type { RemedyRecord, FeedbackRecord, ClimateSnapshot, ClimateTrendPoint, LocationRecord } from "./adminUtils";

export function createSeedRemedies(): RemedyRecord[] {
  const getCategoryAdvice = (category: string) => {
    switch (category) {
      case "Tiêu hóa": return "Hỗ trợ tiêu hóa, làm ấm tỳ vị. Không dùng khi đang sốt cao hoặc tiêu chảy cấp tính.";
      case "An thần": return "Giúp ngủ ngon, giảm căng thẳng thần kinh. Cẩn trọng với người huyết áp thấp hoặc đang lái xe.";
      case "Giải độc": return "Thanh lọc cơ thể, mát gan. Cần uống nhiều nước lọc trong ngày để tăng hiệu quả đào thải.";
      case "Thanh nhiệt": return "Giảm nóng trong, sinh tân dịch. Phụ nữ mang thai hoặc người thể hàn nên tham khảo ý kiến chuyên gia.";
      default: return "Theo dõi phản ứng cơ thể và ưu tiên tư vấn cá nhân hóa để phù hợp với cơ địa riêng biệt.";
    }
  };

  return traditionalRemedies.slice(0, 25).map((remedy, idx) => ({
    id: remedy.id,
    name: remedy.name,
    category: remedy.category || "Dân gian",
    ingredients: Array.isArray(remedy.ingredients) ? remedy.ingredients.join(", ") : String(remedy.ingredients),
    method: Array.isArray(remedy.steps) ? remedy.steps.join(" ") : String(remedy.steps),
    benefits: remedy.benefits || "",
    description: remedy.benefits || "",
    status: "published",
    doctorNote: `Nhóm ${remedy.category}: ${getCategoryAdvice(remedy.category)}`,
    updatedAt: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7) - idx * 3600000).toISOString(),
  }));
}

export function createSeedFeedback(): FeedbackRecord[] {
  return [
    // Web feedback - about the WEBSITE itself
    { id: "seed-w1", author: "Chú Tuấn (Hải Châu)", remedyUsed: "Nền tảng EcoHeritage", content: "Hồi xưa toàn phải chạy ra tiệm thuốc bắc hỏi, giờ có cái web này tiện ghê. Hướng dẫn nấu nước lá tía tô giải cảm cực kỳ chuẩn, nhà tôi xài xong ai cũng khen.", satisfaction: 5, source: "seeded", status: "published", category: "web", isFeatured: true, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: "seed-w2", author: "Chị Mai Lan", remedyUsed: "Nền tảng EcoHeritage", content: "Thấy thích nhất là cái tính năng báo chất lượng không khí rồi gợi ý uống gì cho bổ phổi. Mấy hôm Đà Nẵng bụi mịn, mở web lên thấy nhắc nhở dễ thương ghê.", satisfaction: 5, source: "seeded", status: "published", category: "web", isFeatured: true, createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
    { id: "seed-w3", author: "Thanh Trúc", remedyUsed: "Nền tảng EcoHeritage", content: "Giao diện cực kỳ sang trọng, đọc mướt con mắt. Ước gì hệ thống cập nhật thêm nhiều bài thuốc về xương khớp cho người lớn tuổi nữa là hoàn hảo 10 điểm!", satisfaction: 4, source: "seeded", status: "published", category: "web", isFeatured: true, createdAt: new Date(Date.now() - 7200000 * 3).toISOString() },
    
    // Heritage/Remedy feedback - about SPECIFIC traditional remedies
    { id: "seed-h1", author: "Người lớn tuổi", remedyUsed: "Canh Khổ Qua Xương Sen", content: "Bài thuốc Canh Khổ Qua Xương Sen này rất hiệu quả. Tôi hay bị mất ngủ, dùng theo công thức của web thấy tinh thần thư thái, dễ ngủ hẳn. Cảm ơn đội ngũ đã bảo tồn y học quê mình.", satisfaction: 5, source: "seeded", status: "published", category: "heritage", isFeatured: true, createdAt: new Date(Date.now() - 1000).toISOString() },
    { id: "seed-h2", author: "Khách du lịch", remedyUsed: "Trà thảo mộc thanh nhiệt", content: "Biết đến khi du lịch Đà Nẵng. Cách kết nối giữa khí hậu địa phương và các bài thuốc thanh nhiệt thực sự rất thông minh và tinh tế.", satisfaction: 5, source: "seeded", status: "published", category: "heritage", isFeatured: true, createdAt: new Date(Date.now() - 3601000).toISOString() },
    { id: "seed-h3", author: "Minh Toàn", remedyUsed: "Canh Khổ Qua Xương Sen", content: "[Hiệu quả sử dụng] Tốt, hay phù hợp với tất cả mọi người", satisfaction: 5, source: "seeded", status: "published", category: "heritage", isFeatured: true, createdAt: new Date(Date.now() - 7201000).toISOString() },
    
    // Others (Not featured by default)
    { id: "seed-h4", author: "Lê Thị Hồng", remedyUsed: "Trà Gừng Mật Ong", content: "Bài thuốc trà gừng mật ong đơn giản nhưng hiệu quả bất ngờ. Tôi đã chia sẻ cho nhiều bạn bè cùng sử dụng để giải nhiệt và làm ấm cơ thể mùa đông.", satisfaction: 5, source: "seeded", status: "published", category: "heritage", isFeatured: false, createdAt: new Date(Date.now() - 10800000).toISOString() },
    { id: "seed-h5", author: "Nguyễn Văn Tèo", remedyUsed: "Trà Lá Sen", content: "Dữ liệu bản đồ dược liệu rất hay, giúp mình biết được xung quanh Đà Nẵng có những khu vực trồng cây thuốc nào quý.", satisfaction: 4, source: "seeded", status: "published", category: "heritage", isFeatured: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
  ];
}

export function createSeedUsers(): any[] {
  return [
    {
      name: "Minh Hùng",
      email: "minhhung@gmail.com",
      password: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", // Hashed "123456"
      provider: "email",
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      status: "active"
    },
    {
      name: "Thành Viên Demo",
      email: "demo@ecoheritage.vn",
      password: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", // Hashed "123456"
      provider: "email",
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      status: "active"
    },
    {
      name: "Quản Trị Viên",
      email: "admin@ecoheritage.vn",
      password: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", // Hashed "123456"
      provider: "email",
      createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
      status: "active"
    }
  ];
}

export function createSeedLocations(): LocationRecord[] {
  return HERITAGE_LOCATIONS.map((location) => ({
    id: location.id,
    name: location.name,
    address: location.address,
    lat: location.position[0],
    lon: location.position[1],
    status: location.status,
    level: location.level,
    herbs: location.herbs.join(", "),
    regulations: location.regulations,
    type: location.type,
    color: location.color,
    image: location.image,
    imageBase64: "",
    isVisible: true,
    updatedAt: new Date().toISOString(),
  }));
}

export function incrementDailyVisits(): number {
  const today = new Date().toISOString().slice(0, 10);
  const visitKey = `ecoheritage_admin_visits_${today}`;
  const next = Number(localStorage.getItem(visitKey) || "0") + 1;
  localStorage.setItem(visitKey, String(next));
  return next;
}
