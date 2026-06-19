import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputField from '../../Reusable/InputField';
import Button from '../../Reusable/Button';
import { Spinner } from '@/components/ui/spinner';
import { register } from '../../services/auth';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Create Account | FurniCRM';
  }, []);

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
      <p style={styles.subtitle}>Please fill in your details to sign up.</p>

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
          leftIcon={<FiUser />}
        />

        <InputField
          label="Email Address"
          type="email"
          name="email"
          value={dataForm.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
          leftIcon={<FiMail />}
        />

        <InputField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={dataForm.password}
          onChange={handleChange}
          placeholder="Enter password"
          required
          leftIcon={<FiLock />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          }
        />

        <InputField
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={dataForm.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm password"
          required
          leftIcon={<FiLock />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeBtn}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          }
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
    fontSize: '30px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14.5px',
    color: '#64748b',
    margin: '0 0 28px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  fullBtn: {
    width: '100%',
    padding: '12.5px',
    fontSize: '15px',
  },
  btnLoading: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  footerText: {
    marginTop: '32px',
    textAlign: 'center',
    fontSize: '13.5px',
    color: '#64748b',
  },
  cyanLink: {
    color: '#6e39cb',
    textDecoration: 'none',
    fontWeight: '600',
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
  eyeBtn: {
    background: 'transparent',
    border: 'none',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#667085',
    outline: 'none',
  }
};

export default Register;
