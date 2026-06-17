const partners = [
  { name: 'Badut', logo: '/assets/images/Logo/badut.png' },
  { name: 'Hostify', logo: '/assets/images/Logo/hostify.png' },
  { name: 'Midtrans', logo: '/assets/images/Logo/midtrans.png' },
  { name: 'Supabase', logo: '/assets/images/Logo/supabase.png' },
  { name: 'Vite', logo: '/assets/images/Logo/vite.jpg' },
];

// Ulangi beberapa kali agar satu set cukup lebar memenuhi layar,
// lalu digandakan dua kali supaya loop mulus tanpa celah kosong.
const baseSet = [...partners, ...partners, ...partners, ...partners];
const loopItems = [...baseSet, ...baseSet];

const MediaPartners = () => {
  return (
    <section style={styles.section}>
      <div className="container text-center">
        <p style={styles.label}>Dipercaya oleh berbagai media partner</p>
      </div>

      <div className="marquee-container" style={styles.marquee}>
        <div className="marquee-track" style={styles.track}>
          {loopItems.map((partner, index) => (
            <div key={index} style={styles.item}>
              <img
                src={partner.logo}
                alt={partner.name}
                style={styles.logo}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '64px 0',
    backgroundColor: 'var(--bg-color)',
    overflow: 'hidden',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-light)',
    marginBottom: '40px',
  },
  marquee: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    // Fade halus di tepi kiri & kanan.
    maskImage:
      'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)',
    WebkitMaskImage:
      'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)',
  },
  track: {
    gap: '80px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logo: {
    height: '52px',
    width: 'auto',
    objectFit: 'contain',
    opacity: 1,
    transition: 'transform 0.3s ease',
  },
};

export default MediaPartners;
