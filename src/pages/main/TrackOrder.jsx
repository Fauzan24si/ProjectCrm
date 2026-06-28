import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiPackage, FiCheck, FiClock, FiLock, FiX } from 'react-icons/fi';
import { formatRupiah } from '../../lib/membership';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  getOrderForGuest,
  getOrderStatusMeta,
  FULFILLMENT_STEPS,
} from '../../services/orders';

const STEP_LABEL = {
  paid: 'Pembayaran diterima',
  processing: 'Sedang diproses',
  shipped: 'Dikirim',
  delivered: 'Sampai tujuan',
  completed: 'Selesai',
};

const REASON_MESSAGE = {
  not_found: 'Pesanan tidak ditemukan. Periksa kembali nomor order Anda.',
  wrong_pin: 'PIN salah. Gunakan 4 digit terakhir no HP penerima.',
  no_pin: 'Pesanan ini tidak memiliki PIN lacak. Hubungi admin untuk bantuan.',
};

function TrackOrder() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('order') || '');
  const [pin, setPin] = useState('');
  const [pinOpen, setPinOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pinError, setPinError] = useState(null);
  const [searched, setSearched] = useState(false);

  // Langkah 1: user submit nomor order -> buka modal PIN.
  const handleSubmitNumber = (e) => {
    e?.preventDefault();
    const number = query.trim();
    if (!number) return;
    setError(null);
    setPin('');
    setPinError(null);
    setPinOpen(true);
  };

  const closePinModal = () => {
    setPinOpen(false);
    setPinError(null);
  };

  // Langkah 2: user submit PIN di modal -> verifikasi & ambil order.
  const handleSubmitPin = async (e) => {
    e?.preventDefault();
    const number = query.trim();
    const cleanPin = pin.replace(/\D/g, '');
    if (cleanPin.length !== 4) {
      setPinError('Masukkan PIN 4 digit (4 angka terakhir no HP penerima).');
      return;
    }

    setLoading(true);
    setPinError(null);
    setError(null);

    try {
      const result = await getOrderForGuest(number, cleanPin);
      if (!result.ok) {
        setOrder(null);
        if (result.reason === 'wrong_pin') {
          setPinError(REASON_MESSAGE.wrong_pin);
          setLoading(false);
          return;
        }
        setError(REASON_MESSAGE[result.reason] || 'Gagal melacak pesanan.');
      } else {
        setOrder(result.order);
        setParams({ order: number });
      }
      setSearched(true);
      setPinOpen(false);
    } catch (err) {
      setPinError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const status = (order?.status || '').toLowerCase();
  const isCancelled = status === 'cancelled' || status === 'failed';
  const currentStepIndex = FULFILLMENT_STEPS.indexOf(status);
  const statusMeta = order ? getOrderStatusMeta(order.status) : null;
  const items = order?.items || [];

  return (
    <>
      <style>{trackStyles}</style>
      <div className="track-wrap">
        <div className="track-head">
          <FiPackage size={34} className="track-head-icon" />
          <h1 className="track-title">Lacak Pesanan</h1>
          <p className="track-sub">
            Masukkan nomor order Anda (contoh: ORD-XXXXXXXXXXXXX-XXX) untuk
            melihat status pesanan.
          </p>
        </div>

        <form className="track-form" onSubmit={handleSubmitNumber}>
          <div className="track-input-wrap">
            <FiSearch size={18} className="track-input-icon" />
            <input
              type="text"
              className="track-input"
              placeholder="Nomor order (ORD-...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" disabled={loading}>
            Lacak
          </Button>
        </form>

        {error && <div className="track-error">{error}</div>}

        {/* Modal PIN */}
        {pinOpen && (
          <div className="track-modal-overlay" onClick={closePinModal}>
            <div
              className="track-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                className="track-modal-close"
                onClick={closePinModal}
                aria-label="Tutup"
              >
                <FiX size={18} />
              </button>
              <div className="track-modal-icon">
                <FiLock size={22} />
              </div>
              <h2 className="track-modal-title">Masukkan PIN</h2>
              <p className="track-modal-sub">
                PIN adalah 4 digit terakhir nomor HP penerima.
              </p>
              <form onSubmit={handleSubmitPin}>
                <div className="track-otp-wrap">
                  <InputOTP
                    maxLength={4}
                    value={pin}
                    onChange={(value) => {
                      setPin(value.replace(/\D/g, ''));
                      setPinError(null);
                    }}
                    autoFocus
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {pinError && <div className="track-modal-error">{pinError}</div>}
                <Button
                  type="submit"
                  className="w-full mt-4"
                  size="lg"
                  disabled={loading || pin.length !== 4}
                >
                  {loading ? 'Memeriksa...' : 'Lacak Pesanan'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {order && !loading && (
          <div className="track-result">
            <div className="track-card">
              <div className="track-card-head">
                <div>
                  <span className="track-label">Nomor Order</span>
                  <p className="track-ordernum">{order.order_number}</p>
                </div>
                <span
                  className="track-status-badge"
                  style={{ color: statusMeta.color, background: statusMeta.bg }}
                >
                  {statusMeta.label}
                </span>
              </div>

              <div className="track-meta">
                <div>
                  <span className="track-label">Pelanggan</span>
                  <p className="track-meta-val">{order.customer_name || '—'}</p>
                </div>
                <div>
                  <span className="track-label">Tanggal</span>
                  <p className="track-meta-val">
                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <span className="track-label">Total</span>
                  <p className="track-meta-val">{formatRupiah(order.gross_amount)}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {isCancelled ? (
              <div className="track-cancelled">
                Pesanan ini {statusMeta.label.toLowerCase()}.
              </div>
            ) : status === 'pending' ? (
              <div className="track-pending">
                <FiClock size={20} />
                Pesanan menunggu pembayaran. Status pengiriman akan muncul setelah
                pembayaran diterima.
              </div>
            ) : (
              <div className="track-timeline">
                {FULFILLMENT_STEPS.map((step, idx) => {
                  const done = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div
                      key={step}
                      className={`tl-step ${done ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                    >
                      <div className="tl-marker">
                        {done ? <FiCheck size={14} /> : <span className="tl-dot" />}
                      </div>
                      <span className="tl-label">{STEP_LABEL[step]}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Item */}
            {items.length > 0 && (
              <div className="track-items">
                <h3 className="track-items-title">Rincian Item</h3>
                {items.map((item) => (
                  <div key={item.id} className="track-item-row">
                    <span className="track-item-name">
                      {item.title}
                      {item.variant && (
                        <span className="track-item-variant"> · {item.variant}</span>
                      )}
                    </span>
                    <span className="track-item-qty">x{item.qty}</span>
                    <span className="track-item-price">
                      {formatRupiah(Number(item.price) * Number(item.qty))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {searched && !order && !error && !loading && (
          <div className="track-empty">Tidak ada hasil.</div>
        )}
      </div>
    </>
  );
}

const trackStyles = `
  .track-wrap {
    max-width: 720px;
    margin: 0 auto;
    padding: 80px 20px 100px;
    min-height: calc(100vh - 320px);
    font-family: 'Lato', sans-serif;
  }
  .track-head { text-align: center; margin-bottom: 28px; }
  .track-head-icon { color: #101828; display: block; margin: 0 auto; }
  .track-title { margin: 12px 0 6px; font-size: 28px; font-weight: 700; color: #101828; }
  .track-sub { margin: 0; font-size: 14px; color: #667085; }

  .track-form { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; align-items: stretch; }
  .track-input-wrap { position: relative; flex: 1; min-width: 200px; }
  .track-form button[data-slot="button"] { height: auto; padding-left: 28px; padding-right: 28px; font-size: 14px; }
  .track-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #98a2b3; }
  .track-input {
    width: 100%;
    padding: 13px 14px 13px 42px;
    border: 1px solid #d0d5dd;
    border-radius: 10px;
    font-size: 14px;
    outline: none;
  }
  .track-input:focus { border-color: #101828; box-shadow: 0 0 0 3px rgba(16,24,40,0.12); }
  .track-btn {
    padding: 0 26px;
    background: #101828;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
  .track-btn:disabled { opacity: 0.6; cursor: default; }

  .track-error {
    padding: 14px 16px;
    background: #fef3f2;
    color: #b42318;
    border: 1px solid #fecdca;
    border-radius: 10px;
    font-size: 14px;
  }
  .track-empty { text-align: center; color: #98a2b3; padding: 24px; }

  /* ---- Modal PIN ---- */
  .track-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(16, 24, 40, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    animation: track-fade 0.15s ease;
  }
  @keyframes track-fade { from { opacity: 0; } to { opacity: 1; } }
  .track-modal {
    position: relative;
    background: #fff;
    border-radius: 16px;
    padding: 32px 28px 28px;
    width: 100%;
    max-width: 380px;
    text-align: center;
    box-shadow: 0 20px 48px rgba(16, 24, 40, 0.2);
    animation: track-pop 0.18s ease;
  }
  @keyframes track-pop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .track-modal-close {
    position: absolute;
    top: 14px;
    right: 14px;
    background: transparent;
    border: none;
    color: #98a2b3;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    display: flex;
  }
  .track-modal-close:hover { background: #f2f4f7; color: #475467; }
  .track-modal-icon {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #f2f4f7;
    color: #101828;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }
  .track-modal-title { margin: 0 0 6px; font-size: 20px; font-weight: 700; color: #101828; }
  .track-modal-sub { margin: 0 0 22px; font-size: 14px; color: #667085; }
  .track-otp-wrap { display: flex; justify-content: center; }
  .track-modal-error {
    margin-top: 12px;
    font-size: 13px;
    color: #b42318;
  }

  .track-card {
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 16px;
    padding: 22px;
    margin-bottom: 18px;
  }
  .track-card-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    padding-bottom: 18px;
    border-bottom: 1px solid #f2f4f7;
  }
  .track-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #98a2b3;
    font-weight: 600;
  }
  .track-ordernum { margin: 4px 0 0; font-size: 18px; font-weight: 700; color: #101828; }
  .track-status-badge {
    font-size: 12px;
    font-weight: 600;
    padding: 5px 14px;
    border-radius: 999px;
    white-space: nowrap;
  }
  .track-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
    padding-top: 18px;
  }
  .track-meta-val { margin: 4px 0 0; font-size: 14px; font-weight: 600; color: #344054; }

  .track-timeline {
    display: flex;
    justify-content: space-between;
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 16px;
    padding: 26px 20px;
    margin-bottom: 18px;
    position: relative;
  }
  .tl-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    flex: 1;
    position: relative;
    text-align: center;
  }
  .tl-step:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 14px;
    left: 50%;
    width: 100%;
    height: 2px;
    background: #eaecf0;
    z-index: 0;
  }
  .tl-step.done:not(:last-child)::after { background: #101828; }
  .tl-marker {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #f2f4f7;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    border: 2px solid #eaecf0;
  }
  .tl-step.done .tl-marker { background: #101828; border-color: #101828; }
  .tl-step.current .tl-marker { box-shadow: 0 0 0 4px rgba(16,24,40,0.18); }
  .tl-dot { width: 8px; height: 8px; border-radius: 50%; background: #98a2b3; }
  .tl-label { font-size: 12px; color: #667085; font-weight: 500; max-width: 80px; }
  .tl-step.done .tl-label { color: #101828; font-weight: 600; }

  .track-pending, .track-cancelled {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 18px;
    border-radius: 12px;
    font-size: 14px;
    margin-bottom: 18px;
  }
  .track-pending { background: #fffaeb; color: #b54708; border: 1px solid #fedf89; }
  .track-cancelled { background: #fef3f2; color: #b42318; border: 1px solid #fecdca; justify-content: center; }

  .track-items {
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 16px;
    padding: 22px;
  }
  .track-items-title { margin: 0 0 14px; font-size: 15px; font-weight: 700; color: #101828; }
  .track-item-row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 16px;
    padding: 10px 0;
    border-bottom: 1px solid #f2f4f7;
    font-size: 14px;
  }
  .track-item-row:last-child { border-bottom: none; }
  .track-item-name { color: #344054; font-weight: 500; }
  .track-item-variant { color: #98a2b3; font-weight: 400; font-size: 12px; }
  .track-item-qty { color: #98a2b3; }
  .track-item-price { color: #101828; font-weight: 600; }
`;

export default TrackOrder;
