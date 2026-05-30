import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InputField from '../../Reusable/InputField';
import Button from '../../Reusable/Button';

const Login = () => {
  const [dataForm, setDataForm] = useState({
    email: 'emilys',
    password: 'emilyspass'
  });
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    axios
      .post("https://dummyjson.com/user/login", {
        username: dataForm.email,
        password: dataForm.password,
      })
      .then((response) => {
        if (response.status !== 200) {
          setError(response.data.message);
          return;
        }
        navigate("/admin/dashboard");
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "An error occurred");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Welcome back</h2>
      <p style={styles.subtitle}>Welcome back please enter your details</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}

        <InputField
          label="Email"
          type="text"
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

        <div style={styles.forgotRow}>
          <a href="#" style={styles.forgotLink}>Forgot password</a>
        </div>

        <Button type="submit" variant="primary" disabled={loading} style={styles.fullBtn}>
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>

        <Button type="button" variant="ghost" style={styles.fullBtn}>
          Sign in with Google
        </Button>
      </form>

      <p style={styles.footerText}>
        Don't have an account. <a href="#" style={styles.cyanLink}>Sign in</a>
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
  forgotRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '4px',
  },
  forgotLink: {
    fontSize: '12px',
    color: '#4FC3F7',
    textDecoration: 'none',
    fontWeight: '500',
  },
  fullBtn: {
    width: '100%',
    padding: '12px',
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
  }
};

export default Login;
