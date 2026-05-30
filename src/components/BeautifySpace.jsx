const BeautifySpace = () => {
  return (
    <section style={styles.section}>
      <div className="container" style={styles.container}>
        <div style={styles.textContent}>
          <h2 style={styles.title}>Beautify Your Space</h2>
          <p style={styles.description}>
            Do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
          <button className="btn btn-primary" style={{borderRadius: '50px'}}>Learn More</button>
        </div>
        <div style={styles.imageContent}>
          <img src="/assets/images/beautify_space.png" alt="Beautify your space" style={styles.image} />
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '80px 0',
    backgroundColor: '#F9F9F9',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '40px',
    flexWrap: 'wrap',
  },
  textContent: {
    flex: '1 1 400px',
    paddingRight: '40px',
  },
  title: {
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: '16px',
    color: 'var(--text-dark)',
  },
  description: {
    fontSize: '16px',
    color: 'var(--text-light)',
    marginBottom: '32px',
    lineHeight: '1.6',
  },
  imageContent: {
    flex: '1 1 400px',
  },
  image: {
    width: '100%',
    borderRadius: '8px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  }
};

export default BeautifySpace;
