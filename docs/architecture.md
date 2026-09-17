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

## 6. Trạng thái hiện tại (Phase 2)

- Phase 1: scaffold kiến trúc, build sạch (typecheck + build) cho cả `frontend/` và `backend/`.
- Phase 2: `database/schema.sql` (19 bảng, đã áp thành công vào MySQL thật) +
  `database/seed.sql` (dữ liệu demo thực tế, đã kiểm tra chéo tổng tiền đơn hàng,
  tồn kho, rating, điểm tích luỹ đều khớp). `backend/prisma/schema.prisma` được
  đồng bộ với DB thật qua `prisma db pull`, sau đó đổi tên model/field sang
  PascalCase/camelCase (giữ nguyên tên bảng/cột MySQL qua `@@map`/`@map`).
  Quy trình thay đổi schema: sửa `database/schema.sql` → áp lại vào MySQL →
  chạy `npx prisma db pull` → đối chiếu và đổi tên trong `schema.prisma` →
  `npx prisma generate`.
- Chưa có business logic API hay UI đầy đủ — sẽ triển khai ở Phase 3 (Backend)
  và Phase 4 (Frontend).
