import { useState } from 'react';
import { FiUser, FiHeart, FiShoppingCart } from 'react-icons/fi';
import { Link, NavLink } from 'react-router-dom';
import Header from '../Reusable/Header';
import Container from '../Reusable/Container';
import Cart from '../Reusable/Cart';
import { useCart } from '../context/CartContext';
import { formatRupiah } from '../lib/membership';
import { getCurrentUser } from '../services/auth';

const HeaderSection = () => {
  const [showCart, setShowCart] = useState(false);
  const { items, totalItems, totalPrice } = useCart();
  const session = getCurrentUser();
  const userTarget =
    session ? (session.role === 'admin' ? '/admin/dashboard' : '/member') : '/login';
  const userTitle = session ? `Akun: ${session.name}` : 'Login';

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
            <li>
              <NavLink
                to="/"
                end
                style={({ isActive }) => ({
                  ...styles.navLink,
                  fontWeight: isActive ? 600 : 400,
                })}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/shop"
                style={({ isActive }) => ({
                  ...styles.navLink,
                  fontWeight: isActive ? 600 : 400,
                })}
              >
                Shop
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                style={({ isActive }) => ({
                  ...styles.navLink,
                  fontWeight: isActive ? 600 : 400,
                })}
              >
                About
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                style={({ isActive }) => ({
                  ...styles.navLink,
                  fontWeight: isActive ? 600 : 400,
                })}
              >
                Contact
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/track"
                style={({ isActive }) => ({
                  ...styles.navLink,
                  fontWeight: isActive ? 600 : 400,
                })}
              >
                Lacak Order
              </NavLink>
            </li>
          </ul>
        </nav>

        <div style={styles.icons}>
          <Link to={userTarget} style={styles.icon} aria-label={userTitle} title={userTitle}>
            <FiUser />
          </Link>
          <a href="#" style={styles.icon}><FiHeart /></a>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowCart((prev) => !prev)}
              style={{ ...styles.icon, background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
              aria-label="Cart"
            >
              <FiShoppingCart />
              {totalItems > 0 && <span style={styles.cartBadge}>{totalItems}</span>}
            </button>
            {showCart && (
              <Cart style={styles.cartPanel}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Keranjang</h4>
                {items.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-light)' }}>
                    Belum ada item di keranjang.
                  </p>
                ) : (
                  <>
                    <div style={styles.cartList}>
                      {items.slice(0, 3).map((item) => (
                        <div key={item.id} style={styles.cartRow}>
                          <img src={item.thumbnail} alt={item.title} style={styles.cartThumb} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={styles.cartItemTitle}>{item.title}</p>
                            <p style={styles.cartItemMeta}>{item.qty} × {formatRupiah(item.price)}</p>
                          </div>
                        </div>
                      ))}
                      {items.length > 3 && (
                        <p style={styles.cartMore}>+{items.length - 3} item lainnya</p>
                      )}
                    </div>
                    <div style={styles.cartTotalRow}>
                      <span>Total</span>
                      <strong>{formatRupiah(totalPrice)}</strong>
                    </div>
                  </>
                )}
                <Link to="/shop" style={styles.cartLink} onClick={() => setShowCart(false)}>
                  {items.length === 0 ? 'Mulai belanja' : 'Lihat keranjang'}
                </Link>
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
    minWidth: '260px',
    background: 'var(--bg-card)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    zIndex: 1100,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    borderRadius: '10px',
  },
  cartLink: {
    display: 'inline-block',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--primary)',
    textDecoration: 'none',
  },
  cartBadge: {
    position: 'absolute',
    top: '-6px',
    right: '-8px',
    background: '#ef4444',
    color: '#fff',
    borderRadius: '999px',
    fontSize: '10px',
    fontWeight: 700,
    minWidth: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
  },
  cartList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '220px',
    overflowY: 'auto',
  },
  cartRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cartThumb: {
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    objectFit: 'cover',
    background: '#f7f7f8',
    flexShrink: 0,
  },
  cartItemTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-dark)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cartItemMeta: {
    margin: 0,
    fontSize: '12px',
    color: 'var(--text-light)',
  },
  cartMore: {
    margin: 0,
    fontSize: '12px',
    color: 'var(--text-light)',
  },
  cartTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    paddingTop: '10px',
    borderTop: '1px solid #eee',
  },
};

export default HeaderSection;
