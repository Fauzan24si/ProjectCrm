import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiSearch } from 'react-icons/fi';
import { getProducts } from '../../services/products';
import { useCart } from '../../context/CartContext';
import { formatRupiah } from '../../lib/membership';
import { getCurrentUser } from '../../services/auth';
import Pagination from '../../components/Pagination';

const PAGE_SIZE = 12;

function Shop() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { items, addItem, totalItems } = useCart();
  const session = getCurrentUser();

  useEffect(() => {
    let active = true;
    getProducts({ limit: 50 })
      .then((data) => {
        if (!active) return;
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = (Array.isArray(products) ? products : []).filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setPage(1);
  }, [search]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <style>{shopStyles}</style>

      <div className="shop-wrap">
        {/* Heading */}
        <div className="shop-head">
          <div>
            <h1 className="shop-title">Shop</h1>
            <p className="shop-subtitle">
              Temukan furnitur pilihan untuk rumah impianmu.
            </p>
          </div>

          <div className="shop-head-actions">
            <div className="shop-search">
              <FiSearch className="shop-search-icon" size={16} />
              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              className="shop-cart-btn"
              onClick={() => navigate(session ? '/member/cart' : '/login')}
            >
              <FiShoppingCart size={18} />
              <span>Keranjang</span>
              {totalItems > 0 && <span className="shop-cart-badge">{totalItems}</span>}
            </button>
          </div>
        </div>

        {error && <div className="shop-error">Gagal memuat produk: {error}</div>}

        {/* Grid produk */}
        <div className="shop-grid">
          {loading &&
            [...Array(8)].map((_, i) => (
              <div key={`sk-${i}`} className="shop-card shop-card--skeleton">
                <div className="shop-skel-img" />
                <div className="shop-skel-line" />
                <div className="shop-skel-line short" />
              </div>
            ))}

          {!loading &&
            paged.map((p) => (
              <div
                key={p.id}
                className="shop-card"
                onClick={() => navigate(`/shop/${p.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="shop-card-img">
                  <img src={p.thumbnail} alt={p.title} loading="lazy" />
                  {p.discount_percentage > 0 && (
                    <span className="shop-badge">-{Math.round(p.discount_percentage)}%</span>
                  )}
                </div>
                <div className="shop-card-body">
                  <span className="shop-card-cat">{p.category}</span>
                  <h3 className="shop-card-title">{p.title}</h3>
                  <div className="shop-card-foot">
                    <span className="shop-card-price">{formatRupiah(p.price)}</span>
                    <button
                      className="shop-add-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Produk dengan varian harus dipilih dulu di halaman detail.
                        if (Array.isArray(p.variants) && p.variants.length > 0) {
                          navigate(`/shop/${p.id}`);
                        } else {
                          addItem(p);
                        }
                      }}
                      title="Tambah ke keranjang"
                    >
                      <FiShoppingCart size={15} />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {!loading && !error && filtered.length === 0 && (
          <div className="shop-empty">Tidak ada produk yang cocok dengan pencarian.</div>
        )}

        {!loading && filtered.length > 0 && (
          <Pagination
            currentPage={page}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>
    </>
  );
}

const shopStyles = `
  .shop-wrap {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 48px 24px;
    font-family: var(--font-family);
  }

  .shop-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 32px;
  }

  .shop-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 4px;
  }

  .shop-subtitle {
    font-size: 15px;
    color: var(--text-light);
    margin: 0;
  }

  .shop-head-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .shop-search { position: relative; }
  .shop-search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
  }
  .shop-search input {
    padding: 10px 16px 10px 40px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    font-size: 14px;
    outline: none;
    width: 240px;
    font-family: inherit;
  }
  .shop-search input:focus { border-color: var(--primary); }

  .shop-cart-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--primary);
    color: #fff;
    border: none;
    padding: 11px 18px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
  }

  .shop-cart-badge {
    background: #ef4444;
    color: #fff;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    min-width: 18px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
  }

  .shop-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  @media (max-width: 1024px) { .shop-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 768px)  { .shop-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 480px)  { .shop-grid { grid-template-columns: 1fr; } }

  .shop-card {
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 14px;
    overflow: hidden;
    transition: box-shadow 0.2s, transform 0.2s;
    display: flex;
    flex-direction: column;
  }
  .shop-card:hover {
    box-shadow: 0 10px 24px rgba(16, 24, 40, 0.08);
    transform: translateY(-3px);
  }

  .shop-card-img {
    position: relative;
    aspect-ratio: 1 / 1;
    background: #f7f7f8;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .shop-card-img img { width: 100%; height: 100%; object-fit: cover; }

  .shop-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: #ef4444;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 999px;
  }

  .shop-card-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
  }
  .shop-card-cat {
    font-size: 11px;
    font-weight: 700;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .shop-card-title {
    font-size: 15px;
    font-weight: 600;
    color: #101828;
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 42px;
  }
  .shop-card-foot {
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;
  }
  .shop-card-price { font-size: 18px; font-weight: 700; color: #101828; }
  .shop-add-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--text-dark);
    color: #fff;
    border: none;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: opacity 0.2s;
  }
  .shop-add-btn:hover { opacity: 0.85; }

  .shop-error {
    background: #fef2f2;
    color: #dc2626;
    padding: 14px 16px;
    border-radius: 8px;
    border: 1px solid #fecaca;
    margin-bottom: 16px;
  }
  .shop-empty { text-align: center; padding: 60px 0; color: #667085; }

  .shop-card--skeleton { padding: 0; }
  .shop-skel-img {
    aspect-ratio: 1 / 1;
    background: #f0f0f2;
    animation: shopPulse 1.5s infinite;
  }
  .shop-skel-line {
    height: 14px;
    margin: 14px 16px 0;
    border-radius: 6px;
    background: #f0f0f2;
    animation: shopPulse 1.5s infinite;
  }
  .shop-skel-line.short { width: 50%; margin-bottom: 16px; }
  @keyframes shopPulse { 50% { opacity: 0.5; } }
`;

export default Shop;

