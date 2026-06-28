import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiSave, FiCheckCircle } from 'react-icons/fi';
import { getCurrentUser, setCurrentUser } from '../../services/auth';
import { getUser, updateUser } from '../../services/users';
import { getMembershipMeta } from '../../lib/membership';

function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', gender: '', age: '' });
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
            name: data.name || '',
            phone: data.phone || '',
            gender: data.gender || '',
            age: data.age ?? '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        gender: form.gender || null,
        age: form.age === '' ? null : Number(form.age),
      };
      const updated = await updateUser(user.id, payload);
      setUser(updated);

      // Sinkronkan nama/email di sesi lokal agar sidebar ikut ter-update.
      const session = getCurrentUser();
      setCurrentUser({ ...session, name: updated.name });

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
        Memuat profil...
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

  const meta = getMembershipMeta(user.membership);

  return (
    <>
      <style>{profileStyles}</style>
      <div className="profile-wrap">
        <div className="profile-header">
          <h1 className="profile-title">Profil Saya</h1>
          <p className="profile-subtitle">
            Kelola informasi akun dan data kontak Anda.
          </p>
        </div>

        {/* Identity card */}
        <div className="profile-identity">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.name
            )}&background=101828&color=fff&size=128`}
            alt={user.name}
            className="profile-avatar"
          />
          <div className="profile-identity-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <span
              className="profile-badge"
              style={{ background: meta.bg, color: meta.color }}
            >
              {meta.label} Member
            </span>
          </div>
        </div>

        {/* Edit form */}
        <form className="profile-form" onSubmit={handleSubmit}>
          <h3 className="profile-section-title">Informasi Pribadi</h3>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="name">Nama Lengkap</label>
              <div className="input-wrap">
                <FiUser className="input-icon" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nama lengkap"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="email">Email</label>
              <div className="input-wrap">
                <FiMail className="input-icon" />
                <input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  title="Email tidak dapat diubah"
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="phone">Nomor Telepon</label>
              <div className="input-wrap">
                <FiPhone className="input-icon" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="gender">Jenis Kelamin</label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Pilih...</option>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="age">Usia</label>
              <input
                id="age"
                name="age"
                type="number"
                min="0"
                max="120"
                value={form.age}
                onChange={handleChange}
                placeholder="Usia"
                className="form-input-plain"
              />
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}
          {success && (
            <div className="form-success">
              <FiCheckCircle /> Profil berhasil diperbarui.
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-save" disabled={saving}>
              <FiSave />
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

const profileStyles = `
  .profile-wrap { font-family: 'Lato', sans-serif; max-width: 760px; }
  .profile-header { margin-bottom: 24px; }
  .profile-title { margin: 0; font-size: 26px; font-weight: 700; color: #101828; }
  .profile-subtitle { margin: 4px 0 0; font-size: 14px; color: #667085; }

  .profile-identity {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 24px;
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 16px;
    margin-bottom: 20px;
  }
  .profile-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }
  .profile-identity-info h2 { margin: 0; font-size: 20px; font-weight: 700; color: #101828; }
  .profile-identity-info p { margin: 4px 0 8px; font-size: 14px; color: #667085; }
  .profile-badge {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 999px;
  }

  .profile-form {
    padding: 24px;
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 16px;
  }
  .profile-section-title {
    font-size: 15px;
    font-weight: 700;
    color: #101828;
    margin: 0 0 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f3f4f6;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 18px;
  }
  .form-field { display: flex; flex-direction: column; gap: 6px; }
  .form-field label {
    font-size: 13px;
    font-weight: 600;
    color: #344054;
  }

  .input-wrap { position: relative; display: flex; align-items: center; }
  .input-icon {
    position: absolute;
    left: 12px;
    color: #98a2b3;
    font-size: 16px;
    pointer-events: none;
  }
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
  .form-input-plain, .form-select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d0d5dd;
    border-radius: 8px;
    font-size: 14px;
    color: #101828;
    font-family: inherit;
    outline: none;
    background: #fff;
    transition: border 0.15s, box-shadow 0.15s;
  }
  .input-wrap input:focus, .form-input-plain:focus, .form-select:focus {
    border-color: #101828;
    box-shadow: 0 0 0 3px rgba(16, 24, 40, 0.12);
  }
  .input-wrap input:disabled {
    background: #f9fafb;
    color: #98a2b3;
    cursor: not-allowed;
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

  .form-actions {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }
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

export default Profile;
