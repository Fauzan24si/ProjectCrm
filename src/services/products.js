import supabase from '../lib/supabase';

/**
 * Service CRUD produk menggunakan Supabase REST API (PostgREST).
 * Endpoint: <project>/rest/v1/products
 *
 * Struktur tabel `products` yang diharapkan:
 *   id          bigint (primary key, auto)
 *   title       text
 *   category    text
 *   price       numeric
 *   stock       integer
 *   brand       text
 *   description text
 *   thumbnail   text
 *   created_at  timestamptz (default now())
 */

const TABLE = '/products';

/** Ambil daftar produk (terbaru dulu). */
export async function getProducts({ limit = 50, offset = 0 } = {}) {
  const res = await supabase.get(TABLE, {
    params: {
      select: '*',
      order: 'created_at.desc',
      limit,
      offset,
    },
  });
  // Bentuk respons disamakan { products } agar kompatibel dengan pemakaian lama.
  return { products: res.data || [] };
}

/** Ambil satu produk berdasarkan id. */
export async function getProduct(id) {
  const res = await supabase.get(TABLE, {
    params: { id: `eq.${id}`, select: '*', limit: 1 },
  });
  return res.data && res.data[0];
}

/** Tambah produk baru. Mengembalikan produk yang tersimpan (dengan id asli). */
export async function createProduct(payload) {
  const res = await supabase.post(TABLE, [payload], {
    headers: { Prefer: 'return=representation' },
  });
  return Array.isArray(res.data) ? res.data[0] : res.data;
}

/** Update produk berdasarkan id. Mengembalikan produk hasil update. */
export async function updateProduct(id, payload) {
  const res = await supabase.patch(TABLE, payload, {
    params: { id: `eq.${id}` },
    headers: { Prefer: 'return=representation' },
  });
  return Array.isArray(res.data) ? res.data[0] : res.data;
}

/** Hapus produk berdasarkan id. */
export async function deleteProduct(id) {
  await supabase.delete(TABLE, {
    params: { id: `eq.${id}` },
  });
  return { id };
}

/** Daftar kategori yang umum dipakai (untuk dropdown form). */
export const PRODUCT_CATEGORIES = [
  'furniture',
  'home-decoration',
  'kitchen-accessories',
  'lighting',
  'beauty',
  'fragrances',
  'groceries',
];
