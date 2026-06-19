import { useState } from 'react';
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiSend,
  FiCheckCircle,
  FiMessageCircle,
} from 'react-icons/fi';
import Container from '../../Reusable/Container';

const WHATSAPP_NUMBER = '6281267905243';

const contactInfo = [
  {
    icon: <FiMapPin />,
    title: 'Alamat',
    lines: ['400 University Drive Suite 200', 'Coral Gables, FL 33134, USA'],
  },
  {
    icon: <FiPhone />,
    title: 'Telepon',
    lines: ['+62 812-6790-5243'],
  },
  {
    icon: <FiMail />,
    title: 'Email',
    lines: ['hello@furniture.co', 'support@furniture.co'],
  },
  {
    icon: <FiClock />,
    title: 'Jam Operasional',
    lines: ['Senin - Jumat: 09.00 - 18.00', 'Sabtu: 09.00 - 14.00'],
  },
];

const initialForm = { name: '', email: '', subject: '', message: '' };

const Contact = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Nama wajib diisi.';
    if (!form.email.trim()) {
      next.email = 'Email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Format email tidak valid.';
    }
    if (!form.message.trim()) next.message = 'Pesan wajib diisi.';
    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    // Tidak ada backend khusus untuk pesan; arahkan ke WhatsApp resmi toko.
    const text = encodeURIComponent(
      `Halo, saya ${form.name}.\n` +
        (form.subject ? `Perihal: ${form.subject}\n` : '') +
        `${form.message}\n\n(Email: ${form.email})`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
    setSubmitted(true);
    setForm(initialForm);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <>
      <style>{contactStyles}</style>

      {/* Hero */}
      <section className="contact-hero">
        <Container>
          <p className="contact-eyebrow">Hubungi Kami</p>
          <h1 className="contact-hero-title">Kami Senang Mendengar dari Anda</h1>
          <p className="contact-hero-sub">
            Punya pertanyaan tentang produk, pesanan, atau ingin berkolaborasi? Tim kami
            siap membantu. Kirim pesan dan kami akan segera merespons.
          </p>
        </Container>
      </section>

      {/* Info cards */}
      <section className="contact-section">
        <Container>
          <div className="contact-info-grid">
            {contactInfo.map((c) => (
              <div key={c.title} className="contact-info-card">
                <span className="contact-info-icon">{c.icon}</span>
                <h4>{c.title}</h4>
                {c.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Form + Map */}
      <section className="contact-section contact-section--alt">
        <Container>
          <div className="contact-grid">
            {/* Form */}
            <div className="contact-form-wrap">
              <h2>Kirim Pesan</h2>
              <p className="contact-form-sub">
                Isi formulir di bawah ini dan kami akan menghubungi Anda secepatnya.
              </p>

              {submitted && (
                <div className="contact-success">
                  <FiCheckCircle />
                  <span>Terima kasih! Pesan Anda sedang kami arahkan ke WhatsApp.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="contact-field-row">
                  <div className="contact-field">
                    <label htmlFor="name">Nama Lengkap</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Nama Anda"
                      value={form.name}
                      onChange={handleChange}
                      className={errors.name ? 'has-error' : ''}
                    />
                    {errors.name && <span className="contact-error">{errors.name}</span>}
                  </div>
                  <div className="contact-field">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="email@contoh.com"
                      value={form.email}
                      onChange={handleChange}
                      className={errors.email ? 'has-error' : ''}
                    />
                    {errors.email && <span className="contact-error">{errors.email}</span>}
                  </div>
                </div>

                <div className="contact-field">
                  <label htmlFor="subject">Subjek</label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="Perihal pesan (opsional)"
                    value={form.subject}
                    onChange={handleChange}
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="message">Pesan</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Tulis pesan Anda di sini..."
                    value={form.message}
                    onChange={handleChange}
                    className={errors.message ? 'has-error' : ''}
                  />
                  {errors.message && <span className="contact-error">{errors.message}</span>}
                </div>

                <button type="submit" className="contact-submit">
                  <FiSend /> Kirim Pesan
                </button>
              </form>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-wa-link"
              >
                <FiMessageCircle /> Atau chat langsung via WhatsApp
              </a>
            </div>

            {/* Map */}
            <div className="contact-map-wrap">
              <iframe
                title="Lokasi Furniture"
                src="https://www.google.com/maps?q=Coral+Gables+University+Drive&output=embed"
                className="contact-map"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

const contactStyles = `
  .contact-hero {
    padding: 80px 0 56px;
    background: var(--bg-light);
    text-align: center;
  }
  .contact-eyebrow {
    text-transform: uppercase;
    letter-spacing: 2px;
    font-size: 13px;
    font-weight: 600;
    color: var(--primary);
    margin: 0 0 12px;
  }
  .contact-hero-title {
    font-size: 40px;
    font-weight: 700;
    color: var(--text-dark);
    max-width: 700px;
    margin: 0 auto 20px;
    line-height: 1.2;
  }
  .contact-hero-sub {
    max-width: 620px;
    margin: 0 auto;
    color: var(--text-light);
    font-size: 17px;
    line-height: 1.7;
  }

  .contact-section {
    padding: 56px 0;
  }
  .contact-section--alt {
    background: var(--bg-light);
  }

  .contact-info-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  .contact-info-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 28px 22px;
    text-align: center;
  }
  .contact-info-icon {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    background: var(--primary-light);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    margin: 0 auto 16px;
  }
  .contact-info-card h4 {
    font-size: 17px;
    margin: 0 0 10px;
  }
  .contact-info-card p {
    color: var(--text-light);
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
  }

  .contact-grid {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 40px;
    align-items: stretch;
  }
  .contact-form-wrap {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 36px;
  }
  .contact-form-wrap h2 {
    font-size: 26px;
    margin: 0 0 8px;
  }
  .contact-form-sub {
    color: var(--text-light);
    margin: 0 0 24px;
    font-size: 15px;
  }
  .contact-field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .contact-field {
    margin-bottom: 18px;
    display: flex;
    flex-direction: column;
  }
  .contact-field label {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 6px;
  }
  .contact-field input,
  .contact-field textarea {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 11px 14px;
    font-size: 14px;
    font-family: inherit;
    color: var(--text-dark);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    background: var(--bg-color);
    resize: vertical;
  }
  .contact-field input:focus,
  .contact-field textarea:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light);
  }
  .contact-field input.has-error,
  .contact-field textarea.has-error {
    border-color: #dc2626;
  }
  .contact-error {
    color: #dc2626;
    font-size: 12px;
    margin-top: 6px;
  }
  .contact-submit {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--primary);
    color: var(--text-white);
    border: none;
    padding: 13px 28px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .contact-submit:hover {
    opacity: 0.9;
  }
  .contact-success {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f0fdf4;
    color: #16a34a;
    border: 1px solid #bbf7d0;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 20px;
  }
  .contact-wa-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 20px;
    color: var(--primary);
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
  }
  .contact-wa-link:hover {
    text-decoration: underline;
  }

  .contact-map-wrap {
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--border-color);
    min-height: 420px;
  }
  .contact-map {
    width: 100%;
    height: 100%;
    min-height: 420px;
    border: 0;
    display: block;
  }

  @media (max-width: 900px) {
    .contact-info-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .contact-grid {
      grid-template-columns: 1fr;
    }
    .contact-hero-title {
      font-size: 30px;
    }
  }

  @media (max-width: 520px) {
    .contact-info-grid {
      grid-template-columns: 1fr;
    }
    .contact-field-row {
      grid-template-columns: 1fr;
    }
  }
`;

export default Contact;
