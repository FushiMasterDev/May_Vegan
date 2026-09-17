-- ============================================================================
-- Mây Vegan — Seed Data
-- Dữ liệu mẫu thực tế cho quán ăn chay Mây Vegan (không dùng lorem ipsum).
-- Idempotent: TRUNCATE toàn bộ bảng nghiệp vụ trước khi insert lại, để có thể
-- chạy lại script này nhiều lần trên môi trường dev mà không lỗi trùng khoá.
--
-- Ghi chú: đường dẫn ảnh (`product_images.image_url`) và avatar là placeholder
-- theo quy ước lưu trữ `/uploads/...` của backend — sẽ được thay bằng ảnh thật
-- khi admin upload qua chức năng quản lý món ăn (Phase 3/4).
--
-- Tài khoản demo (mật khẩu xem database/seed-accounts.md — không commit mật
-- khẩu thật vào mã nguồn production).
-- ============================================================================

USE mayvegan;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE notifications;
TRUNCATE TABLE reviews;
TRUNCATE TABLE coupon_usages;
TRUNCATE TABLE payments;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE coupons;
TRUNCATE TABLE reservations;
TRUNCATE TABLE tables;
TRUNCATE TABLE inventory_transactions;
TRUNCATE TABLE ingredients;
TRUNCATE TABLE product_images;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE employees;
TRUNCATE TABLE customers;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- roles
-- ----------------------------------------------------------------------------
INSERT INTO roles (id, name, description) VALUES
  (1, 'ADMIN',    'Toàn quyền quản trị hệ thống'),
  (2, 'MANAGER',  'Quản lý cửa hàng: món ăn, kho, khuyến mãi, báo cáo'),
  (3, 'STAFF',    'Nhân viên phục vụ: đơn hàng, bàn, đặt bàn'),
  (4, 'KITCHEN',  'Nhân viên bếp: xem và cập nhật trạng thái món đang chuẩn bị'),
  (5, 'CUSTOMER', 'Khách hàng đặt món/đặt bàn online');

-- ----------------------------------------------------------------------------
-- users
-- Mật khẩu demo (đã bcrypt-hash, xem database/seed-accounts.md):
--   Tài khoản nhân viên: MayVegan@2026
--   Tài khoản khách hàng mẫu: KhachHang@2026
-- ----------------------------------------------------------------------------
INSERT INTO users (id, role_id, full_name, email, phone, password_hash, status, created_at) VALUES
  (1, 1, 'Quản trị viên Mây Vegan', 'admin@mayvegan.vn',   '0900000001', '$2b$10$2hu037.mTrHdjTeOhGn54..nBX0sd.p3T3sUWH0JrKolqngV82iqa', 'ACTIVE', '2024-01-01 08:00:00'),
  (2, 2, 'Nguyễn Thị Quản Lý',     'manager@mayvegan.vn', '0900000002', '$2b$10$2hu037.mTrHdjTeOhGn54..nBX0sd.p3T3sUWH0JrKolqngV82iqa', 'ACTIVE', '2024-01-15 08:00:00'),
  (3, 3, 'Trần Văn Phục Vụ',       'staff@mayvegan.vn',   '0900000003', '$2b$10$2hu037.mTrHdjTeOhGn54..nBX0sd.p3T3sUWH0JrKolqngV82iqa', 'ACTIVE', '2024-03-01 08:00:00'),
  (4, 4, 'Lê Thị Bếp Trưởng',      'kitchen@mayvegan.vn', '0900000004', '$2b$10$2hu037.mTrHdjTeOhGn54..nBX0sd.p3T3sUWH0JrKolqngV82iqa', 'ACTIVE', '2024-02-01 08:00:00'),
  (5, 5, 'Phạm Thị Lan',    'lan.pham@gmail.com',    '0901234567', '$2b$10$rBAT5v/KpVyJh6Gcm7Klo./VBOeJm9Hl2YSNFK/SZkjxwgy84kNIu', 'ACTIVE', '2025-05-10 10:00:00'),
  (6, 5, 'Trần Văn Minh',   'minh.tran@gmail.com',   '0912345678', '$2b$10$rBAT5v/KpVyJh6Gcm7Klo./VBOeJm9Hl2YSNFK/SZkjxwgy84kNIu', 'ACTIVE', '2025-06-02 10:00:00'),
  (7, 5, 'Nguyễn Thị Hương','huong.nguyen@gmail.com','0923456789', '$2b$10$rBAT5v/KpVyJh6Gcm7Klo./VBOeJm9Hl2YSNFK/SZkjxwgy84kNIu', 'ACTIVE', '2025-07-18 10:00:00'),
  (8, 5, 'Lê Anh Đức',      'duc.le@gmail.com',      '0934567890', '$2b$10$rBAT5v/KpVyJh6Gcm7Klo./VBOeJm9Hl2YSNFK/SZkjxwgy84kNIu', 'ACTIVE', '2025-08-05 10:00:00'),
  (9, 5, 'Võ Thị Mai',      'mai.vo@gmail.com',      '0945678901', '$2b$10$rBAT5v/KpVyJh6Gcm7Klo./VBOeJm9Hl2YSNFK/SZkjxwgy84kNIu', 'ACTIVE', '2025-09-01 10:00:00');

-- ----------------------------------------------------------------------------
-- customers
-- ----------------------------------------------------------------------------
INSERT INTO customers (id, user_id, address, loyalty_points, total_orders, total_spent, created_at) VALUES
  (1, 5, '12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',  15, 2, 154500, '2025-05-10 10:00:00'),
  (2, 6, '45 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',     10, 2, 100000, '2025-06-02 10:00:00'),
  (3, 7, '78 Trần Hưng Đạo, Phường Cầu Kho, Quận 1, TP. Hồ Chí Minh', 0, 1,      0, '2025-07-18 10:00:00'),
  (4, 8, '23 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',23, 2, 233000, '2025-08-05 10:00:00'),
  (5, 9, '56 Pasteur, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',      0, 1,      0, '2025-09-01 10:00:00');

-- ----------------------------------------------------------------------------
-- employees
-- ----------------------------------------------------------------------------
INSERT INTO employees (id, user_id, employee_code, position, hired_at, status) VALUES
  (1, 1, 'NV001', 'Quản trị hệ thống',   '2024-01-01', 'ACTIVE'),
  (2, 2, 'NV002', 'Quản lý cửa hàng',    '2024-01-15', 'ACTIVE'),
  (3, 3, 'NV003', 'Nhân viên phục vụ',   '2024-03-01', 'ACTIVE'),
  (4, 4, 'NV004', 'Bếp trưởng',          '2024-02-01', 'ACTIVE');

-- ----------------------------------------------------------------------------
-- suppliers
-- ----------------------------------------------------------------------------
INSERT INTO suppliers (id, name, contact_person, phone, email, address) VALUES
  (1, 'Vựa Rau Sạch Đà Lạt',   'Anh Hòa',  '0281234567', 'hoa@rausachdalat.vn',   'Phường 8, TP. Đà Lạt, Lâm Đồng'),
  (2, 'Đậu Hũ Củ Chi',         'Chị Hạnh', '0282345678', 'hanh@dauhucuchi.vn',    'Huyện Củ Chi, TP. Hồ Chí Minh'),
  (3, 'Nấm Sạch Vietfarm',     'Anh Phong','0283456789', 'phong@vietfarm.vn',     'Bến Lức, Long An'),
  (4, 'Gạo & Bún Miền Tây',    'Chị Thu',  '0284567890', 'thu@gaobunmientay.vn',  'Ninh Kiều, TP. Cần Thơ');

-- ----------------------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------------------
INSERT INTO categories (id, name, slug, description, display_order, is_active) VALUES
  (1, 'Món khai vị', 'khai-vi',      'Các món khai vị thanh nhẹ, kích thích vị giác trước bữa chính', 1, 1),
  (2, 'Món chính',   'mon-chinh',    'Các món mặn chay đậm đà, dùng kèm cơm hoặc bún',                 2, 1),
  (3, 'Cơm',         'com',          'Các món cơm chay no bụng, đủ chất',                              3, 1),
  (4, 'Mì',          'mi',           'Phở, bún, mì chay nước dùng thanh ngọt tự nhiên',                4, 1),
  (5, 'Lẩu',         'lau',          'Lẩu chay dùng cho nhóm 2-4 người',                               5, 1),
  (6, 'Canh',        'canh',         'Các món canh chay thanh mát',                                    6, 1),
  (7, 'Đồ uống',     'do-uong',      'Trà, nước ép, sinh tố tươi mỗi ngày',                            7, 1),
  (8, 'Tráng miệng', 'trang-mieng',  'Chè và món tráng miệng chay nhẹ nhàng',                          8, 1),
  (9, 'Combo',       'combo',        'Combo tiết kiệm cho 1 người hoặc cả gia đình',                   9, 1);

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
INSERT INTO products
  (id, category_id, name, slug, description, ingredients_text, calories, allergy_info, price, sale_price, status, is_featured, is_best_seller, rating_avg, rating_count, sold_count, created_at) VALUES
  (1, 1, 'Gỏi cuốn chay', 'goi-cuon-chay',
    'Gỏi cuốn tươi mát cuốn tay với bún, rau sống và đậu hũ, chấm cùng nước tương pha me chua ngọt.',
    'Bún tươi, rau sống, đậu hũ chiên, bánh tráng, nước tương me', 180, 'Có chứa đậu nành',
    45000, NULL, 'AVAILABLE', 0, 0, 4.0, 1, 20, '2024-04-01 08:00:00'),
  (2, 1, 'Chả giò chay', 'cha-gio-chay',
    'Chả giò chiên giòn nhân nấm và rau củ băm nhuyễn, ăn kèm rau sống và nước chấm chua ngọt.',
    'Bánh tráng cuốn, nấm mèo, cà rốt, miến, khoai môn', 220, 'Có chứa gluten',
    49000, NULL, 'AVAILABLE', 0, 0, 0, 0, 16, '2024-04-01 08:00:00'),
  (3, 1, 'Nem nướng chay', 'nem-nuong-chay',
    'Nem nướng chay thơm mùi sả, ăn kèm bánh tráng, rau sống và nước chấm đậu phộng.',
    'Đậu hũ, sả, rau thơm, bánh tráng, tương đậu phộng', 200, 'Có chứa đậu phộng',
    52000, NULL, 'AVAILABLE', 0, 0, 0, 0, 12, '2024-04-01 08:00:00'),
  (4, 2, 'Đậu hũ sốt nấm', 'dau-hu-sot-nam',
    'Đậu hũ non chiên sém vàng, rưới sốt nấm đông cô đậm đà, ăn kèm cơm trắng nóng hổi.',
    'Đậu hũ non, nấm đông cô, hành boa rô, nước tương', 260, 'Có chứa đậu nành',
    65000, 55000, 'AVAILABLE', 1, 1, 5.0, 1, 45, '2024-04-05 08:00:00'),
  (5, 2, 'Nấm kho tiêu', 'nam-kho-tieu',
    'Nấm bào ngư kho tiêu kiểu Nam Bộ, vị mặn ngọt hài hoà, cay nhẹ từ tiêu xanh.',
    'Nấm bào ngư, tiêu xanh, nước dừa, nước tương', 190, NULL,
    68000, NULL, 'AVAILABLE', 0, 0, 0, 0, 22, '2024-04-05 08:00:00'),
  (6, 2, 'Đậu hũ chiên sả ớt', 'dau-hu-chien-sa-ot',
    'Đậu hũ chiên giòn áo lớp sả ớt thơm nồng, món ăn được yêu thích nhất trong nhóm món chính cay.',
    'Đậu hũ, sả, ớt, tỏi', 240, 'Có chứa đậu nành, cay',
    62000, NULL, 'AVAILABLE', 0, 0, 0, 0, 19, '2024-04-05 08:00:00'),
  (7, 2, 'Rau củ xào thập cẩm', 'rau-cu-xao-thap-cam',
    'Bông cải, cà rốt, nấm và đậu que xào giòn với dầu mè, giữ trọn vị ngọt tự nhiên của rau củ.',
    'Bông cải xanh, cà rốt, nấm, đậu que, dầu mè', 150, NULL,
    58000, NULL, 'AVAILABLE', 0, 0, 0, 0, 14, '2024-04-05 08:00:00'),
  (8, 3, 'Cơm tấm chay', 'com-tam-chay',
    'Cơm tấm chay kiểu Sài Gòn với đậu hũ chiên sả, chả chay và trứng chay, dùng kèm nước mắm chay.',
    'Cơm tấm, đậu hũ, chả chay, trứng chay, dưa leo', 520, 'Có chứa đậu nành',
    59000, NULL, 'AVAILABLE', 0, 1, 0, 0, 38, '2024-04-10 08:00:00'),
  (9, 3, 'Cơm chiên rau củ', 'com-chien-rau-cu',
    'Cơm chiên với cà rốt, bắp non, đậu Hà Lan và trứng chay, hạt cơm tơi thơm mùi dầu mè.',
    'Cơm trắng, cà rốt, bắp non, đậu Hà Lan, trứng chay', 480, NULL,
    55000, NULL, 'AVAILABLE', 0, 0, 0, 0, 21, '2024-04-10 08:00:00'),
  (10, 3, 'Cơm cuộn rong biển chay', 'com-cuon-rong-bien-chay',
    'Cơm cuộn kiểu Hàn với rong biển, cà rốt, dưa leo và đậu hũ áp chảo, cắt miếng vừa ăn.',
    'Cơm, rong biển, cà rốt, dưa leo, đậu hũ áp chảo', 400, NULL,
    65000, NULL, 'AVAILABLE', 0, 0, 0, 0, 9, '2024-04-10 08:00:00'),
  (11, 4, 'Phở chay', 'pho-chay',
    'Nước dùng phở ninh từ rau củ và nấm trong nhiều giờ, thanh ngọt tự nhiên, ăn kèm đậu hũ và rau thơm.',
    'Bánh phở, nấm đông cô, đậu hũ, rau thơm, giá', 350, NULL,
    55000, NULL, 'AVAILABLE', 1, 1, 5.0, 1, 40, '2024-04-02 08:00:00'),
  (12, 4, 'Bún Huế chay', 'bun-hue-chay',
    'Bún bò Huế phiên bản chay cay nồng đặc trưng, nước dùng sả ớt đậm đà, ăn kèm chả chay.',
    'Bún, sả, ớt, chả chay, rau sống', 380, 'Cay',
    58000, NULL, 'AVAILABLE', 0, 0, 0, 0, 17, '2024-04-02 08:00:00'),
  (13, 4, 'Mì xào rau củ chay', 'mi-xao-rau-cu-chay',
    'Mì trứng chay xào giòn cạnh, phủ rau củ và nấm xào sốt nâu sánh nhẹ.',
    'Mì trứng chay, nấm, cải thìa, cà rốt', 420, 'Có chứa gluten',
    52000, NULL, 'AVAILABLE', 0, 0, 0, 0, 11, '2024-04-02 08:00:00'),
  (14, 5, 'Lẩu nấm', 'lau-nam',
    'Lẩu nước dùng ngọt thanh từ nấm và rau củ, thập cẩm nhiều loại nấm tươi, dùng cho 2-3 người.',
    'Nấm đông cô, nấm bào ngư, cải thảo, đậu hũ, bún', 600, NULL,
    189000, NULL, 'AVAILABLE', 1, 0, 5.0, 1, 25, '2024-04-08 08:00:00'),
  (15, 5, 'Lẩu Thái chay', 'lau-thai-chay',
    'Lẩu Thái chua cay chay, vị sả chanh đặc trưng, ăn kèm nấm, đậu hũ và rau nhúng thập cẩm.',
    'Sả, lá chanh, nấm, đậu hũ, cà chua', 580, 'Cay',
    199000, NULL, 'AVAILABLE', 0, 0, 0, 0, 8, '2024-04-08 08:00:00'),
  (16, 6, 'Canh chua chay', 'canh-chua-chay',
    'Canh chua vị me thanh nhẹ với đậu bắp, thơm, cà chua và đậu hũ, không quá chua.',
    'Me, thơm, cà chua, đậu bắp, đậu hũ', 120, NULL,
    45000, NULL, 'AVAILABLE', 0, 0, 4.0, 1, 18, '2024-04-06 08:00:00'),
  (17, 6, 'Canh rong biển đậu hũ', 'canh-rong-bien-dau-hu',
    'Canh thanh đạm với rong biển và đậu hũ non, thích hợp dùng cùng các món chiên xào đậm vị.',
    'Rong biển, đậu hũ non, hành lá', 90, 'Có chứa đậu nành',
    42000, NULL, 'AVAILABLE', 0, 0, 0, 0, 13, '2024-04-06 08:00:00'),
  (18, 7, 'Trà sen', 'tra-sen',
    'Trà ướp hương sen tự nhiên, vị thanh nhẹ, thích hợp dùng nóng hoặc đá.',
    'Trà xanh, hoa sen', 20, NULL,
    29000, NULL, 'AVAILABLE', 0, 0, 4.0, 1, 52, '2024-04-01 08:00:00'),
  (19, 7, 'Nước ép cam cà rốt', 'nuoc-ep-cam-ca-rot',
    'Nước ép tươi từ cam và cà rốt, giàu vitamin, không thêm đường.',
    'Cam, cà rốt', 90, NULL,
    35000, NULL, 'AVAILABLE', 0, 0, 0, 0, 15, '2024-04-01 08:00:00'),
  (20, 7, 'Sinh tố bơ', 'sinh-to-bo',
    'Sinh tố bơ sáp béo mịn, xay cùng sữa hạt, không dùng sữa động vật.',
    'Bơ sáp, sữa hạt, đá', 210, NULL,
    39000, NULL, 'AVAILABLE', 0, 0, 0, 0, 24, '2024-04-01 08:00:00'),
  (21, 7, 'Nước ép dứa', 'nuoc-ep-dua',
    'Nước ép dứa tươi mát, vị chua ngọt tự nhiên, giải nhiệt ngày nắng.',
    'Dứa tươi', 80, NULL,
    32000, NULL, 'AVAILABLE', 0, 0, 0, 0, 10, '2024-04-01 08:00:00'),
  (22, 8, 'Chè đậu xanh', 'che-dau-xanh',
    'Chè đậu xanh nấu nhuyễn mịn, nước cốt dừa béo nhẹ, vị ngọt thanh vừa phải.',
    'Đậu xanh, nước cốt dừa, đường thốt nốt', 250, NULL,
    25000, NULL, 'AVAILABLE', 0, 0, 0, 0, 27, '2024-04-01 08:00:00'),
  (23, 8, 'Chè hạt sen long nhãn', 'che-hat-sen-long-nhan',
    'Chè hạt sen long nhãn thanh mát, tốt cho giấc ngủ, độ ngọt nhẹ nhàng.',
    'Hạt sen, long nhãn, đường phèn', 230, NULL,
    29000, NULL, 'AVAILABLE', 0, 0, 0, 0, 16, '2024-04-01 08:00:00'),
  (24, 8, 'Rau câu dừa', 'rau-cau-dua',
    'Rau câu dừa mềm mịn, béo nhẹ vị nước cốt dừa, thích hợp tráng miệng sau bữa ăn.',
    'Bột rau câu, nước cốt dừa, đường', 160, 'Có chứa dừa',
    22000, NULL, 'AVAILABLE', 0, 0, 0, 0, 20, '2024-04-01 08:00:00'),
  (25, 9, 'Combo Mây', 'combo-may',
    'Combo Mây gồm Cơm tấm chay, Canh chua chay và Trà sen — lựa chọn trọn vị, tiết kiệm cho 1 người.',
    'Cơm tấm chay, Canh chua chay, Trà sen', 700, NULL,
    149000, 129000, 'AVAILABLE', 1, 1, 0, 0, 30, '2024-04-12 08:00:00'),
  (26, 9, 'Combo Gia đình Mây Vegan', 'combo-gia-dinh-may-vegan',
    'Combo cho 3-4 người gồm Lẩu nấm, Cơm chiên rau củ, Gỏi cuốn chay và Trà sen — đủ đầy cho cả gia đình.',
    'Lẩu nấm, Cơm chiên rau củ, Gỏi cuốn chay, Trà sen', 1500, NULL,
    349000, NULL, 'AVAILABLE', 0, 0, 0, 0, 6, '2024-04-12 08:00:00');

-- ----------------------------------------------------------------------------
-- product_images (1 ảnh chính / món — placeholder path, thay bằng ảnh thật khi upload)
-- ----------------------------------------------------------------------------
INSERT INTO product_images (product_id, image_url, is_primary, display_order)
SELECT id, CONCAT('/uploads/products/', slug, '-1.jpg'), 1, 1 FROM products;

-- ----------------------------------------------------------------------------
-- ingredients
-- ----------------------------------------------------------------------------
INSERT INTO ingredients (id, code, name, unit, quantity_in_stock, min_stock_level, cost_price, supplier_id, imported_at, expiry_date) VALUES
  (1,  'NL001', 'Đậu hũ',            'kg', 8.5,  10, 25000,  2, '2026-09-15', '2026-09-22'),
  (2,  'NL002', 'Nấm đông cô',       'kg', 12,   5,  120000, 3, '2026-09-14', '2026-09-28'),
  (3,  'NL003', 'Nấm bào ngư',       'kg', 3.2,  5,  90000,  3, '2026-09-15', '2026-09-25'),
  (4,  'NL004', 'Rau cải xanh',      'kg', 15,   8,  18000,  1, '2026-09-16', '2026-09-20'),
  (5,  'NL005', 'Bún tươi',          'kg', 20,   10, 15000,  4, '2026-09-16', '2026-09-19'),
  (6,  'NL006', 'Bánh phở',          'kg', 18,   10, 16000,  4, '2026-09-16', '2026-09-19'),
  (7,  'NL007', 'Gạo tấm',           'kg', 50,   20, 22000,  4, '2026-09-10', '2027-03-10'),
  (8,  'NL008', 'Sả',                'kg', 4,    3,  20000,  1, '2026-09-14', '2026-09-29'),
  (9,  'NL009', 'Ớt',                'kg', 2,    2,  35000,  1, '2026-09-14', '2026-09-24'),
  (10, 'NL010', 'Nước cốt dừa',      'lít',10,   5,  40000,  2, '2026-09-12', '2026-10-12'),
  (11, 'NL011', 'Hạt sen',           'kg', 6,    4,  150000, 1, '2026-09-08', '2026-12-08'),
  (12, 'NL012', 'Đường thốt nốt',    'kg', 9,    5,  45000,  1, '2026-09-01', '2027-03-01'),
  (13, 'NL013', 'Rong biển khô',     'kg', 1.5,  2,  180000, 3, '2026-08-20', '2027-02-20'),
  (14, 'NL014', 'Cà rốt',            'kg', 14,   5,  15000,  1, '2026-09-16', '2026-09-30'),
  (15, 'NL015', 'Bơ sáp',            'kg', 7,    3,  60000,  1, '2026-09-15', '2026-09-22'),
  (16, 'NL016', 'Đậu xanh',          'kg', 11,   5,  35000,  1, '2026-09-05', '2027-01-05');

-- ----------------------------------------------------------------------------
-- inventory_transactions
-- ----------------------------------------------------------------------------
INSERT INTO inventory_transactions (ingredient_id, type, quantity, unit_cost, note, created_by, created_at) VALUES
  (1,  'IMPORT', 10.5, 25000,  'Nhập kho ban đầu', 2, '2026-09-15 07:30:00'),
  (2,  'IMPORT', 12,   120000, 'Nhập kho ban đầu', 2, '2026-09-14 07:30:00'),
  (3,  'IMPORT', 5,    90000,  'Nhập kho ban đầu', 2, '2026-09-15 07:30:00'),
  (4,  'IMPORT', 15,   18000,  'Nhập kho ban đầu', 2, '2026-09-16 07:30:00'),
  (5,  'IMPORT', 20,   15000,  'Nhập kho ban đầu', 2, '2026-09-16 07:30:00'),
  (6,  'IMPORT', 18,   16000,  'Nhập kho ban đầu', 2, '2026-09-16 07:30:00'),
  (7,  'IMPORT', 50,   22000,  'Nhập kho ban đầu', 2, '2026-09-10 07:30:00'),
  (8,  'IMPORT', 4,    20000,  'Nhập kho ban đầu', 2, '2026-09-14 07:30:00'),
  (9,  'IMPORT', 2,    35000,  'Nhập kho ban đầu', 2, '2026-09-14 07:30:00'),
  (10, 'IMPORT', 10,   40000,  'Nhập kho ban đầu', 2, '2026-09-12 07:30:00'),
  (11, 'IMPORT', 6,    150000, 'Nhập kho ban đầu', 2, '2026-09-08 07:30:00'),
  (12, 'IMPORT', 9,    45000,  'Nhập kho ban đầu', 2, '2026-09-01 07:30:00'),
  (13, 'IMPORT', 2,    180000, 'Nhập kho ban đầu', 2, '2026-08-20 07:30:00'),
  (14, 'IMPORT', 14,   15000,  'Nhập kho ban đầu', 2, '2026-09-16 07:30:00'),
  (15, 'IMPORT', 7,    60000,  'Nhập kho ban đầu', 2, '2026-09-15 07:30:00'),
  (16, 'IMPORT', 11,   35000,  'Nhập kho ban đầu', 2, '2026-09-05 07:30:00'),
  (1,  'EXPORT', -2,   NULL,   'Xuất cho chế biến ngày 16/09', 4, '2026-09-16 10:00:00'),
  (13, 'STOCKTAKE', -0.5, NULL, 'Kiểm kê định kỳ tháng 9, phát hiện hao hụt nhẹ', 2, '2026-09-16 18:00:00'),
  (3,  'ADJUST', -1.8, NULL,   'Điều chỉnh sau kiểm kê, nấm hư hỏng một phần', 2, '2026-09-16 18:10:00');

-- ----------------------------------------------------------------------------
-- tables
-- ----------------------------------------------------------------------------
INSERT INTO tables (id, code, seats, area, status) VALUES
  (1,  'B01', 4,  'Tầng 1',    'AVAILABLE'),
  (2,  'B02', 4,  'Tầng 1',    'OCCUPIED'),
  (3,  'B03', 2,  'Tầng 1',    'AVAILABLE'),
  (4,  'B04', 6,  'Tầng 1',    'RESERVED'),
  (5,  'B05', 4,  'Tầng 2',    'AVAILABLE'),
  (6,  'B06', 4,  'Tầng 2',    'CLEANING'),
  (7,  'B07', 2,  'Tầng 2',    'AVAILABLE'),
  (8,  'B08', 8,  'Sân vườn',  'AVAILABLE'),
  (9,  'B09', 6,  'Sân vườn',  'OCCUPIED'),
  (10, 'B10', 4,  'Sân vườn',  'MAINTENANCE'),
  (11, 'B11', 6,  'Phòng VIP', 'RESERVED'),
  (12, 'B12', 10, 'Phòng VIP', 'OCCUPIED');

-- ----------------------------------------------------------------------------
-- reservations
-- ----------------------------------------------------------------------------
INSERT INTO reservations (reservation_code, customer_id, guest_name, guest_phone, table_id, party_size, reservation_date, reservation_time, area, note, status, created_at) VALUES
  ('RS20260917001', 1,    'Phạm Thị Lan',   '0901234567', 4,    4, '2026-09-17', '18:30:00', 'Tầng 1',    'Sinh nhật, cần bàn yên tĩnh', 'CONFIRMED', '2026-09-14 09:15:00'),
  ('RS20260917002', NULL, 'Ngô Thị Hạnh',   '0978901234', 11,   6, '2026-09-17', '19:00:00', 'Phòng VIP', NULL,                          'PENDING',   '2026-09-16 20:00:00'),
  ('RS20260918001', 3,    'Nguyễn Thị Hương','0923456789', NULL, 2, '2026-09-18', '12:00:00', 'Tầng 2',    NULL,                          'PENDING',   '2026-09-16 21:30:00'),
  ('RS20260916001', 5,    'Võ Thị Mai',     '0945678901', 9,    6, '2026-09-16', '19:30:00', 'Sân vườn',  NULL,                          'COMPLETED', '2026-09-13 14:00:00'),
  ('RS20260915001', 2,    'Trần Văn Minh',  '0912345678', 2,    4, '2026-09-15', '12:30:00', 'Tầng 1',    'Khách bận đột xuất',          'CANCELLED', '2026-09-12 08:00:00');

-- ----------------------------------------------------------------------------
-- coupons
-- ----------------------------------------------------------------------------
INSERT INTO coupons (id, code, name, discount_type, discount_value, min_order_amount, max_discount_amount, start_date, end_date, usage_limit, used_count, status) VALUES
  (1, 'MAYVEGAN10', 'Giảm 10% cho đơn từ 150.000đ',   'PERCENT', 10,    150000, 30000, '2026-09-01', '2026-12-31', 500, 1, 'ACTIVE'),
  (2, 'FREESHIP',   'Miễn phí giao hàng',             'AMOUNT',  15000, 100000, NULL,  '2026-09-01', '2026-12-31', 1000,1, 'ACTIVE'),
  (3, 'WELCOME50',  'Giảm 50.000đ cho khách hàng mới','AMOUNT',  50000, 200000, NULL,  '2026-09-01', '2026-12-31', 200, 0, 'ACTIVE');

-- ----------------------------------------------------------------------------
-- orders
-- ----------------------------------------------------------------------------
INSERT INTO orders (id, order_code, customer_id, table_id, employee_id, coupon_id, order_type, status, guest_name, guest_phone, guest_email, delivery_address, note, requested_time, subtotal, discount_amount, delivery_fee, total_amount, payment_method, payment_status, created_at) VALUES
  (1,  'MV20260915001', 1,    NULL, NULL, 1,    'DELIVERY', 'COMPLETED',  NULL, NULL, NULL, '12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', NULL, '2026-09-15 12:00:00', 155000, 15500, 15000, 154500, 'CASH',          'PAID',   '2026-09-15 11:20:00'),
  (2,  'MV20260915002', 2,    2,    3,    NULL, 'DINE_IN',  'PREPARING',  NULL, NULL, NULL, NULL, 'Ăn tại bàn B02', '2026-09-15 19:00:00', 247000, 0,     0,     247000, 'CASH',          'UNPAID', '2026-09-15 18:45:00'),
  (3,  'MV20260915003', NULL, NULL, NULL, NULL, 'PICKUP',   'COMPLETED',  'Hoàng Văn Khách', '0956789012', NULL, NULL, NULL, '2026-09-15 13:00:00', 164000, 0,     0,     164000, 'BANK_TRANSFER', 'PAID',   '2026-09-15 12:30:00'),
  (4,  'MV20260916001', 3,    NULL, NULL, NULL, 'DELIVERY', 'CANCELLED',  NULL, NULL, NULL, '78 Trần Hưng Đạo, Phường Cầu Kho, Quận 1, TP. Hồ Chí Minh', 'Khách huỷ do chuyển khoản thất bại', '2026-09-16 12:30:00', 199000, 0, 15000, 214000, 'BANK_TRANSFER', 'UNPAID', '2026-09-16 11:50:00'),
  (5,  'MV20260916002', 4,    9,    3,    NULL, 'DINE_IN',  'READY',      NULL, NULL, NULL, NULL, NULL, '2026-09-16 19:30:00', 166000, 0,     0,     166000, 'CASH',          'UNPAID', '2026-09-16 19:10:00'),
  (6,  'MV20260916003', 5,    NULL, NULL, 2,    'DELIVERY', 'DELIVERING', NULL, NULL, NULL, '56 Pasteur, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', NULL, '2026-09-16 20:00:00', 110000, 15000, 15000, 110000, 'ONLINE', 'PAID',   '2026-09-16 19:20:00'),
  (7,  'MV20260917001', 1,    NULL, NULL, NULL, 'PICKUP',   'CONFIRMED',  NULL, NULL, NULL, NULL, NULL, '2026-09-17 18:00:00', 349000, 0,     0,     349000, 'CASH',          'UNPAID', '2026-09-17 09:05:00'),
  (8,  'MV20260917002', NULL, 12,   3,    NULL, 'DINE_IN',  'PENDING',    'Yến Nhi', '0967890123', NULL, NULL, NULL, '2026-09-17 12:15:00', 135000, 0, 0, 135000, 'CASH', 'UNPAID', '2026-09-17 12:00:00'),
  (9,  'MV20260914001', 2,    NULL, NULL, NULL, 'PICKUP',   'COMPLETED',  NULL, NULL, NULL, NULL, NULL, '2026-09-14 12:00:00', 100000, 0,     0,     100000, 'CASH',          'PAID',   '2026-09-14 11:30:00'),
  (10, 'MV20260914002', 4,    NULL, NULL, NULL, 'DELIVERY', 'COMPLETED',  NULL, NULL, NULL, '23 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh', NULL, '2026-09-14 19:00:00', 218000, 0, 15000, 233000, 'BANK_TRANSFER', 'PAID', '2026-09-14 18:15:00');

-- ----------------------------------------------------------------------------
-- order_items
-- ----------------------------------------------------------------------------
INSERT INTO order_items (order_id, product_id, product_name_snapshot, unit_price, quantity, subtotal) VALUES
  (1, 11, 'Phở chay',        55000, 2, 110000),
  (1, 1,  'Gỏi cuốn chay',   45000, 1, 45000),
  (2, 14, 'Lẩu nấm',         189000,1, 189000),
  (2, 18, 'Trà sen',         29000, 2, 58000),
  (3, 25, 'Combo Mây',       129000,1, 129000),
  (3, 19, 'Nước ép cam cà rốt', 35000, 1, 35000),
  (4, 15, 'Lẩu Thái chay',   199000,1, 199000),
  (5, 12, 'Bún Huế chay',    58000, 2, 116000),
  (5, 22, 'Chè đậu xanh',    25000, 2, 50000),
  (6, 9,  'Cơm chiên rau củ',55000, 1, 55000),
  (6, 4,  'Đậu hũ sốt nấm',  55000, 1, 55000),
  (7, 26, 'Combo Gia đình Mây Vegan', 349000, 1, 349000),
  (8, 13, 'Mì xào rau củ chay', 52000, 1, 52000),
  (8, 20, 'Sinh tố bơ',      39000, 1, 39000),
  (8, 24, 'Rau câu dừa',     22000, 2, 44000),
  (9, 4,  'Đậu hũ sốt nấm',  55000, 1, 55000),
  (9, 16, 'Canh chua chay',  45000, 1, 45000),
  (10,14, 'Lẩu nấm',         189000,1, 189000),
  (10,18, 'Trà sen',         29000, 1, 29000);

-- ----------------------------------------------------------------------------
-- payments (1-1 với orders)
-- ----------------------------------------------------------------------------
INSERT INTO payments (order_id, amount, method, status, paid_at, created_at) VALUES
  (1,  154500, 'CASH',          'SUCCESS', '2026-09-15 12:10:00', '2026-09-15 11:20:00'),
  (2,  247000, 'CASH',          'PENDING', NULL,                  '2026-09-15 18:45:00'),
  (3,  164000, 'BANK_TRANSFER', 'SUCCESS', '2026-09-15 12:35:00', '2026-09-15 12:30:00'),
  (4,  214000, 'BANK_TRANSFER', 'FAILED',  NULL,                  '2026-09-16 11:55:00'),
  (5,  166000, 'CASH',          'PENDING', NULL,                  '2026-09-16 19:10:00'),
  (6,  110000, 'ONLINE',        'SUCCESS', '2026-09-16 19:22:00', '2026-09-16 19:20:00'),
  (7,  349000, 'CASH',          'PENDING', NULL,                  '2026-09-17 09:05:00'),
  (8,  135000, 'CASH',          'PENDING', NULL,                  '2026-09-17 12:00:00'),
  (9,  100000, 'CASH',          'SUCCESS', '2026-09-14 12:05:00', '2026-09-14 11:30:00'),
  (10, 233000, 'BANK_TRANSFER', 'SUCCESS', '2026-09-14 18:20:00', '2026-09-14 18:15:00');

-- ----------------------------------------------------------------------------
-- coupon_usages
-- ----------------------------------------------------------------------------
INSERT INTO coupon_usages (coupon_id, order_id, customer_id, discount_amount, used_at) VALUES
  (1, 1, 1, 15500, '2026-09-15 11:20:00'),
  (2, 6, 5, 15000, '2026-09-16 19:20:00');

-- ----------------------------------------------------------------------------
-- reviews (chỉ trên đơn đã COMPLETED của khách có tài khoản)
-- ----------------------------------------------------------------------------
INSERT INTO reviews (product_id, customer_id, order_id, rating, comment, status, created_at) VALUES
  (11, 1, 1,  5, 'Phở chay thơm ngon, nước dùng đậm đà mà vẫn thanh nhẹ. Chắc chắn sẽ quay lại!', 'VISIBLE', '2026-09-15 20:00:00'),
  (1,  1, 1,  4, 'Gỏi cuốn tươi, chấm nước tương rất vừa miệng, chỉ hơi ít rau.',                  'VISIBLE', '2026-09-15 20:05:00'),
  (4,  2, 9,  5, 'Đậu hũ mềm, sốt nấm đậm vị, ăn với cơm trắng cực kỳ hợp.',                        'VISIBLE', '2026-09-14 13:00:00'),
  (16, 2, 9,  4, 'Canh chua vị vừa phải, không quá chua, có nhiều loại rau.',                       'VISIBLE', '2026-09-14 13:05:00'),
  (14, 4, 10, 5, 'Lẩu nấm nước dùng ngọt thanh tự nhiên, nhiều loại nấm tươi, ăn cùng bạn bè rất thích hợp.', 'VISIBLE', '2026-09-14 20:30:00'),
  (18, 4, 10, 4, 'Trà sen thơm nhẹ, không quá ngọt, uống rất thư giãn.',                            'VISIBLE', '2026-09-14 20:32:00');

-- ----------------------------------------------------------------------------
-- notifications
-- ----------------------------------------------------------------------------
INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES
  (5, 'Đơn hàng MV20260915001 đã hoàn thành',  'Cảm ơn bạn đã dùng bữa cùng Mây Vegan. Đừng quên để lại đánh giá nhé!', 'ORDER_STATUS', 1, '2026-09-15 13:00:00'),
  (5, 'Đặt bàn RS20260917001 đã được xác nhận', 'Bàn B04 (Tầng 1) đã sẵn sàng cho bạn lúc 18:30 ngày 17/09/2026.',       'RESERVATION',  0, '2026-09-14 09:20:00'),
  (9, 'Đơn hàng MV20260916003 đang được giao',  'Shipper đang trên đường giao đơn hàng của bạn.',                        'ORDER_STATUS', 0, '2026-09-16 19:40:00'),
  (1, 'Nguyên liệu Đậu hũ sắp hết hàng',        'Tồn kho hiện chỉ còn 8.5 kg, dưới mức tối thiểu 10 kg. Vui lòng nhập thêm.', 'SYSTEM',   0, '2026-09-16 10:05:00');
