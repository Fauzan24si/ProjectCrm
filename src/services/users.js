import supabase from '../lib/supabase';
import { getMembership } from '../lib/membership';

/**
 * Service users menggunakan Supabase REST API (PostgREST).
 * Endpoint: <project>/rest/v1/users
 *
 * Kolom membership dihitung ulang dari `total_spent` saat data dibaca,
 * agar tier selalu konsisten dengan total transaksi.
 *
 * Struktur tabel `users` (lihat juga services/auth.js):
 *   id          bigint (pk)
 *   name        text
 *   email       text (unique)
 *   password    text
 *   role        text   default 'user'
 *   phone       text
 *   gender      text
 *   age         integer
 *   image       text
 *   total_spent numeric default 0   -- total transaksi (Rupiah)
 *   membership  text   default 'bronze'
 *   created_at  timestamptz default now()
 */

const TABLE = '/users';

// Field aman untuk ditampilkan (tanpa password).
const PUBLIC_FIELDS =
  'id,name,email,role,phone,gender,age,image,address,total_spent,membership,created_at';

/** Sisipkan membership terhitung ke objek user. */
function withMembership(user) {
  if (!user) return user;
  return { ...user, membership: getMembership(user.total_spent) };
}

/** Ambil semua user. Bisa difilter berdasarkan role. */
export async function getUsers({ limit = 100, offset = 0, role } = {}) {
  const params = {
    select: PUBLIC_FIELDS,
    order: 'created_at.desc',
    limit,
    offset,
  };
  if (role) params.role = `eq.${role}`;

  const res = await supabase.get(TABLE, { params });
  return (res.data || []).map(withMembership);
}

/**
 * Ambil total belanja & jumlah order per user dari view `admin_customer_spending`
 * (dihitung dari order paid-like, bukan kolom users.total_spent).
 *
 * @returns {Promise<Map<number, {orderCount:number, totalSpent:number}>>}
 */
export async function getCustomerSpendingMap() {
  try {
    const res = await supabase.get('/admin_customer_spending', {
      params: { select: '*' },
    });
    const map = new Map();
    for (const row of res.data || []) {
      map.set(Number(row.user_id), {
        orderCount: Number(row.order_count) || 0,
        totalSpent: Number(row.total_spent) || 0,
      });
    }
    return map;
  } catch {
    // View belum dimigrasi -> kembalikan map kosong (fallback ke total_spent lama).
    return new Map();
  }
}

/**
 * Ambil daftar customer (role 'user') beserta total transaksi nyata dari order.
 * Membership ikut dihitung ulang dari total transaksi yang sebenarnya.
 *
 * @returns {Promise<Array>}
 */
export async function getCustomersWithSpending({ limit = 100, offset = 0 } = {}) {
  const [users, spendingMap] = await Promise.all([
    getUsers({ limit, offset, role: 'user' }),
    getCustomerSpendingMap(),
  ]);

  return users.map((u) => {
    const spend = spendingMap.get(Number(u.id));
    const totalSpent = spend ? spend.totalSpent : Number(u.total_spent) || 0;
    return {
      ...u,
      total_spent: totalSpent,
      order_count: spend ? spend.orderCount : 0,
      membership: getMembership(totalSpent),
    };
  });
}

/** Ambil satu user berdasarkan id. */
export async function getUser(id) {
  const res = await supabase.get(TABLE, {
    params: { id: `eq.${id}`, select: PUBLIC_FIELDS, limit: 1 },
  });
  return withMembership(res.data && res.data[0]);
}

/**
 * Ambil satu customer beserta total transaksi nyata (dari order paid-like).
 * Membership dihitung ulang dari total transaksi sebenarnya.
 *
 * @param {number|string} id
 * @returns {Promise<object|null>}
 */
export async function getCustomerWithSpending(id) {
  const user = await getUser(id);
  if (!user) return null;

  const spendingMap = await getCustomerSpendingMap();
  const spend = spendingMap.get(Number(id));
  const totalSpent = spend ? spend.totalSpent : Number(user.total_spent) || 0;
  return {
    ...user,
    total_spent: totalSpent,
    order_count: spend ? spend.orderCount : 0,
    membership: getMembership(totalSpent),
  };
}

/** Update sebagian data user. Membership akan dihitung ulang dari total_spent. */
export async function updateUser(id, payload) {
  const body = { ...payload };
  if (body.total_spent !== undefined) {
    body.membership = getMembership(body.total_spent);
  }
  const res = await supabase.patch(TABLE, body, {
    params: { id: `eq.${id}` },
    headers: { Prefer: 'return=representation' },
  });
  const updated = Array.isArray(res.data) ? res.data[0] : res.data;
  return withMembership(updated);
}

/** Hapus user berdasarkan id. */
export async function deleteUser(id) {
  await supabase.delete(TABLE, { params: { id: `eq.${id}` } });
  return { id };
}
