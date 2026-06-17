import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiPhone, FiUser, FiCreditCard, FiCalendar, FiShield } from 'react-icons/fi';
import Card from '../../Reusable/Card';
import Loading from '../../Reusable/Loading';
import { getUser } from '../../services/users';
import { getMembershipMeta, formatRupiah } from '../../lib/membership';

function UserDetail() {
  const { abc } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getUser(abc)
      .then((data) => {
        if (!data) {
          setError('User tidak ditemukan');
        } else {
          setUser(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
  }, [abc]);

  if (loading) return <Loading message="Memuat data user..." />;
  if (error) return <div style={styles.error}>Gagal memuat: {error}</div>;
  if (!user) return null;

  const meta = getMembershipMeta(user.membership);
  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  return (
    <>
      <Link to="/users" style={styles.backLink}>
        <FiArrowLeft /> Kembali ke daftar user
      </Link>

      <div style={styles.header}>
        <img
          src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=DFE9F4&color=054C73&size=128`}
          alt={user.name}
          style={styles.avatar}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={styles.name}>{user.name}</h1>
          <p style={styles.username}>{user.email}</p>
          <div style={styles.badges}>
            <span style={{ ...styles.badge, background: meta.bg, color: meta.color }}>
              {meta.label} Member
            </span>
            {user.role && (
              <span style={{ ...styles.badge, ...styles.badgeAccent }}>{user.role}</span>
            )}
            {user.gender && <span style={styles.badge}>{user.gender}</span>}
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Membership */}
        <Card style={styles.cardOverride}>
          <h2 style={styles.cardTitle}>Membership</h2>
          <InfoRow icon={<FiShield />} label="Tier" value={`${meta.label}`} />
          <InfoRow icon={<FiCreditCard />} label="Total Transaksi" value={formatRupiah(user.total_spent)} />
          <InfoRow icon={<FiCalendar />} label="Bergabung" value={createdAt} />
        </Card>

        {/* Kontak */}
        <Card style={styles.cardOverride}>
          <h2 style={styles.cardTitle}>Kontak</h2>
          <InfoRow icon={<FiMail />} label="Email" value={user.email} />
          <InfoRow icon={<FiPhone />} label="Phone" value={user.phone} />
          <InfoRow icon={<FiUser />} label="Umur" value={user.age ? `${user.age} tahun` : '-'} />
        </Card>
      </div>
    </>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={styles.row}>
      <div style={styles.rowHeader}>
        {icon && <span style={styles.rowIcon}>{icon}</span>}
        <span style={styles.rowLabel}>{label}</span>
      </div>
      <span style={styles.rowValue}>{value || '-'}</span>
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
    marginBottom: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    background: '#fff',
    border: '1px solid #f3f4f6',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  avatar: {
    width: '88px',
    height: '88px',
    borderRadius: '50%',
    objectFit: 'cover',
    background: '#f3f4f6',
    border: '3px solid #DFE9F4',
    flexShrink: 0,
  },
  name: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1f2937',
    margin: '0 0 4px',
  },
  username: {
    fontSize: '13px',
    color: '#054C73',
    fontWeight: 600,
    margin: '0 0 10px',
  },
  badges: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    background: '#f3f4f6',
    color: '#4b5563',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'capitalize',
  },
  badgeAccent: {
    background: '#DFE9F4',
    color: '#054C73',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  cardOverride: {
    border: '1px solid #f3f4f6',
    borderRadius: '16px',
    padding: '20px 22px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#1f2937',
    margin: '0 0 16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f3f4f6',
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '10px 0',
    borderBottom: '1px dashed #f3f4f6',
  },
  rowHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  rowIcon: {
    color: '#9ca3af',
    display: 'inline-flex',
    fontSize: '14px',
  },
  rowLabel: {
    fontSize: '11px',
    color: '#9ca3af',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  rowValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1f2937',
    wordBreak: 'break-word',
    lineHeight: 1.5,
    paddingLeft: '22px',
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid #fecaca',
    fontSize: '14px',
  },
};

export default UserDetail;
