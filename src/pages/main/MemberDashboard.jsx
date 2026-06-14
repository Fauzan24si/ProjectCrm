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
} from 'react-icons/fi';
import { getCurrentUser } from '../../services/auth';
import { getUser } from '../../services/users';
import { getMembershipMeta, formatRupiah } from '../../lib/membership';

const TIER_THRESHOLDS = {
  bronze: { next: 'Silver', target: 500_000 },
  silver: { next: 'Gold', target: 2_000_000 },
  gold: { next: null, target: null },
};

function MemberDashboard() {
  const [user, setUser] = useState(null);
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
      .then((data) => {
        if (!data) setError('Data member tidak ditemukan.');
        else setUser(data);
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

  const meta = getMembershipMeta(user.membership);
  const tierInfo = TIER_THRESHOLDS[user.membership] || TIER_THRESHOLDS.bronze;
  const totalSpent = Number(user.total_spent) || 0;
  const remainingToNext =
    tierInfo.target != null ? Math.max(tierInfo.target - totalSpent, 0) : 0;
  const progressPct =
    tierInfo.target != null
      ? Math.min((totalSpent / tierInfo.target) * 100, 100)
      : 100;

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
            to="/shop"
          />
          <ActionCard
            icon={<FiUser />}
            title="Akun Saya"
            desc="Kelola informasi profil dan kontak."
            to="/member/profile"
          />
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
`;

export default MemberDashboard;
