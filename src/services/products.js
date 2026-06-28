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
  // Pastikan selalu array; PostgREST bisa mengembalikan objek (mis. error) pada kasus tertentu.
  return { products: Array.isArray(res.data) ? res.data : [] };
}

/** Ambil satu produk berdasarkan id. */
export async function getProduct(id) {
  const res = await supabase.get(TABLE, {
    params: { id: `eq.${id}`, select: '*', limit: 1 },
  });
  return res.data && res.data[0];
}

/**
 * Ambil produk terlaris via RPC `get_best_sellers` (agregasi qty terjual +
 * jumlah wishlist di sisi Postgres). Mengembalikan array produk + sold_count.
 *
 * @param {number} limit - jumlah produk teratas (default 8)
 * @returns {Promise<Array>}
 */
export async function getBestSellers(limit = 8) {
  const res = await supabase.post('/rpc/get_best_sellers', {
    limit_count: limit,
  });
  return Array.isArray(res.data) ? res.data : [];
}

/**
 * Ambil produk unggulan/terbaru.
 * Prioritas: produk dengan is_featured = true (terbaru dulu).
 * Bila tidak ada yang di-flag, fallback ke produk terbaru.
 *
 * @param {number} limit - jumlah produk (default 8)
 * @returns {Promise<Array>}
 */
export async function getFeaturedProducts(limit = 8) {
  try {
    const res = await supabase.get(TABLE, {
      params: {
        select: '*',
        is_featured: 'eq.true',
        order: 'created_at.desc',
        limit,
      },
    });
    const featured = Array.isArray(res.data) ? res.data : [];
    if (featured.length > 0) return featured;
  } catch (err) {
    // Kolom is_featured belum dimigrasi -> fallback ke produk terbaru.
    if (!isMissingColumnError(err)) throw err;
  }

  const { products } = await getProducts({ limit });
  return products;
}

/**
 * Kolom yang BENAR-BENAR ada di tabel `products`.
 * Field lain (mis. sku, rating) yang dikirim form akan dibuang agar
 * PostgREST tidak menolak seluruh insert/update karena kolom tak dikenal.
 */
const PRODUCT_COLUMNS = [
  'title',
  'category',
  'price',
  'stock',
  'brand',
  'description',
  'thumbnail',
  'discount_percentage',
  'variants',
];

/** Ambil hanya field yang merupakan kolom tabel products. */
function sanitizeProductPayload(payload = {}) {
  const clean = {};
  for (const key of PRODUCT_COLUMNS) {
    if (payload[key] !== undefined) clean[key] = payload[key];
  }
  return clean;
}

/** Apakah error PostgREST karena kolom tidak ditemukan? */
function isMissingColumnError(err) {
  const data = err?.response?.data;
  const text = JSON.stringify(data || err?.message || '');
  // PostgREST: code PGRST204 / pesan "Could not find the 'x' column"
  return (
    data?.code === 'PGRST204' ||
    /could not find the .* column/i.test(text) ||
    /column .* does not exist/i.test(text)
  );
}

/** Tambah produk baru. Mengembalikan produk yang tersimpan (dengan id asli). */
export async function createProduct(payload) {
  const clean = sanitizeProductPayload(payload);
  try {
    const res = await supabase.post(TABLE, [clean], {
      headers: { Prefer: 'return=representation' },
    });
    return Array.isArray(res.data) ? res.data[0] : res.data;
  } catch (err) {
    // Fallback: kolom `variants` belum dimigrasi -> coba lagi tanpa variants.
    if (isMissingColumnError(err) && 'variants' in clean) {
      const { variants, ...rest } = clean;
      const res = await supabase.post(TABLE, [rest], {
        headers: { Prefer: 'return=representation' },
      });
      return Array.isArray(res.data) ? res.data[0] : res.data;
    }
    throw err;
  }
}

/** Update produk berdasarkan id. Mengembalikan produk hasil update. */
export async function updateProduct(id, payload) {
  const clean = sanitizeProductPayload(payload);
  try {
    const res = await supabase.patch(TABLE, clean, {
      params: { id: `eq.${id}` },
      headers: { Prefer: 'return=representation' },
    });
    return Array.isArray(res.data) ? res.data[0] : res.data;
  } catch (err) {
    if (isMissingColumnError(err) && 'variants' in clean) {
      const { variants, ...rest } = clean;
      const res = await supabase.patch(TABLE, rest, {
        params: { id: `eq.${id}` },
        headers: { Prefer: 'return=representation' },
      });
      return Array.isArray(res.data) ? res.data[0] : res.data;
    }
    throw err;
  }
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
