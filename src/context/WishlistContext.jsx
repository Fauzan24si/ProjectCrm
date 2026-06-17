import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, isAuthenticated } from '../services/auth';
import * as wishlistApi from '../services/wishlist';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Muat ulang wishlist user yang sedang login dari database. */
  const refresh = useCallback(async () => {
    const user = getCurrentUser();
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await wishlistApi.getWishlist(user.id);
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Muat wishlist saat pertama kali (jika ada sesi login).
  useEffect(() => {
    refresh();
  }, [refresh]);

  const isInWishlist = (id) => items.some((i) => i.id === id);

  /**
   * Tambah produk ke wishlist (tersimpan di database).
   * @returns {Promise<{ok: boolean, reason?: string}>}
   */
  const addToWishlist = async (product) => {
    const user = getCurrentUser();
    if (!user) {
      return { ok: false, reason: 'not-authenticated' };
    }
    if (isInWishlist(product.id)) {
      return { ok: false, reason: 'already-exists' };
    }

    // Optimistic update.
    setItems((prev) => [{ ...product }, ...prev]);
    try {
      await wishlistApi.addToWishlist(user.id, product.id);
      return { ok: true };
    } catch (err) {
      // Rollback jika gagal.
      setItems((prev) => prev.filter((i) => i.id !== product.id));
      return { ok: false, reason: 'error', error: err.message };
    }
  };

  /**
   * Hapus produk dari wishlist (database).
   * @returns {Promise<{ok: boolean}>}
   */
  const removeFromWishlist = async (productId) => {
    const user = getCurrentUser();
    if (!user) return { ok: false, reason: 'not-authenticated' };

    const prevItems = items;
    // Optimistic update.
    setItems((prev) => prev.filter((i) => i.id !== productId));
    try {
      await wishlistApi.removeFromWishlist(user.id, productId);
      return { ok: true };
    } catch (err) {
      // Rollback jika gagal.
      setItems(prevItems);
      return { ok: false, reason: 'error', error: err.message };
    }
  };

  /** Toggle: tambah jika belum ada, hapus jika sudah ada. */
  const toggleWishlist = async (product) => {
    if (!isAuthenticated()) {
      return { ok: false, reason: 'not-authenticated' };
    }
    if (isInWishlist(product.id)) {
      const res = await removeFromWishlist(product.id);
      return { ...res, removed: true };
    }
    return addToWishlist(product);
  };

  /** Kosongkan seluruh wishlist user. */
  const clearWishlist = async () => {
    const user = getCurrentUser();
    if (!user) return;
    const prevItems = items;
    setItems([]);
    try {
      await Promise.all(
        prevItems.map((i) => wishlistApi.removeFromWishlist(user.id, i.id))
      );
    } catch {
      setItems(prevItems);
    }
  };

  const totalItems = useMemo(() => items.length, [items]);

  const value = {
    items,
    loading,
    error,
    refresh,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    totalItems,
  };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist harus dipakai di dalam <WishlistProvider>');
  }
  return ctx;
}
