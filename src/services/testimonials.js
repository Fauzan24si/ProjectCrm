import supabase from '../lib/supabase';

/**
 * Service testimoni menggunakan Supabase REST API (PostgREST).
 * Endpoint: <project>/rest/v1/testimonials
 *
 * Struktur tabel `testimonials` (lihat supabase/migration-landing-dynamic.sql):
 *   id            bigint (pk)
 *   user_id       bigint -> users(id) (nullable)
 *   customer_name text
 *   avatar        text
 *   rating        integer (1-5)
 *   content       text
 *   status        text   default 'approved'  -- pending | approved | rejected
 *   created_at    timestamptz default now()
 */

const TABLE = '/testimonials';

/**
 * Ambil testimoni yang sudah di-approve (terbaru dulu).
 *
 * @param {number} limit - jumlah maksimum (default 12)
 * @returns {Promise<Array>}
 */
export async function getTestimonials(limit = 12) {
  const res = await supabase.get(TABLE, {
    params: {
      select: '*',
      status: 'eq.approved',
      order: 'created_at.desc',
      limit,
    },
  });
  return Array.isArray(res.data) ? res.data : [];
}
