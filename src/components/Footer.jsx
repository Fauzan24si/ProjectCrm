import { FiInstagram } from 'react-icons/fi';
import Footer from '../Reusable/Footer';
import Container from '../Reusable/Container';

const FooterSection = () => {
  return (
    <Footer style={styles.footer}>
      <Container style={styles.container}>
        <div style={styles.topSection}>
          <div style={styles.column}>
            <h3 style={styles.logo}>Furniture.</h3>
            <p style={styles.description}>
              400 University Drive Suite 200 Coral Gables, <br/>
              FL 33134 USA
            </p>
          </div>
          
          <div style={styles.column}>
            <h4 style={styles.heading}>Links</h4>
            <ul style={styles.list}>
              <li><a href="#" style={styles.link}>Home</a></li>
              <li><a href="#" style={styles.link}>Shop</a></li>
              <li><a href="#" style={styles.link}>About</a></li>
              <li><a href="#" style={styles.link}>Contact</a></li>
            </ul>
          </div>

          <div style={styles.column}>
            <h4 style={styles.heading}>Help</h4>
            <ul style={styles.list}>
              <li><a href="#" style={styles.link}>Payment Options</a></li>
              <li><a href="#" style={styles.link}>Returns</a></li>
              <li><a href="#" style={styles.link}>Privacy Policies</a></li>
            </ul>
          </div>

          <div style={styles.column}>
            <h4 style={styles.heading}>Newsletter</h4>
            <div style={styles.newsletterForm}>
              <input type="email" placeholder="Enter Your Email Address" style={styles.input} />
              <button style={styles.subscribeBtn}>SUBSCRIBE</button>
            </div>
          </div>
        </div>

        <div style={styles.bottomSection}>
          <p style={styles.copyright}>2023 furino. All rights reverved</p>
        </div>
      </Container>
    </Footer>
  );
};

const styles = {
  footer: {
    padding: '80px 0 40px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-color)',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 24px',
  },
  topSection: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '40px',
    marginBottom: '60px',
  },
  column: {
    flex: '1 1 200px',
  },
  logo: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '24px',
    color: 'var(--text-dark)',
  },
  description: {
    color: 'var(--text-light)',
    lineHeight: '1.6',
    fontSize: '15px',
  },
  heading: {
    fontSize: '16px',
    color: 'var(--text-light)',
    marginBottom: '32px',
    fontWeight: '500',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  link: {
    color: 'var(--text-dark)',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'color 0.3s ease',
  },
  newsletterForm: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  input: {
    border: 'none',
    borderBottom: '1px solid #000',
    padding: '4px 0',
    fontSize: '14px',
    outline: 'none',
    width: '200px',
  },
  subscribeBtn: {
    border: 'none',
    borderBottom: '1px solid #000',
    padding: '4px 0',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  bottomSection: {
    paddingTop: '32px',
    borderTop: '1px solid var(--border-color)',
  },
  copyright: {
    fontSize: '15px',
    color: 'var(--text-dark)',
  }
};

export default FooterSection;
