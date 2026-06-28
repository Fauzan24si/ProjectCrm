import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTag, FiStar } from 'react-icons/fi';
import { getCurrentUser } from '../../services/auth';
import { getUser } from '../../services/users';
import { formatRupiah } from '../../lib/membership';
import { formatPoints } from '../../lib/loyalty';
import {
  getRedeemableVouchers,
  getUserVouchers,
  redeemVoucher,
} from '../../services/vouchers';

function MemberVouchers() {
  const [user, setUser] = useState(null);
  const [redeemable, setRedeemable] = useState([]);
  const [myVouchers, setMyVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redeeming, setRedeeming] = useState(null); // voucher id sedang diproses
  const [voucherMsg, setVoucherMsg] = useState(null); // { type, text }
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
          setUser(data);
          const [redeem, mine] = await Promise.all([
            getRedeemableVouchers(),
            getUserVouchers(data.id),
          ]);
          setRedeemable(redeem);
          setMyVouchers(mine);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
  }, [navigate]);

  const handleRedeem = async (voucher) => {
    if (!user) return;
    setRedeeming(voucher.id);
    setVoucherMsg(null);
    try {
      await redeemVoucher(user.id, voucher.id);
      const [freshUser, redeem, mine] = await Promise.all([
        getUser(user.id),
        getRedeemableVouchers(),
        getUserVouchers(user.id),
      ]);
      setUser(freshUser);
      setRedeemable(redeem);
      setMyVouchers(mine);
      setVoucherMsg({ type: 'success', text: `Voucher "${voucher.title}" berhasil ditukar.` });
    } catch (err) {
      setVoucherMsg({ type: 'error', text: err.message });
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#667085' }}>
        Memuat voucher...
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

  const points = Number(user?.points) || 0;

  return (
    <>
      <style>{voucherStyles}</style>
      <div className="mv-wrap">
        <div className="mv-header">
          <h1 className="mv-title">Tukar Poin</h1>
          <p className="mv-subtitle">
            Tukarkan poin Anda dengan voucher belanja.
          </p>
        </div>

        {/* Saldo poin */}
        <div className="mv-balance">
          <div className="mv-balance-icon">
            <FiStar />
          </div>
          <div>
            <span className="mv-balance-label">Saldo Poin Anda</span>
            <p className="mv-balance-value">{formatPoints(points)} pts</p>
          </div>
        </div>

        {voucherMsg && (
          <div className={`mv-msg mv-msg-${voucherMsg.type}`}>{voucherMsg.text}</div>
        )}

        {/* Voucher redeemable */}
        <div className="mv-section">
          <h3 className="mv-section-title">Voucher Tersedia</h3>
          {redeemable.length === 0 ? (
            <p className="mv-empty">Belum ada voucher yang bisa ditukar saat ini.</p>
          ) : (
            <div className="mv-grid">
              {redeemable.map((v) => {
                const affordable = points >= Number(v.point_cost);
                return (
                  <div key={v.id} className="mv-card">
                    <div className="mv-card-head">
                      <span className="mv-card-title">{v.title}</span>
                      <span className="mv-card-cost">{v.point_cost} pts</span>
                    </div>
                    {v.description && <p className="mv-card-desc">{v.description}</p>}
                    <div className="mv-card-meta">
                      <span>
                        {v.discount_type === 'percentage'
                          ? `Diskon ${v.discount_value}%`
                          : `Potongan ${formatRupiah(v.discount_value)}`}
                      </span>
                      {Number(v.min_purchase) > 0 && (
                        <span>Min. {formatRupiah(v.min_purchase)}</span>
                      )}
                    </div>
                    <button
                      className="mv-redeem-btn"
                      disabled={!affordable || redeeming === v.id}
                      onClick={() => handleRedeem(v)}
                    >
                      {redeeming === v.id
                        ? 'Memproses...'
                        : affordable
                          ? 'Tukar'
                          : 'Poin kurang'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Voucher milik user */}
        <div className="mv-section">
          <h3 className="mv-section-title">Voucher Saya</h3>
          {myVouchers.length === 0 ? (
            <p className="mv-empty">Anda belum memiliki voucher. Tukar poin Anda di atas.</p>
          ) : (
            <div className="mv-mine-list">
              {myVouchers.map((uv) => {
                const v = uv.vouchers;
                if (!v) return null;
                return (
                  <div key={uv.id} className="mv-mine-item">
                    <div className="mv-mine-main">
                      <span className="mv-mine-title">
                        <FiTag size={13} /> {v.title}
                      </span>
                      <span className="mv-mine-desc">
                        {v.discount_type === 'percentage'
                          ? `Diskon ${v.discount_value}%`
                          : `Potongan ${formatRupiah(v.discount_value)}`}
                        {Number(v.min_purchase) > 0 && ` · Min. ${formatRupiah(v.min_purchase)}`}
                      </span>
                    </div>
                    <span className="mv-mine-status">Aktif</span>
                  </div>
                );
              })}
            </div>
          )}
          <p className="mv-hint">
            Voucher aktif dapat dipilih saat checkout di halaman Keranjang.
          </p>
        </div>
      </div>
    </>
  );
}

const voucherStyles = `
  .mv-wrap { font-family: 'Lato', sans-serif; }
  .mv-header { margin-bottom: 24px; }
  .mv-title { margin: 0; font-size: 26px; font-weight: 700; color: #101828; }
  .mv-subtitle { margin: 4px 0 0; font-size: 14px; color: #667085; }

  .mv-balance {
    display: flex;
    align-items: center;
    gap: 16px;
    background: linear-gradient(135deg, #054C73, #0A6FA0);
    color: #fff;
    border-radius: 16px;
    padding: 22px 24px;
    margin-bottom: 24px;
  }
  .mv-balance-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
  }
  .mv-balance-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.9;
    font-weight: 600;
  }
  .mv-balance-value { margin: 4px 0 0; font-size: 28px; font-weight: 800; }

  .mv-msg {
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 16px;
  }
  .mv-msg-success { background: #ecfdf3; color: #067647; border: 1px solid #abefc6; }
  .mv-msg-error { background: #fef3f2; color: #b42318; border: 1px solid #fecdca; }

  .mv-section {
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 14px;
    padding: 24px;
    margin-bottom: 20px;
  }
  .mv-section-title {
    font-size: 15px;
    font-weight: 700;
    color: #101828;
    margin: 0 0 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f3f4f6;
  }
  .mv-empty { margin: 0; font-size: 14px; color: #98a2b3; }

  .mv-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }
  .mv-card {
    border: 1px solid #eaecf0;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .mv-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .mv-card-title { font-size: 15px; font-weight: 700; color: #101828; }
  .mv-card-cost {
    font-size: 12px;
    font-weight: 700;
    color: #054C73;
    background: #DFE9F4;
    padding: 3px 10px;
    border-radius: 999px;
    white-space: nowrap;
  }
  .mv-card-desc { margin: 0; font-size: 13px; color: #667085; line-height: 1.5; }
  .mv-card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    font-size: 12px;
    color: #475467;
  }
  .mv-redeem-btn {
    margin-top: 4px;
    padding: 9px;
    background: #101828;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
  }
  .mv-redeem-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .mv-mine-list { display: flex; flex-direction: column; gap: 8px; }
  .mv-mine-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid #eaecf0;
    border-radius: 8px;
  }
  .mv-mine-main { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .mv-mine-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #101828;
  }
  .mv-mine-desc { font-size: 12px; color: #667085; }
  .mv-mine-status {
    font-size: 11px;
    font-weight: 600;
    color: #067647;
    background: #ECFDF3;
    padding: 3px 12px;
    border-radius: 999px;
    white-space: nowrap;
  }
  .mv-hint { margin: 16px 0 0; font-size: 12px; color: #98a2b3; }
`;

export default MemberVouchers;
