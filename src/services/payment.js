/**
 * Service pembayaran Midtrans Snap (sisi client).
 *
 *  - loadSnap(): inject script Snap.js sekali saja.
 *  - createTransaction(): minta token ke serverless /api/midtrans/token.
 *  - pay(): buka popup Snap dan kembalikan hasil via callback.
 */

const CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
const IS_PRODUCTION = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';

const SNAP_SCRIPT = IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js';

let snapLoading = null;

/** Inject script Snap.js (hanya sekali). */
export function loadSnap() {
  if (window.snap) return Promise.resolve(window.snap);
  if (snapLoading) return snapLoading;

  snapLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SNAP_SCRIPT;
    script.setAttribute('data-client-key', CLIENT_KEY || '');
    script.onload = () => resolve(window.snap);
    script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap.'));
    document.body.appendChild(script);
  });
  return snapLoading;
}

/**
 * Minta token transaksi dari serverless function.
 * @param {{items: Array, customer: object}} param0
 * @returns {Promise<{token: string, orderId: string, grossAmount: number}>}
 */
export async function createTransaction({ items, customer }) {
  const res = await fetch('/api/midtrans/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: items.map((i) => ({
        id: i.id,
        qty: i.qty,
        variant: i.variant || null,
        selection: i.selection || null,
        unitPrice: i.price,
      })),
      customer,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Gagal membuat transaksi.');
  }
  return data;
}

/**
 * Buka popup Snap memakai token yang sudah ada (order sudah dibuat sebelumnya).
 * @param {string} token
 * @param {object} callbacks - { onSuccess, onPending, onError, onClose }
 */
export async function payWithToken(token, callbacks = {}) {
  await loadSnap();
  window.snap.pay(token, {
    onSuccess: (result) => callbacks.onSuccess?.(result),
    onPending: (result) => callbacks.onPending?.(result),
    onError: (result) => callbacks.onError?.(result),
    onClose: () => callbacks.onClose?.(),
  });
}

/**
 * Jalankan alur pembayaran: load Snap, ambil token, buka popup.
 * @param {object} params
 * @param {Array} params.items - item keranjang
 * @param {object} params.customer - { name, email, phone }
 * @param {object} params.callbacks - { onSuccess, onPending, onError, onClose }
 * @returns {Promise<{orderId: string, grossAmount: number}>}
 */
export async function pay({ items, customer, callbacks = {} }) {
  await loadSnap();
  const { token, orderId, grossAmount } = await createTransaction({
    items,
    customer,
  });

  window.snap.pay(token, {
    onSuccess: (result) => callbacks.onSuccess?.(result, { orderId, grossAmount }),
    onPending: (result) => callbacks.onPending?.(result, { orderId, grossAmount }),
    onError: (result) => callbacks.onError?.(result, { orderId, grossAmount }),
    onClose: () => callbacks.onClose?.({ orderId, grossAmount }),
  });

  return { orderId, grossAmount };
}
