import { traditionalRemedies } from "../../data";
import { createId, buildClimateAdvice, formatHourLabel } from "./adminUtils";
import type { RemedyRecord, FeedbackRecord, ClimateSnapshot, ClimateTrendPoint } from "./adminUtils";

export function createSeedRemedies(): RemedyRecord[] {
  return traditionalRemedies.slice(0, 25).map((remedy) => ({
    id: remedy.id,
    name: remedy.name,
    ingredients: remedy.ingredients.join(", "),
    method: remedy.steps.join(" "),
    doctorNote: `Theo dõi phản ứng cơ địa khi dùng nhóm ${remedy.category.toLowerCase()} và ưu tiên tư vấn cá nhân hóa nếu người dùng đang có bệnh nền hô hấp.`,
    updatedAt: new Date().toISOString(),
  }));
}

export function createSeedFeedback(): FeedbackRecord[] {
  return [
    // Web (Home Page) Featured Reviews
    { id: "seed-w1", author: "Chú Tuấn (Hải Châu)", remedyUsed: "Nền tảng EcoHeritage", content: "Hồi xưa toàn phải chạy ra tiệm thuốc bắc hỏi, giờ có cái web này tiện ghê. Hướng dẫn nấu nước lá tía tô giải cảm cực kỳ chuẩn, nhà tôi xài xong ai cũng khen.", satisfaction: 5, source: "seeded", status: "published", category: "web", isFeatured: true, createdAt: new Date().toISOString() },
    { id: "seed-w2", author: "Chị Mai Lan", remedyUsed: "Nền tảng EcoHeritage", content: "Thấy thích nhất là cái tính năng báo chất lượng không khí rồi gợi ý uống gì cho bổ phổi. Mấy hôm Đà Nẵng bụi mịn, mở app lên thấy nhắc nhở dễ thương ghê.", satisfaction: 5, source: "seeded", status: "published", category: "web", isFeatured: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: "seed-w3", author: "Thanh Trúc", remedyUsed: "Nền tảng EcoHeritage", content: "Giao diện cực kỳ sang trọng, đọc mướt con mắt. Ước gì hệ thống cập nhật thêm nhiều bài thuốc về xương khớp cho người lớn tuổi nữa là hoàn hảo 10 điểm!", satisfaction: 4, source: "seeded", status: "published", category: "web", isFeatured: true, createdAt: new Date(Date.now() - 7200000).toISOString() },
    
    // Heritage Page Featured Reviews
    { id: "seed-h1", author: "Người lớn tuổi", remedyUsed: "Canh Khổ Qua Xương Sen", content: "Bài thuốc Canh Khổ Qua Xương Sen này rất hiệu quả. Tôi hay bị mất ngủ, dùng theo công thức của app thấy tinh thần thư thái, dễ ngủ hẳn. Cảm ơn đội ngũ đã bảo tồn y học quê mình.", satisfaction: 5, source: "seeded", status: "published", category: "heritage", isFeatured: true, createdAt: new Date(Date.now() - 1000).toISOString() },
    { id: "seed-h2", author: "Khách du lịch", remedyUsed: "App EcoHeritage", content: "Biết đến app khi du lịch Đà Nẵng. Cách app kết nối giữa khí hậu địa phương và các bài thuốc thanh nhiệt thực sự rất thông minh và tinh tế.", satisfaction: 5, source: "seeded", status: "published", category: "heritage", isFeatured: true, createdAt: new Date(Date.now() - 3601000).toISOString() },
    { id: "seed-h3", author: "Minh Toàn", remedyUsed: "Canh Khổ Qua Xương Sen", content: "[Hiệu quả sử dụng] Tốt, hay phù hợp với tất cả mọi người", satisfaction: 5, source: "seeded", status: "published", category: "heritage", isFeatured: true, createdAt: new Date(Date.now() - 7201000).toISOString() },
    
    // Others (Not featured by default)
    { id: "seed-h4", author: "Sinh viên", remedyUsed: "Dự án Di sản số", content: "Dự án Di sản số này rất ý nghĩa. Vừa giúp bảo tồn kiến thức y học cổ truyền Đà Nẵng, vừa ứng dụng AI để đưa ra lời khuyên thời tiết. Rất hiện đại và thực tế!", satisfaction: 5, source: "seeded", status: "published", category: "heritage", isFeatured: false, createdAt: new Date(Date.now() - 10800000).toISOString() },
  ];
}

export function createSeedUsers(): any[] {
  return [
    {
      name: "Minh Hùng",
      email: "minhhung@gmail.com",
      password: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", // Hashed "123456"
      provider: "email",
      createdAt: new Date().toISOString(),
      status: "active"
    },
    {
      name: "Thành Viên Demo",
      email: "demo@ecoheritage.vn",
      password: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", // Hashed "123456"
      provider: "email",
      createdAt: new Date().toISOString(),
      status: "active"
    }
  ];
}

export function incrementDailyVisits(): number {
  const today = new Date().toISOString().slice(0, 10);
  const visitKey = `ecoheritage_admin_visits_${today}`;
  const next = Number(localStorage.getItem(visitKey) || "0") + 1;
  localStorage.setItem(visitKey, String(next));
  return next;
}
