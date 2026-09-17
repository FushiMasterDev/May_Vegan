# Mây Vegan

Hệ thống quản lý & đặt món quán ăn chay Mây Vegan.

> README này sẽ được hoàn thiện đầy đủ (cài đặt, seed DB, tài khoản demo...) ở Phase 8.
> Hiện tại (Phase 1) mới có scaffold kiến trúc.

## Cấu trúc

```
frontend/   React + TypeScript + Vite + Tailwind CSS
backend/    Node.js + Express + TypeScript + Prisma
database/   schema.sql / seed.sql (tham chiếu song song với Prisma migration)
docs/       architecture.md, api.md
```

## Chạy dev (scaffold hiện tại)

### Backend

```bash
cd backend
cp .env.example .env   # rồi chỉnh DATABASE_URL trỏ tới MySQL local
npm install
npm run dev             # http://localhost:4000, GET /api/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173, proxy /api -> backend :4000
```

## Trạng thái

- [x] Phase 1 — Kiến trúc & scaffold (frontend/backend build sạch)
- [ ] Phase 2 — Database (schema.sql, seed.sql, Prisma schema)
- [ ] Phase 3 — Backend (auth, products, orders, tables, reservations, customers, inventory, coupons, reviews, dashboard, reports)
- [ ] Phase 4 — Frontend (landing, menu, cart, checkout, reservation, auth, profile, admin)
- [ ] Phase 5 — Integration
- [ ] Phase 6 — Testing
- [ ] Phase 7 — UI polish
- [ ] Phase 8 — Final (README đầy đủ, tài khoản demo)
