import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiSearch, FiMoreVertical } from 'react-icons/fi';
import Card from '../../Reusable/Card';
import Button from '../../Reusable/Button';
import SelectField from '../../Reusable/SelectField';
import { Skeleton } from '@/components/ui/skeleton';

function Produk() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    axios
      .get('https://dummyjson.com/products?limit=30')
      .then((response) => {
        if (response.status !== 200) {
          setError(response.message);
          return;
        }
        setProducts(response.data.products);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products
    .filter(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return 0;
    });

  if (error) {
    return (
      <Card style={styles.errorCardOverride}>
        <div style={styles.errorIcon}>
          <span style={{ fontSize: '32px', fontWeight: 900 }}>!</span>
        </div>
        <h2 style={styles.errorTitle}>Terjadi Kesalahan</h2>
        <p style={styles.errorMessage}>{error}</p>
        <Button variant="admin" onClick={() => window.location.reload()}>
          Coba Lagi
        </Button>
      </Card>
    );
  }

  return (
    <>
      {/* Page title selaras dengan halaman admin lain */}
      <div style={styles.titleRow}>
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle" style={{ margin: 0 }}>
            Kelola katalog produk toko furniture kamu
          </p>
        </div>

        <div style={styles.searchWrapper}>
          <FiSearch style={styles.searchIcon} size={16} />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.filterRow}>
        <div style={{ minWidth: 180 }}>
          <SelectField
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'default', label: 'Urutan default' },
              { value: 'name', label: 'Nama A-Z' },
              { value: 'price-asc', label: 'Harga termurah' },
              { value: 'price-desc', label: 'Harga termahal' },
            ]}
          />
        </div>
        <div style={styles.countBadge}>
          {loading ? 'Menyiapkan katalog...' : `Menampilkan ${filteredProducts.length} produk`}
        </div>
      </div>

      {loading ? (
        <div className="produk-grid" style={styles.grid}>
          {[...Array(8)].map((_, index) => (
            <div key={index} style={styles.skeletonCard}>
              <Skeleton style={{ width: '100%', height: '200px', borderRadius: 0 }} />
              <div style={styles.skeletonContent}>
                <Skeleton style={{ width: '40%', height: '12px' }} />
                <Skeleton style={{ width: '80%', height: '16px' }} />
                <Skeleton style={{ width: '60%', height: '14px' }} />
                <div style={styles.skeletonFooter}>
                  <Skeleton style={{ width: '35%', height: '20px' }} />
                  <Skeleton style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="produk-grid" style={styles.grid}>
          {filteredProducts.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <Card style={styles.emptyStateOverride}>
          <div style={styles.emptyIcon}>
            <FiSearch size={40} />
          </div>
          <h3 style={styles.emptyTitle}>Produk tidak ditemukan</h3>
          <p style={styles.emptyText}>
            Maaf, kami tidak dapat menemukan produk yang sesuai dengan pencarian Anda.
          </p>
          <Button
            variant="admin"
            onClick={() => setSearchTerm('')}
            style={styles.emptyButtonOverride}
          >
            Hapus Pencarian
          </Button>
        </Card>
      )}
    </>
  );
}

/* ─── Product Card Component ─── */
function ProductCard({ item }) {
  const [hovered, setHovered] = useState(false);

  // Mock avatars based on item data to mimic the image
  const avatars = [
    `https://ui-avatars.com/api/?name=${item.title.charAt(0)}&background=random&color=fff&size=24`,
    `https://ui-avatars.com/api/?name=${item.brand?.charAt(0) || 'B'}&background=random&color=fff&size=24`,
    `https://ui-avatars.com/api/?name=${item.category?.charAt(0) || 'C'}&background=random&color=fff&size=24`,
  ];

  return (
    <Link
      to={`/products/${item.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Card
        style={{
          ...styles.cardWidget,
          ...(hovered ? styles.cardWidgetHover : {}),
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
      {/* Top Header */}
      <div style={styles.cwHeader}>
        <div style={styles.cwIconBox}>
          <img src={item.thumbnail} alt={item.title} style={styles.cwIconImg} loading="lazy" />
        </div>
        <div style={styles.cwTitleArea}>
          <h3 style={styles.cwTitle}>{item.title}</h3>
          <div style={styles.cwAvatars}>
            {avatars.map((url, idx) => (
              <img key={idx} src={url} alt="avatar" style={{
                ...styles.cwAvatarImg,
                marginLeft: idx === 0 ? 0 : '-6px',
                zIndex: 3 - idx
              }} />
            ))}
            <div style={{
               ...styles.cwAvatarImg,
               marginLeft: '-6px',
               zIndex: 0,
               background: '#f2f4f7',
               color: '#667085',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: '8px',
               fontWeight: 'bold'
            }}>
               +{Math.floor(item.rating * 10)}
            </div>
          </div>
        </div>
        <div style={styles.cwMenu}>
          <FiMoreVertical size={16} />
        </div>
      </div>

      {/* Description */}
      <p style={styles.cwDesc}>
        {item.description}
      </p>

      {/* Divider */}
      <hr style={styles.cwDivider} />

      {/* Footer stats */}
      <div style={styles.cwFooter}>
        <div style={styles.cwStatLeft}>
          <span style={styles.cwVal}>{item.stock}</span>
          <span style={styles.cwLbl}>In Stock</span>
        </div>
        <div style={styles.cwStatRight}>
          <span style={styles.cwVal}>${item.price}</span>
          <span style={styles.cwLbl}>Price</span>
        </div>
      </div>
      </Card>
    </Link>
  );
}

/* ─── Styles (khusus konten, tidak ada page shell) ─── */
const styles = {
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },

  searchWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '320px',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#89868D',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px 10px 40px',
    background: '#fff',
    border: '1px solid #EDEDF0',
    borderRadius: '10px',
    outline: 'none',
    fontSize: '14px',
    fontWeight: 500,
    color: '#3A3541',
    fontFamily: 'inherit',
  },

  countBadge: {
    display: 'inline-block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#89868D',
    background: '#fff',
    padding: '8px 14px',
    borderRadius: '10px',
    border: '1px solid #EDEDF0',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },

  /* Grid */
  grid: {
    display: 'grid',
    gap: '20px',
  },

  /* Widget Card Theme — di-merge ke <Card> */
  cardWidget: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #eaecf0',
    boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  cardWidgetHover: {
    boxShadow: '0 6px 16px rgba(16, 24, 40, 0.08)',
    borderColor: '#d0d5dd',
    transform: 'translateY(-2px)',
  },
  cwHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  cwIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    background: '#1d1d21',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  cwIconImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cwTitleArea: {
    flexGrow: 1,
    marginLeft: '12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
  },
  cwTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#344054',
    margin: '0 0 6px 0',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cwAvatars: {
    display: 'flex',
    alignItems: 'center',
  },
  cwAvatarImg: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '1.5px solid #fff',
    objectFit: 'cover',
  },
  cwMenu: {
    color: '#98a2b3',
    padding: '4px',
    cursor: 'pointer',
    marginRight: '-4px',
    marginTop: '-4px',
  },
  cwDesc: {
    fontSize: '13px',
    color: '#667085',
    lineHeight: 1.5,
    margin: '0 0 16px 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    minHeight: '39px',
  },
  cwDivider: {
    border: 'none',
    borderTop: '1px solid #eaecf0',
    margin: '0 0 16px 0',
  },
  cwFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cwStatLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  cwStatRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  cwVal: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#101828',
    marginBottom: '2px',
  },
  cwLbl: {
    fontSize: '11px',
    color: '#98a2b3',
    fontWeight: 500,
  },

  /* Skeleton */
  skeletonCard: {
    background: '#fff',
    borderRadius: '14px',
    overflow: 'hidden',
    border: '1px solid #EDEDF0',
  },
  skeletonImage: {
    width: '100%',
    height: '200px',
    background: 'linear-gradient(110deg, #F0EAFA 30%, #EDE4F9 50%, #F0EAFA 70%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
  skeletonContent: {
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  skeletonLine: {
    height: '14px',
    background: '#F0EAFA',
    borderRadius: '6px',
  },
  skeletonFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
    paddingTop: '14px',
    borderTop: '1px solid #F0EAFA',
  },

  /* Error — wrapping Card override */
  errorCardOverride: {
    padding: '40px',
    borderRadius: '14px',
    boxShadow: '0 2px 8px rgba(110,57,203,0.06)',
    textAlign: 'center',
    maxWidth: '400px',
    margin: '40px auto',
    border: '1px solid #EDEDF0',
  },
  errorIcon: {
    width: '64px',
    height: '64px',
    background: '#FDECEA',
    color: '#C62828',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  errorTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#3A3541',
    margin: '0 0 8px',
  },
  errorMessage: {
    fontSize: '14px',
    color: '#89868D',
    margin: '0 0 24px',
  },

  /* Empty State — wrapping Card override */
  emptyStateOverride: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 16px',
    textAlign: 'center',
    borderRadius: '14px',
    border: '1px solid #EDEDF0',
  },
  emptyIcon: {
    width: '80px',
    height: '80px',
    background: '#EDE4F9',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#C2A1FD',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#3A3541',
    margin: '0 0 8px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#89868D',
    maxWidth: '400px',
    margin: '0 0 24px',
  },
  emptyButtonOverride: {
    padding: '10px 24px',
    background: '#EDE4F9',
    color: '#6E39CB',
    fontWeight: 700,
    borderRadius: '10px',
  },
};

/* Shimmer + responsive grid */
if (typeof document !== 'undefined' && !document.querySelector('[data-produk-styles]')) {
  const styleSheet = document.createElement('style');
  styleSheet.setAttribute('data-produk-styles', '');
  styleSheet.textContent = `
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .produk-grid { grid-template-columns: repeat(4, 1fr); }
    @media (max-width: 1200px) { .produk-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 900px)  { .produk-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 520px)  { .produk-grid { grid-template-columns: 1fr; } }
  `;
  document.head.appendChild(styleSheet);
}

export default Produk;
