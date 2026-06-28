/**
 * Vercel Serverless Function: membuat transaksi Midtrans Snap & mengembalikan token.
 *
 * Alur:
 *  1. Client kirim daftar item (id + qty) dan data customer.
 *  2. Server AMBIL ULANG harga produk dari Supabase (jangan percaya harga client).
 *  3. Server panggil Midtrans Snap API pakai SERVER KEY untuk bikin transaksi.
 *  4. Server balikin { token, orderId, grossAmount } ke client.
 *
 * Env yang dipakai (set di .env dev & Vercel):
 *   MIDTRANS_SERVER_KEY      - server key rahasia
 *   MIDTRANS_IS_PRODUCTION   - 'true' / 'false'
 *   VITE_SUPABASE_URL        - URL Supabase (untuk validasi harga)
 *   VITE_SUPABASE_ANON_KEY   - anon key Supabase
 */

import { sendConfirmationEmail } from '../_lib/email.js';

const SNAP_URL = {
  sandbox: 'https://app.sandbox.midtrans.com/snap/v1/transactions',
  production: 'https://app.midtrans.com/snap/v1/transactions',
};

/**
 * Hitung selisih harga & label dari varian terpilih, berdasarkan definisi
 * `variants` produk di DB (server adalah sumber kebenaran harga).
 *
 * @param {Array} variants - product.variants: [{name, options:[{label, priceDelta}]}]
 * @param {object} selection - { [namaGrup]: labelOpsi }
 * @returns {{delta: number, label: string}}
 */
function resolveVariant(variants, selection) {
  if (!Array.isArray(variants) || !selection || typeof selection !== 'object') {
    return { delta: 0, label: '' };
  }
  let delta = 0;
  const parts = [];
  for (const group of variants) {
    if (!group || !group.name || !Array.isArray(group.options)) continue;
    const chosen = selection[group.name];
    if (!chosen) continue;
    const opt = group.options.find((o) => o && String(o.label) === String(chosen));
    if (opt) {
      delta += Number(opt.priceDelta) || 0;
      parts.push(`${group.name}: ${chosen}`);
    }
  }
  return { delta, label: parts.join(', ') };
}

/**
 * Validasi voucher milik user & hitung ulang potongan di server (sumber kebenaran).
 * Menerima { userVoucherId } dari client, lalu ambil user_voucher + voucher dari DB.
 *
 * @param {object|null} voucherInput - { userVoucherId }
 * @param {number} grossAmount - subtotal sebelum diskon
 * @param {number|null} userId - id user pemesan
 * @returns {Promise<{discount:number, userVoucherId:number|null}>}
 */
async function resolveVoucher(voucherInput, grossAmount, userId) {
  if (!voucherInput || !voucherInput.userVoucherId || !userId) {
    return { discount: 0, userVoucherId: null };
  }
  const base = (process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  const url =
    `${base}/rest/v1/user_vouchers?id=eq.${encodeURIComponent(voucherInput.userVoucherId)}` +
    `&select=*,vouchers(*)&limit=1`;
  const res = await fetch(url, { headers });
  if (!res.ok) return { discount: 0, userVoucherId: null };
  const rows = await res.json();
  const uv = Array.isArray(rows) ? rows[0] : null;

  // Validasi kepemilikan & status.
  if (!uv || uv.status !== 'active' || String(uv.user_id) !== String(userId)) {
    return { discount: 0, userVoucherId: null };
  }
  const v = uv.vouchers;
  if (!v) return { discount: 0, userVoucherId: null };

  const min = Number(v.min_purchase) || 0;
  if (grossAmount < min) return { discount: 0, userVoucherId: null };

  let discount = 0;
  if (v.discount_type === 'percentage') {
    discount = (grossAmount * (Number(v.discount_value) || 0)) / 100;
    const max = v.max_discount != null ? Number(v.max_discount) : null;
    if (max != null && discount > max) discount = max;
  } else {
    discount = Number(v.discount_value) || 0;
  }
  if (discount > grossAmount) discount = grossAmount;
  if (discount < 0) discount = 0;

  return { discount: Math.round(discount), userVoucherId: uv.id };
}

/** Ambil harga produk asli dari Supabase berdasarkan daftar id. */
async function fetchProducts(ids) {
  const base = (process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  const idList = ids.join(',');

  const url = `${base}/rest/v1/products?id=in.(${idList})&select=id,title,price,variants`;
  const res = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    throw new Error(`Gagal ambil data produk (${res.status})`);
  }
  return res.json();
}

/** Simpan order (header + items) ke Supabase dengan status 'pending'. */
async function saveOrder({ orderId, grossAmount, discountAmount = 0, userVoucherId = null, customer, itemDetails }) {
  const base = (process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };

  // Insert header order, minta representasi agar dapat id.
  const orderRes = await fetch(`${base}/rest/v1/orders`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify([
      {
        order_number: orderId,
        user_id: customer.id ?? null,
        customer_name: customer.name || 'Guest',
        customer_email: customer.email || null,
        gross_amount: grossAmount,
        discount_amount: discountAmount,
        user_voucher_id: userVoucherId,
        status: 'pending',
        shipping_address: customer.address || null,
        recipient_phone: customer.phone || null,
        track_pin: customer.trackPin || null,
      },
    ]),
  });

  if (!orderRes.ok) {
    const detail = await orderRes.text();
    throw new Error(`Gagal menyimpan order (${orderRes.status}): ${detail}`);
  }

  const orderRows = await orderRes.json();
  const order = Array.isArray(orderRows) ? orderRows[0] : orderRows;

  // Insert item-item order.
  if (order?.id && itemDetails.length) {
    const rows = itemDetails.map((i) => ({
      order_id: order.id,
      product_id: i.id,
      title: i.title || i.name,
      variant: i.variant || null,
      price: i.price,
      qty: i.quantity,
    }));
    await fetch(`${base}/rest/v1/order_items`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify(rows),
    });
  }

  return order;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return res.status(500).json({
      error: 'Konfigurasi Midtrans belum lengkap. Set MIDTRANS_SERVER_KEY.',
    });
  }

  try {
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { items = [], customer = {}, voucher = null } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Keranjang kosong.' });
    }

    // PIN lacak guest = 4 digit terakhir nomor HP penerima (selalu dihitung di server).
    const phoneDigits = String(customer.phone || '').replace(/\D/g, '');
    customer.trackPin =
      phoneDigits.length >= 4 ? phoneDigits.slice(-4) : customer.trackPin || null;

    // Validasi & hitung ulang harga di server.
    const ids = items.map((i) => i.id);
    const products = await fetchProducts(ids);
    const priceMap = new Map(products.map((p) => [String(p.id), p]));

    const itemDetails = [];
    let grossAmount = 0;

    for (const item of items) {
      const product = priceMap.get(String(item.id));
      if (!product) {
        return res
          .status(400)
          .json({ error: `Produk tidak ditemukan: ${item.id}` });
      }
      const qty = Math.max(1, Number(item.qty) || 1);
      // Harga dihitung ulang di server: harga dasar + selisih varian terpilih.
      const { delta, label } = resolveVariant(product.variants, item.selection);
      const price = (Number(product.price) || 0) + delta;
      grossAmount += price * qty;

      const baseName = String(product.title).slice(0, 50);
      itemDetails.push({
        id: String(product.id),
        price,
        quantity: qty,
        // Sertakan label varian pada nama item Midtrans (maks 50 char).
        name: label ? `${baseName} (${label})`.slice(0, 50) : baseName,
        title: product.title,
        variant: label || null,
      });
    }

    if (grossAmount <= 0) {
      return res.status(400).json({ error: 'Total transaksi tidak valid.' });
    }

    // Hitung diskon voucher di server (sumber kebenaran). Net = subtotal - diskon.
    const { discount, userVoucherId } = await resolveVoucher(
      voucher,
      grossAmount,
      customer.id ?? null
    );
    const netAmount = Math.max(grossAmount - discount, 0);

    // Nomor order unik.
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Simpan order (status pending) DULU agar halaman finish selalu menemukannya,
    // terlepas dari apakah callback browser sempat jalan.
    // gross_amount = NET yang ditagih (subtotal - diskon) agar konsisten dengan
    // pembayaran Midtrans & perhitungan revenue.
    await saveOrder({
      orderId,
      grossAmount: netAmount,
      discountAmount: discount,
      userVoucherId,
      customer,
      itemDetails,
    });

    // Kirim email konfirmasi pesanan (non-fatal: jangan gagalkan checkout).
    try {
      await sendConfirmationEmail({
        order_number: orderId,
        customer_name: customer.name || 'Guest',
        customer_email: customer.email || null,
        gross_amount: netAmount,
        shipping_address: customer.address || null,
        recipient_phone: customer.phone || null,
        track_pin: customer.trackPin || null,
        order_items: itemDetails.map((i) => ({
          title: i.title || i.name,
          variant: i.variant || null,
          price: i.price,
          qty: i.quantity,
        })),
      });
    } catch (mailErr) {
      console.error('Email konfirmasi gagal:', mailErr.message);
    }

    // URL untuk kembali ke app setelah pembayaran (override default example.com).
    // Diambil dari origin request, fallback ke env bila ada.
    const origin =
      req.headers.origin ||
      process.env.APP_BASE_URL ||
      (req.headers.host ? `https://${req.headers.host}` : '');
    const finishUrl = origin ? `${origin}/payment/finish` : undefined;

    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    const endpoint = isProduction ? SNAP_URL.production : SNAP_URL.sandbox;
    // Auth Midtrans: Basic base64(serverKey + ':').
    const auth = Buffer.from(`${serverKey}:`).toString('base64');

    // Midtrans mensyaratkan sum(item_details) == gross_amount. Bila ada diskon,
    // tambahkan baris diskon bernilai negatif agar totalnya cocok dengan netAmount.
    const snapItemDetails = [...itemDetails];
    if (discount > 0) {
      snapItemDetails.push({
        id: 'VOUCHER_DISCOUNT',
        price: -discount,
        quantity: 1,
        name: 'Diskon Voucher',
      });
    }

    const payload = {
      transaction_details: { order_id: orderId, gross_amount: netAmount },
      item_details: snapItemDetails,
      customer_details: {
        first_name: customer.name || 'Guest',
        email: customer.email || 'guest@furnicrm.local',
        phone: customer.phone || '',
      },
      credit_card: { secure: true },
      ...(finishUrl ? { callbacks: { finish: finishUrl } } : {}),
    };

    const snapRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    const snapData = await snapRes.json();

    if (!snapRes.ok) {
      return res.status(snapRes.status).json({
        error:
          (snapData.error_messages && snapData.error_messages.join(', ')) ||
          'Gagal membuat transaksi Midtrans.',
      });
    }

    // Simpan snap token ke order agar bisa dipakai lagi di halaman faktur.
    try {
      const base = (process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
      const key = process.env.VITE_SUPABASE_ANON_KEY;
      await fetch(
        `${base}/rest/v1/orders?order_number=eq.${encodeURIComponent(orderId)}`,
        {
          method: 'PATCH',
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ snap_token: snapData.token }),
        }
      );
    } catch {
      // Non-fatal: token tetap dikembalikan ke client.
    }

    return res.status(200).json({
      token: snapData.token,
      redirectUrl: snapData.redirect_url,
      orderId,
      grossAmount,
      discountAmount: discount,
      netAmount,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Gagal memproses pembayaran: ${err.message}` });
  }
}
