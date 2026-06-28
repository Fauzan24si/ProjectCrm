import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  cartKey,
  variantUnitPrice,
  variantLabel,
} from '../lib/variants';

const CartContext = createContext(null);

const STORAGE_KEY = 'guest_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      // Backfill `key` untuk item lama (sebelum fitur varian).
      return parsed.map((i) =>
        i.key ? i : { ...i, key: cartKey(i.id, i.selection || {}), variant: i.variant || '' }
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /**
   * Tambah item ke keranjang.
   * @param {object} product - objek produk (punya id, title, price, thumbnail, variants)
   * @param {number} qty
   * @param {object} selection - pilihan varian { [grup]: label }
   */
  const addItem = (product, qty = 1, selection = {}) => {
    const key = cartKey(product.id, selection);
    const unitPrice = variantUnitPrice(product.price, product.variants, selection);
    const label = variantLabel(product.variants, selection);

    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          title: product.title,
          price: unitPrice,
          thumbnail: product.thumbnail,
          variant: label,
          selection,
          qty,
        },
      ];
    });
  };

  const removeItem = (key) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const updateQty = (key, qty) => {
    if (qty <= 0) {
      removeItem(key);
      return;
    }
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty } : i)));
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items]
  );

  const value = {
    items,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart harus dipakai di dalam <CartProvider>');
  }
  return ctx;
}
