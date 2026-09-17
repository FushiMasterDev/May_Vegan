-- ============================================================================
-- Mây Vegan — Database Schema (MySQL 8+)
-- Chuẩn hoá 3NF. InnoDB, utf8mb4. Mỗi bảng có created_at/updated_at, FK ràng
-- buộc, UNIQUE cho các trường định danh nghiệp vụ, INDEX cho cột lọc/tìm kiếm.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS mayvegan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mayvegan;

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- roles
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(30) NOT NULL,
  description VARCHAR(255) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_roles_name UNIQUE (name)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- users  (tài khoản đăng nhập — dùng chung cho customer lẫn nhân viên)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id       INT UNSIGNED NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL,
  phone         VARCHAR(20) NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url    VARCHAR(500) NULL,
  status        ENUM('ACTIVE','LOCKED') NOT NULL DEFAULT 'ACTIVE',
  last_login_at DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT uq_users_phone UNIQUE (phone),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_status ON users(status);

-- ----------------------------------------------------------------------------
-- customers  (hồ sơ khách hàng, 1-1 với users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  address        VARCHAR(500) NULL,
  loyalty_points INT UNSIGNED NOT NULL DEFAULT 0,
  total_orders   INT UNSIGNED NOT NULL DEFAULT 0,
  total_spent    DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_customers_user UNIQUE (user_id),
  CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- employees  (hồ sơ nhân viên, 1-1 với users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  employee_code  VARCHAR(20) NOT NULL,
  position       VARCHAR(100) NOT NULL,
  hired_at       DATE NULL,
  status         ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_employees_user UNIQUE (user_id),
  CONSTRAINT uq_employees_code UNIQUE (employee_code),
  CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- suppliers  (nhà cung cấp nguyên liệu)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(150) NOT NULL,
  contact_person VARCHAR(100) NULL,
  phone          VARCHAR(20) NULL,
  email          VARCHAR(150) NULL,
  address        VARCHAR(500) NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- categories  (danh mục thực đơn)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  slug           VARCHAR(120) NOT NULL,
  description    VARCHAR(500) NULL,
  display_order  INT NOT NULL DEFAULT 0,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_categories_slug UNIQUE (slug)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- products  (món ăn)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id      INT UNSIGNED NOT NULL,
  name             VARCHAR(150) NOT NULL,
  slug             VARCHAR(180) NOT NULL,
  description      TEXT NULL,
  ingredients_text VARCHAR(500) NULL,
  calories         SMALLINT UNSIGNED NULL,
  allergy_info     VARCHAR(255) NULL,
  price            DECIMAL(12,2) NOT NULL,
  sale_price       DECIMAL(12,2) NULL,
  status           ENUM('AVAILABLE','OUT_OF_STOCK','HIDDEN') NOT NULL DEFAULT 'AVAILABLE',
  is_featured      TINYINT(1) NOT NULL DEFAULT 0,
  is_best_seller   TINYINT(1) NOT NULL DEFAULT 0,
  rating_avg       DECIMAL(2,1) NOT NULL DEFAULT 0,
  rating_count     INT UNSIGNED NOT NULL DEFAULT 0,
  sold_count       INT UNSIGNED NOT NULL DEFAULT 0,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_products_slug UNIQUE (slug),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT chk_products_price CHECK (price >= 0),
  CONSTRAINT chk_products_sale_price CHECK (sale_price IS NULL OR sale_price >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_best_seller ON products(is_best_seller);
CREATE INDEX idx_products_name ON products(name);

-- ----------------------------------------------------------------------------
-- product_images
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id     INT UNSIGNED NOT NULL,
  image_url      VARCHAR(500) NOT NULL,
  is_primary     TINYINT(1) NOT NULL DEFAULT 0,
  display_order  INT NOT NULL DEFAULT 0,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ----------------------------------------------------------------------------
-- ingredients  (nguyên liệu)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ingredients (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code               VARCHAR(30) NOT NULL,
  name               VARCHAR(150) NOT NULL,
  unit               VARCHAR(20) NOT NULL,
  quantity_in_stock  DECIMAL(12,2) NOT NULL DEFAULT 0,
  min_stock_level    DECIMAL(12,2) NOT NULL DEFAULT 0,
  cost_price         DECIMAL(12,2) NOT NULL DEFAULT 0,
  supplier_id        INT UNSIGNED NULL,
  imported_at        DATE NULL,
  expiry_date        DATE NULL,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_ingredients_code UNIQUE (code),
  CONSTRAINT fk_ingredients_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  CONSTRAINT chk_ingredients_stock CHECK (quantity_in_stock >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_ingredients_supplier ON ingredients(supplier_id);
CREATE INDEX idx_ingredients_name ON ingredients(name);

-- ----------------------------------------------------------------------------
-- inventory_transactions  (nhập / xuất / điều chỉnh / kiểm kê)
-- `quantity` luôn là số lượng thay đổi có dấu (IMPORT > 0, EXPORT < 0,
-- ADJUST/STOCKTAKE dương hoặc âm tuỳ chiều điều chỉnh) — tồn kho hiện tại của
-- một nguyên liệu = SUM(quantity) trên toàn bộ giao dịch của nguyên liệu đó.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ingredient_id  INT UNSIGNED NOT NULL,
  type           ENUM('IMPORT','EXPORT','ADJUST','STOCKTAKE') NOT NULL,
  quantity       DECIMAL(12,2) NOT NULL,
  unit_cost      DECIMAL(12,2) NULL,
  note           VARCHAR(500) NULL,
  created_by     INT UNSIGNED NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inventory_tx_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
  CONSTRAINT fk_inventory_tx_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_inventory_tx_ingredient ON inventory_transactions(ingredient_id);
CREATE INDEX idx_inventory_tx_type ON inventory_transactions(type);
CREATE INDEX idx_inventory_tx_created_at ON inventory_transactions(created_at);

-- ----------------------------------------------------------------------------
-- tables  (bàn tại quán)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tables (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(20) NOT NULL,
  seats       TINYINT UNSIGNED NOT NULL,
  area        VARCHAR(100) NOT NULL,
  status      ENUM('AVAILABLE','OCCUPIED','RESERVED','CLEANING','MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_tables_code UNIQUE (code)
) ENGINE=InnoDB;

CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_tables_area ON tables(area);

-- ----------------------------------------------------------------------------
-- reservations  (đặt bàn)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservations (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reservation_code   VARCHAR(30) NOT NULL,
  customer_id        INT UNSIGNED NULL,
  guest_name         VARCHAR(100) NOT NULL,
  guest_phone        VARCHAR(20) NOT NULL,
  table_id           INT UNSIGNED NULL,
  party_size         TINYINT UNSIGNED NOT NULL,
  reservation_date   DATE NOT NULL,
  reservation_time   TIME NOT NULL,
  area               VARCHAR(100) NULL,
  note               VARCHAR(500) NULL,
  status             ENUM('PENDING','CONFIRMED','SEATED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_reservations_code UNIQUE (reservation_code),
  CONSTRAINT fk_reservations_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  CONSTRAINT fk_reservations_table FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL,
  CONSTRAINT chk_reservations_party_size CHECK (party_size > 0)
) ENGINE=InnoDB;

CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_table ON reservations(table_id);

-- ----------------------------------------------------------------------------
-- coupons  (mã khuyến mãi)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code                VARCHAR(40) NOT NULL,
  name                VARCHAR(150) NOT NULL,
  discount_type       ENUM('PERCENT','AMOUNT') NOT NULL,
  discount_value      DECIMAL(12,2) NOT NULL,
  min_order_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
  max_discount_amount DECIMAL(12,2) NULL,
  start_date          DATE NOT NULL,
  end_date            DATE NOT NULL,
  usage_limit         INT UNSIGNED NULL,
  used_count          INT UNSIGNED NOT NULL DEFAULT 0,
  status              ENUM('ACTIVE','INACTIVE','EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_coupons_code UNIQUE (code),
  CONSTRAINT chk_coupons_dates CHECK (end_date >= start_date),
  CONSTRAINT chk_coupons_value CHECK (discount_value > 0)
) ENGINE=InnoDB;

CREATE INDEX idx_coupons_status ON coupons(status);

-- ----------------------------------------------------------------------------
-- orders  (đơn hàng)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_code       VARCHAR(30) NOT NULL,
  customer_id      INT UNSIGNED NULL,
  table_id         INT UNSIGNED NULL,
  employee_id      INT UNSIGNED NULL,
  coupon_id        INT UNSIGNED NULL,
  order_type       ENUM('DINE_IN','DELIVERY','PICKUP') NOT NULL,
  status           ENUM('PENDING','CONFIRMED','PREPARING','READY','DELIVERING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  guest_name       VARCHAR(100) NULL,
  guest_phone      VARCHAR(20) NULL,
  guest_email      VARCHAR(150) NULL,
  delivery_address VARCHAR(500) NULL,
  note             VARCHAR(500) NULL,
  requested_time   DATETIME NULL,
  subtotal         DECIMAL(12,2) NOT NULL,
  discount_amount  DECIMAL(12,2) NOT NULL DEFAULT 0,
  delivery_fee     DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount     DECIMAL(12,2) NOT NULL,
  payment_method   ENUM('CASH','BANK_TRANSFER','ONLINE') NOT NULL DEFAULT 'CASH',
  payment_status   ENUM('UNPAID','PAID','REFUNDED') NOT NULL DEFAULT 'UNPAID',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_orders_code UNIQUE (order_code),
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_table FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL,
  CONSTRAINT chk_orders_amounts CHECK (subtotal >= 0 AND discount_amount >= 0 AND delivery_fee >= 0 AND total_amount >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_type ON orders(order_type);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ----------------------------------------------------------------------------
-- order_items
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id              INT UNSIGNED NOT NULL,
  product_id            INT UNSIGNED NOT NULL,
  product_name_snapshot VARCHAR(150) NOT NULL,
  unit_price            DECIMAL(12,2) NOT NULL,
  quantity              INT UNSIGNED NOT NULL,
  note                  VARCHAR(255) NULL,
  subtotal              DECIMAL(12,2) NOT NULL,
  created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT chk_order_items_quantity CHECK (quantity > 0)
) ENGINE=InnoDB;

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ----------------------------------------------------------------------------
-- payments
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id         INT UNSIGNED NOT NULL,
  amount           DECIMAL(12,2) NOT NULL,
  method           ENUM('CASH','BANK_TRANSFER','ONLINE') NOT NULL,
  status           ENUM('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  transaction_ref  VARCHAR(100) NULL,
  paid_at          DATETIME NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_payments_order UNIQUE (order_id),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- coupon_usages
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupon_usages (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  coupon_id        INT UNSIGNED NOT NULL,
  order_id         INT UNSIGNED NOT NULL,
  customer_id      INT UNSIGNED NULL,
  discount_amount  DECIMAL(12,2) NOT NULL,
  used_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_coupon_usages_order UNIQUE (order_id),
  CONSTRAINT fk_coupon_usages_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id),
  CONSTRAINT fk_coupon_usages_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_coupon_usages_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_coupon_usages_coupon ON coupon_usages(coupon_id);

-- ----------------------------------------------------------------------------
-- reviews
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id   INT UNSIGNED NOT NULL,
  customer_id  INT UNSIGNED NOT NULL,
  order_id     INT UNSIGNED NULL,
  rating       TINYINT UNSIGNED NOT NULL,
  comment      VARCHAR(1000) NULL,
  image_url    VARCHAR(500) NULL,
  status       ENUM('VISIBLE','HIDDEN') NOT NULL DEFAULT 'VISIBLE',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB;

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_customer ON reviews(customer_id);
CREATE INDEX idx_reviews_status ON reviews(status);

-- ----------------------------------------------------------------------------
-- notifications
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  title       VARCHAR(150) NOT NULL,
  message     VARCHAR(1000) NOT NULL,
  type        VARCHAR(30) NOT NULL,
  is_read     TINYINT(1) NOT NULL DEFAULT 0,
  link        VARCHAR(500) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

SET FOREIGN_KEY_CHECKS = 1;
