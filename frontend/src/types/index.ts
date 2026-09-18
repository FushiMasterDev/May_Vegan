export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiListResponse<T> {
  success: true;
  data: T[];
  meta: ApiMeta;
}

export interface ApiItemResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  details?: unknown;
}

export type Role = 'ADMIN' | 'MANAGER' | 'STAFF' | 'KITCHEN' | 'CUSTOMER';

export interface CustomerSummary {
  id: number;
  address: string | null;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: string;
}

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  status: 'ACTIVE' | 'LOCKED';
  role: Role;
  createdAt: string;
  customer: CustomerSummary | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export type ProductStatus = 'AVAILABLE' | 'OUT_OF_STOCK' | 'HIDDEN';

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface Review {
  id: number;
  productId: number;
  customerId: number;
  orderId: number | null;
  rating: number;
  comment: string | null;
  imageUrl: string | null;
  status: 'VISIBLE' | 'HIDDEN';
  createdAt: string;
  customer?: { user: { fullName: string; avatarUrl: string | null; email?: string } };
  product?: { id: number; name: string; slug: string };
}

export interface Product {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  ingredientsText: string | null;
  calories: number | null;
  allergyInfo: string | null;
  price: string;
  salePrice: string | null;
  status: ProductStatus;
  isFeatured: boolean;
  isBestSeller: boolean;
  ratingAvg: string;
  ratingCount: number;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  images: ProductImage[];
  reviews?: Review[];
}

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'MAINTENANCE';

export interface RestaurantTable {
  id: number;
  code: string;
  seats: number;
  area: string;
  status: TableStatus;
  createdAt: string;
  updatedAt: string;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED';

export interface Reservation {
  id: number;
  reservationCode: string;
  customerId: number | null;
  guestName: string;
  guestPhone: string;
  tableId: number | null;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  area: string | null;
  note: string | null;
  status: ReservationStatus;
  createdAt: string;
  table: RestaurantTable | null;
  customer?: { user: { fullName: string; phone: string | null } } | null;
}

export type OrderType = 'DINE_IN' | 'DELIVERY' | 'PICKUP';
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'ONLINE';
export type OrderPaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productNameSnapshot: string;
  unitPrice: string;
  quantity: number;
  note: string | null;
  subtotal: string;
  product?: { id: number; name: string; slug: string };
}

export interface Order {
  id: number;
  orderCode: string;
  customerId: number | null;
  tableId: number | null;
  employeeId: number | null;
  couponId: number | null;
  orderType: OrderType;
  status: OrderStatus;
  guestName: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
  deliveryAddress: string | null;
  note: string | null;
  requestedTime: string | null;
  subtotal: string;
  discountAmount: string;
  deliveryFee: string;
  totalAmount: string;
  paymentMethod: PaymentMethod;
  paymentStatus: OrderPaymentStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  table: RestaurantTable | null;
  customer?: { user: { fullName: string; phone: string | null; email: string } } | null;
  employee?: { user: { fullName: string } } | null;
  coupon?: Coupon | null;
  payment?: { id: number; status: string; method: PaymentMethod; paidAt: string | null } | null;
}

export type CouponDiscountType = 'PERCENT' | 'AMOUNT';
export type CouponStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

export interface Coupon {
  id: number;
  code: string;
  name: string;
  discountType: CouponDiscountType;
  discountValue: string;
  minOrderAmount: string;
  maxDiscountAmount: string | null;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  usedCount: number;
  status: CouponStatus;
  createdAt: string;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export interface Ingredient {
  id: number;
  code: string;
  name: string;
  unit: string;
  quantityInStock: string;
  minStockLevel: string;
  costPrice: string;
  supplierId: number | null;
  supplier?: Supplier | null;
  importedAt: string | null;
  expiryDate: string | null;
  createdAt: string;
}

export type InventoryTransactionType = 'IMPORT' | 'EXPORT' | 'ADJUST' | 'STOCKTAKE';

export interface InventoryTransaction {
  id: number;
  ingredientId: number;
  type: InventoryTransactionType;
  quantity: string;
  unitCost: string | null;
  note: string | null;
  createdAt: string;
  ingredient?: Ingredient;
  createdByUser?: { fullName: string } | null;
}

export interface Customer {
  id: number;
  userId: number;
  address: string | null;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: string;
  createdAt: string;
  user: { fullName: string; email: string; phone: string | null; status: string; avatarUrl: string | null };
  orders?: Order[];
  reservations?: Reservation[];
}

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export interface Employee {
  id: number;
  userId: number;
  employeeCode: string;
  position: string;
  hiredAt: string | null;
  status: EmployeeStatus;
  createdAt: string;
  user: { fullName: string; email: string; phone: string | null; status: string; role: { name: Role } };
}

export interface DashboardStatistics {
  revenueToday: number;
  revenueMonth: number;
  ordersToday: number;
  customerCount: number;
  occupiedTables: number;
  productCount: number;
  pendingOrders: number;
  topProducts: Array<{
    id: number;
    name: string;
    soldCount: number;
    price: string;
    salePrice: string | null;
    images: ProductImage[];
  }>;
}

export interface RevenueReport {
  range: { start: string; end: string };
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  revenueByDay: Array<{ date: string; revenue: number }>;
  revenueByOrderType: Array<{ orderType: OrderType; revenue: number }>;
  topProducts: Array<{ productId: number; name: string; quantity: number; revenue: number }>;
}

export interface InventoryDashboard {
  totalIngredients: number;
  lowStockCount: number;
  lowStockItems: Ingredient[];
  stockValue: number;
  importedThisMonth: number;
  exportedThisMonth: number;
}

export interface CartItem {
  productId: number;
  name: string;
  slug: string;
  unitPrice: number;
  image: string | null;
  quantity: number;
  note?: string;
}
