import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiPrinter,
  FiCreditCard,
  FiShoppingBag,
} from 'react-icons/fi';
import { getOrderByNumber, completeCheckout } from '../../services/orders';
import { payWithToken, createTransaction } from '../../services/payment';
import { getCurrentUser } from '../../services/auth';
import { formatRupiah } from '../../lib/membership';

const STATUS_META = {
  paid: {
    icon: FiCheckCircle,
    title: 'Pembayaran Berhasil',
    desc: 'Terima kasih! Pesanan Anda telah kami terima dan sedang diproses.',
    color: '#067647',
    bg: '#ECFDF3',
    label: 'LUNAS',
  },
  pending: {
    icon: FiClock,
    title: 'Pesanan Dikonfirmasi',
    desc: 'Faktur Anda telah dibuat. Lakukan pembayaran untuk memproses pesanan.',
    color: '#B54708',
    bg: '#FFFAEB',
    label: 'BELUM DIBAYAR',
  },
  failed: {
    icon: FiXCircle,
    title: 'Pembayaran Gagal',
    desc: 'Maaf, pembayaran tidak dapat diproses. Silakan coba lagi.',
    color: '#B42318',
    bg: '#FEF3F2',
    label: 'GAGAL',
  },
};

function PaymentFinish({ mode = 'finish' }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const orderId = params.get('order_id');
  const txStatus = params.get('transaction_status');
  const basePath = mode === 'confirm' ? '/payment/confirm' : '/payment/finish';

  const loadOrder = (id) =>
    getOrderByNumber(id)
      .then((data) => {
        if (!data) setError('Detail order tidak ditemukan.');
        else setOrder(data);
        setLoading(false);
        return data;
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
        return null;
      });

  // Status final (tidak perlu polling lagi).
  const isFinalStatus = (s) =>
    ['paid', 'processing', 'shipped', 'delivered', 'completed', 'failed'].includes(
      (s || '').toLowerCase()
    );

  // Apakah redirect Midtrans menandakan pembayaran sukses?
  const txIndicatesPaid =
    txStatus === 'settlement' || txStatus === 'capture';

  // Pindahkan ke route yang sesuai dengan status order:
  //  - belum dibayar (pending) -> /payment/confirm
  //  - sudah dibayar/diproses dst -> /payment/finish
  useEffect(() => {
    if (!order) return;
    const status = (order.status || '').toLowerCase();
    const id = order.order_number;
    if (status === 'pending' && mode !== 'confirm') {
      navigate(`/payment/confirm?order_id=${id}`, { replace: true });
    } else if (status !== 'pending' && mode === 'confirm') {
      navigate(`/payment/finish?order_id=${id}`, { replace: true });
    }
  }, [order, mode, navigate]);

  useEffect(() => {
    // Wajib login untuk mengakses halaman order/pembayaran.
    const session = getCurrentUser();
    if (!session) {
      const id = orderId || sessionStorage.getItem('last_order_id') || '';
      const redirect = id ? `${basePath}?order_id=${id}` : basePath;
      navigate('/login', { replace: true, state: { from: redirect } });
      return;
    }

    // Fallback: bila Midtrans redirect tanpa membawa order_id,
    // pakai order id terakhir yang disimpan saat konfirmasi.
    const effectiveId = orderId || sessionStorage.getItem('last_order_id');
    if (!effectiveId) {
      setError('Nomor order tidak ditemukan.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 8; // ~16 detik (8 x 2s)

    const syncAndPoll = async () => {
      const data = await loadOrder(effectiveId);
      if (cancelled || !data) return;

      const status = (data.status || '').toLowerCase();

      // Jika kembali dari redirect Midtrans dengan status sukses tapi DB masih
      // pending (webhook belum masuk), sinkronkan sekali agar tidak perlu refresh.
      if (status === 'pending' && txIndicatesPaid) {
        setSyncing(true);
        try {
          await completeCheckout({
            orderNumber: data.order_number,
            grossAmount: data.gross_amount,
            customer: { id: data.user_id || session?.id || null },
            status: 'paid',
          });
        } catch {
          // Abaikan; polling di bawah tetap akan menangkap update dari webhook.
        }
        if (!cancelled) await loadOrder(effectiveId);
        if (!cancelled) setSyncing(false);
        return;
      }

      // Selama status belum final (mis. menunggu webhook), polling berkala.
      if (!isFinalStatus(status) && txIndicatesPaid && attempts < MAX_ATTEMPTS) {
        setSyncing(true);
        attempts += 1;
        pollTimer = setTimeout(syncAndPoll, 2000);
      } else if (!cancelled) {
        setSyncing(false);
      }
    };

    let pollTimer;
    syncAndPoll();

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [orderId, navigate, txStatus]);

  const handlePay = async () => {
    setPaying(true);
    setError(null);
    const session = getCurrentUser();
    const customer = { id: order.user_id || session?.id || null };

    const callbacks = {
      onSuccess: async (result) => {
        await completeCheckout({
          orderNumber: order.order_number,
          grossAmount: order.gross_amount,
          customer: { ...customer, paymentType: result.payment_type },
          status: 'paid',
        });
        setPaying(false);
        loadOrder(order.order_number);
      },
      onPending: async (result) => {
        await completeCheckout({
          orderNumber: order.order_number,
          grossAmount: order.gross_amount,
          customer: { ...customer, paymentType: result.payment_type },
          status: 'pending',
        });
        setPaying(false);
        loadOrder(order.order_number);
      },
      onError: () => setPaying(false),
      onClose: () => setPaying(false),
    };

    try {
      let token = order.snap_token;
      // Fallback: jika token belum tersimpan, buat transaksi baru dari item order.
      if (!token) {
        const items = (order.items || []).map((i) => ({ id: i.product_id, qty: i.qty }));
        const tx = await createTransaction({ items, customer });
        token = tx.token;
      }
      await payWithToken(token, callbacks);
    } catch (err) {
      setPaying(false);
      setError(err.message || 'Gagal memulai pembayaran.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#667085' }}>
        Memuat detail pesanan...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 560, margin: '40px auto', padding: 16 }}>
        <div
          style={{
            padding: 16,
            background: '#fef2f2',
            color: '#b42318',
            border: '1px solid #fecaca',
            borderRadius: 10,
          }}
        >
          {error}
        </div>
        <button
          onClick={() => navigate('/shop')}
          style={{
            marginTop: 16,
            padding: '10px 20px',
            border: '1px solid #d0d5dd',
            background: '#fff',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Kembali ke Shop
        </button>
      </div>
    );
  }

  const rawStatus =
    order?.status ||
    (txStatus === 'settlement' || txStatus === 'capture'
      ? 'paid'
      : txStatus === 'pending'
        ? 'pending'
        : 'failed');
  const meta = STATUS_META[rawStatus] || STATUS_META.pending;
  const StatusIcon = meta.icon;
  const items = order?.items || [];
  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.price) * Number(i.qty),
    0
  );

  return (
    <>
      <style>{styles}</style>
      <div className="pf-wrap">
        {/* Status header */}
        <div className="pf-head">
          <div className="pf-icon" style={{ background: meta.bg, color: meta.color }}>
            <StatusIcon size={36} />
          </div>
          <h1 className="pf-title">{meta.title}</h1>
          <p className="pf-desc">{meta.desc}</p>
        </div>

        {syncing && (
          <div className="pf-syncing">
            <span className="pf-spinner" />
            Memperbarui status pembayaran…
          </div>
        )}

        {/* Invoice card */}
        <div className="pf-invoice">
          <div className="pf-invoice-head">
            <div>
              <h2 className="pf-invoice-title">Faktur Pembelian</h2>
              <p className="pf-invoice-sub">FurniCRM</p>
            </div>
            <span
              className="pf-badge"
              style={{ background: meta.bg, color: meta.color }}
            >
              {meta.label}
            </span>
          </div>

          <div className="pf-divider" />

          <div className="pf-meta">
            <div>
              <span className="pf-meta-label">No. Order</span>
              <p className="pf-meta-value">{order?.order_number}</p>
            </div>
            <div>
              <span className="pf-meta-label">Tanggal</span>
              <p className="pf-meta-value">
                {order?.created_at
                  ? new Date(order.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '-'}
              </p>
            </div>
            <div>
              <span className="pf-meta-label">Pelanggan</span>
              <p className="pf-meta-value">{order?.customer_name || 'Guest'}</p>
            </div>
          </div>

          <div className="pf-table-wrap">
            <table className="pf-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th className="ta-center">Qty</th>
                  <th className="ta-right">Harga</th>
                  <th className="ta-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="pf-td-product">
                      {item.title}
                      {item.variant && (
                        <span style={{ color: '#98a2b3', fontSize: 12 }}> · {item.variant}</span>
                      )}
                    </td>
                    <td className="ta-center">{item.qty}</td>
                    <td className="ta-right">{formatRupiah(item.price)}</td>
                    <td className="ta-right">
                      {formatRupiah(item.price * item.qty)}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="ta-center pf-empty">
                      Tidak ada detail item.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                {Number(order?.discount_amount) > 0 && (
                  <>
                    <tr>
                      <td colSpan={3} className="ta-right">Subtotal</td>
                      <td className="ta-right">{formatRupiah(subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="ta-right" style={{ color: '#067647' }}>
                        Diskon Voucher
                      </td>
                      <td className="ta-right" style={{ color: '#067647' }}>
                        - {formatRupiah(order.discount_amount)}
                      </td>
                    </tr>
                  </>
                )}
                <tr>
                  <td colSpan={3} className="ta-right pf-total-label">
                    Total
                  </td>
                  <td className="ta-right pf-total-value">
                    {formatRupiah(order?.gross_amount || subtotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {order?.payment_type && (
            <p className="pf-payment-type">
              Metode pembayaran: <strong>{order.payment_type}</strong>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="pf-actions">
          {rawStatus === 'pending' && (
            <button className="pf-btn pf-btn-primary" onClick={handlePay} disabled={paying}>
              <FiCreditCard size={16} />
              {paying ? 'Memproses...' : 'Bayar Sekarang'}
            </button>
          )}
          <button className="pf-btn pf-btn-outline" onClick={() => window.print()}>
            <FiPrinter size={16} />
            Cetak Faktur
          </button>
          <button className="pf-btn pf-btn-ghost" onClick={() => navigate('/shop')}>
            <FiShoppingBag size={16} />
            Lanjut Belanja
          </button>
        </div>
      </div>
    </>
  );
}

const styles = `
  .pf-wrap {
    max-width: 760px;
    margin: 0 auto;
    padding: 32px 16px;
    font-family: 'Lato', sans-serif;
  }
  .pf-head { text-align: center; margin-bottom: 32px; }
  .pf-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }
  .pf-title { margin: 0; font-size: 26px; font-weight: 700; color: #101828; }
  .pf-desc {
    margin: 8px auto 0;
    max-width: 440px;
    font-size: 14px;
    color: #667085;
    line-height: 1.6;
  }

  .pf-invoice {
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 16px;
    padding: 28px;
    box-shadow: 0 4px 15px rgba(16,24,40,0.04);
  }
  .pf-invoice-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
  }
  .pf-invoice-title { margin: 0; font-size: 18px; font-weight: 700; color: #101828; }
  .pf-invoice-sub { margin: 2px 0 0; font-size: 13px; color: #98a2b3; }
  .pf-badge {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    padding: 5px 12px;
    border-radius: 999px;
    white-space: nowrap;
  }
  .pf-divider { height: 1px; background: #f3f4f6; margin: 20px 0; }

  .pf-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  .pf-meta-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #98a2b3;
    font-weight: 600;
  }
  .pf-meta-value { margin: 4px 0 0; font-size: 14px; font-weight: 600; color: #101828; word-break: break-word; }

  .pf-table-wrap {
    border: 1px solid #eaecf0;
    border-radius: 10px;
    overflow: hidden;
    overflow-x: auto;
  }
  .pf-table { width: 100%; border-collapse: collapse; min-width: 480px; }
  .pf-table th {
    background: #f9fafb;
    font-size: 12px;
    font-weight: 600;
    color: #475467;
    text-align: left;
    padding: 12px 16px;
    border-bottom: 1px solid #eaecf0;
  }
  .pf-table td {
    padding: 14px 16px;
    font-size: 14px;
    color: #475467;
    border-bottom: 1px solid #f3f4f6;
  }
  .pf-table tbody tr:last-child td { border-bottom: none; }
  .pf-td-product { font-weight: 600; color: #101828; }
  .ta-center { text-align: center; }
  .ta-right { text-align: right; }
  .pf-empty { color: #98a2b3; padding: 24px; }
  .pf-table tfoot td {
    background: #f9fafb;
    border-top: 1px solid #eaecf0;
    border-bottom: none;
    padding: 14px 16px;
  }
  .pf-total-label { font-weight: 600; color: #475467; }
  .pf-total-value { font-size: 16px; font-weight: 700; color: #101828; }

  .pf-payment-type { margin: 16px 0 0; font-size: 12px; color: #667085; }

  .pf-syncing {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin: 0 auto 20px;
    max-width: 360px;
    padding: 10px 16px;
    background: #fffaeb;
    color: #b54708;
    border: 1px solid #fedf89;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
  }
  .pf-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid #fedf89;
    border-top-color: #b54708;
    border-radius: 50%;
    animation: pf-spin 0.7s linear infinite;
  }
  @keyframes pf-spin { to { transform: rotate(360deg); } }

  .pf-actions {
    margin-top: 24px;
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .pf-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    border: 1px solid transparent;
    transition: background 0.15s, opacity 0.15s;
  }
  .pf-btn-primary { background: #101828; color: #fff; }
  .pf-btn-primary:hover { background: #000000; }
  .pf-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .pf-btn-outline { background: #fff; border-color: #d0d5dd; color: #344054; }
  .pf-btn-outline:hover { background: #f9fafb; }
  .pf-btn-ghost { background: transparent; color: #475467; }
  .pf-btn-ghost:hover { background: #f3f4f6; }

  @media print {
    .pf-actions { display: none; }
    .pf-invoice { box-shadow: none; border: none; }
  }
`;

export default PaymentFinish;
