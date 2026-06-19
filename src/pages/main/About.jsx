import { Link } from 'react-router-dom';
import {
  FiAward,
  FiUsers,
  FiTruck,
  FiHeart,
  FiTarget,
  FiEye,
  FiCheckCircle,
  FiMapPin,
  FiMail,
  FiPhone,
} from 'react-icons/fi';
import Container from '../../Reusable/Container';

const stats = [
  { icon: <FiUsers />, value: '12.500+', label: 'Pelanggan Puas' },
  { icon: <FiTruck />, value: '48.000+', label: 'Produk Terkirim' },
  { icon: <FiAward />, value: '15', label: 'Tahun Pengalaman' },
  { icon: <FiHeart />, value: '4.9/5', label: 'Rating Pelanggan' },
];

const values = [
  {
    icon: <FiCheckCircle />,
    title: 'Kualitas Tanpa Kompromi',
    desc: 'Setiap furnitur dibuat dari material pilihan dan melalui kontrol kualitas yang ketat sebelum sampai ke tangan Anda.',
  },
  {
    icon: <FiHeart />,
    title: 'Pelanggan Utama',
    desc: 'Kami percaya hubungan jangka panjang dibangun lewat layanan yang tulus, jujur, dan responsif.',
  },
  {
    icon: <FiTarget />,
    title: 'Desain Fungsional',
    desc: 'Estetika dan kenyamanan berjalan beriringan. Setiap produk dirancang untuk mempercantik sekaligus memudahkan hidup.',
  },
  {
    icon: <FiTruck />,
    title: 'Berkelanjutan',
    desc: 'Kami berkomitmen pada praktik produksi ramah lingkungan dan penggunaan kayu bersertifikat.',
  },
];

const milestones = [
  { year: '2010', text: 'Furniture didirikan sebagai workshop kecil di Coral Gables, Florida.' },
  { year: '2014', text: 'Membuka showroom pertama dan meluncurkan layanan custom furniture.' },
  { year: '2018', text: 'Ekspansi penjualan online dan menjangkau pelanggan di seluruh negeri.' },
  { year: '2022', text: 'Meluncurkan platform CRM untuk pengalaman belanja yang lebih personal.' },
  { year: '2025', text: 'Menjadi salah satu brand furnitur modern dengan pertumbuhan tercepat.' },
];

const team = [
  { name: 'Andrea Wijaya', role: 'Founder & CEO', initial: 'AW' },
  { name: 'Bima Saputra', role: 'Head of Design', initial: 'BS' },
  { name: 'Clara Tanuwijaya', role: 'Operations Director', initial: 'CT' },
  { name: 'Dimas Pratama', role: 'Customer Success Lead', initial: 'DP' },
];

const About = () => {
  return (
    <>
      <style>{aboutStyles}</style>

      {/* Hero */}
      <section className="about-hero">
        <Container>
          <p className="about-eyebrow">Tentang Kami</p>
          <h1 className="about-hero-title">
            Menghadirkan Furnitur Berkualitas untuk Setiap Ruang
          </h1>
          <p className="about-hero-sub">
            Furniture adalah perusahaan furnitur modern yang berfokus pada desain
            fungsional, kualitas premium, dan pengalaman belanja yang menyenangkan.
            Kami percaya rumah yang nyaman dimulai dari furnitur yang tepat.
          </p>
        </Container>
      </section>

      {/* Stats */}
      <section className="about-section">
        <Container>
          <div className="about-stats">
            {stats.map((s) => (
              <div key={s.label} className="about-stat-card">
                <span className="about-stat-icon">{s.icon}</span>
                <span className="about-stat-value">{s.value}</span>
                <span className="about-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Story */}
      <section className="about-section">
        <Container>
          <div className="about-story">
            <div className="about-story-media">
              <img
                src="/assets/images/living_room.png"
                alt="Showroom Furniture"
                loading="lazy"
              />
            </div>
            <div className="about-story-text">
              <p className="about-eyebrow">Cerita Kami</p>
              <h2>Dari Workshop Kecil Menjadi Brand Tepercaya</h2>
              <p>
                Berawal dari sebuah workshop kecil pada tahun 2010, Furniture lahir dari
                kecintaan terhadap kerajinan kayu dan desain interior. Apa yang dimulai
                sebagai usaha keluarga kini berkembang menjadi perusahaan furnitur yang
                melayani ribuan pelanggan.
              </p>
              <p>
                Kami menggabungkan keahlian pengrajin tradisional dengan teknologi modern
                untuk menghasilkan furnitur yang tahan lama, nyaman, dan estetis. Setiap
                produk adalah hasil dari perhatian pada detail dan komitmen pada kualitas.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Vision & Mission */}
      <section className="about-section about-section--alt">
        <Container>
          <div className="about-vm">
            <div className="about-vm-card">
              <span className="about-vm-icon"><FiEye /></span>
              <h3>Visi</h3>
              <p>
                Menjadi brand furnitur pilihan utama yang menginspirasi setiap orang untuk
                menciptakan ruang hidup yang lebih indah dan bermakna.
              </p>
            </div>
            <div className="about-vm-card">
              <span className="about-vm-icon"><FiTarget /></span>
              <h3>Misi</h3>
              <ul>
                <li>Menyediakan furnitur berkualitas dengan harga yang adil.</li>
                <li>Memberikan layanan pelanggan yang ramah dan responsif.</li>
                <li>Berinovasi dalam desain yang fungsional dan berkelanjutan.</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="about-section">
        <Container>
          <div className="about-head">
            <h2>Nilai yang Kami Pegang</h2>
            <p>Prinsip yang menjadi landasan setiap keputusan dan produk kami.</p>
          </div>
          <div className="about-values">
            {values.map((v) => (
              <div key={v.title} className="about-value-card">
                <span className="about-value-icon">{v.icon}</span>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Milestones */}
      <section className="about-section about-section--alt">
        <Container>
          <div className="about-head">
            <h2>Perjalanan Kami</h2>
            <p>Tonggak penting dalam pertumbuhan Furniture.</p>
          </div>
          <div className="about-timeline">
            {milestones.map((m) => (
              <div key={m.year} className="about-timeline-item">
                <span className="about-timeline-year">{m.year}</span>
                <span className="about-timeline-dot" />
                <p className="about-timeline-text">{m.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Team */}
      <section className="about-section">
        <Container>
          <div className="about-head">
            <h2>Tim Kami</h2>
            <p>Orang-orang yang berdedikasi di balik Furniture.</p>
          </div>
          <div className="about-team">
            {team.map((t) => (
              <div key={t.name} className="about-team-card">
                <div className="about-team-avatar">{t.initial}</div>
                <h4>{t.name}</h4>
                <p>{t.role}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Contact / CTA */}
      <section className="about-section about-section--alt">
        <Container>
          <div className="about-contact">
            <div className="about-contact-info">
              <h2>Hubungi Kami</h2>
              <p>Punya pertanyaan atau ingin berkolaborasi? Kami senang mendengar dari Anda.</p>
              <ul>
                <li>
                  <FiMapPin />
                  <span>400 University Drive Suite 200, Coral Gables, FL 33134, USA</span>
                </li>
                <li>
                  <FiPhone />
                  <span>+62 812-6790-5243</span>
                </li>
                <li>
                  <FiMail />
                  <span>hello@furniture.co</span>
                </li>
              </ul>
            </div>
            <div className="about-contact-cta">
              <h3>Siap mempercantik ruang Anda?</h3>
              <p>Jelajahi katalog produk kami dan temukan furnitur impian Anda.</p>
              <Link to="/shop" className="about-cta-btn">Lihat Produk</Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

const aboutStyles = `
  .about-hero {
    padding: 80px 0 64px;
    background: var(--bg-light);
    text-align: center;
  }
  .about-eyebrow {
    text-transform: uppercase;
    letter-spacing: 2px;
    font-size: 13px;
    font-weight: 600;
    color: var(--primary);
    margin: 0 0 12px;
  }
  .about-hero-title {
    font-size: 40px;
    font-weight: 700;
    color: var(--text-dark);
    max-width: 760px;
    margin: 0 auto 20px;
    line-height: 1.2;
  }
  .about-hero-sub {
    max-width: 640px;
    margin: 0 auto;
    color: var(--text-light);
    font-size: 17px;
    line-height: 1.7;
  }

  .about-section {
    padding: 64px 0;
  }
  .about-section--alt {
    background: var(--bg-light);
  }
  .about-head {
    text-align: center;
    max-width: 560px;
    margin: 0 auto 40px;
  }
  .about-head h2 {
    font-size: 30px;
    margin: 0 0 10px;
  }
  .about-head p {
    color: var(--text-light);
    margin: 0;
  }

  .about-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  .about-stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 28px 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .about-stat-icon {
    font-size: 26px;
    color: var(--primary);
    display: flex;
  }
  .about-stat-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-dark);
  }
  .about-stat-label {
    font-size: 14px;
    color: var(--text-light);
  }

  .about-story {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: center;
  }
  .about-story-media img {
    width: 100%;
    height: 100%;
    max-height: 420px;
    object-fit: cover;
    border-radius: 16px;
  }
  .about-story-text h2 {
    font-size: 30px;
    margin: 0 0 16px;
  }
  .about-story-text p {
    color: var(--text-light);
    line-height: 1.8;
    margin: 0 0 16px;
  }

  .about-vm {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }
  .about-vm-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 36px;
  }
  .about-vm-icon {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    background: var(--primary-light);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 18px;
  }
  .about-vm-card h3 {
    font-size: 22px;
    margin: 0 0 12px;
  }
  .about-vm-card p,
  .about-vm-card li {
    color: var(--text-light);
    line-height: 1.7;
  }
  .about-vm-card ul {
    margin: 0;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .about-values {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  .about-value-card {
    padding: 28px 22px;
    border: 1px solid var(--border-color);
    border-radius: 14px;
    background: var(--bg-card);
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .about-value-card:hover {
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.07);
    transform: translateY(-3px);
  }
  .about-value-icon {
    font-size: 24px;
    color: var(--primary);
    display: flex;
    margin-bottom: 14px;
  }
  .about-value-card h4 {
    font-size: 17px;
    margin: 0 0 8px;
  }
  .about-value-card p {
    color: var(--text-light);
    font-size: 14px;
    line-height: 1.65;
    margin: 0;
  }

  .about-timeline {
    max-width: 720px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .about-timeline-item {
    display: grid;
    grid-template-columns: 72px 24px 1fr;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
  }
  .about-timeline-year {
    font-weight: 700;
    color: var(--primary);
    font-size: 17px;
  }
  .about-timeline-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--primary);
    justify-self: center;
    box-shadow: 0 0 0 4px var(--primary-light);
  }
  .about-timeline-text {
    color: var(--text-light);
    margin: 0;
    line-height: 1.6;
  }

  .about-team {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  .about-team-card {
    text-align: center;
    padding: 28px 20px;
    border: 1px solid var(--border-color);
    border-radius: 14px;
    background: var(--bg-card);
  }
  .about-team-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: var(--primary-light);
    color: var(--primary);
    font-weight: 700;
    font-size: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }
  .about-team-card h4 {
    margin: 0 0 4px;
    font-size: 17px;
  }
  .about-team-card p {
    margin: 0;
    color: var(--text-light);
    font-size: 14px;
  }

  .about-contact {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: stretch;
  }
  .about-contact-info h2 {
    font-size: 30px;
    margin: 0 0 12px;
  }
  .about-contact-info > p {
    color: var(--text-light);
    margin: 0 0 24px;
    line-height: 1.7;
  }
  .about-contact-info ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .about-contact-info li {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--text-dark);
  }
  .about-contact-info li svg {
    color: var(--primary);
    flex-shrink: 0;
    font-size: 18px;
  }
  .about-contact-cta {
    background: var(--primary);
    color: var(--text-white);
    border-radius: 16px;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .about-contact-cta h3 {
    color: var(--text-white);
    font-size: 24px;
    margin: 0 0 12px;
  }
  .about-contact-cta p {
    color: rgba(255, 255, 255, 0.85);
    margin: 0 0 24px;
    line-height: 1.7;
  }
  .about-cta-btn {
    align-self: flex-start;
    background: var(--text-white);
    color: var(--primary);
    padding: 12px 28px;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s;
  }
  .about-cta-btn:hover {
    opacity: 0.9;
  }

  @media (max-width: 900px) {
    .about-stats,
    .about-values,
    .about-team {
      grid-template-columns: repeat(2, 1fr);
    }
    .about-story,
    .about-vm,
    .about-contact {
      grid-template-columns: 1fr;
    }
    .about-hero-title {
      font-size: 30px;
    }
  }

  @media (max-width: 520px) {
    .about-stats,
    .about-values,
    .about-team {
      grid-template-columns: 1fr;
    }
    .about-timeline-item {
      grid-template-columns: 60px 20px 1fr;
      gap: 12px;
    }
  }
`;

export default About;
