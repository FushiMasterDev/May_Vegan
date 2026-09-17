# Mây Vegan — API

Base URL: `/api`

Response envelope chung:

```json
{ "success": true, "data": {}, "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 } }
{ "success": false, "message": "...", "details": {} }
```

Tất cả endpoint ghi/sửa/xoá yêu cầu header `Authorization: Bearer <accessToken>` và đúng role.
List endpoint hỗ trợ chung `?page&limit`, phần lớn hỗ trợ thêm `search`/filter riêng theo domain.

## Auth (`/api/auth`)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/register` | Không | Đăng ký khách hàng |
| POST | `/login` | Không | Đăng nhập |
| POST | `/refresh` | Không | Cấp lại access token từ refresh token |
| POST | `/logout` | Không | Đăng xuất (stateless — client tự xoá token) |
| POST | `/forgot-password` | Không | Gửi link đặt lại mật khẩu (log console ở dev, chưa nối email thật) |
| POST | `/reset-password` | Không | Đặt lại mật khẩu bằng token |
| GET | `/me` | Có | Thông tin tài khoản hiện tại |
| PUT | `/me` | Có | Cập nhật hồ sơ |
| PUT | `/me/password` | Có | Đổi mật khẩu |

## Categories (`/api/categories`)

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/` `/:id` | Không |
| POST `/`, PUT `/:id`, DELETE `/:id` | ADMIN, MANAGER |

## Products (`/api/products`)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/?search=&categoryId=&minPrice=&maxPrice=&status=&isFeatured=&isBestSeller=&onSale=&isNew=&sort=price_asc\|price_desc\|popular\|newest\|rating&page=&limit=` | Không | |
| GET | `/:idOrSlug` | Không | Chi tiết món (theo id hoặc slug) kèm reviews |
| GET | `/:id/reviews` | Không | |
| POST `/`, PUT `/:id`, DELETE `/:id` | ADMIN, MANAGER | |
| POST | `/:id/images` (multipart, field `image`) | ADMIN, MANAGER | Upload ảnh món |
| DELETE | `/:id/images/:imageId` | ADMIN, MANAGER | |

## Orders (`/api/orders`)

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/` | Tuỳ chọn | Tạo đơn (khách vãng lai hoặc đã đăng nhập) |
| GET | `/code/:code` | Không | Tra cứu đơn theo mã (theo dõi đơn) |
| GET | `/mine` | CUSTOMER | Lịch sử đơn của tôi |
| GET | `/` | Staff | Danh sách (filter `status,orderType,search,dateFrom,dateTo`) |
| GET | `/:id` | Có | Chi tiết (khách chỉ xem đơn của mình) |
| PUT | `/:id/status` | Staff (KITCHEN chỉ PREPARING/READY) | Chuyển trạng thái |
| PUT | `/:id/table` | ADMIN, MANAGER, STAFF | Chuyển bàn (đơn DINE_IN) |
| POST | `/:id/cancel` | Có | Huỷ đơn (khách chỉ huỷ được khi PENDING/CONFIRMED) |

Trạng thái: `PENDING → CONFIRMED → PREPARING → READY → DELIVERING → COMPLETED`, hoặc `CANCELLED`.

## Tables (`/api/tables`)

GET `/`, GET `/:id` (Staff+) · POST `/`, PUT `/:id`, DELETE `/:id` (ADMIN, MANAGER) · PUT `/:id/status` (Staff+)

## Reservations (`/api/reservations`)

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/availability?reservationDate=&reservationTime=&partySize=&area=` | Không |
| POST | `/` | Tuỳ chọn |
| GET | `/code/:code` | Không |
| GET | `/` | ADMIN, MANAGER, STAFF |
| PUT | `/:id/status` | ADMIN, MANAGER, STAFF |

## Customers (`/api/customers`) — ADMIN, MANAGER

GET `/`, GET `/:id`, PUT `/:id/status`

## Employees (`/api/employees`) — ADMIN only

GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id` (soft-deactivate)

## Ingredients (`/api/ingredients`) — ADMIN, MANAGER

GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id`

## Suppliers (`/api/suppliers`) — ADMIN, MANAGER

GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id`

## Inventory (`/api/inventory`) — ADMIN, MANAGER

GET `/dashboard`, GET `/transactions`, POST `/transactions` (`type: IMPORT|EXPORT|ADJUST|STOCKTAKE`)

## Coupons (`/api/coupons`)

POST `/validate` (không cần đăng nhập) · GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id` (ADMIN, MANAGER)

## Reviews (`/api/reviews`)

GET `/products/:id/reviews` (không cần đăng nhập) · POST `/api/reviews` (CUSTOMER, chỉ trên đơn COMPLETED) ·
GET `/`, PUT `/:id/hide`, PUT `/:id/unhide`, DELETE `/:id` (ADMIN, MANAGER)

## Dashboard (`/api/dashboard`) — ADMIN, MANAGER

GET `/statistics`, GET `/orders-by-status`, GET `/revenue-trend?days=14`

## Reports (`/api/reports`) — ADMIN, MANAGER

GET `/revenue?range=today|7d|30d|month|year|custom&from=&to=&export=csv`
