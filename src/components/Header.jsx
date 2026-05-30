import { useState } from 'react';
import { FiUser, FiSearch, FiHeart, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Header from '../Reusable/Header';
import Container from '../Reusable/Container';
import Cart from '../Reusable/Cart';

const HeaderSection = () => {
  const [showCart, setShowCart] = useState(false);

  return (
    <Header style={styles.header}>
      <Container style={styles.container}>
        <div style={styles.logo}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2>Furniture</h2>
          </Link>
        </div>
        
        <nav style={styles.nav}>
          <ul style={styles.navList}>
            <li><Link to="/" style={{...styles.navLink, fontWeight: 600}}>Home</Link></li>
            <li><Link to="/products" style={styles.navLink}>Shop</Link></li>
            <li><a href="#" style={styles.navLink}>About</a></li>
            <li><a href="#" style={styles.navLink}>Contact</a></li>
          </ul>
        </nav>

        <div style={styles.icons}>
          <a href="#" style={styles.icon}><FiUser /></a>
          <a href="#" style={styles.icon}><FiSearch /></a>
          <a href="#" style={styles.icon}><FiHeart /></a>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowCart((prev) => !prev)}
              style={{ ...styles.icon, background: 'none', border: 'none', cursor: 'pointer' }}
              aria-label="Cart"
            >
              <FiShoppingCart />
            </button>
            {showCart && (
              <Cart style={styles.cartPanel}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Keranjang</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-light)' }}>
                  Belum ada item di keranjang.
                </p>
                <Link to="/products" style={styles.cartLink}>Mulai belanja</Link>
              </Cart>
            )}
          </div>
        </div>
      </Container>
    </Header>
  );
};

const styles = {
  header: {
    padding: '24px 0',
    backgroundColor: 'var(--bg-color)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: '24px',
  },
  nav: {
    display: 'flex',
  },
  navList: {
    display: 'flex',
    gap: '40px',
  },
  navLink: {
    color: 'var(--text-dark)',
    fontSize: '16px',
    transition: 'color 0.3s ease',
  },
  icons: {
    display: 'flex',
    gap: '24px',
  },
  icon: {
    color: 'var(--text-dark)',
    fontSize: '20px',
    cursor: 'pointer',
    transition: 'color 0.3s ease',
  },
  cartPanel: {
    position: 'absolute',
    top: 'calc(100% + 12px)',
    right: 0,
    minWidth: '240px',
    background: 'var(--bg-card)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    zIndex: 1100,
    padding: '16px',
  },
  cartLink: {
    display: 'inline-block',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--primary)',
    textDecoration: 'none',
  }
};

export default HeaderSection;
