import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import ProductSection from '../Reusable/ProductSection';
import { getFeaturedProducts } from '../services/products';
import { useCart } from '../context/CartContext';
import { formatRupiah } from '../lib/membership';

/**
 * Section landing: Produk Unggulan / Terbaru (dinamis dari Supabase).
 * Menampilkan grid kartu produk: thumbnail, harga, badge diskon,
 * tombol Add to Cart, dan link ke halaman detail produk.
 *
 * Catatan: produk dengan varian diarahkan ke halaman detail untuk memilih
 * varian dulu (selaras dengan perilaku katalog Shop).
 */
const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getFeaturedProducts(8)
      .then((data) => {
        if (active) setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Jangan render section bila tidak ada produk (hindari blok kosong).
  if (!loading && products.length === 0) return null;

  return (
    <ProductSection style={styles.section}>
      <div className="container">
        <h2 className="section-title">Produk Unggulan</h2>
        <p className="section-subtitle">
          Koleksi pilihan terbaru kami yang siap mempercantik hunian Anda.
        </p>

        <div style={styles.grid}>
          {loading
            ? [...Array(4)].map((_, i) => (
                <div key={`sk-${i}`} style={styles.card}>
                  <div style={{ ...styles.imageWrapper, ...styles.skeleton }} />
                  <div style={{ ...styles.skelLine, width: '70%' }} />
                  <div style={{ ...styles.skelLine, width: '40%' }} />
                </div>
              ))
            : products.map((p) => {
                const hasDiscount = Number(p.discount_percentage) > 0;
                const hasVariants =
                  Array.isArray(p.variants) && p.variants.length > 0;
                return (
                  <div
                    key={p.id}
                    style={styles.card}
                    onClick={() => navigate(`/shop/${p.id}`)}
                  >
                    <div style={styles.imageWrapper}>
                      <img src={p.thumbnail} alt={p.title} style={styles.image} />
                      {hasDiscount && (
                        <span style={styles.badge}>
                          -{Math.round(p.discount_percentage)}%
                        </span>
                      )}
                    </div>
                    <div style={styles.body}>
                      <span style={styles.category}>{p.category}</span>
                      <h3 style={styles.title}>{p.title}</h3>
                      <div style={styles.foot}>
                        <span style={styles.price}>{formatRupiah(p.price)}</span>
                        <button
                          style={styles.addBtn}
                          title="Tambah ke keranjang"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hasVariants) {
                              navigate(`/shop/${p.id}`);
                            } else {
                              addItem(p);
                            }
                          }}
                        >
                          <FiShoppingCart size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </ProductSection>
  );
};

const styles = {
  section: {
    padding: '80px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    marginTop: '40px',
  },
  card: {
    background: 'var(--bg-card)',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    cursor: 'pointer',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '240px',
    overflow: 'hidden',
    background: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    background: '#ef4444',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 999,
  },
  body: {
    padding: '16px',
  },
  category: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-light)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-dark)',
    margin: '6px 0 14px',
  },
  foot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--primary)',
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
  skeleton: {
    background: 'linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6)',
  },
  skelLine: {
    height: '12px',
    borderRadius: '6px',
    background: '#eef0f3',
    margin: '12px 0 0 16px',
  },
};

export default FeaturedProducts;
