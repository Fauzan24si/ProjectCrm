import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPrinter, FiUser, FiCalendar, FiCreditCard, FiPackage, FiTag } from 'react-icons/fi';
import Table from '../../Reusable/Table';
import { getOrderDetail, getOrderStatusMeta } from '../../services/orders';

const formatRupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

const formatDate = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
};

// Status DB (lowercase) -> kelas badge/timeline existing.
const odStatusClass = (status) => {
  const s = (status || '').toLowerCase();
  if (['cancelled', 'failed'].includes(s)) return 'cancelled';
  if (s === 'pending') return 'processing';
  return 'completed';
};

function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getOrderDetail(id)
      .then((data) => {
        if (active) setOrder(data || null);
      })
      .catch(() => {
        if (active) setOrder(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
        Memuat detail order...
      </div>
    );
  }

  if (!order) {
    return (
      <>
        <Link to="/sales-report" style={styles.backLink}>
          <FiArrowLeft /> Kembali ke Sales Report
        </Link>
        <div style={styles.notFound}>
          <h2 style={{ margin: '0 0 8px', color: '#111827' }}>Order tidak ditemukan</h2>
          <p style={{ margin: 0, color: '#6b7280' }}>Invoice dengan ID <strong>{id}</strong> tidak ada.</p>
        </div>
      </>
    );
  }

  const statusClass = odStatusClass(order.status);
  const statusMeta = getOrderStatusMeta(order.status);
  const items = order.items || [];

  // Breakdown biaya: subtotal item, PPN 11%, ongkir flat 150k.
  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.price) * Number(i.qty),
    0
  );
  const tax = Math.round(subtotal * 0.11);
  const shipping = 150000;
  const grandTotal = subtotal + tax + shipping;

  return (
    <>
      <style>{componentStyles}</style>

      <div className="od-top">
        <Link to="/sales-report" style={styles.backLink}>
          <FiArrowLeft /> Kembali ke Sales Report
        </Link>
        <button className="od-print-btn" onClick={() => window.print()}>
          <FiPrinter /> Print Invoice
        </button>
      </div>

      {/* Header invoice */}
      <div className="od-header">
        <div>
          <p className="od-label">Invoice</p>
          <h1 className="od-invoice">{order.orderNumber}</h1>
          <p className="od-date">
            <FiCalendar style={{ marginRight: 6, verticalAlign: 'middle' }} />
            {formatDate(order.date)}
          </p>
        </div>
        <div className="od-status-wrap">
          <span className={`od-status ${statusClass}`}>
            {statusMeta.label}
          </span>
        </div>
      </div>

      <div className="od-grid">
        {/* Kolom kiri — info customer & payment & items */}
        <div className="od-col-main">
          {/* Customer & Payment */}
          <div className="od-card">
            <div className="od-two-col">
              <InfoBlock
                icon={<FiUser />}
                title="Customer"
                lines={[order.customer || 'Guest', order.email || '-']}
              />
              <InfoBlock
                icon={<FiCreditCard />}
                title="Pembayaran"
                lines={[order.payment || '-', statusMeta.label]}
              />
            </div>
          </div>

          {/* Items */}
          <div className="od-card">
            <h2 className="od-card-title">Item Pembelian</h2>
            <Table className="od-items">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Varian</th>
                  <th className="num">Qty</th>
                  <th className="num">Harga</th>
                  <th className="num">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="od-item-cell">
                        <div className="od-item-thumb"><FiPackage /></div>
                        <div>
                          <p className="od-item-name">{item.title}</p>
                          <p className="od-item-sku">ID: {item.productId ?? '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="od-category">
                        <FiTag size={11} style={{ marginRight: 4 }} />
                        {item.variant || '-'}
                      </span>
                    </td>
                    <td className="num">{item.qty}</td>
                    <td className="num">{formatRupiah(item.price)}</td>
                    <td className="num bold">{formatRupiah(item.price * item.qty)}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 20, color: '#9ca3af', textAlign: 'center' }}>
                      Tidak ada item.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>

        {/* Kolom kanan — summary */}
        <aside className="od-col-side">
          <div className="od-card">
            <h2 className="od-card-title">Ringkasan</h2>
            <div className="od-sum-row">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="od-sum-row">
              <span>PPN (11%)</span>
              <span>{formatRupiah(tax)}</span>
            </div>
            <div className="od-sum-row">
              <span>Pengiriman</span>
              <span>{formatRupiah(shipping)}</span>
            </div>
            <div className="od-sum-divider" />
            <div className="od-sum-row total">
              <span>Grand Total</span>
              <span>{formatRupiah(grandTotal)}</span>
            </div>
          </div>

          <div className="od-card">
            <h2 className="od-card-title">Timeline</h2>
            <ul className="od-timeline">
              <li className="done">
                <span className="od-dot" />
                <div>
                  <p className="od-tl-title">Order dibuat</p>
                  <p className="od-tl-sub">{formatDate(order.date)}</p>
                </div>
              </li>
              <li className={statusClass !== 'cancelled' ? 'done' : ''}>
                <span className="od-dot" />
                <div>
                  <p className="od-tl-title">Pembayaran diterima</p>
                  <p className="od-tl-sub">{order.payment || '-'}</p>
                </div>
              </li>
              <li className={statusClass === 'completed' ? 'done' : statusClass === 'processing' ? 'current' : ''}>
                <span className="od-dot" />
                <div>
                  <p className="od-tl-title">{statusMeta.label}</p>
                  <p className="od-tl-sub">
                    {statusClass === 'completed' ? 'Pesanan diproses / selesai'
                     : statusClass === 'processing' ? 'Menunggu pembayaran'
                     : 'Order dibatalkan'}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}

function InfoBlock({ icon, title, lines }) {
  return (
    <div className="od-info-block">
      <div className="od-info-icon">{icon}</div>
      <div>
        <p className="od-info-title">{title}</p>
        {lines.map((line, i) => (
          <p key={i} className={i === 0 ? 'od-info-main' : 'od-info-sub'}>{line}</p>
        ))}
      </div>
    </div>
  );
}

const styles = {
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#054C73',
    textDecoration: 'none',
  },
  notFound: {
    background: '#fff',
    border: '1px solid #f3f4f6',
    borderRadius: '14px',
    padding: '40px',
    textAlign: 'center',
    marginTop: '20px',
  },
};

const componentStyles = `
  .od-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .od-print-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #054C73;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Lato', sans-serif;
    transition: background 0.2s;
  }
  .od-print-btn:hover { background: #04395a; }

  .od-header {
    background: #fff;
    border: 1px solid #f3f4f6;
    border-radius: 16px;
    padding: 24px 28px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    flex-wrap: wrap;
    gap: 16px;
  }
  .od-label {
    font-size: 11px;
    font-weight: 700;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin: 0 0 4px;
  }
  .od-invoice {
    font-size: 28px;
    font-weight: 800;
    color: #054C73;
    margin: 0 0 6px;
    letter-spacing: -0.02em;
  }
  .od-date {
    font-size: 13px;
    color: #6b7280;
    margin: 0;
  }
  .od-status {
    display: inline-block;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.3px;
  }
  .od-status.completed  { background: #dcfce7; color: #15803d; }
  .od-status.processing { background: #dbeafe; color: #1d4ed8; }
  .od-status.cancelled  { background: #fee2e2; color: #dc2626; }

  /* Grid 2-col */
  .od-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
    align-items: start;
  }
  .od-col-main { display: flex; flex-direction: column; gap: 20px; }
  .od-col-side { display: flex; flex-direction: column; gap: 20px; }

  .od-card {
    background: #fff;
    border: 1px solid #f3f4f6;
    border-radius: 14px;
    padding: 20px 22px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }

  .od-card-title {
    font-size: 14px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f3f4f6;
  }

  /* Two-col info */
  .od-two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .od-info-block {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .od-info-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #DFE9F4;
    color: #054C73;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .od-info-title {
    font-size: 11px;
    font-weight: 700;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 4px;
  }
  .od-info-main {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }
  .od-info-sub {
    font-size: 12px;
    color: #6b7280;
    margin: 2px 0 0;
  }

  /* Items table */
  .od-items {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .od-items thead th {
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 10px 12px;
    background: #fafafa;
    border-bottom: 1px solid #f3f4f6;
  }
  .od-items th.num, .od-items td.num { text-align: right; }
  .od-items tbody td {
    padding: 14px 12px;
    color: #1f2937;
    border-bottom: 1px solid #f9fafb;
  }
  .od-items .bold { font-weight: 700; }

  .od-item-cell { display: flex; align-items: center; gap: 12px; }
  .od-item-thumb {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #f3f4f6;
    color: #9ca3af;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .od-item-name { font-size: 13px; font-weight: 600; color: #1f2937; margin: 0; }
  .od-item-sku { font-size: 11px; color: #9ca3af; margin: 2px 0 0; }

  .od-category {
    display: inline-flex;
    align-items: center;
    font-size: 11px;
    font-weight: 600;
    color: #6b7280;
    background: #f3f4f6;
    padding: 3px 8px;
    border-radius: 12px;
  }

  /* Summary */
  .od-sum-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 13px;
    color: #6b7280;
  }
  .od-sum-row span:last-child {
    font-weight: 600;
    color: #1f2937;
  }
  .od-sum-divider {
    height: 1px;
    background: #f3f4f6;
    margin: 8px 0;
  }
  .od-sum-row.total {
    font-size: 16px;
    font-weight: 700;
    color: #054C73;
    padding: 8px 0 0;
  }
  .od-sum-row.total span:last-child {
    color: #054C73;
    font-size: 18px;
    font-weight: 800;
  }

  /* Timeline */
  .od-timeline {
    list-style: none;
    padding: 0;
    margin: 0;
    position: relative;
  }
  .od-timeline li {
    position: relative;
    padding-left: 28px;
    padding-bottom: 20px;
  }
  .od-timeline li:last-child { padding-bottom: 0; }
  .od-timeline li::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 14px;
    bottom: -6px;
    width: 2px;
    background: #f3f4f6;
  }
  .od-timeline li:last-child::before { display: none; }

  .od-dot {
    position: absolute;
    left: 0;
    top: 4px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #f3f4f6;
    border: 3px solid #fff;
    box-shadow: 0 0 0 1px #e5e7eb;
  }
  .od-timeline li.done .od-dot {
    background: #16a34a;
    box-shadow: 0 0 0 1px #16a34a;
  }
  .od-timeline li.current .od-dot {
    background: #1d4ed8;
    box-shadow: 0 0 0 1px #1d4ed8;
  }

  .od-tl-title {
    font-size: 13px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 2px;
  }
  .od-tl-sub {
    font-size: 12px;
    color: #9ca3af;
    margin: 0;
  }

  /* Responsive */
  @media (max-width: 1000px) {
    .od-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .od-two-col { grid-template-columns: 1fr; }
  }

  /* Print */
  @media print {
    .od-top, .sidebar, .admin-header { display: none !important; }
    .od-card { box-shadow: none; border: 1px solid #ddd; }
  }
`;

export default OrderDetail;
