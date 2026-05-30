import { Component } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, errorInfo } = this.state;
    const isDev = import.meta.env.DEV;

    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.iconWrap}>
            <FiAlertTriangle size={32} />
          </div>

          <h1 style={styles.title}>Terjadi kesalahan</h1>
          <p style={styles.desc}>
            Ada yang salah saat memuat halaman ini. Coba muat ulang atau kembali ke beranda.
          </p>

          {isDev && error && (
            <details style={styles.details}>
              <summary style={styles.summary}>Detail error (dev only)</summary>
              <div style={styles.errorBox}>
                <strong>{error.toString()}</strong>
                {errorInfo?.componentStack && (
                  <pre style={styles.stack}>{errorInfo.componentStack}</pre>
                )}
              </div>
            </details>
          )}

          <div style={styles.actions}>
            <button onClick={this.handleReload} style={styles.btnPrimary}>
              <FiRefreshCw /> Muat Ulang
            </button>
            <a href="/" onClick={this.handleReset} style={styles.btnGhost}>
              <FiHome /> Ke Beranda
            </a>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F4F5F7',
    padding: '24px',
    fontFamily: "'Lato', sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.06)',
    padding: '48px 40px',
    maxWidth: '560px',
    width: '100%',
    textAlign: 'center',
    border: '1px solid #fef2f2',
  },
  iconWrap: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: '#fef2f2',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1f2937',
    margin: '0 0 8px',
  },
  desc: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: 1.6,
    margin: '0 0 24px',
  },
  details: {
    textAlign: 'left',
    background: '#fafafa',
    border: '1px solid #f3f4f6',
    borderRadius: '10px',
    padding: '12px 14px',
    marginBottom: '24px',
    fontSize: '13px',
  },
  summary: {
    cursor: 'pointer',
    fontWeight: 600,
    color: '#6b7280',
    userSelect: 'none',
  },
  errorBox: {
    marginTop: '12px',
    color: '#dc2626',
    fontSize: '12px',
  },
  stack: {
    marginTop: '8px',
    padding: '10px',
    background: '#fff',
    borderRadius: '6px',
    border: '1px solid #f3f4f6',
    fontSize: '11px',
    lineHeight: 1.5,
    color: '#6b7280',
    maxHeight: '180px',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#054C73',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'transparent',
    color: '#374151',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    textDecoration: 'none',
  },
};

export default ErrorBoundary;
