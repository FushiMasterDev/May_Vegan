-- ============================================================================
-- Mây Vegan — Database Schema (PostgreSQL 15+, ví dụ Neon free tier)
-- Chuẩn hoá 3NF. Mỗi bảng có created_at/updated_at, FK ràng buộc, UNIQUE cho
-- các trường định danh nghiệp vụ, INDEX cho cột lọc/tìm kiếm.
--
-- Migrate từ MySQL sang PostgreSQL (2026) để deploy backend lên Render Free
-- (không có gói MySQL miễn phí) + Neon Postgres free. Khác biệt chính so với
-- bản MySQL gốc:
--   - Không có CREATE DATABASE/USE — kết nối thẳng vào DB Neon đã tạo sẵn
--     qua DATABASE_URL.
--   - AUTO_INCREMENT -> SERIAL; INT UNSIGNED -> INTEGER (Postgres không có
--     kiểu unsigned); TINYINT -> SMALLINT; TINYINT(1) -> BOOLEAN.
--   - ENUM(...) inline (MySQL) -> CREATE TYPE ... AS ENUM (...) rồi tham
--     chiếu tên type (Postgres không hỗ trợ enum inline trong CREATE TABLE).
--   - `... ON UPDATE CURRENT_TIMESTAMP` (MySQL) không có tương đương trực
--     tiếp ở Postgres -> dùng trigger `set_updated_at()` bên dưới. Prisma
--     Client cũng có `@updatedAt` (xem schema.prisma) làm lớp dự phòng thứ 2.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Enum types (phải tạo trước các bảng dùng chúng)
-- ----------------------------------------------------------------------------
CREATE TYPE user_status AS ENUM ('ACTIVE','LOCKED');
CREATE TYPE employee_status AS ENUM ('ACTIVE','INACTIVE');
CREATE TYPE product_status AS ENUM ('AVAILABLE','OUT_OF_STOCK','HIDDEN');
CREATE TYPE table_status AS ENUM ('AVAILABLE','OCCUPIED','RESERVED','CLEANING','MAINTENANCE');
CREATE TYPE reservation_status AS ENUM ('PENDING','CONFIRMED','SEATED','COMPLETED','CANCELLED');
CREATE TYPE coupon_discount_type AS ENUM ('PERCENT','AMOUNT');
CREATE TYPE coupon_status AS ENUM ('ACTIVE','INACTIVE','EXPIRED');
CREATE TYPE order_type AS ENUM ('DINE_IN','DELIVERY','PICKUP');
CREATE TYPE order_status AS ENUM ('PENDING','CONFIRMED','PREPARING','READY','DELIVERING','COMPLETED','CANCELLED');
-- Dùng chung cho orders.payment_method và payments.method
CREATE TYPE payment_method AS ENUM ('CASH','BANK_TRANSFER','ONLINE');
-- orders.payment_status — trạng thái thanh toán ở mức đơn hàng
CREATE TYPE order_payment_status AS ENUM ('UNPAID','PAID','REFUNDED');
-- payments.status — trạng thái của một giao dịch thanh toán cụ thể
CREATE TYPE payment_status AS ENUM ('PENDING','SUCCESS','FAILED','REFUNDED');
CREATE TYPE review_status AS ENUM ('VISIBLE','HIDDEN');
CREATE TYPE inventory_transaction_type AS ENUM ('IMPORT','EXPORT','ADJUST','STOCKTAKE');

-- ----------------------------------------------------------------------------
-- Trigger dùng chung: tự set updated_at = now() mỗi khi UPDATE một hàng
-- (tương đương MySQL `... ON UPDATE CURRENT_TIMESTAMP`)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- roles
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(30) NOT NULL,
  description VARCHAR(255) NULL,
  created_at  TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_roles_name UNIQUE (name)
);

CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON roles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- users  (tài khoản đăng nhập — dùng chung cho customer lẫn nhân viên)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  role_id       INTEGER NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL,
  phone         VARCHAR(20) NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url    VARCHAR(500) NULL,
  status        user_status NOT NULL DEFAULT 'ACTIVE',
  last_login_at TIMESTAMP(0) NULL,
  created_at    TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT uq_users_phone UNIQUE (phone),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_status ON users(status);
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- customers  (hồ sơ khách hàng, 1-1 với users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL,
  address        VARCHAR(500) NULL,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  total_orders   INTEGER NOT NULL DEFAULT 0,
  total_spent    DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at     TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_customers_user UNIQUE (user_id),
  CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- employees  (hồ sơ nhân viên, 1-1 với users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL,
  employee_code  VARCHAR(20) NOT NULL,
  position       VARCHAR(100) NOT NULL,
  hired_at       DATE NULL,
  status         employee_status NOT NULL DEFAULT 'ACTIVE',
  created_at     TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_employees_user UNIQUE (user_id),
  CONSTRAINT uq_employees_code UNIQUE (employee_code),
  CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TRIGGER trg_employees_updated_at BEFORE UPDATE ON employees
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- suppliers  (nhà cung cấp nguyên liệu)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(150) NOT NULL,
  contact_person VARCHAR(100) NULL,
  phone          VARCHAR(20) NULL,
  email          VARCHAR(150) NULL,
  address        VARCHAR(500) NULL,
  created_at     TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_suppliers_updated_at BEFORE UPDATE ON suppliers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- categories  (danh mục thực đơn)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  slug           VARCHAR(120) NOT NULL,
  description    VARCHAR(500) NULL,
  display_order  INTEGER NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_categories_slug UNIQUE (slug)
);

CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- products  (món ăn)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id               SERIAL PRIMARY KEY,
  category_id      INTEGER NOT NULL,
  name             VARCHAR(150) NOT NULL,
  slug             VARCHAR(180) NOT NULL,
  description      TEXT NULL,
  ingredients_text VARCHAR(500) NULL,
  calories         SMALLINT NULL,
  allergy_info     VARCHAR(255) NULL,
  price            DECIMAL(12,2) NOT NULL,
  sale_price       DECIMAL(12,2) NULL,
  status           product_status NOT NULL DEFAULT 'AVAILABLE',
  is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
  is_best_seller   BOOLEAN NOT NULL DEFAULT FALSE,
  rating_avg       DECIMAL(2,1) NOT NULL DEFAULT 0,
  rating_count     INTEGER NOT NULL DEFAULT 0,
  sold_count       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_products_slug UNIQUE (slug),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT chk_products_price CHECK (price >= 0),
  CONSTRAINT chk_products_sale_price CHECK (sale_price IS NULL OR sale_price >= 0)
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_best_seller ON products(is_best_seller);
CREATE INDEX idx_products_name ON products(name);
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- product_images
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
  id             SERIAL PRIMARY KEY,
  product_id     INTEGER NOT NULL,
  image_url      VARCHAR(500) NOT NULL,
  is_primary     BOOLEAN NOT NULL DEFAULT FALSE,
  display_order  INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ----------------------------------------------------------------------------
-- ingredients  (nguyên liệu)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ingredients (
  id                 SERIAL PRIMARY KEY,
  code               VARCHAR(30) NOT NULL,
  name               VARCHAR(150) NOT NULL,
  unit               VARCHAR(20) NOT NULL,
  quantity_in_stock  DECIMAL(12,2) NOT NULL DEFAULT 0,
  min_stock_level    DECIMAL(12,2) NOT NULL DEFAULT 0,
  cost_price         DECIMAL(12,2) NOT NULL DEFAULT 0,
  supplier_id        INTEGER NULL,
  imported_at        DATE NULL,
  expiry_date        DATE NULL,
  created_at         TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_ingredients_code UNIQUE (code),
  CONSTRAINT fk_ingredients_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  CONSTRAINT chk_ingredients_stock CHECK (quantity_in_stock >= 0)
);

CREATE INDEX idx_ingredients_supplier ON ingredients(supplier_id);
CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE TRIGGER trg_ingredients_updated_at BEFORE UPDATE ON ingredients
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- inventory_transactions  (nhập / xuất / điều chỉnh / kiểm kê)
-- `quantity` luôn là số lượng thay đổi có dấu (IMPORT > 0, EXPORT < 0,
-- ADJUST/STOCKTAKE dương hoặc âm tuỳ chiều điều chỉnh) — tồn kho hiện tại của
-- một nguyên liệu = SUM(quantity) trên toàn bộ giao dịch của nguyên liệu đó.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id             SERIAL PRIMARY KEY,
  ingredient_id  INTEGER NOT NULL,
  type           inventory_transaction_type NOT NULL,
  quantity       DECIMAL(12,2) NOT NULL,
  unit_cost      DECIMAL(12,2) NULL,
  note           VARCHAR(500) NULL,
  created_by     INTEGER NULL,
  created_at     TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inventory_tx_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
  CONSTRAINT fk_inventory_tx_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_inventory_tx_ingredient ON inventory_transactions(ingredient_id);
CREATE INDEX idx_inventory_tx_type ON inventory_transactions(type);
CREATE INDEX idx_inventory_tx_created_at ON inventory_transactions(created_at);

-- ----------------------------------------------------------------------------
-- tables  (bàn tại quán)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tables (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(20) NOT NULL,
  seats       SMALLINT NOT NULL,
  area        VARCHAR(100) NOT NULL,
  status      table_status NOT NULL DEFAULT 'AVAILABLE',
  created_at  TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_tables_code UNIQUE (code)
);

CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_tables_area ON tables(area);
CREATE TRIGGER trg_tables_updated_at BEFORE UPDATE ON tables
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- reservations  (đặt bàn)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservations (
  id                 SERIAL PRIMARY KEY,
  reservation_code   VARCHAR(30) NOT NULL,
  customer_id        INTEGER NULL,
  guest_name         VARCHAR(100) NOT NULL,
  guest_phone        VARCHAR(20) NOT NULL,
  table_id           INTEGER NULL,
  party_size         SMALLINT NOT NULL,
  reservation_date   DATE NOT NULL,
  reservation_time   TIME(0) NOT NULL,
  area               VARCHAR(100) NULL,
  note               VARCHAR(500) NULL,
  status             reservation_status NOT NULL DEFAULT 'PENDING',
  created_at         TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_reservations_code UNIQUE (reservation_code),
  CONSTRAINT fk_reservations_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  CONSTRAINT fk_reservations_table FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL,
  CONSTRAINT chk_reservations_party_size CHECK (party_size > 0)
);

CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_table ON reservations(table_id);
CREATE TRIGGER trg_reservations_updated_at BEFORE UPDATE ON reservations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- coupons  (mã khuyến mãi)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
  id                  SERIAL PRIMARY KEY,
  code                VARCHAR(40) NOT NULL,
  name                VARCHAR(150) NOT NULL,
  discount_type       coupon_discount_type NOT NULL,
  discount_value      DECIMAL(12,2) NOT NULL,
  min_order_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
  max_discount_amount DECIMAL(12,2) NULL,
  start_date          DATE NOT NULL,
  end_date            DATE NOT NULL,
  usage_limit         INTEGER NULL,
  used_count          INTEGER NOT NULL DEFAULT 0,
  status              coupon_status NOT NULL DEFAULT 'ACTIVE',
  created_at          TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_coupons_code UNIQUE (code),
  CONSTRAINT chk_coupons_dates CHECK (end_date >= start_date),
  CONSTRAINT chk_coupons_value CHECK (discount_value > 0)
);

CREATE INDEX idx_coupons_status ON coupons(status);
CREATE TRIGGER trg_coupons_updated_at BEFORE UPDATE ON coupons
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- orders  (đơn hàng)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  order_code       VARCHAR(30) NOT NULL,
  customer_id      INTEGER NULL,
  table_id         INTEGER NULL,
  employee_id      INTEGER NULL,
  coupon_id        INTEGER NULL,
  order_type       order_type NOT NULL,
  status           order_status NOT NULL DEFAULT 'PENDING',
  guest_name       VARCHAR(100) NULL,
  guest_phone      VARCHAR(20) NULL,
  guest_email      VARCHAR(150) NULL,
  delivery_address VARCHAR(500) NULL,
  note             VARCHAR(500) NULL,
  requested_time   TIMESTAMP(0) NULL,
  subtotal         DECIMAL(12,2) NOT NULL,
  discount_amount  DECIMAL(12,2) NOT NULL DEFAULT 0,
  delivery_fee     DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount     DECIMAL(12,2) NOT NULL,
  payment_method   payment_method NOT NULL DEFAULT 'CASH',
  payment_status   order_payment_status NOT NULL DEFAULT 'UNPAID',
  created_at       TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_orders_code UNIQUE (order_code),
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_table FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL,
  CONSTRAINT chk_orders_amounts CHECK (subtotal >= 0 AND discount_amount >= 0 AND delivery_fee >= 0 AND total_amount >= 0)
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_type ON orders(order_type);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- order_items
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id                    SERIAL PRIMARY KEY,
  order_id              INTEGER NOT NULL,
  product_id            INTEGER NOT NULL,
  product_name_snapshot VARCHAR(150) NOT NULL,
  unit_price            DECIMAL(12,2) NOT NULL,
  quantity              INTEGER NOT NULL,
  note                  VARCHAR(255) NULL,
  subtotal              DECIMAL(12,2) NOT NULL,
  created_at            TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT chk_order_items_quantity CHECK (quantity > 0)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ----------------------------------------------------------------------------
-- payments
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id               SERIAL PRIMARY KEY,
  order_id         INTEGER NOT NULL,
  amount           DECIMAL(12,2) NOT NULL,
  method           payment_method NOT NULL,
  status           payment_status NOT NULL DEFAULT 'PENDING',
  transaction_ref  VARCHAR(100) NULL,
  paid_at          TIMESTAMP(0) NULL,
  created_at       TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_payments_order UNIQUE (order_id),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- coupon_usages
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupon_usages (
  id               SERIAL PRIMARY KEY,
  coupon_id        INTEGER NOT NULL,
  order_id         INTEGER NOT NULL,
  customer_id      INTEGER NULL,
  discount_amount  DECIMAL(12,2) NOT NULL,
  used_at          TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_coupon_usages_order UNIQUE (order_id),
  CONSTRAINT fk_coupon_usages_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id),
  CONSTRAINT fk_coupon_usages_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_coupon_usages_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE INDEX idx_coupon_usages_coupon ON coupon_usages(coupon_id);

-- ----------------------------------------------------------------------------
-- reviews
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id           SERIAL PRIMARY KEY,
  product_id   INTEGER NOT NULL,
  customer_id  INTEGER NOT NULL,
  order_id     INTEGER NULL,
  rating       SMALLINT NOT NULL,
  comment      VARCHAR(1000) NULL,
  image_url    VARCHAR(500) NULL,
  status       review_status NOT NULL DEFAULT 'VISIBLE',
  created_at   TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_customer ON reviews(customer_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- notifications
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL,
  title       VARCHAR(150) NOT NULL,
  message     VARCHAR(1000) NOT NULL,
  type        VARCHAR(30) NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  link        VARCHAR(500) NULL,
  created_at  TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
