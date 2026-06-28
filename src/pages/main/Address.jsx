import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiPhone, FiSave, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { getCurrentUser } from '../../services/auth';
import { getUser, updateUser } from '../../services/users';

function Address() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ address: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const session = getCurrentUser();
    if (!session) {
      navigate('/login');
      return;
    }

    getUser(session.id)
      .then((data) => {
        if (!data) {
          setError('Data member tidak ditemukan.');
        } else {
          setUser(data);
          setForm({
            address: data.address || '',
            phone: data.phone || '',
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const phoneDigits = form.phone.replace(/\D/g, '');
  const pinPreview = phoneDigits.length >= 4 ? phoneDigits.slice(-4) : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (phoneDigits.length < 4) {
      setError('Nomor HP penerima minimal 4 digit.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
      };
      const updated = await updateUser(user.id, payload);
      setUser(updated);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#667085' }}>
        Memuat alamat...
      </div>
    );
  }

  if (error && !user) {
    return (
      <div style={{ padding: 16, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 10 }}>
        {error}
      </div>
    );
  }

  return (
    <>
      <style>{addressStyles}</style>
      <div className="addr-wrap">
        <div className="addr-header">
          <h1 className="addr-title">Alamat Pengiriman</h1>
          <p className="addr-subtitle">
            Alamat dan nomor HP penerima ini akan dipakai saat checkout.
          </p>
        </div>

        <form className="addr-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="address">Alamat Lengkap</label>
            <div className="textarea-wrap">
              <FiMapPin className="textarea-icon" />
              <textarea
                id="address"
                name="address"
                rows={4}
                value={form.address}
                onChange={handleChange}
                placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota, kode pos"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="phone">Nomor HP Penerima</label>
            <div className="input-wrap">
              <FiPhone className="input-icon" />
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                required
              />
            </div>
          </div>

          <div className="addr-pin-note">
            <FiInfo />
            <div>
              <strong>PIN Lacak Pesanan</strong>
              <p>
                4 digit terakhir nomor HP penerima menjadi PIN untuk melacak
                pesanan sebagai tamu.
                {pinPreview && (
                  <>
                    {' '}PIN Anda saat ini: <span className="addr-pin">{pinPreview}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}
          {success && (
            <div className="form-success">
              <FiCheckCircle /> Alamat berhasil disimpan.
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-save" disabled={saving}>
              <FiSave />
              {saving ? 'Menyimpan...' : 'Simpan Alamat'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

const addressStyles = `
  .addr-wrap { font-family: 'Lato', sans-serif; max-width: 640px; }
  .addr-header { margin-bottom: 24px; }
  .addr-title { margin: 0; font-size: 26px; font-weight: 700; color: #101828; }
  .addr-subtitle { margin: 4px 0 0; font-size: 14px; color: #667085; }

  .addr-form {
    padding: 24px;
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 16px;
  }
  .form-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
  .form-field label { font-size: 13px; font-weight: 600; color: #344054; }

  .input-wrap { position: relative; display: flex; align-items: center; }
  .input-icon { position: absolute; left: 12px; color: #98a2b3; font-size: 16px; pointer-events: none; }
  .input-wrap input {
    width: 100%;
    padding: 10px 12px 10px 38px;
    border: 1px solid #d0d5dd;
    border-radius: 8px;
    font-size: 14px;
    color: #101828;
    font-family: inherit;
    outline: none;
    transition: border 0.15s, box-shadow 0.15s;
  }
  .textarea-wrap { position: relative; }
  .textarea-icon { position: absolute; left: 12px; top: 14px; color: #98a2b3; font-size: 16px; pointer-events: none; }
  .textarea-wrap textarea {
    width: 100%;
    padding: 12px 12px 12px 38px;
    border: 1px solid #d0d5dd;
    border-radius: 8px;
    font-size: 14px;
    color: #101828;
    font-family: inherit;
    outline: none;
    resize: vertical;
    transition: border 0.15s, box-shadow 0.15s;
  }
  .input-wrap input:focus, .textarea-wrap textarea:focus {
    border-color: #101828;
    box-shadow: 0 0 0 3px rgba(16, 24, 40, 0.12);
  }

  .addr-pin-note {
    display: flex;
    gap: 12px;
    padding: 14px 16px;
    background: #f2f4f7;
    border: 1px solid #eaecf0;
    border-radius: 10px;
    color: #5925dc;
    font-size: 13px;
  }
  .addr-pin-note strong { display: block; margin-bottom: 2px; color: #42307d; }
  .addr-pin-note p { margin: 0; color: #6941c6; line-height: 1.5; }
  .addr-pin {
    font-weight: 700;
    letter-spacing: 2px;
    background: #fff;
    padding: 1px 8px;
    border-radius: 6px;
    border: 1px solid #eaecf0;
  }

  .form-error {
    margin-top: 18px;
    padding: 10px 14px;
    background: #fef3f2;
    color: #b42318;
    border: 1px solid #fecdca;
    border-radius: 8px;
    font-size: 13px;
  }
  .form-success {
    margin-top: 18px;
    padding: 10px 14px;
    background: #ecfdf3;
    color: #067647;
    border: 1px solid #abefc6;
    border-radius: 8px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .form-actions { margin-top: 24px; display: flex; justify-content: flex-end; }
  .btn-save {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: #101828;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
    font-family: inherit;
  }
  .btn-save:hover:not(:disabled) { background: #000000; }
  .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
`;

export default Address;
