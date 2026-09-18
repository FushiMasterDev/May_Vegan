# Mây Vegan

Hệ thống quản lý & đặt món quán ăn chay Mây Vegan.

> README này sẽ được hoàn thiện đầy đủ ở Phase 8.

## Cấu trúc

```
frontend/   React + TypeScript + Vite + Tailwind CSS
backend/    Node.js + Express + TypeScript + Prisma
database/   schema.sql / seed.sql (nguồn sự thật cho cấu trúc DB — Prisma schema đồng bộ qua db pull)
docs/       architecture.md, api.md
```

## Cài đặt

### 1. Database (MySQL 8+)

Tạo database và user riêng cho project (thay `<password>` bằng mật khẩu bạn chọn):

```sql
CREATE DATABASE mayvegan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mayvegan_app'@'localhost' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON mayvegan.* TO 'mayvegan_app'@'localhost';
FLUSH PRIVILEGES;
```

```bash
cd backend
cp .env.example .env   # chỉnh DATABASE_URL="mysql://mayvegan_app:<password>@localhost:3306/mayvegan"
npm install
npm run db:schema       # áp database/schema.sql (chỉ chạy trên DB rỗng, tạo 19 bảng)
npm run db:seed         # áp database/seed.sql (dữ liệu demo, có thể chạy lại nhiều lần)
npm run prisma:generate # sinh Prisma Client khớp với schema hiện tại
```

Tài khoản demo sau khi seed: xem `database/seed-accounts.md`.

### 2. Backend

```bash
cd backend
npm run dev              # http://localhost:4000, GET /api/health
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173, proxy /api -> backend :4000
```

## Trạng thái

- [x] Phase 1 — Kiến trúc & scaffold (frontend/backend build sạch)
- [x] Phase 2 — Database (schema.sql, seed.sql, Prisma schema đồng bộ, đã test trên MySQL thật)
- [x] Phase 3 — Backend (auth, products, orders, tables, reservations, customers, employees, inventory, coupons, reviews, dashboard, reports — xem `docs/api.md`)
- [x] Phase 4 — Frontend (landing, menu, giỏ hàng, thanh toán, đặt bàn, auth, hồ sơ, admin đầy đủ)
- [x] Phase 5 — Integration (đối chiếu toàn bộ endpoint FE↔BE, kiểm tra shape response khớp type, test luồng end-to-end thật qua CORS/proxy)
- [x] Phase 6 — Testing (RBAC matrix, CRUD còn lại, tính tiền, validation, build/lint frontend)
- [x] Phase 7 — UI polish (dark mode hoàn thiện, Error Boundary, favicon thương hiệu, rà soát responsive/typography)
- [ ] Phase 8 — Final (README đầy đủ, tài khoản demo)
