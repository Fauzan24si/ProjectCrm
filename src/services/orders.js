/**
 * Service orders (riwayat pesanan & fulfillment).
 *
 * Sumber data: tabel `orders` + `order_items` di Supabase.
 *
 * Alur status (kolom `orders.status`, lowercase):
 *   pending    -> order dibuat, belum dibayar
 *   paid       -> sudah dibayar, menunggu konfirmasi admin
 *   processing -> admin konfirmasi, pesanan sedang diproses
 *   shipped    -> pesanan sudah dikirim
 *   delivered  -> pesanan sampai di tujuan
 *   completed  -> transaksi selesai (admin tandai selesai)
 *   cancelled / failed -> dibatalkan / gagal
 */

import supabase from '../lib/supabase';
import { updateUser, getUser } from './users';
import { calculatePoints } from '../lib/loyalty';

/**
 * Normalisasi satu baris order Supabase (beserta order_items) menjadi bentuk
 * order yang dipakai komponen UI.
 */
function normalizeOrder(row) {
  const items = (row.order_items || []).map((i) => ({
    id: i.id,
    productId: i.product_id,
    title: i.title,
    variant: i.variant || '',
    price: Number(i.price) || 0,
    qty: Number(i.qty) || 0,
  }));
  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);
  const productLabel = items.length
    ? items.map((i) => i.title).filter(Boolean).join(', ')
    : '—';
  const categoryLabel =
    items.length > 1 ? `${items.length} produk` : items.length === 1 ? '1 produk' : '—';

  return {
    id: row.order_number || row.id,
    orderNumber: row.order_number,
    date: row.created_at,
    product: productLabel,
    category: categoryLabel,
    qty: totalQty || items.length,
    price: items[0]?.price || 0,
    total: Number(row.gross_amount) || 0,
    payment: row.payment_type || '—',
    status: (row.status || 'pending').toLowerCase(),
    customer: row.customer_name,
    email: row.customer_email,
    userId: row.user_id,
    items,
  };
}

/**
 * Ambil riwayat pesanan milik seorang member berdasarkan user_id dari Supabase.
 *
 * @param {number|string} userId
 * @returns {Promise<Array>} daftar order terurut dari yang terbaru
 */
export async function getOrdersByUser(userId) {
  if (!userId) return [];

  const res = await supabase.get('/orders', {
    params: {
      user_id: `eq.${userId}`,
      select: '*,order_items(*)',
      order: 'created_at.desc',
    },
  });

  return (res.data || []).map(normalizeOrder);
}

/**
 * Ambil SELURUH pesanan (untuk halaman admin "Pesanan").
 *
 * @returns {Promise<Array>} daftar order terurut dari yang terbaru
 */
export async function getAllOrders() {
  const res = await supabase.get('/orders', {
    params: {
      select: '*,order_items(*)',
      order: 'created_at.desc',
    },
  });
  return (res.data || []).map(normalizeOrder);
}

/**
 * Statistik dashboard admin dari view `admin_dashboard_stats` (satu baris).
 * @returns {Promise<{total_revenue:number,total_orders:number,total_customers:number,conversion_rate:number}>}
 */
export async function getDashboardStats() {
  const res = await supabase.get('/admin_dashboard_stats', {
    params: { select: '*', limit: 1 },
  });
  const row = Array.isArray(res.data) ? res.data[0] : res.data;
  return {
    total_revenue: Number(row?.total_revenue) || 0,
    total_orders: Number(row?.total_orders) || 0,
    total_customers: Number(row?.total_customers) || 0,
    conversion_rate: Number(row?.conversion_rate) || 0,
  };
}

/**
 * Produk terlaris dari view `admin_top_products` (order lunas).
 * @param {number} limit
 * @returns {Promise<Array<{product_id,title,total_qty,total_revenue}>>}
 */
export async function getTopProducts(limit = 4) {
  const res = await supabase.get('/admin_top_products', {
    params: { select: '*', limit },
  });
  return (res.data || []).map((r) => ({
    productId: r.product_id,
    title: r.title,
    totalQty: Number(r.total_qty) || 0,
    totalRevenue: Number(r.total_revenue) || 0,
  }));
}

/**
 * Order terbaru untuk panel "Recent Orders" di dashboard.
 * @param {number} limit
 * @returns {Promise<Array>} order yang sudah dinormalisasi
 */
export async function getRecentOrders(limit = 5) {
  const res = await supabase.get('/orders', {
    params: {
      select: '*,order_items(*)',
      order: 'created_at.desc',
      limit,
    },
  });
  return (res.data || []).map(normalizeOrder);
}

/**
 * Data untuk halaman Sales Report (dari Supabase, menggantikan sales.json).
 * Mengembalikan satu baris per ORDER (bukan per item), dengan field yang
 * dipetakan agar cocok dengan tabel existing.
 *
 * @param {object} [opts]
 * @param {string} [opts.status]   - filter status order (lowercase DB) atau 'all'
 * @param {string} [opts.dateFrom] - ISO date (inklusif)
 * @param {string} [opts.dateTo]   - ISO date (inklusif)
 * @returns {Promise<Array>}
 */
export async function getSalesReport({ status, dateFrom, dateTo } = {}) {
  const params = {
    select: '*,order_items(*)',
    order: 'created_at.desc',
  };
  if (status && status !== 'all') params.status = `eq.${status}`;
  if (dateFrom) params.created_at = `gte.${dateFrom}`;
  // PostgREST tidak mendukung dua filter pada kolom yang sama via objek params
  // sederhana; untuk rentang penuh dipfilter di sisi client bila dateTo diisi.

  const res = await supabase.get('/orders', { params });
  let rows = (res.data || []).map(normalizeOrder);

  if (dateTo) {
    const to = new Date(dateTo).getTime();
    rows = rows.filter((r) => new Date(r.date).getTime() <= to);
  }
  return rows;
}

/**
 * Ambil satu order detail untuk halaman Order Detail admin.
 * Menerima order_number (string "ORD-...") maupun id numerik.
 *
 * @param {string|number} idOrOrderNumber
 * @returns {Promise<object|null>} order ternormalisasi atau null
 */
export async function getOrderDetail(idOrOrderNumber) {
  if (!idOrOrderNumber) return null;
  const raw = String(idOrOrderNumber);
  const isNumeric = /^\d+$/.test(raw);

  const params = {
    select: '*,order_items(*)',
    limit: 1,
  };
  params[isNumeric ? 'id' : 'order_number'] = `eq.${raw}`;

  const res = await supabase.get('/orders', { params });
  const row = Array.isArray(res.data) ? res.data[0] : null;
  return row ? normalizeOrder(row) : null;
}

/** Status yang dianggap "uang sudah masuk" (dipakai hitung total belanja & poin). */
const PAID_STATES = new Set([
  'paid',
  'processing',
  'shipped',
  'delivered',
  'completed',
]);

/** Ringkasan statistik pesanan: jumlah, total belanja, item terbeli. */
export function summarizeOrders(orders = []) {
  const paid = orders.filter((o) => PAID_STATES.has(o.status));
  const completed = orders.filter((o) => o.status === 'completed');
  return {
    totalOrders: orders.length,
    completedOrders: completed.length,
    totalSpent: paid.reduce((sum, o) => sum + o.total, 0),
    totalItems: paid.reduce((sum, o) => sum + o.qty, 0),
  };
}

/** Metadata tampilan untuk tiap status pesanan (label + warna). */
export const ORDER_STATUS_META = {
  pending: { label: 'Menunggu Pembayaran', color: '#475467', bg: '#F2F4F7' },
  paid: { label: 'Dibayar', color: '#175CD3', bg: '#EFF8FF' },
  processing: { label: 'Sedang Diproses', color: '#B54708', bg: '#FFFAEB' },
  shipped: { label: 'Dikirim', color: '#5925DC', bg: '#F4F3FF' },
  delivered: { label: 'Sampai', color: '#0E7090', bg: '#ECFDFF' },
  completed: { label: 'Selesai', color: '#067647', bg: '#ECFDF3' },
  cancelled: { label: 'Dibatalkan', color: '#B42318', bg: '#FEF3F2' },
  failed: { label: 'Gagal', color: '#B42318', bg: '#FEF3F2' },
};

export function getOrderStatusMeta(status) {
  const key = (status || '').toLowerCase();
  return (
    ORDER_STATUS_META[key] || { label: status, color: '#475467', bg: '#F2F4F7' }
  );
}

/**
 * Urutan langkah fulfillment yang ditampilkan di timeline pelacakan.
 */
export const FULFILLMENT_STEPS = [
  'paid',
  'processing',
  'shipped',
  'delivered',
  'completed',
];

/**
 * Aksi admin untuk memajukan status ke langkah berikutnya.
 * key = status saat ini, value = { next, label }.
 */
export const NEXT_STATUS_ACTION = {
  paid: { next: 'processing', label: 'Konfirmasi Pesanan' },
  processing: { next: 'shipped', label: 'Tandai Dikirim' },
  shipped: { next: 'delivered', label: 'Tandai Sampai' },
  delivered: { next: 'completed', label: 'Tandai Selesai' },
};

/** Ambil aksi lanjutan untuk sebuah status (atau null bila tidak ada). */
export function getNextStatusAction(status) {
  return NEXT_STATUS_ACTION[(status || '').toLowerCase()] || null;
}

/**
 * Simpan order ke Supabase setelah pembayaran.
 *
 * Struktur tabel yang diharapkan:
 *   orders:
 *     id           bigint pk
 *     order_number text (unique)   -- = orderId Midtrans
 *     user_id      bigint null     -- null untuk guest
 *     customer_name  text
 *     customer_email text
 *     gross_amount numeric
 *     status       text            -- pending | paid | failed
 *     payment_type text null
 *     created_at   timestamptz default now()
 *   order_items:
 *     id        bigint pk
 *     order_id  bigint fk -> orders.id
 *     product_id bigint
 *     title     text
 *     price     numeric
 *     qty       integer
 *
 * @param {object} params
 * @param {string} params.orderNumber  - orderId dari Midtrans
 * @param {Array}  params.items        - item keranjang [{id,title,price,qty}]
 * @param {number} params.grossAmount
 * @param {string} params.status       - 'pending' | 'paid' | 'failed'
 * @param {object} params.customer     - { id?, name, email }
 * @returns {Promise<object>} order tersimpan
 */
export async function createOrder({
  orderNumber,
  items,
  grossAmount,
  status = 'pending',
  customer = {},
}) {
  const orderRes = await supabase.post(
    '/orders',
    [
      {
        order_number: orderNumber,
        user_id: customer.id ?? null,
        customer_name: customer.name || 'Guest',
        customer_email: customer.email || null,
        gross_amount: grossAmount,
        status,
        payment_type: customer.paymentType || null,
      },
    ],
    { headers: { Prefer: 'return=representation' } }
  );

  const order = Array.isArray(orderRes.data) ? orderRes.data[0] : orderRes.data;

  // Simpan item-item order.
  if (order?.id && items?.length) {
    const rows = items.map((i) => ({
      order_id: order.id,
      product_id: i.id,
      title: i.title,
      price: i.price,
      qty: i.qty,
    }));
    await supabase.post('/order_items', rows, {
      headers: { Prefer: 'return=minimal' },
    });
  }

  return order;
}

/**
 * Update status order yang sudah ada (dibuat server saat token dibuat).
 * @param {string} orderNumber
 * @param {string} status
 * @param {string} [paymentType]
 * @returns {Promise<object|null>}
 */
export async function updateOrderStatus(orderNumber, status, paymentType) {
  const body = { status };
  if (paymentType) body.payment_type = paymentType;

  const res = await supabase.patch('/orders', body, {
    params: { order_number: `eq.${orderNumber}` },
    headers: { Prefer: 'return=representation' },
  });
  return Array.isArray(res.data) ? res.data[0] : res.data;
}

/**
 * Berikan poin & update total_spent untuk MEMBER terdaftar.
 * Guest (tanpa userId) TIDAK mendapatkan poin.
 *
 * @param {number|string} userId
 * @param {number} amount - nominal transaksi yang dibayar
 * @returns {Promise<object|null>} user terupdate, atau null jika guest
 */
export async function awardMemberPoints(userId, amount) {
  if (!userId) return null; // guest: tidak dapat poin

  const user = await getUser(userId);
  if (!user) return null;

  const prevSpent = Number(user.total_spent) || 0;
  const newSpent = prevSpent + (Number(amount) || 0);

  // total_spent dipakai untuk hitung tier & poin (lihat lib/loyalty & membership).
  const updated = await updateUser(userId, { total_spent: newSpent });
  return { ...updated, pointsEarned: calculatePoints(amount) };
}

/**
 * Finalisasi setelah pembayaran.
 * Order sudah dibuat (status pending) di server saat token dibuat,
 * jadi di sini kita hanya UPDATE status + beri poin (jika member & lunas).
 * @returns {Promise<{order: object, pointsEarned: number}>}
 */
export async function completeCheckout({
  orderNumber,
  grossAmount,
  customer = {},
  status = 'paid',
}) {
  const order = await updateOrderStatus(
    orderNumber,
    status,
    customer.paymentType
  );

  let pointsEarned = 0;
  if (status === 'paid' && customer.id) {
    const result = await awardMemberPoints(customer.id, grossAmount);
    pointsEarned = result?.pointsEarned || 0;
  }

  // Kirim email invoice (fallback selain webhook Midtrans). Non-fatal & idempoten.
  if (status === 'paid') {
    try {
      await fetch('/api/orders/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber }),
      });
    } catch {
      // Abaikan: webhook Midtrans tetap akan mengirim invoice.
    }
  }

  return { order, pointsEarned };
}

/**
 * Ambil satu order + item-itemnya dari Supabase berdasarkan order_number.
 * Dipakai halaman faktur/sukses pembayaran.
 *
 * @param {string} orderNumber
 * @returns {Promise<object|null>} { ...order, items: [...] } atau null
 */
export async function getOrderByNumber(orderNumber) {
  if (!orderNumber) return null;

  const res = await supabase.get('/orders', {
    params: {
      order_number: `eq.${orderNumber}`,
      select: '*,order_items(*)',
      limit: 1,
    },
  });

  const order = Array.isArray(res.data) ? res.data[0] : null;
  if (!order) return null;

  return { ...order, items: order.order_items || [] };
}

/**
 * Lacak order sebagai GUEST: butuh nomor order + PIN.
 * PIN = 4 digit terakhir nomor HP penerima (kolom `track_pin`).
 *
 * @param {string} orderNumber
 * @param {string} pin - 4 digit
 * @returns {Promise<{ok: boolean, reason?: string, order?: object}>}
 */
export async function getOrderForGuest(orderNumber, pin) {
  if (!orderNumber) return { ok: false, reason: 'not_found' };

  const order = await getOrderByNumber(orderNumber);
  if (!order) return { ok: false, reason: 'not_found' };

  const cleanPin = String(pin || '').replace(/\D/g, '');
  const expected = order.track_pin
    ? String(order.track_pin)
    : String(order.recipient_phone || '').replace(/\D/g, '').slice(-4);

  if (!expected) {
    // Order lama tanpa data PIN — tidak bisa diverifikasi sebagai guest.
    return { ok: false, reason: 'no_pin' };
  }
  if (cleanPin !== expected) {
    return { ok: false, reason: 'wrong_pin' };
  }

  return { ok: true, order };
}
