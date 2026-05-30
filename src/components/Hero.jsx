import HeroSection from '../Reusable/HeroSection';
import Container from '../Reusable/Container';
import Button from '../Reusable/Button';

const Hero = () => {
  return (
    <HeroSection style={styles.hero}>
      <Container style={styles.container}>
        <div style={styles.card}>
          <p style={styles.subtitle}>New Arrival</p>
          <h1 style={styles.title}>Discover Our <br/> New Collection</h1>
          <p style={styles.description}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.
          </p>
          <Button variant="primary" className="btn btn-primary" style={styles.btn}>BUY NOW</Button>
        </div>
      </Container>
    </HeroSection>
  );
};

const styles = {
  hero: {
    height: '80vh',
    minHeight: '600px',
    backgroundImage: `url('/assets/images/hero.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end', /* Puts the card on the right side */
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    padding: '60px',
    borderRadius: '8px',
    maxWidth: '540px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  },
  subtitle: {
    color: 'var(--text-dark)',
    fontWeight: '600',
    letterSpacing: '2px',
    marginBottom: '16px',
  },
  title: {
    color: 'var(--text-dark)',
    fontSize: '48px',
    fontWeight: '700',
    lineHeight: 1.2,
    marginBottom: '16px',
  },
  description: {
    color: 'var(--text-light)',
    fontSize: '16px',
    marginBottom: '32px',
    lineHeight: 1.5,
  },
  btn: {
    padding: '16px 48px',
    fontSize: '16px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    backgroundColor: 'var(--primary)',
  }
};

export default Hero;
