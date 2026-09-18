# Mây Vegan — Kiến trúc hệ thống

## 1. Tổng quan

Hệ thống gồm 3 phần độc lập, giao tiếp qua REST API:

```
frontend/   React + TS + Vite + Tailwind CSS      (SPA — khách hàng + admin, route-gated theo role)
backend/    Node.js + Express + TypeScript         (REST API, JWT auth, RBAC)
database/   MySQL (schema.sql / seed.sql tham chiếu, Prisma là nguồn sự thật cho migration)
```

Một backend API dùng chung cho cả site khách hàng lẫn admin dashboard. Phân quyền theo role
(`ADMIN`, `MANAGER`, `STAFF`, `KITCHEN`) được enforce ở middleware backend — không tin tưởng vào
việc ẩn UI ở frontend.

## 2. Backend

- **Layering**: `routes -> controllers -> services -> (Prisma) models -> MySQL`.
- **Validation**: zod schema trong `validators/`, dùng chung type giữa request body và service input.
- **Auth**: JWT access token (15 phút) + refresh token (7 ngày), mật khẩu hash bằng bcrypt.
  Access token gửi qua header `Authorization: Bearer <token>`.
- **Error handling**: middleware `errorHandler` tập trung, trả JSON đồng nhất
  `{ success, message, details? }`. `AppError` là base class cho lỗi nghiệp vụ có statusCode rõ ràng.
- **File upload**: `multer`, lưu local `backend/uploads/`, serve tĩnh qua `/uploads`.

## 3. Frontend

- **Routing**: React Router, cây route tách `CustomerLayout` và `AdminLayout`. Route admin được
  bảo vệ bằng route-guard kiểm tra role (thêm ở Phase 4 khi có AuthContext thật).
- **Data fetching**: TanStack React Query, axios instance dùng chung (`services/apiClient.ts`)
  tự đính JWT vào header và tự xử lý 401 (xoá token).
- **Styling**: Tailwind CSS v4 (config qua `@theme` trong `index.css`), design token màu thương hiệu
  (`brand`, `olive`, `cream`, `wood`, `accent`) thay vì hard-code màu rải rác trong component.
- **Component**: tách `components/ui` (Button, Input, Modal, Table, Badge...) và
  `components/common` (Navbar, Sidebar, Footer...) để tái sử dụng giữa các trang.

## 4. Database

- MySQL, thiết kế chuẩn hoá (3NF), FK ràng buộc, UNIQUE cho email/phone/order_code/coupon code,
  INDEX cho cột tìm kiếm/lọc thường xuyên (status, category_id, created_at...).
- Prisma schema (`backend/prisma/schema.prisma`) là nguồn migration chính thức.
  `database/schema.sql` + `database/seed.sql` là bản DDL/seed thuần để có thể khởi tạo DB độc lập
  với Node/Prisma nếu cần (ví dụ import trực tiếp vào MySQL Workbench).
- Chi tiết bảng và ERD: xem báo cáo Phase 0 trong lịch sử trao đổi / sẽ được chốt lại khi hoàn
  thành Phase 2.

## 5. Bảo mật

- Không lưu plaintext password — bcrypt.
- JWT ký bằng secret trong `.env`, không commit `.env` (chỉ commit `.env.example`).
- Input validation ở boundary (request body/query) bằng zod trước khi vào service.
- Query qua Prisma (prepared statement) — không nối chuỗi SQL thủ công.
- CORS giới hạn theo `CORS_ORIGIN`, Helmet bật các header bảo mật mặc định.

## 6. Trạng thái hiện tại (Phase 3)

- Phase 1: scaffold kiến trúc, build sạch (typecheck + build) cho cả `frontend/` và `backend/`.
- Phase 2: `database/schema.sql` (19 bảng) + `database/seed.sql`, đã áp và kiểm tra
  chéo trên MySQL thật. `backend/prisma/schema.prisma` đồng bộ qua `prisma db pull`
  rồi đổi tên PascalCase/camelCase.
- Phase 3: toàn bộ business logic backend (xem `docs/api.md` cho danh sách endpoint
  đầy đủ) — auth (JWT access+refresh, đổi/quên mật khẩu), danh mục, món ăn
  (search/filter/sort/pagination, upload ảnh), đơn hàng (tạo đơn khách vãng lai/đã
  đăng nhập, áp coupon, chuyển trạng thái, chuyển bàn, huỷ đơn, tự động cập nhật
  sold_count/điểm tích luỹ/tồn kho bàn khi hoàn thành), bàn, đặt bàn (kiểm tra bàn
  trống theo khung giờ), khách hàng, nhân viên (ADMIN only), nguyên liệu + kho
  (nhập/xuất/điều chỉnh/kiểm kê, cảnh báo tồn thấp), nhà cung cấp, khuyến mãi
  (validate coupon), đánh giá (chỉ trên đơn COMPLETED, tự tính lại rating sản
  phẩm), dashboard và báo cáo doanh thu (export CSV). Toàn bộ đã test thật qua
  curl trên server + MySQL thật (không phải mock) — xem lịch sử test trong quá
  trình Phase 3.
- Phase 4: toàn bộ frontend — site khách hàng (trang chủ, thực đơn với
  search/filter/sort/pagination, chi tiết món, giỏ hàng, thanh toán khách vãng
  lai/đã đăng nhập, theo dõi đơn, đặt bàn có kiểm tra bàn trống, đăng ký/đăng
  nhập/quên-đặt lại mật khẩu, hồ sơ khách hàng) và admin dashboard đầy đủ
  (tổng quan có biểu đồ, đơn hàng, sơ đồ bàn + tạo đơn tại bàn, thực đơn có
  upload ảnh, danh mục, nguyên liệu, kho, khách hàng, nhân viên, khuyến mãi,
  đánh giá, doanh thu, báo cáo có export CSV, cài đặt), route guard theo role,
  responsive/mobile-first, dark mode qua CSS variables. Build + typecheck
  sạch cho cả frontend/backend; admin pages được code-split (lazy load) khỏi
  bundle chính để trang khách hàng tải nhanh hơn.
- Phase 5 (Integration): đối chiếu toàn bộ endpoint frontend↔backend, so
  sánh shape response thật với type TypeScript, test end-to-end qua đúng
  đường dẫn Vite proxy mà trình duyệt dùng — không phát hiện lỗi tích hợp.
- Phase 6 (Testing): ma trận RBAC đầy đủ 5 role, CRUD còn lại (suppliers,
  bàn, coupon, nguyên liệu, nhân viên, đánh giá) kèm các rule chặn xoá khi
  có dữ liệu liên quan, cạnh tính tiền (cap giảm giá, hoàn coupon khi huỷ
  đơn), validation. Phát hiện và sửa 1 bug thật: hệ thống từng cho phép đặt
  bàn cho ngày/giờ trong quá khứ.
- Phase 7 (UI polish): hoàn thiện dark mode (trước đó chỉ có CSS chết,
  không có cách bật) — phát hiện và sửa ~90 chỗ chữ sẽ vô hình khi bật dark
  mode (dùng token `--text-primary`/`--bg-accent-soft` thích ứng theme thay
  vì màu cố định); thêm Error Boundary toàn cục (trước đó thiếu hoàn toàn —
  một lỗi render bất kỳ sẽ làm trắng màn hình); favicon thương hiệu.
- Phase 8 (Final): mô phỏng lại toàn bộ quy trình cài đặt từ README trên
  một database hoàn toàn trống (drop → schema → seed → generate) và xác
  nhận cả 5 tài khoản demo đăng nhập thành công — README phản ánh đúng các
  bước thực tế, không phải suy đoán.
- Một vài giới hạn phạm vi có chủ đích: chưa có ảnh món ăn thật (dùng
  placeholder có thiết kế, admin có thể upload qua chức năng đã hoàn thiện);
  không có "tuỳ chọn topping" riêng (dùng trường ghi chú món); không có cổng
  thanh toán online thật (chỉ Tiền mặt/Chuyển khoản ở checkout khách hàng,
  tránh giả lập luồng thanh toán không có thật); chưa gửi email thật (link
  đặt lại mật khẩu log ra console ở dev); không có công cụ trình duyệt trong
  suốt quá trình phát triển nên phần UI/responsive được xác minh qua rà soát
  code có hệ thống thay vì quan sát trực quan.
