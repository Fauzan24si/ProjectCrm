import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputField from '../../Reusable/InputField';
import Button from '../../Reusable/Button';
import { Spinner } from '@/components/ui/spinner';
import { login } from '../../services/auth';
import { FiMail, FiLock, FiEye, FiEyeOff, FiKey } from 'react-icons/fi';

const Login = () => {
  const [dataForm, setDataForm] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sign In | FurniCRM';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const user = await login({ email: dataForm.email, password: dataForm.password });
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/member');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataForm(prev => ({ ...prev, [name]: value }));
  };

  const fillGuest = () => {
    setDataForm({ email: 'guest@guest.site', password: 'guest@guest.site' });
    setError(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Welcome back</h2>
      <p style={styles.subtitle}>Please enter your details to sign in.</p>

      <div style={styles.guestBox}>
        <div style={styles.guestHeader}>
          <span style={styles.guestBadge}>
            <FiKey size={13} style={{ marginRight: 4 }} />
            Demo Account
          </span>
          <button type="button" onClick={fillGuest} style={styles.guestFillBtn}>
            Use Account
          </button>
        </div>
        <p style={styles.guestRow}>
          <span style={styles.guestLabel}>Email</span>
          <span style={styles.guestValue}>guest@guest.site</span>
        </p>
        <p style={styles.guestRow}>
          <span style={styles.guestLabel}>Password</span>
          <span style={styles.guestValue}>guest@guest.site</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}

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
          placeholder="Enter your password"
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

        <div style={styles.forgotRow}>
          <a href="#" style={styles.forgotLink}>Forgot password?</a>
        </div>

        <Button type="submit" variant="primary" disabled={loading} style={styles.fullBtn}>
          {loading ? (
            <span style={styles.btnLoading}>
              <Spinner style={{ width: 16, height: 16 }} />
              Signing In...
            </span>
          ) : (
            'Sign In'
          )}
        </Button>

        <Button 
          type="button" 
          variant="ghost" 
          style={{ ...styles.fullBtn, ...styles.googleBtn }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: 8 }}>
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 15.01 1 12 1 7.24 1 3.2 3.8 1.3 7.86l3.87 3C6.1 8.2 8.8 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.98 3.7-8.71z"
            />
            <path
              fill="#FBBC05"
              d="M5.17 10.86c-.25-.76-.39-1.57-.39-2.4 0-.83.14-1.64.39-2.4L1.3 3.06C.47 4.7 0 6.55 0 8.46s.47 3.76 1.3 5.4l3.87-3z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.1.74-2.5 1.18-4.23 1.18-3.2 0-5.9-2.16-6.86-5.06L1.27 16.3C3.17 20.3 7.21 23 12 23z"
            />
          </svg>
          Sign in with Google
        </Button>
      </form>

      <p style={styles.footerText}>
        Don't have an account? <Link to="/register" style={styles.cyanLink}>Sign up</Link>
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
  guestBox: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px 20px',
    margin: '0 0 24px 0',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
  },
  guestHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  guestBadge: {
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    color: '#6e39cb',
    display: 'flex',
    alignItems: 'center',
  },
  guestFillBtn: {
    background: '#6e39cb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '11.5px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  guestRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '4px 0',
    fontSize: '13.5px',
  },
  guestLabel: {
    color: '#64748B',
  },
  guestValue: {
    color: '#0F172A',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  forgotRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '6px',
  },
  forgotLink: {
    fontSize: '13px',
    color: '#6e39cb',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.2s',
  },
  fullBtn: {
    width: '100%',
    padding: '12.5px',
    fontSize: '15px',
  },
  googleBtn: {
    border: '1px solid #d0d5dd',
    backgroundColor: '#ffffff',
    color: '#344054',
    marginTop: '6px',
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

export default Login;
