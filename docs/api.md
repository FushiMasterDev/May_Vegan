# Mây Vegan — API

> Tài liệu này được cập nhật dần theo từng phase. Hiện tại (Phase 1) chỉ có endpoint health-check;
> các nhóm endpoint dưới đây là kiến trúc dự kiến, sẽ được hiện thực đầy đủ ở Phase 3.

Base URL: `/api`

Response envelope chung:

```json
{ "success": true, "data": {}, "meta": { "page": 1, "limit": 20, "total": 100 } }
{ "success": false, "message": "...", "details": {} }
```

## Hiện có

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/api/health` | Kiểm tra API sống | Không |

## Dự kiến (Phase 3)

### Auth
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký khách hàng |
| POST | `/api/auth/login` | Đăng nhập, trả access + refresh token |
| POST | `/api/auth/refresh` | Cấp lại access token |
| POST | `/api/auth/logout` | Đăng xuất |
| POST | `/api/auth/forgot-password` | Gửi yêu cầu đặt lại mật khẩu |
| POST | `/api/auth/reset-password` | Đặt lại mật khẩu |
| GET | `/api/auth/me` | Thông tin user hiện tại |

### Products / Categories
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/categories` | Danh sách danh mục |
| POST/PUT/DELETE | `/api/categories/:id` | CRUD danh mục (ADMIN/MANAGER) |
| GET | `/api/products` | Danh sách món (search, filter, sort, pagination) |
| POST/PUT/DELETE | `/api/products/:id` | CRUD món (ADMIN/MANAGER) |
| GET | `/api/products/:id/reviews` | Đánh giá của món |

### Orders
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/orders` | Danh sách đơn (filter status/date, phân trang) |
| GET | `/api/orders/:id` | Chi tiết đơn |
| POST | `/api/orders` | Tạo đơn (khách hoặc tại quầy) |
| PUT | `/api/orders/:id/status` | Chuyển trạng thái đơn |
| POST | `/api/orders/:id/cancel` | Huỷ đơn |

### Tables / Reservations
| Method | Endpoint | Mô tả |
|---|---|---|
| GET/POST/PUT/DELETE | `/api/tables(/:id)` | CRUD bàn, đổi trạng thái |
| GET/POST | `/api/reservations` | Danh sách / tạo đặt bàn |
| PUT | `/api/reservations/:id/status` | Xác nhận / huỷ đặt bàn |

### Ingredients / Inventory
| Method | Endpoint | Mô tả |
|---|---|---|
| GET/POST/PUT/DELETE | `/api/ingredients(/:id)` | CRUD nguyên liệu |
| GET | `/api/inventory/transactions` | Lịch sử nhập/xuất/điều chỉnh |
| POST | `/api/inventory/import` \| `/export` \| `/adjust` | Ghi nhận giao dịch kho |

### Customers / Employees
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/customers` | Danh sách khách hàng |
| GET | `/api/customers/:id` | Chi tiết + lịch sử mua hàng |
| GET/POST/PUT/DELETE | `/api/employees(/:id)` | CRUD nhân viên (ADMIN/MANAGER) |

### Coupons / Reviews
| Method | Endpoint | Mô tả |
|---|---|---|
| GET/POST/PUT/DELETE | `/api/coupons(/:id)` | CRUD mã giảm giá |
| POST | `/api/coupons/validate` | Kiểm tra mã hợp lệ khi checkout |
| GET | `/api/reviews` | Danh sách đánh giá |
| PUT | `/api/reviews/:id/hide` \| DELETE | Ẩn/xoá đánh giá vi phạm |

### Dashboard / Reports
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/dashboard/statistics` | Số liệu tổng quan cho dashboard |
| GET | `/api/reports/revenue` | Doanh thu theo khoảng thời gian (`?range=today\|7d\|30d\|month\|year\|custom&from=&to=`) |

Tất cả endpoint ghi/sửa/xoá đều qua middleware `authenticate` + `authorize(...roles)`.
List endpoint hỗ trợ chung `?page&limit&search&sort&order` + filter riêng theo domain.
