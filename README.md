# Mây Vegan

**Một chút xanh cho một ngày an lành.**

Hệ thống quản lý & đặt món trực tuyến cho quán ăn chay Mây Vegan — website khách hàng (thực đơn, giỏ
hàng, đặt món, đặt bàn, theo dõi đơn) và trang quản trị đầy đủ cho nhân viên/quản lý (đơn hàng, bàn,
thực đơn, kho, khách hàng, nhân viên, khuyến mãi, đánh giá, doanh thu, báo cáo).

## Công nghệ sử dụng

| Layer | Công nghệ |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Axios, TanStack Query, Recharts, Lucide Icons |
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| Database | MySQL 8 |
| Auth | JWT (access + refresh token), bcrypt |

## Cấu trúc thư mục

```
frontend/   React SPA — site khách hàng (/) + trang quản trị (/admin)
backend/    REST API — routes/controllers/services theo domain, Prisma
database/   schema.sql, seed.sql — nguồn sự thật cho cấu trúc DB
            (backend/prisma/schema.prisma đồng bộ qua `prisma db pull`)
docs/       architecture.md (kiến trúc chi tiết), api.md (danh sách API đầy đủ)
```

## Yêu cầu hệ thống

- Node.js 20+ và npm
- MySQL 8+ đang chạy (local hoặc container)

## Cài đặt

### 1. Database

Tạo database và một user riêng cho project (khuyến nghị dùng user riêng thay vì `root`):

```sql
CREATE DATABASE mayvegan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mayvegan_app'@'localhost' IDENTIFIED BY '<mật khẩu bạn chọn>';
GRANT ALL PRIVILEGES ON mayvegan.* TO 'mayvegan_app'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
```

Mở `backend/.env` và chỉnh các giá trị:

- `DATABASE_URL` → `mysql://mayvegan_app:<mật khẩu>@localhost:3306/mayvegan`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` → chuỗi ngẫu nhiên, ví dụ tạo bằng `openssl rand -hex 32`

```bash
npm install
npm run db:schema        # tạo 19 bảng — chỉ chạy trên database rỗng
npm run db:seed          # nạp dữ liệu mẫu (menu, tài khoản demo...) — có thể chạy lại nhiều lần
npm run prisma:generate  # sinh Prisma Client khớp với schema

npm run dev               # http://localhost:4000 — kiểm tra bằng GET /api/health
```

### 3. Frontend

Mở terminal khác:

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173 — tự động proxy /api và /uploads sang backend :4000
```

Truy cập `http://localhost:5173` cho site khách hàng, đăng nhập rồi vào `/admin` cho trang quản trị
(tài khoản nhân viên sẽ tự thấy menu quản trị phù hợp với vai trò của mình).

## Tài khoản demo

Sau khi `npm run db:seed`, các tài khoản sau đã sẵn sàng (chi tiết: `database/seed-accounts.md`):

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | admin@mayvegan.vn | `MayVegan@2026` |
| Manager | manager@mayvegan.vn | `MayVegan@2026` |
| Staff | staff@mayvegan.vn | `MayVegan@2026` |
| Kitchen | kitchen@mayvegan.vn | `MayVegan@2026` |
| Khách hàng mẫu | lan.pham@gmail.com | `KhachHang@2026` |

> Mật khẩu demo chỉ dùng cho môi trường phát triển local — không dùng lại cho production.

## Scripts hữu ích

**Backend** (`backend/`)

| Script | Mô tả |
|---|---|
| `npm run dev` | Chạy API với hot-reload |
| `npm run build` / `npm start` | Build và chạy bản production |
| `npm run typecheck` / `npm run lint` | Kiểm tra kiểu dữ liệu / lint |
| `npm run db:schema` | Áp `database/schema.sql` (chỉ trên DB rỗng) |
| `npm run db:seed` | Áp `database/seed.sql` (idempotent, chạy lại được) |
| `npm run prisma:generate` | Sinh lại Prisma Client |
| `npm run prisma:studio` | Mở Prisma Studio để xem dữ liệu trực quan |

**Frontend** (`frontend/`)

| Script | Mô tả |
|---|---|
| `npm run dev` | Chạy dev server (Vite) |
| `npm run build` | Typecheck + build production vào `dist/` |
| `npm run lint` | Lint bằng oxlint |
| `npm run preview` | Xem thử bản build production |

## Tài liệu liên quan

- [`docs/architecture.md`](docs/architecture.md) — kiến trúc hệ thống, quyết định thiết kế, quy trình đồng bộ Prisma
- [`docs/api.md`](docs/api.md) — danh sách đầy đủ API, quyền theo role
- [`database/seed-accounts.md`](database/seed-accounts.md) — chi tiết tài khoản demo

## Đã kiểm thử

Toàn bộ được test qua API/DB thật (không mock) trong suốt quá trình phát triển: ma trận phân quyền
đầy đủ theo 5 role, CRUD từng module, tính tiền (giảm giá theo %/số tiền, cap giảm tối đa, phí giao
hàng, hoàn trả lượt dùng coupon khi huỷ đơn), validate dữ liệu đầu vào, luồng đặt món/đặt bàn/thanh
toán end-to-end, và build + typecheck + lint sạch cho cả hai phía. Chi tiết xem lịch sử commit theo
từng phase.

**Giới hạn đã biết**: phiên làm việc này không có công cụ trình duyệt để xem giao diện trực tiếp —
việc kiểm tra responsive/UI được thực hiện qua rà soát code có hệ thống, không phải quan sát trực
quan. Nên tự mở ứng dụng trên các kích thước màn hình thật trước khi dùng cho việc quan trọng.

## Giới hạn phạm vi có chủ đích

- Chưa có ảnh món ăn thật — dùng placeholder có thiết kế; admin có thể upload ảnh thật qua trang quản
  lý thực đơn (chức năng đã hoạt động đầy đủ).
- Không có hệ thống "topping" riêng — khách hàng tuỳ chỉnh món qua trường ghi chú.
- Không tích hợp cổng thanh toán online thật — checkout khách hàng chỉ có Tiền mặt/Chuyển khoản, tránh
  giả lập một luồng thanh toán không tồn tại.
- Gửi email (quên mật khẩu...) chưa nối dịch vụ email thật — link đặt lại mật khẩu được log ra console
  backend ở môi trường dev.
