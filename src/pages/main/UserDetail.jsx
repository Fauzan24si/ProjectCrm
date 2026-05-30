import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar, FiUser, FiHeart, FiCreditCard } from 'react-icons/fi';
import Card from '../../Reusable/Card';
import Loading from '../../Reusable/Loading';

function UserDetail() {
  const { abc } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`https://dummyjson.com/users/${abc}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [abc]);

  if (loading) return <Loading message="Memuat data user..." />;
  if (error) return <div style={styles.error}>Gagal memuat: {error}</div>;
  if (!user) return null;

  const fullAddress = [user.address?.address, user.address?.city, user.address?.state]
    .filter(Boolean)
    .join(', ');

  const companyAddress = [user.company?.address?.address, user.company?.address?.city]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <Link to="/users" style={styles.backLink}>
        <FiArrowLeft /> Kembali ke daftar user
      </Link>

      <div style={styles.header}>
        <img src={user.image} alt={user.firstName} style={styles.avatar} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={styles.name}>
            {user.firstName} {user.maidenName ? user.maidenName + ' ' : ''}{user.lastName}
          </h1>
          <p style={styles.username}>@{user.username}</p>
          <div style={styles.badges}>
            <span style={styles.badge}>{user.gender}</span>
            <span style={styles.badge}>{user.age} tahun</span>
            {user.role && <span style={{ ...styles.badge, ...styles.badgeAccent }}>{user.role}</span>}
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Kontak */}
        <Card style={styles.cardOverride}>
          <h2 style={styles.cardTitle}>Kontak</h2>
          <InfoRow icon={<FiMail />}   label="Email"  value={user.email} />
          <InfoRow icon={<FiPhone />}  label="Phone"  value={user.phone} />
          <InfoRow icon={<FiMapPin />} label="Alamat" value={fullAddress} />
        </Card>

        {/* Profil */}
        <Card style={styles.cardOverride}>
          <h2 style={styles.cardTitle}>Profil</h2>
          <InfoRow icon={<FiCalendar />}  label="Tanggal Lahir"   value={user.birthDate} />
          <InfoRow icon={<FiBriefcase />} label="Pekerjaan"       value={user.company?.title ? `${user.company.title} di ${user.company.name}` : '-'} />
          <InfoRow icon={<FiHeart />}     label="Golongan Darah"  value={user.bloodGroup} />
          <InfoRow icon={<FiUser />}      label="Tinggi / Berat"  value={`${user.height} cm / ${user.weight} kg`} />
        </Card>

        {/* Bank */}
        {user.bank && (
          <Card style={styles.cardOverride}>
            <h2 style={styles.cardTitle}>Bank</h2>
            <InfoRow icon={<FiCreditCard />} label="Card Type" value={user.bank.cardType} />
            <InfoRow                         label="Currency"  value={user.bank.currency} />
            <InfoRow                         label="IBAN"      value={user.bank.iban} />
          </Card>
        )}

        {/* Perusahaan */}
        {user.company && (
          <Card style={styles.cardOverride}>
            <h2 style={styles.cardTitle}>Perusahaan</h2>
            <InfoRow icon={<FiBriefcase />} label="Nama"       value={user.company.name} />
            <InfoRow                        label="Departemen" value={user.company.department} />
            <InfoRow                        label="Alamat"     value={companyAddress} />
          </Card>
        )}
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
    padding: '4px 10px',
    background: '#f3f4f6',
    color: '#4b5563',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
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
  /* Layout baru: label di atas, value di bawah — anti overlap */
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
