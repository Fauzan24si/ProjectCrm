import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleOAuthCallback } from '../../services/auth';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    handleOAuthCallback()
      .then((user) => {
        if (user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/member', { replace: true });
        }
      })
      .catch(() => {
        navigate('/login?error=oauth_failed', { replace: true });
      });
  }, [navigate]);

  return (
    <div style={styles.wrap}>
      <div style={styles.spinner} />
      <p style={styles.text}>Menyelesaikan login…</p>
    </div>
  );
};

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    background: '#f5f2ed',
    fontFamily: 'Inter, sans-serif',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e3ddd5',
    borderTopColor: '#2c2825',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  text: {
    fontSize: '14px',
    color: '#8c8278',
    margin: 0,
  },
};

export default OAuthCallback;
