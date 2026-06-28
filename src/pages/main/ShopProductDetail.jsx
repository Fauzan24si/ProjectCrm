import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FiArrowLeft, FiStar, FiHeart, FiShoppingCart } from 'react-icons/fi';
import { getProduct } from '../../services/products';
import { formatRupiah } from '../../lib/membership';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { isAuthenticated } from '../../services/auth';
import {
  normalizeVariants,
  variantUnitPrice,
  isSelectionComplete,
  defaultSelection,
} from '../../lib/variants';

export default function ShopProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const [selection, setSelection] = useState({});

  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    let active = true;
    getProduct(id)
      .then((data) => {
        if (!active) return;
        if (!data) {
          setError('Produk tidak ditemukan');
          return;
        }
        setProduct(data);
        setSelection(defaultSelection(data.variants));
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || err.message);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 2500);
  };

  const handleWishlist = async () => {
    // Syarat: user harus sudah login.
    if (!isAuthenticated()) {
      showNotice('Silakan login terlebih dahulu untuk menambah ke wishlist.');
      setTimeout(() => navigate('/login'), 1200);
      return;
    }
    const result = await toggleWishlist(product);
    if (result.removed) {
      showNotice('Dihapus dari wishlist.');
    } else if (result.ok) {
      showNotice('Ditambahkan ke wishlist!');
    } else {
      showNotice('Gagal memperbarui wishlist. Coba lagi.');
    }
  };

  if (error) return <div style={styles.error}>{error}</div>;
  if (!product) return <div style={styles.loading}>Memuat detail produk...</div>;

  const inWishlist = isInWishlist(product.id);
  const loggedIn = isAuthenticated();
  const variantGroups = normalizeVariants(product.variants);
  const unitPrice = variantUnitPrice(product.price, product.variants, selection);
  const selectionComplete = isSelectionComplete(product.variants, selection);

  const handleAddToCart = () => {
    if (!selectionComplete) {
      showNotice('Pilih semua varian terlebih dahulu.');
      return;
    }
    addItem(product, 1, selection);
    showNotice('Ditambahkan ke keranjang!');
  };

  return (
    <div style={styles.wrap}>
      <Link to="/shop" style={styles.backLink}>
        <FiArrowLeft /> Kembali ke Shop
      </Link>

      {notice && <div style={styles.notice}>{notice}</div>}

      <div style={styles.card}>
        <div style={styles.grid}>
          <div style={styles.imageBox}>
            <img src={product.thumbnail} alt={product.title} style={styles.image} />
            {product.discount_percentage > 0 && (
              <span style={styles.discountBadge}>
                -{Math.round(product.discount_percentage)}%
              </span>
            )}
          </div>

          <div style={styles.info}>
            <span style={styles.category}>{product.category}</span>
            <h1 style={styles.title}>{product.title}</h1>

            <div style={styles.ratingRow}>
              <FiStar style={{ color: '#f59e0b', fill: '#f59e0b' }} />
              <span style={styles.ratingText}>{product.rating ?? '-'}</span>
              <span style={styles.brandText}>· {product.brand || 'Premium Brand'}</span>
            </div>

            <p style={styles.desc}>{product.description}</p>

            <div style={styles.priceBox}>
              <span style={styles.priceLabel}>Harga</span>
              <span style={styles.price}>{formatRupiah(unitPrice)}</span>
            </div>

            {variantGroups.length > 0 && (
              <div style={styles.variantWrap}>
                {variantGroups.map((group) => (
                  <div key={group.name} style={styles.variantGroup}>
                    <span style={styles.variantName}>{group.name}</span>
                    <div style={styles.variantOptions}>
                      {group.options.map((opt) => {
                        const active = selection[group.name] === opt.label;
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            style={{
                              ...styles.variantChip,
                              ...(active ? styles.variantChipActive : {}),
                            }}
                            onClick={() =>
                              setSelection((prev) => ({ ...prev, [group.name]: opt.label }))
                            }
                          >
                            {opt.label}
                            {opt.priceDelta > 0 && (
                              <span style={styles.variantDelta}>
                                +{formatRupiah(opt.priceDelta)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={styles.metaGrid}>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Stock</span>
                <span style={styles.metaValue}>{product.stock}</span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>SKU</span>
                <span style={styles.metaValue}>{product.sku || '-'}</span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Diskon</span>
                <span style={styles.metaValue}>{product.discount_percentage ?? 0}%</span>
              </div>
            </div>

            <div style={styles.actions}>
              <button
                style={styles.cartBtn}
                onClick={handleAddToCart}
              >
                <FiShoppingCart size={17} /> Tambah ke Keranjang
              </button>

              <button
                style={{
                  ...styles.wishBtn,
                  ...(inWishlist ? styles.wishBtnActive : {}),
                }}
                onClick={handleWishlist}
                title={
                  loggedIn
                    ? inWishlist
                      ? 'Hapus dari wishlist'
                      : 'Tambah ke wishlist'
                    : 'Login untuk menambah ke wishlist'
                }
              >
                <FiHeart
                  size={17}
                  style={{ fill: inWishlist ? '#dc2626' : 'none' }}
                />
                {inWishlist ? 'Tersimpan di Wishlist' : 'Tambah ke Wishlist'}
              </button>
            </div>

            {!loggedIn && (
              <p style={styles.loginHint}>
                <Link to="/login" style={styles.loginLink}>
                  Login
                </Link>{' '}
                untuk menyimpan produk ke wishlist.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    padding: '48px 24px',
    fontFamily: 'var(--font-family)',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#054C73',
    textDecoration: 'none',
    marginBottom: '20px',
  },
  notice: {
    background: '#f0fdf4',
    color: '#16a34a',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #bbf7d0',
    marginBottom: '16px',
    fontSize: '14px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #f3f4f6',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(260px, 420px) 1fr',
    gap: '32px',
    alignItems: 'start',
  },
  imageBox: {
    position: 'relative',
    background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '340px',
  },
  image: { maxWidth: '100%', maxHeight: '340px', objectFit: 'contain' },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    background: '#ef4444',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    padding: '4px 12px',
    borderRadius: 999,
  },
  info: { display: 'flex', flexDirection: 'column' },
  category: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#054C73',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '8px',
  },
  title: { fontSize: '26px', fontWeight: 700, color: '#1f2937', margin: '0 0 12px' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' },
  ratingText: { fontSize: '14px', fontWeight: 700, color: '#374151' },
  brandText: { fontSize: '13px', color: '#9ca3af' },
  desc: { fontSize: '14px', color: '#6b7280', lineHeight: 1.7, margin: '0 0 24px' },
  priceBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '16px 20px',
    background: '#DFE9F4',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  priceLabel: { fontSize: '12px', color: '#054C73', fontWeight: 600 },
  price: { fontSize: '24px', fontWeight: 800, color: '#054C73' },
  variantWrap: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' },
  variantGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  variantName: { fontSize: '13px', fontWeight: 700, color: '#374151' },
  variantOptions: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  variantChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    background: '#fff',
    color: '#374151',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  variantChipActive: {
    borderColor: '#054C73',
    background: '#DFE9F4',
    color: '#054C73',
  },
  variantDelta: { fontSize: '11px', fontWeight: 600, opacity: 0.8 },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '24px',
  },
  metaItem: {
    background: '#f9fafb',
    padding: '12px',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  metaLabel: {
    fontSize: '11px',
    color: '#9ca3af',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  metaValue: { fontSize: '14px', fontWeight: 700, color: '#1f2937' },
  actions: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  cartBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#054C73',
    color: '#fff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  wishBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
    padding: '12px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  wishBtnActive: {
    borderColor: '#fecaca',
    background: '#fef2f2',
    color: '#dc2626',
  },
  loginHint: { marginTop: '14px', fontSize: '13px', color: '#9ca3af' },
  loginLink: { color: '#054C73', fontWeight: 600, textDecoration: 'none' },
  error: { padding: '48px 24px', color: '#dc2626', textAlign: 'center' },
  loading: { padding: '48px 24px', color: '#667085', textAlign: 'center' },
};
