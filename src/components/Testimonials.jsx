import { useEffect, useState } from 'react';
import { FiStar } from 'react-icons/fi';
import { getTestimonials } from '../services/testimonials';

// Fallback statis dipakai bila data dari Supabase belum tersedia / kosong,
// agar tampilan landing tetap terisi (desain tidak berubah).
const fallbackTestimonials = [
  {
    customer_name: 'Rina Wijaya',
    role: 'Interior Enthusiast',
    rating: 5,
    content:
      'Kualitas sofanya jauh di atas ekspektasi. Bahannya kokoh dan jahitannya rapi. Pengiriman juga cepat sampai Bandung!',
  },
  {
    customer_name: 'Andre Kurniawan',
    role: 'Pemilik Kafe',
    rating: 5,
    content:
      'Beli meja dan kursi untuk kafe saya. Desainnya elegan dan pelanggan banyak yang memuji. Pasti pesan lagi di sini.',
  },
  {
    customer_name: 'Siti Nurhaliza',
    role: 'Ibu Rumah Tangga',
    rating: 4,
    content:
      'Lemari penyimpanannya luas dan kuat. Perakitannya mudah karena panduan lengkap. Sangat memuaskan untuk harganya.',
  },
];

const Stars = ({ count }) => (
  <div style={styles.stars}>
    {Array.from({ length: 5 }).map((_, i) => (
      <FiStar
        key={i}
        size={16}
        style={{
          fill: i < count ? '#f5a623' : 'transparent',
          color: i < count ? '#f5a623' : '#d1d1d1',
        }}
      />
    ))}
  </div>
);

const Testimonials = () => {
  const [items, setItems] = useState(fallbackTestimonials);

  useEffect(() => {
    let active = true;
    getTestimonials()
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch(() => {
        // Biarkan fallback statis bila fetch gagal.
      });
    return () => {
      active = false;
    };
  }, []);

  const averageRating = (
    items.reduce((sum, t) => sum + (t.rating || 0), 0) / (items.length || 1)
  ).toFixed(1);

  return (
    <section style={styles.section}>
      <div className="container text-center">
        <h2 className="section-title">Apa Kata Customer Kami</h2>
        <p className="section-subtitle">
          Lebih dari 2.000 pelanggan puas mempercayakan rumah mereka kepada kami.
        </p>

        <div style={styles.ratingSummary}>
          <span style={styles.bigRating}>{averageRating}</span>
          <div>
            <Stars count={Math.round(averageRating)} />
            <span style={styles.ratingCount}>dari 2.143 ulasan</span>
          </div>
        </div>

        <div style={styles.grid}>
          {items.map((t, index) => (
            <div key={t.id ?? index} style={styles.card}>
              <Stars count={t.rating} />
              <p style={styles.comment}>"{t.content}"</p>
              <div style={styles.author}>
                <div style={styles.avatar}>
                  {t.avatar ? (
                    <img
                      src={t.avatar}
                      alt={t.customer_name}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    (t.customer_name || '?').charAt(0).toUpperCase()
                  )}
                </div>
                <div style={styles.authorInfo}>
                  <span style={styles.name}>{t.customer_name}</span>
                  {t.role && <span style={styles.role}>{t.role}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '80px 0',
    backgroundColor: 'var(--bg-light)',
  },
  ratingSummary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '24px',
  },
  bigRating: {
    fontSize: '48px',
    fontWeight: '700',
    color: 'var(--text-dark)',
    lineHeight: '1',
  },
  ratingCount: {
    display: 'block',
    fontSize: '14px',
    color: 'var(--text-light)',
    marginTop: '4px',
  },
  stars: {
    display: 'flex',
    gap: '2px',
    justifyContent: 'flex-start',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginTop: '48px',
    textAlign: 'left',
  },
  card: {
    padding: '28px',
    backgroundColor: 'var(--bg-color)',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  comment: {
    fontSize: '15px',
    color: 'var(--text-light)',
    lineHeight: '1.7',
    margin: 0,
    flexGrow: 1,
  },
  author: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
    flexShrink: 0,
  },
  authorInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  name: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-dark)',
  },
  role: {
    fontSize: '13px',
    color: 'var(--text-light)',
  },
};

export default Testimonials;
