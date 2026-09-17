# Tài khoản demo (chỉ dùng cho môi trường local/dev)

Dữ liệu trong `seed.sql` tạo sẵn các tài khoản sau. **Không dùng các mật khẩu
này cho môi trường production** — đây chỉ là dữ liệu mẫu để test chức năng.

## Nhân viên / Quản trị

Mật khẩu chung: `MayVegan@2026`

| Role     | Email                | Ghi chú |
|----------|-----------------------|---------|
| ADMIN    | admin@mayvegan.vn    | Toàn quyền |
| MANAGER  | manager@mayvegan.vn  | Quản lý cửa hàng |
| STAFF    | staff@mayvegan.vn    | Nhân viên phục vụ |
| KITCHEN  | kitchen@mayvegan.vn  | Nhân viên bếp |

## Khách hàng mẫu

Mật khẩu chung: `KhachHang@2026`

| Email                    | Họ tên           |
|---------------------------|------------------|
| lan.pham@gmail.com       | Phạm Thị Lan     |
| minh.tran@gmail.com      | Trần Văn Minh    |
| huong.nguyen@gmail.com   | Nguyễn Thị Hương |
| duc.le@gmail.com         | Lê Anh Đức       |
| mai.vo@gmail.com         | Võ Thị Mai       |

## Ghi chú bảo mật

- Các mật khẩu trên đã được bcrypt-hash (`bcrypt`, cost 10) trước khi lưu vào
  `seed.sql` — không có mật khẩu dạng plaintext nào trong database.
- Nếu deploy demo này lên môi trường công khai, hãy đổi mật khẩu các tài
  khoản trên ngay sau khi seed, hoặc thay `password_hash` trong `seed.sql`
  bằng hash của mật khẩu khác trước khi seed.
