import supabase from '../lib/supabase';

/**
 * Service voucher & point menggunakan Supabase REST API (PostgREST).
 * Endpoint: <project>/rest/v1/vouchers, /user_vouchers, /point_transactions
 *
 * Struktur tabel (lihat supabase/migration-vouchers.sql):
 *   vouchers           : katalog voucher redeemable
 *   user_vouchers      : voucher milik user setelah redeem
 *   point_transactions : ledger point (earn/redeem)
 *   users.points       : saldo point member
 */

const VOUCHERS = '/vouchers';
const USER_VOUCHERS = '/user_vouchers';
const POINT_TX = '/point_transactions';
const USERS = '/users';

/**
 * Voucher yang bisa ditukar: aktif, belum kedaluwarsa, dan masih ada stok
 * (stock null = tak terbatas). Filter kedaluwarsa & stok null diproses di client
 * agar query tetap sederhana.
 *
 * @returns {Promise<Array>}
 */
export async function getRedeemableVouchers() {
  const res = await supabase.get(VOUCHERS, {
    params: {
      select: '*',
      is_active: 'eq.true',
      order: 'point_cost.asc',
    },
  });
  const now = Date.now();
  return (res.data || []).filter((v) => {
    const notExpired = !v.valid_until || new Date(v.valid_until).getTime() >= now;
    const hasStock = v.stock == null || Number(v.stock) > 0;
    return notExpired && hasStock;
  });
}

/**
 * Voucher milik user yang masih aktif (beserta detail voucher-nya).
 *
 * @param {number|string} userId
 * @returns {Promise<Array>} baris user_vouchers + embedded vouchers(*)
 */
export async function getUserVouchers(userId) {
  if (!userId) return [];
  const res = await supabase.get(USER_VOUCHERS, {
    params: {
      user_id: `eq.${userId}`,
      status: 'eq.active',
      select: '*,vouchers(*)',
      order: 'redeemed_at.desc',
    },
  });
  return res.data || [];
}

/**
 * Tukar voucher dengan point.
 * Validasi point cukup & stok tersedia, lalu:
 *  - kurangi users.points
 *  - insert user_vouchers (active)
 *  - insert point_transactions (redeem, negatif)
 *  - decrement stok voucher (bila tidak null)
 *
 * @param {number|string} userId
 * @param {number|string} voucherId
 * @returns {Promise<object>} baris user_vouchers baru
 */
export async function redeemVoucher(userId, voucherId) {
  if (!userId) throw new Error('User tidak valid.');

  // Ambil voucher & user terkini.
  const [voucherRes, userRes] = await Promise.all([
    supabase.get(VOUCHERS, { params: { id: `eq.${voucherId}`, select: '*', limit: 1 } }),
    supabase.get(USERS, { params: { id: `eq.${userId}`, select: 'id,points', limit: 1 } }),
  ]);

  const voucher = voucherRes.data && voucherRes.data[0];
  const user = userRes.data && userRes.data[0];
  if (!voucher) throw new Error('Voucher tidak ditemukan.');
  if (!user) throw new Error('User tidak ditemukan.');
  if (!voucher.is_active) throw new Error('Voucher sudah tidak aktif.');
  if (voucher.valid_until && new Date(voucher.valid_until).getTime() < Date.now()) {
    throw new Error('Voucher sudah kedaluwarsa.');
  }
  if (voucher.stock != null && Number(voucher.stock) <= 0) {
    throw new Error('Stok voucher habis.');
  }

  const currentPoints = Number(user.points) || 0;
  const cost = Number(voucher.point_cost) || 0;
  if (currentPoints < cost) {
    throw new Error('Poin Anda tidak cukup untuk menukar voucher ini.');
  }

  // Kurangi point user.
  await supabase.patch(
    USERS,
    { points: currentPoints - cost },
    { params: { id: `eq.${userId}` }, headers: { Prefer: 'return=minimal' } }
  );

  // Buat user_voucher.
  const uvRes = await supabase.post(
    USER_VOUCHERS,
    [{ user_id: userId, voucher_id: voucherId, status: 'active' }],
    { headers: { Prefer: 'return=representation' } }
  );
  const userVoucher = Array.isArray(uvRes.data) ? uvRes.data[0] : uvRes.data;

  // Catat ledger point (redeem, negatif).
  await supabase.post(
    POINT_TX,
    [
      {
        user_id: userId,
        amount: -cost,
        type: 'redeem',
        description: `Tukar voucher ${voucher.code}`,
      },
    ],
    { headers: { Prefer: 'return=minimal' } }
  );

  // Decrement stok voucher (bila terbatas).
  if (voucher.stock != null) {
    await supabase.patch(
      VOUCHERS,
      { stock: Math.max(Number(voucher.stock) - 1, 0) },
      { params: { id: `eq.${voucherId}` }, headers: { Prefer: 'return=minimal' } }
    );
  }

  return userVoucher;
}

/**
 * Tandai user_voucher sudah dipakai pada sebuah order.
 *
 * @param {number|string} userVoucherId
 * @param {number|string} orderId - id numerik order (orders.id)
 * @returns {Promise<object|null>}
 */
export async function markVoucherUsed(userVoucherId, orderId) {
  if (!userVoucherId) return null;
  const res = await supabase.patch(
    USER_VOUCHERS,
    { status: 'used', used_at: new Date().toISOString(), order_id: orderId ?? null },
    { params: { id: `eq.${userVoucherId}` }, headers: { Prefer: 'return=representation' } }
  );
  return Array.isArray(res.data) ? res.data[0] : res.data;
}

/**
 * Tambah point untuk member (earn) & catat di ledger.
 *
 * @param {number|string} userId
 * @param {number} amount - jumlah point (positif)
 * @param {string} [description]
 * @returns {Promise<number|null>} saldo point baru, atau null bila guest
 */
export async function awardPoints(userId, amount, description = 'Poin dari transaksi') {
  if (!userId || !amount) return null;

  const userRes = await supabase.get(USERS, {
    params: { id: `eq.${userId}`, select: 'id,points', limit: 1 },
  });
  const user = userRes.data && userRes.data[0];
  if (!user) return null;

  const newPoints = (Number(user.points) || 0) + Number(amount);
  await supabase.patch(
    USERS,
    { points: newPoints },
    { params: { id: `eq.${userId}` }, headers: { Prefer: 'return=minimal' } }
  );
  await supabase.post(
    POINT_TX,
    [{ user_id: userId, amount: Number(amount), type: 'earn', description }],
    { headers: { Prefer: 'return=minimal' } }
  );
  return newPoints;
}
