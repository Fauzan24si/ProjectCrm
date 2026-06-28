/**
 * Vercel Serverless Function: webhook notifikasi Midtrans.
 *
 * Midtrans memanggil endpoint ini setiap status transaksi berubah.
 * Kita verifikasi signature, tentukan status final, lalu update order
 * di Supabase.
 *
 * Set URL ini di dashboard Midtrans:
 *   Settings > Configuration > Payment Notification URL
 *   => https://<domain-vercel>/api/midtrans/notification
 *
 * Env: MIDTRANS_SERVER_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 */

import crypto from 'crypto';
import { sendInvoiceForOrder } from '../_lib/email.js';

/** Update status order di Supabase berdasarkan order_number. */
async function updateOrderStatus(orderNumber, status, paymentType) {
  const base = (process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.VITE_SUPABASE_ANON_KEY;

  const url = `${base}/rest/v1/orders?order_number=eq.${encodeURIComponent(
    orderNumber
  )}`;
  await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ status, payment_type: paymentType }),
  });
}

/** Petakan status Midtrans ke status order internal. */
function mapStatus(transactionStatus, fraudStatus) {
  if (
    transactionStatus === 'capture' ||
    transactionStatus === 'settlement'
  ) {
    if (fraudStatus === 'challenge') return 'pending';
    return 'paid';
  }
  if (transactionStatus === 'pending') return 'pending';
  if (
    transactionStatus === 'deny' ||
    transactionStatus === 'cancel' ||
    transactionStatus === 'expire'
  ) {
    return 'failed';
  }
  return 'pending';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return res.status(500).json({ error: 'MIDTRANS_SERVER_KEY belum di-set.' });
  }

  try {
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = body;

    // Verifikasi signature: sha512(order_id + status_code + gross_amount + serverKey)
    const expected = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    if (expected !== signature_key) {
      return res.status(403).json({ error: 'Signature tidak valid.' });
    }

    const status = mapStatus(transaction_status, fraud_status);
    await updateOrderStatus(order_id, status, payment_type);

    // Kirim email invoice saat lunas (idempoten: hanya sekali).
    if (status === 'paid') {
      try {
        await sendInvoiceForOrder(order_id);
      } catch (mailErr) {
        console.error('Email invoice (webhook) gagal:', mailErr.message);
      }
    }

    return res.status(200).json({ received: true, status });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Gagal memproses notifikasi: ${err.message}` });
  }
}
