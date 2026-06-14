import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputField from '../../Reusable/InputField';
import Button from '../../Reusable/Button';
import { Spinner } from '@/components/ui/spinner';
import { register } from '../../services/auth';

const Register = () => {
  const [dataForm, setDataForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (dataForm.password !== dataForm.confirmPassword) {
      setError('Password dan konfirmasi password tidak sama.');
      return;
    }
    if (dataForm.password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: dataForm.name,
        email: dataForm.email,
        password: dataForm.password,
      });
      setSuccess('Registrasi berhasil! Mengarahkan ke halaman login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat registrasi');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Create account</h2>
      <p style={styles.subtitle}>Please fill in your details to sign up</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <InputField
          label="Full Name"
          type="text"
          name="name"
          value={dataForm.name}
          onChange={handleChange}
          placeholder="Enter your name"
          required
        />

        <InputField
          label="Email"
          type="email"
          name="email"
          value={dataForm.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />

        <InputField
          label="Password"
          type="password"
          name="password"
          value={dataForm.password}
          onChange={handleChange}
          placeholder="............"
          required
        />

        <InputField
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={dataForm.confirmPassword}
          onChange={handleChange}
          placeholder="............"
          required
        />

        <Button type="submit" variant="primary" disabled={loading} style={styles.fullBtn}>
          {loading ? (
            <span style={styles.btnLoading}>
              <Spinner style={{ width: 16, height: 16 }} />
              Creating account...
            </span>
          ) : (
            'Sign Up'
          )}
        </Button>
      </form>

      <p style={styles.footerText}>
        Already have an account? <Link to="/login" style={styles.cyanLink}>Sign in</Link>
      </p>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    fontFamily: 'Inter, sans-serif',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '13px',
    color: '#9CA3AF',
    margin: '0 0 32px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  fullBtn: {
    width: '100%',
    padding: '12px',
  },
  btnLoading: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  footerText: {
    marginTop: '40px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#9CA3AF',
  },
  cyanLink: {
    color: '#4FC3F7',
    textDecoration: 'none',
    fontWeight: '500',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '13px',
    border: '1px solid #fecaca',
  },
  success: {
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '13px',
    border: '1px solid #bbf7d0',
  },
};

export default Register;
