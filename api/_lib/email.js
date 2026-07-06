/**
 * Helper email pesanan (Resend) untuk serverless functions.
 * Dipakai oleh: api/midtrans/token.js (konfirmasi), api/midtrans/notification.js
 * dan api/orders/send-invoice.js (invoice setelah bayar).
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export function supabaseBase() {
  return (process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
}

export function supabaseHeaders(extra = {}) {
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

function fromAddress() {
  return (
    process.env.RESEND_FROM ||
    process.env.EMAIL_FROM ||
    'Furniture <onboarding@resend.dev>'
  );
}

/** Format Rupiah sederhana (tanpa Intl agar konsisten di Node). */
export function rupiah(n) {
  const num = Math.round(Number(n) || 0);
  return 'Rp ' + num.toLocaleString('id-ID');
}

/** Kirim email lewat Resend. Lempar error bila gagal. */
export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY belum di-set.');
  if (!to) throw new Error('Alamat email penerima kosong.');

  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: fromAddress(), to: [to], subject, html }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Resend ${res.status}: ${detail}`);
  }
  return res.json().catch(() => ({}));
}

/** Ambil order + item dari Supabase berdasarkan order_number. */
export async function fetchOrderWithItems(orderNumber) {
  const url =
    `${supabaseBase()}/rest/v1/orders?order_number=eq.${encodeURIComponent(orderNumber)}` +
    `&select=*,order_items(*)&limit=1`;
  const res = await fetch(url, { headers: supabaseHeaders() });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

/** Tandai invoice sudah dikirim (idempotensi). */
async function markInvoiceSent(orderNumber) {
  await fetch(
    `${supabaseBase()}/rest/v1/orders?order_number=eq.${encodeURIComponent(orderNumber)}`,
    {
      method: 'PATCH',
      headers: supabaseHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify({ invoice_sent_at: new Date().toISOString() }),
    }
  );
}

/** Baris tabel item untuk template email. */
function itemsRows(items = []) {
  if (!items.length) {
    return `<tr><td colspan="3" style="padding:10px;color:#98a2b3;">Tidak ada rincian item.</td></tr>`;
  }
  return items
    .map((i) => {
      const name = i.variant ? `${i.title} <span style="color:#98a2b3;">(${i.variant})</span>` : i.title;
      const sub = (Number(i.price) || 0) * (Number(i.qty) || 0);
      return `
        <tr>
          <td style="padding:10px 8px;border-bottom:1px solid #f2f4f7;color:#344054;">${name} × ${i.qty}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #f2f4f7;color:#667085;text-align:right;">${rupiah(i.price)}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #f2f4f7;color:#101828;text-align:right;font-weight:600;">${rupiah(sub)}</td>
        </tr>`;
    })
    .join('');
}

function shell(title, bodyHtml) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#101828;">
      <h1 style="font-size:20px;margin:0 0 4px;">Furniture</h1>
      <h2 style="font-size:16px;font-weight:600;color:#475467;margin:0 0 20px;">${title}</h2>
      ${bodyHtml}
      <p style="color:#98a2b3;font-size:12px;margin:24px 0 0;border-top:1px solid #f2f4f7;padding-top:16px;">
        Email ini dikirim otomatis oleh Furniture. Mohon tidak membalas email ini.
      </p>
    </div>`;
}

function detailsTable(order) {
  const items = order.order_items || order.items || [];
  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:8px 0 16px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px;color:#98a2b3;font-size:12px;text-transform:uppercase;">Produk</th>
          <th style="text-align:right;padding:8px;color:#98a2b3;font-size:12px;text-transform:uppercase;">Harga</th>
          <th style="text-align:right;padding:8px;color:#98a2b3;font-size:12px;text-transform:uppercase;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${itemsRows(items)}</tbody>
    </table>
    <div style="text-align:right;font-size:16px;font-weight:700;margin-bottom:8px;">
      Total: ${rupiah(order.gross_amount)}
    </div>`;
}

function metaBlock(order) {
  const addr = order.shipping_address
    ? `<p style="margin:2px 0;color:#475467;font-size:13px;"><strong>Alamat:</strong> ${order.shipping_address}</p>`
    : '';
  const phone = order.recipient_phone
    ? `<p style="margin:2px 0;color:#475467;font-size:13px;"><strong>No HP:</strong> ${order.recipient_phone}</p>`
    : '';
  return `
    <div style="background:#f9fafb;border-radius:10px;padding:14px 16px;margin-bottom:16px;">
      <p style="margin:2px 0;color:#475467;font-size:13px;"><strong>Nomor Order:</strong> ${order.order_number}</p>
      <p style="margin:2px 0;color:#475467;font-size:13px;"><strong>Nama:</strong> ${order.customer_name || '-'}</p>
      ${addr}
      ${phone}
    </div>`;
}

/**
 * Kirim email KONFIRMASI order (status pending, menunggu pembayaran).
 * Non-fatal: error ditelan agar tidak menggagalkan pembuatan order.
 */
export async function sendConfirmationEmail(order) {
  const to = order.customer_email;
  if (!to) return { ok: false, skipped: 'no_email' };

  const pin = order.track_pin
    ? `<p style="margin:8px 0 0;color:#475467;font-size:13px;">PIN lacak pesanan (tamu): <strong style="letter-spacing:2px;">${order.track_pin}</strong></p>`
    : '';

  const html = shell(
    'Konfirmasi Pesanan',
    `<p style="color:#475467;font-size:14px;line-height:1.6;margin:0 0 16px;">
       Terima kasih, pesanan Anda telah kami terima dan menunggu pembayaran.
     </p>
     ${metaBlock(order)}
     ${detailsTable(order)}
     ${pin}
     <p style="color:#475467;font-size:13px;margin:16px 0 0;">
       Selesaikan pembayaran untuk memproses pesanan Anda.
     </p>`
  );

  try {
    await sendEmail({ to, subject: `Konfirmasi Pesanan ${order.order_number}`, html });
    return { ok: true };
  } catch (err) {
    console.error('sendConfirmationEmail gagal:', err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Kirim email INVOICE setelah pembayaran lunas. Idempoten:
 * hanya terkirim sekali (cek & set invoice_sent_at).
 *
 * @param {string} orderNumber
 * @returns {Promise<{ok:boolean, alreadySent?:boolean, skipped?:string}>}
 */
export async function sendInvoiceForOrder(orderNumber) {
  const order = await fetchOrderWithItems(orderNumber);
  if (!order) return { ok: false, skipped: 'not_found' };
  if ((order.status || '').toLowerCase() !== 'paid') {
    return { ok: false, skipped: 'not_paid' };
  }
  if (order.invoice_sent_at) {
    return { ok: true, alreadySent: true };
  }
  const to = order.customer_email;
  if (!to) return { ok: false, skipped: 'no_email' };

  const html = shell(
    'Invoice Pembayaran',
    `<div style="display:inline-block;background:#ecfdf3;color:#067647;font-weight:700;
                 font-size:12px;padding:4px 12px;border-radius:999px;margin-bottom:14px;">
       LUNAS
     </div>
     <p style="color:#475467;font-size:14px;line-height:1.6;margin:0 0 16px;">
       Pembayaran Anda telah kami terima. Berikut invoice pesanan Anda.
     </p>
     ${metaBlock(order)}
     ${detailsTable(order)}
     <p style="color:#475467;font-size:13px;margin:16px 0 0;">
       Pesanan Anda akan segera diproses. Terima kasih telah berbelanja di Furniture.
     </p>`
  );

  try {
    await sendEmail({ to, subject: `Invoice ${order.order_number} — LUNAS`, html });
    await markInvoiceSent(orderNumber);
    return { ok: true };
  } catch (err) {
    console.error('sendInvoiceForOrder gagal:', err.message);
    return { ok: false, error: err.message };
  }
}
