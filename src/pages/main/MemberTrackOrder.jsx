import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBox, FiFileText, FiChevronRight } from 'react-icons/fi';
import { getCurrentUser } from '../../services/auth';
import { getUser } from '../../services/users';
import { formatRupiah } from '../../lib/membership';
import {
  getOrdersByUser,
  getOrderStatusMeta,
  FULFILLMENT_STEPS,
} from '../../services/orders';

const STEP_LABEL = {
  paid: 'Dibayar',
  processing: 'Diproses',
  shipped: 'Dikirim',
  delivered: 'Sampai',
  completed: 'Selesai',
};

function MemberTrackOrder() {
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const session = getCurrentUser();
    if (!session) {
      navigate('/login');
      return;
    }

    getUser(session.id)
      .then(async (data) => {
        if (!data) {
          setError('Data member tidak ditemukan.');
        } else {
          const userOrders = await getOrdersByUser(data.id);
          setOrders(userOrders);
          if (userOrders.length) setSelectedId(userOrders[0].orderNumber);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
  }, [navigate]);

  const selected = orders.find((o) => o.orderNumber === selectedId) || null;

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#667085' }}>
        Memuat pesanan...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 16, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 10 }}>
        {error}
      </div>
    );
  }

  return (
    <>
      <style>{trackStyles}</style>
      <div className="mtrack-wrap">
        <div className="mtrack-header">
          <h1 className="mtrack-title">Lacak Pesanan</h1>
          <p className="mtrack-subtitle">
            Pantau status pengiriman setiap pesanan Anda.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="mtrack-empty">
            <FiBox size={40} />
            <p>Belum ada pesanan untuk dilacak.</p>
            <Link to="/shop" className="mtrack-empty-btn">
              Lihat Katalog
            </Link>
          </div>
        ) : (
          <div className="mtrack-grid">
            {/* Daftar pesanan */}
            <div className="mtrack-list">
              {orders.map((order) => {
                const meta = getOrderStatusMeta(order.status);
                const active = order.orderNumber === selectedId;
                return (
                  <button
                    key={order.orderNumber}
                    type="button"
                    className={`mtrack-list-item ${active ? 'active' : ''}`}
                    onClick={() => setSelectedId(order.orderNumber)}
                  >
                    <div className="mtrack-list-main">
                      <span className="mtrack-list-num">
                        <FiFileText size={13} /> {order.orderNumber}
                      </span>
                      <span className="mtrack-list-product">{order.product}</span>
                      <span
                        className="mtrack-list-badge"
                        style={{ color: meta.color, background: meta.bg }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <FiChevronRight size={18} className="mtrack-list-chevron" />
                  </button>
                );
              })}
            </div>

            {/* Detail + steps */}
            {selected && <OrderTrackDetail order={selected} />}
          </div>
        )}
      </div>
    </>
  );
}

function OrderTrackDetail({ order }) {
  const status = order.status;
  const isCancelled = status === 'cancelled' || status === 'failed';
  const isPending = status === 'pending';
  const currentStepIndex = FULFILLMENT_STEPS.indexOf(status);
  const meta = getOrderStatusMeta(status);

  return (
    <div className="mtrack-detail">
      <div className="mtrack-detail-head">
        <div>
          <span className="mtrack-label">Nomor Order</span>
          <p className="mtrack-ordernum">{order.orderNumber}</p>
        </div>
        <span
          className="mtrack-status-badge"
          style={{ color: meta.color, background: meta.bg }}
        >
          {meta.label}
        </span>
      </div>

      {/* Steps (gaya DaisyUI) */}
      {isCancelled ? (
        <div className="mtrack-alert cancelled">
          Pesanan ini {meta.label.toLowerCase()}.
        </div>
      ) : isPending ? (
        <div className="mtrack-alert pending">
          Menunggu pembayaran. Status pengiriman muncul setelah pembayaran diterima.
        </div>
      ) : (
        <ul className="steps">
          {FULFILLMENT_STEPS.map((step, idx) => {
            const done = idx <= currentStepIndex;
            return (
              <li
                key={step}
                className={`step ${done ? 'step-primary' : ''}`}
                data-content={done ? '✓' : ''}
              >
                {STEP_LABEL[step]}
              </li>
            );
          })}
        </ul>
      )}

      {/* Meta */}
      <div className="mtrack-meta">
        <div>
          <span className="mtrack-label">Tanggal</span>
          <p className="mtrack-meta-val">
            {new Date(order.date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div>
          <span className="mtrack-label">Pembayaran</span>
          <p className="mtrack-meta-val">{order.payment}</p>
        </div>
        <div>
          <span className="mtrack-label">Total</span>
          <p className="mtrack-meta-val">{formatRupiah(order.total)}</p>
        </div>
      </div>

      {/* Item */}
      {order.items?.length > 0 && (
        <div className="mtrack-items">
          <h3 className="mtrack-items-title">Rincian Item</h3>
          {order.items.map((item) => (
            <div key={item.id} className="mtrack-item-row">
              <span className="mtrack-item-name">
                {item.title}
                {item.variant && (
                  <span className="mtrack-item-variant"> · {item.variant}</span>
                )}
              </span>
              <span className="mtrack-item-qty">x{item.qty}</span>
              <span className="mtrack-item-price">
                {formatRupiah(item.price * item.qty)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const trackStyles = `
  .mtrack-wrap { font-family: 'Lato', sans-serif; }
  .mtrack-header { margin-bottom: 24px; }
  .mtrack-title { margin: 0; font-size: 26px; font-weight: 700; color: #101828; }
  .mtrack-subtitle { margin: 4px 0 0; font-size: 14px; color: #667085; }

  .mtrack-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 64px 16px;
    color: #98a2b3;
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 16px;
    text-align: center;
  }
  .mtrack-empty p { margin: 0; font-size: 15px; }
  .mtrack-empty-btn {
    margin-top: 8px;
    padding: 10px 24px;
    background: #101828;
    color: #fff;
    border-radius: 8px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
  }

  .mtrack-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 860px) {
    .mtrack-grid { grid-template-columns: 1fr; }
  }

  .mtrack-list { display: flex; flex-direction: column; gap: 10px; }
  .mtrack-list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    text-align: left;
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 12px;
    padding: 14px 16px;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .mtrack-list-item:hover { border-color: #d0d5dd; }
  .mtrack-list-item.active {
    border-color: #101828;
    box-shadow: 0 0 0 3px rgba(16,24,40,0.12);
  }
  .mtrack-list-main { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
  .mtrack-list-num {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    font-weight: 600;
    color: #101828;
  }
  .mtrack-list-product {
    font-size: 12px;
    color: #667085;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 220px;
  }
  .mtrack-list-badge {
    align-self: flex-start;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 999px;
  }
  .mtrack-list-chevron { color: #98a2b3; flex-shrink: 0; }

  .mtrack-detail {
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 16px;
    padding: 24px;
  }
  .mtrack-detail-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f2f4f7;
    margin-bottom: 24px;
  }
  .mtrack-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #98a2b3;
    font-weight: 600;
  }
  .mtrack-ordernum { margin: 4px 0 0; font-size: 18px; font-weight: 700; color: #101828; }
  .mtrack-status-badge {
    font-size: 12px;
    font-weight: 600;
    padding: 5px 14px;
    border-radius: 999px;
    white-space: nowrap;
  }

  /* ---- Steps ala DaisyUI ---- */
  .steps {
    display: flex;
    list-style: none;
    margin: 0 0 28px;
    padding: 0;
    width: 100%;
    counter-reset: step;
    overflow-x: auto;
  }
  .step {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 40px 1fr;
    place-items: center;
    text-align: center;
    min-width: 100px;
    flex: 1 1 0;
    position: relative;
    font-size: 13px;
    color: #667085;
    gap: 6px;
  }
  /* garis penghubung antar step */
  .step::before {
    content: '';
    position: absolute;
    top: 20px;
    left: -50%;
    width: 100%;
    height: 4px;
    background: #e5e7eb;
    transform: translateY(-50%);
    z-index: 0;
  }
  .step:first-child::before { content: none; }
  /* lingkaran nomor step */
  .step::after {
    content: counter(step);
    counter-increment: step;
    position: relative;
    z-index: 1;
    grid-row: 1;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e5e7eb;
    color: #667085;
    font-weight: 700;
    font-size: 13px;
  }
  /* step yang sudah selesai */
  .step-primary { color: #101828; font-weight: 600; }
  .step-primary::after {
    background: #101828;
    color: #fff;
    content: attr(data-content);
  }
  .step-primary + .step-primary::before,
  .step-primary::before { background: #101828; }

  .mtrack-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    border-radius: 12px;
    font-size: 14px;
    margin-bottom: 24px;
  }
  .mtrack-alert.pending { background: #fffaeb; color: #b54708; border: 1px solid #fedf89; }
  .mtrack-alert.cancelled { background: #fef3f2; color: #b42318; border: 1px solid #fecdca; }

  .mtrack-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 16px;
    padding: 18px;
    background: #f9fafb;
    border-radius: 12px;
    margin-bottom: 20px;
  }
  .mtrack-meta-val { margin: 4px 0 0; font-size: 14px; font-weight: 600; color: #344054; }

  .mtrack-items-title { margin: 0 0 14px; font-size: 15px; font-weight: 700; color: #101828; }
  .mtrack-item-row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 16px;
    padding: 10px 0;
    border-bottom: 1px solid #f2f4f7;
    font-size: 14px;
  }
  .mtrack-item-row:last-child { border-bottom: none; }
  .mtrack-item-name { color: #344054; font-weight: 500; }
  .mtrack-item-variant { color: #98a2b3; font-weight: 400; font-size: 12px; }
  .mtrack-item-qty { color: #98a2b3; }
  .mtrack-item-price { color: #101828; font-weight: 600; }
`;

export default MemberTrackOrder;
