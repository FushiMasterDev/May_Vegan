import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CartItem } from '@/types';

const STORAGE_KEY = 'mayvegan_cart';
const COUPON_KEY = 'mayvegan_cart_coupon';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  updateNote: (productId: number, note: string) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
  subtotal: number;
  totalItems: number;
  couponCode: string | null;
  setCouponCode: (code: string | null) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [couponCode, setCouponCodeState] = useState<string | null>(() => localStorage.getItem(COUPON_KEY));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage không khả dụng (private mode...) — bỏ qua, giỏ hàng chỉ tồn tại trong phiên hiện tại
    }
  }, [items]);

  function setCouponCode(code: string | null) {
    setCouponCodeState(code);
    try {
      if (code) localStorage.setItem(COUPON_KEY, code);
      else localStorage.removeItem(COUPON_KEY);
    } catch {
      // bỏ qua nếu localStorage không khả dụng
    }
  }

  function addItem(item: Omit<CartItem, 'quantity'>, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
  }

  function updateNote(productId: number, note: string) {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, note } : i)));
  }

  function removeItem(productId: number) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function clear() {
    setItems([]);
    setCouponCode(null);
  }

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        updateNote,
        removeItem,
        clear,
        subtotal,
        totalItems,
        couponCode,
        setCouponCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
