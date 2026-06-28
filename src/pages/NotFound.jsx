const NotFound = () => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.inner}>
        <h1 style={styles.code}>404</h1>
        <div style={styles.divider} />
        <p style={styles.text}>This page could not be found.</p>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000',
    padding: '16px',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
  },
  code: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    color: '#fff',
  },
  divider: {
    width: '1px',
    height: '40px',
    background: 'rgba(255,255,255,0.3)',
    margin: '0 24px',
  },
  text: {
    margin: 0,
    fontSize: '14px',
    color: 'rgba(255,255,255,0.9)',
  },
};

export default NotFound;
