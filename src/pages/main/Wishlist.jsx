import { Link } from 'react-router-dom';
import { FiHeart, FiTrash2, FiShoppingCart, FiShoppingBag } from 'react-icons/fi';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatRupiah } from '../../lib/membership';

function Wishlist() {
  const { items, removeFromWishlist, clearWishlist, totalItems } = useWishlist();
  const { addItem } = useCart();

  return (
    <>
      <style>{wishlistStyles}</style>
      <div className="wl-wrap">
        <div className="wl-head">
          <div>
            <h1 className="wl-title">
              <FiHeart style={{ color: '#dc2626' }} /> Wishlist
            </h1>
            <p className="wl-subtitle">
              {totalItems > 0
                ? `${totalItems} produk tersimpan untuk dibeli nanti.`
                : 'Belum ada produk yang disimpan.'}
            </p>
          </div>
          {totalItems > 0 && (
            <button className="wl-clear" onClick={clearWishlist}>
              Kosongkan wishlist
            </button>
          )}
        </div>

        {totalItems === 0 ? (
          <div className="wl-empty">
            <FiHeart size={48} className="wl-empty-icon" />
            <p className="wl-empty-text">Wishlist kamu masih kosong.</p>
            <Link to="/shop" className="wl-empty-btn">
              <FiShoppingBag size={16} /> Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="wl-grid">
            {items.map((p) => (
              <div key={p.id} className="wl-card">
                <Link to={`/shop/${p.id}`} className="wl-card-img">
                  <img src={p.thumbnail} alt={p.title} loading="lazy" />
                </Link>
                <div className="wl-card-body">
                  {p.category && <span className="wl-card-cat">{p.category}</span>}
                  <Link to={`/shop/${p.id}`} className="wl-card-title">
                    {p.title}
                  </Link>
                  <div className="wl-card-foot">
                    <span className="wl-card-price">{formatRupiah(p.price)}</span>
                  </div>
                  <div className="wl-card-actions">
                    <button
                      className="wl-add-cart"
                      onClick={() => addItem(p)}
                      title="Tambah ke keranjang"
                    >
                      <FiShoppingCart size={15} /> Keranjang
                    </button>
                    <button
                      className="wl-remove"
                      onClick={() => removeFromWishlist(p.id)}
                      title="Hapus dari wishlist"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const wishlistStyles = `
  .wl-wrap { font-family: 'Lato', sans-serif; }

  .wl-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 28px;
  }

  .wl-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 26px;
    font-weight: 700;
    color: #101828;
    margin: 0 0 4px;
  }

  .wl-subtitle { margin: 0; font-size: 14px; color: #667085; }

  .wl-clear {
    background: none;
    border: 1px solid #eaecf0;
    color: #667085;
    padding: 9px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
  }
  .wl-clear:hover { color: #dc2626; border-color: #fecaca; background: #fef2f2; }

  .wl-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
  }

  .wl-card {
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .wl-card:hover {
    box-shadow: 0 10px 24px rgba(16, 24, 40, 0.08);
    transform: translateY(-3px);
  }

  .wl-card-img {
    aspect-ratio: 1 / 1;
    background: #f7f7f8;
    display: block;
    overflow: hidden;
  }
  .wl-card-img img { width: 100%; height: 100%; object-fit: cover; }

  .wl-card-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
  }

  .wl-card-cat {
    font-size: 11px;
    font-weight: 700;
    color: #054C73;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .wl-card-title {
    font-size: 15px;
    font-weight: 600;
    color: #101828;
    text-decoration: none;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 42px;
  }
  .wl-card-title:hover { color: #054C73; }

  .wl-card-foot { margin-top: auto; padding-top: 4px; }
  .wl-card-price { font-size: 18px; font-weight: 700; color: #101828; }

  .wl-card-actions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }

  .wl-add-cart {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: #054C73;
    color: #fff;
    border: none;
    padding: 9px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
  }
  .wl-add-cart:hover { opacity: 0.9; }

  .wl-remove {
    background: #fff;
    border: 1px solid #eaecf0;
    color: #98a2b3;
    border-radius: 8px;
    padding: 0 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  .wl-remove:hover { color: #dc2626; border-color: #fecaca; background: #fef2f2; }

  .wl-empty {
    text-align: center;
    padding: 60px 20px;
    background: #fff;
    border: 1px dashed #eaecf0;
    border-radius: 14px;
  }
  .wl-empty-icon { color: #d0d5dd; margin-bottom: 12px; }
  .wl-empty-text { color: #667085; margin: 0 0 20px; font-size: 15px; }
  .wl-empty-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #054C73;
    color: #fff;
    padding: 11px 20px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
  }
`;

export default Wishlist;
