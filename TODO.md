# TODO - EcoHeritage UI/UX & Admin Upgrade

## Step 1 — Chuẩn hóa “Kho tàng” (Di sản + Bản đồ dược liệu)
- [ ] Tìm đúng vị trí menu/hover “Di sản & bản đồ dược liệu” trên UI.
- [ ] Tạo hover dropdown “Kho tàng” với 2 item: “Di sản” (/heritage) và “Bản đồ dược liệu” (/heritage/map).
- [ ] Đảm bảo dropdown hoạt động tốt trên desktop/mobile.

## Step 2 — Đồng nhất “cuộn lên đầu” khi vào trang
- [ ] Kiểm tra HeritageMapPage/ProfilePage có ảnh hưởng bởi layout fixed.
- [ ] Bổ sung logic scroll-to-top khi mount hoặc khi đổi route (nếu cần).

## Step 3 — Bỏ mục “hình 2” trong HeritageMapPage
- [ ] Xác định section “SECTION 2: KHO TÀNG DƯỢC LIỆU” (được yêu cầu bỏ mục hình 2).
- [ ] Xóa/loại section này khỏi panel chi tiết.
- [ ] Chỉnh lại thứ tự section còn lại để bố cục không bị trống.

## Step 4 — Fix “lỗi form chữ” (typography/input) trên các trang cần thiết
- [ ] Rà soát ProfilePage và Admin module input/select/textarea: font-size/line-height/padding/cắt chữ.
- [ ] Chuẩn hóa lớp class cho label/input/textarea trong Admin.

## Step 5 — Nâng cấp giao diện Admin + thêm thanh tìm kiếm
- [ ] HeritageCMS: thêm toolbar search (lọc remedy theo tên/thành phần/ghi chú).
- [ ] FeedbackSection: thêm search (lọc theo author/content/category).
- [ ] UsersSection: thêm search (lọc theo name/email).

## Step 6 — Đồng nhất form các module admin
- [ ] Tạo “AdminFormShell” dùng chung cho slide-over panel.
- [ ] Refactor HeritageCMS và LocationCMS để dùng chung shell/form.
- [ ] Refactor các phần toolbar/header trong admin để đồng nhất.

## Step 7 — Nâng cấp “hình 4” Hồ sơ cá nhân (ProfilePage)
- [ ] Bố trí 4 khối chính (Tổng quan: thống kê/hoạt động, Thành tựu, Bộ sưu tập, Cài đặt nhanh hoặc tương tự).
- [ ] Kiểm tra tab profile/security: đảm bảo chuyển tab mượt, giữ layout đẹp.

## Step 8 — Kiểm tra & chạy build
- [ ] Chạy typecheck/build (nếu có script).
- [ ] Chạy dev server và kiểm tra các route: /, /heritage, /heritage/map, /profile, /admin-portal.

