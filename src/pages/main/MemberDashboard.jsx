import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiAward,
  FiCreditCard,
  FiCalendar,
  FiShoppingBag,
  FiHeart,
  FiUser,
  FiArrowRight,
  FiStar,
  FiCheck,
  FiBox,
} from 'react-icons/fi';
import { getCurrentUser } from '../../services/auth';
import { getUser } from '../../services/users';
import { getMembership, getMembershipMeta, formatRupiah } from '../../lib/membership';
import { formatPoints, getTierBenefits } from '../../lib/loyalty';
import {
  getOrdersByUser,
  summarizeOrders,
  getOrderStatusMeta,
} from '../../services/orders';

const TIER_THRESHOLDS = {
  bronze: { next: 'Silver', target: 500_000 },
  silver: { next: 'Gold', target: 2_000_000 },
  gold: { next: null, target: null },
};

function MemberDashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
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
          setUser(data);
          // Ambil riwayat pesanan berdasarkan user_id dari Supabase.
          const userOrders = await getOrdersByUser(data.id);
          setOrders(userOrders);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#667085' }}>Memuat data member...</div>;
  }

  if (error || !user) {
    return (
      <div style={{ padding: 16, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 10 }}>
        {error || 'Tidak ada data.'}
      </div>
    );
  }

  const orderSummary = summarizeOrders(orders);
  const totalSpent = orderSummary.totalSpent;
  const currentTier = getMembership(totalSpent);
  const meta = getMembershipMeta(currentTier);
  const tierInfo = TIER_THRESHOLDS[currentTier] || TIER_THRESHOLDS.bronze;
  const remainingToNext =
    tierInfo.target != null ? Math.max(tierInfo.target - totalSpent, 0) : 0;
  const progressPct =
    tierInfo.target != null
      ? Math.min((totalSpent / tierInfo.target) * 100, 100)
      : 100;

  const points = Number(user.points) || 0;
  const benefits = getTierBenefits(currentTier);

  return (
    <>
      <style>{memberStyles}</style>
      <div className="member-wrap">
        {/* Greeting */}
        <div className="member-greet">
          <p className="greet-hello">Halo,</p>
          <h1 className="greet-name">{user.name}</h1>
          <p className="greet-email">{user.email}</p>
        </div>

        {/* Membership Card */}
        <div
          className="member-card"
          style={{
            background: `linear-gradient(135deg, ${meta.color}, ${meta.bg})`,
          }}
        >
          <div className="member-card-top">
            <div>
              <span className="member-card-label">Member Tier</span>
              <h2 className="member-card-tier">{meta.label}</h2>
            </div>
            <div className="member-card-icon">
              <FiAward size={36} />
            </div>
          </div>

          <div className="member-card-body">
            <div>
              <span className="member-card-label">Total Transaksi</span>
              <p className="member-card-amount">{formatRupiah(totalSpent)}</p>
            </div>
            {tierInfo.next ? (
              <div className="member-card-progress">
                <div className="progress-info">
                  <span>Menuju {tierInfo.next}</span>
                  <span>{formatRupiah(remainingToNext)} lagi</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="member-card-progress">
                <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>
                  Anda sudah mencapai tier tertinggi 🎉
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reward Points & Order Stats */}
        <div className="member-stats-grid">
          <div className="stat-card stat-card-accent">
            <div className="stat-icon">
              <FiStar />
            </div>
            <div>
              <span className="stat-label">Poin Reward</span>
              <p className="stat-value">{formatPoints(points)} pts</p>
              <span className="stat-hint">Tukar di menu Voucher</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-muted">
              <FiBox />
            </div>
            <div>
              <span className="stat-label">Total Pesanan</span>
              <p className="stat-value">{orderSummary.totalOrders}</p>
              <span className="stat-hint">{orderSummary.completedOrders} selesai</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-muted">
              <FiShoppingBag />
            </div>
            <div>
              <span className="stat-label">Item Dibeli</span>
              <p className="stat-value">{orderSummary.totalItems}</p>
              <span className="stat-hint">dari pesanan selesai</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="member-actions-grid">
          <ActionCard
            icon={<FiShoppingBag />}
            title="Belanja Sekarang"
            desc="Telusuri katalog furnitur terbaru kami."
            to="/shop"
          />
          <ActionCard
            icon={<FiHeart />}
            title="Wishlist"
            desc="Simpan produk favorit untuk dibeli nanti."
            to="/member/wishlist"
          />
          <ActionCard
            icon={<FiUser />}
            title="Akun Saya"
            desc="Kelola informasi profil dan kontak."
            to="/member/profile"
          />
        </div>

        {/* Order History */}
        <div className="member-section">
          <h3 className="member-section-title">Riwayat Pesanan</h3>
          {orders.length === 0 ? (
            <div className="orders-empty">
              <FiBox size={28} />
              <p>Belum ada pesanan. Yuk mulai belanja!</p>
              <Link to="/shop" className="orders-empty-btn">
                Lihat Katalog
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => {
                const statusMeta = getOrderStatusMeta(order.status);
                return (
                  <div key={order.id} className="order-row">
                    <div className="order-main">
                      <span className="order-product">{order.product}</span>
                      <span className="order-meta">
                        {order.id} &middot; {order.qty} item &middot;{' '}
                        {new Date(order.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="order-side">
                      <span className="order-total">{formatRupiah(order.total)}</span>
                      <span
                        className="order-status"
                        style={{ color: statusMeta.color, background: statusMeta.bg }}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tier Benefits */}
        <div className="member-section">
          <h3 className="member-section-title">
            Keuntungan Member {meta.label}
          </h3>
          <ul className="benefits-list">
            {benefits.map((benefit, i) => (
              <li key={i} className="benefit-item">
                <span className="benefit-check">
                  <FiCheck />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Profile Snapshot */}
        <div className="member-section">
          <h3 className="member-section-title">Informasi Akun</h3>
          <div className="member-info-grid">
            <InfoItem icon={<FiUser />} label="Nama" value={user.name} />
            <InfoItem icon={<FiCreditCard />} label="Email" value={user.email} />
            <InfoItem
              icon={<FiCalendar />}
              label="Bergabung"
              value={
                user.created_at
                  ? new Date(user.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '-'
              }
            />
            <InfoItem icon={<FiAward />} label="Membership" value={meta.label} />
          </div>
        </div>
      </div>
    </>
  );
}

function ActionCard({ icon, title, desc, to }) {
  return (
    <Link to={to} className="action-card">
      <div className="action-card-icon">{icon}</div>
      <div className="action-card-body">
        <h4>{title}</h4>
        <p>{desc}</p>
      </div>
      <FiArrowRight className="action-card-arrow" />
    </Link>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="info-item">
      <span className="info-item-icon">{icon}</span>
      <div>
        <span className="info-item-label">{label}</span>
        <p className="info-item-value">{value || '-'}</p>
      </div>
    </div>
  );
}

const memberStyles = `
  .member-wrap {
    font-family: 'Lato', sans-serif;
  }

  .member-greet {
    margin-bottom: 28px;
  }
  .greet-hello {
    margin: 0;
    font-size: 14px;
    color: #667085;
  }
  .greet-name {
    margin: 4px 0 4px;
    font-size: 28px;
    font-weight: 700;
    color: #101828;
  }
  .greet-email {
    margin: 0;
    font-size: 13px;
    color: #667085;
  }

  .member-actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }

  .member-card {
    border-radius: 20px;
    padding: 28px;
    color: #fff;
    box-shadow: 0 12px 30px rgba(0,0,0,0.12);
    margin-bottom: 28px;
  }

  .member-card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  .member-card-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.85;
  }

  .member-card-tier {
    margin: 4px 0 0;
    font-size: 32px;
    font-weight: 800;
    text-transform: capitalize;
  }

  .member-card-icon {
    background: rgba(255,255,255,0.2);
    padding: 12px;
    border-radius: 14px;
    display: flex;
  }

  .member-card-body {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    align-items: flex-end;
    justify-content: space-between;
  }

  .member-card-amount {
    font-size: 28px;
    font-weight: 700;
    margin: 4px 0 0;
  }

  .member-card-progress {
    flex: 1;
    min-width: 240px;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    margin-bottom: 8px;
    opacity: 0.95;
  }

  .progress-bar {
    height: 8px;
    background: rgba(255,255,255,0.25);
    border-radius: 999px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #fff;
    border-radius: 999px;
    transition: width 0.4s ease;
  }

  .action-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px;
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 14px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s;
  }

  .action-card:hover {
    box-shadow: 0 6px 20px rgba(16,24,40,0.08);
    transform: translateY(-2px);
    border-color: #d0d5dd;
  }

  .action-card-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #DFE9F4;
    color: #054C73;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }

  .action-card-body { flex: 1; min-width: 0; }
  .action-card-body h4 {
    margin: 0 0 4px;
    font-size: 15px;
    font-weight: 600;
    color: #101828;
  }
  .action-card-body p {
    margin: 0;
    font-size: 13px;
    color: #667085;
  }

  .action-card-arrow {
    color: #98a2b3;
    flex-shrink: 0;
  }

  .member-section {
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 14px;
    padding: 24px;
  }

  .member-section-title {
    font-size: 15px;
    font-weight: 700;
    color: #101828;
    margin: 0 0 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f3f4f6;
  }

  .member-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 18px;
  }

  .info-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .info-item-icon {
    width: 36px;
    height: 36px;
    background: #f3f4f6;
    color: #054C73;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  .info-item-label {
    font-size: 12px;
    color: #98a2b3;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }

  .info-item-value {
    margin: 4px 0 0;
    font-size: 14px;
    font-weight: 600;
    color: #101828;
    word-break: break-word;
  }

  @media (max-width: 640px) {
    .member-card-tier { font-size: 26px; }
    .member-card-amount { font-size: 22px; }
  }

  /* --- Reward points & order stats --- */
  .member-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }
  .stat-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px;
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 14px;
  }
  .stat-card-accent {
    background: linear-gradient(135deg, #054C73, #0A6FA0);
    border-color: transparent;
    color: #fff;
  }
  .stat-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }
  .stat-icon-muted {
    background: #DFE9F4;
    color: #054C73;
  }
  .stat-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.85;
    font-weight: 600;
  }
  .stat-value {
    margin: 2px 0;
    font-size: 22px;
    font-weight: 700;
  }
  .stat-card:not(.stat-card-accent) .stat-value { color: #101828; }
  .stat-card:not(.stat-card-accent) .stat-label { color: #98a2b3; }
  .stat-hint {
    font-size: 12px;
    opacity: 0.8;
  }
  .stat-card:not(.stat-card-accent) .stat-hint { color: #667085; }

  /* --- Order history --- */
  .member-section + .member-section { margin-top: 20px; }
  .orders-list {
    display: flex;
    flex-direction: column;
  }
  .order-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 14px 0;
    border-bottom: 1px solid #f3f4f6;
  }
  .order-row:last-child { border-bottom: none; }
  .order-main { display: flex; flex-direction: column; min-width: 0; }
  .order-product {
    font-size: 14px;
    font-weight: 600;
    color: #101828;
  }
  .order-meta {
    font-size: 12px;
    color: #98a2b3;
    margin-top: 2px;
  }
  .order-side {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
  }
  .order-total {
    font-size: 14px;
    font-weight: 700;
    color: #101828;
  }
  .order-status {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 999px;
  }
  .orders-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 32px 16px;
    color: #98a2b3;
    text-align: center;
  }
  .orders-empty p { margin: 0; font-size: 14px; }
  .orders-empty-btn {
    margin-top: 6px;
    padding: 8px 18px;
    background: #054C73;
    color: #fff;
    border-radius: 8px;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
  }

  /* --- Tier benefits --- */
  .benefits-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
  }
  .benefit-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #344054;
  }
  .benefit-check {
    width: 22px;
    height: 22px;
    border-radius: 999px;
    background: #ECFDF3;
    color: #067647;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    flex-shrink: 0;
  }
`;

export default MemberDashboard;
