import supabase from '../lib/supabase';

/**
 * Service wishlist menggunakan Supabase REST API (PostgREST).
 * Endpoint: <project>/rest/v1/wishlists
 *
 * Struktur tabel `wishlists` (lihat docs/sql-wishlist-schema.sql):
 *   id          bigint (pk)
 *   user_id     bigint -> users(id)
 *   product_id  bigint -> products(id)
 *   created_at  timestamptz default now()
 *   unique (user_id, product_id)
 */

const TABLE = '/wishlists';

/**
 * Ambil wishlist milik seorang user, beserta detail produknya
 * (melalui embedded resource PostgREST: products(*)).
 *
 * @param {number|string} userId
 * @returns {Promise<Array>} daftar item wishlist berbentuk produk
 */
export async function getWishlist(userId) {
  const res = await supabase.get(TABLE, {
    params: {
      user_id: `eq.${userId}`,
      select: 'id,product_id,created_at,products(*)',
      order: 'created_at.desc',
    },
  });

  const rows = res.data || [];
  // Bentuk ulang menjadi objek produk + metadata wishlist agar mudah dipakai UI.
  return rows
    .filter((row) => row.products) // jaga-jaga jika produk sudah dihapus
    .map((row) => ({
      ...row.products,
      wishlist_id: row.id,
      wishlist_created_at: row.created_at,
    }));
}

/**
 * Tambah produk ke wishlist user.
 * @param {number|string} userId
 * @param {number|string} productId
 * @returns {Promise<object>} baris wishlist yang tersimpan
 */
export async function addToWishlist(userId, productId) {
  const res = await supabase.post(
    TABLE,
    [{ user_id: userId, product_id: productId }],
    { headers: { Prefer: 'return=representation' } }
  );
  return Array.isArray(res.data) ? res.data[0] : res.data;
}

/**
 * Hapus produk dari wishlist user.
 * @param {number|string} userId
 * @param {number|string} productId
 */
export async function removeFromWishlist(userId, productId) {
  await supabase.delete(TABLE, {
    params: {
      user_id: `eq.${userId}`,
      product_id: `eq.${productId}`,
    },
  });
  return { userId, productId };
}

/**
 * Hitung berapa kali sebuah produk masuk wishlist (untuk analitik admin).
 * @param {number|string} productId
 * @returns {Promise<number>}
 */
export async function countProductWishlists(productId) {
  const res = await supabase.get(TABLE, {
    params: { product_id: `eq.${productId}`, select: 'id' },
    headers: { Prefer: 'count=exact' },
  });
  // PostgREST mengembalikan total via header Content-Range: 0-9/<total>
  const range = res.headers?.['content-range'];
  if (range && range.includes('/')) {
    const total = parseInt(range.split('/')[1], 10);
    if (!Number.isNaN(total)) return total;
  }
  return (res.data || []).length;
}
