/**
 * Vercel Serverless Function: kirim email invoice untuk order yang LUNAS.
 *
 * Dipakai sebagai fallback dari halaman PaymentFinish (setelah callback Snap
 * onSuccess), selain webhook Midtrans. Idempoten: invoice hanya terkirim sekali
 * (dijaga oleh kolom orders.invoice_sent_at di helper).
 *
 * Body: { orderNumber }
 * Env: RESEND_API_KEY, EMAIL_FROM/RESEND_FROM, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 */
import { sendInvoiceForOrder } from '../_lib/email.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const orderNumber = body.orderNumber || body.order_id;

    if (!orderNumber) {
      return res.status(400).json({ error: 'orderNumber wajib diisi.' });
    }

    const result = await sendInvoiceForOrder(orderNumber);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: `Gagal mengirim invoice: ${err.message}` });
  }
}
