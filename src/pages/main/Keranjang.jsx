import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowLeft,
  FiCheckCircle,
} from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { formatRupiah } from '../../lib/membership';
import { getCurrentUser } from '../../services/auth';
import { getUser } from '../../services/users';
import { createTransaction } from '../../services/payment';

function Keranjang() {
  const { items, updateQty, removeItem, clearCart, totalItems, totalPrice } =
    useCart();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type, message }

  const session = getCurrentUser();
  const isGuest = !session;

  const handleCheckout = async () => {
    // Wajib login untuk melakukan order.
    if (!session) {
      navigate('/login', { state: { from: '/member/cart' } });
      return;
    }

    setProcessing(true);
    setFeedback(null);

    try {
      // Ambil data alamat & no HP penerima dari profil.
      const profile = await getUser(session.id);
      if (!profile?.address || !profile?.phone) {
        setProcessing(false);
        setFeedback({
          type: 'error',
          message: 'Lengkapi alamat & no HP penerima di menu Alamat sebelum checkout.',
        });
        return;
      }

      const customer = {
        id: session?.id || null,
        name: session?.name || 'Guest',
        email: session?.email || '',
        phone: profile.phone,
        address: profile.address,
      };

      // Konfirmasi pesanan: buat invoice (order pending) di server.
      const { orderId } = await createTransaction({ items, customer });
      sessionStorage.setItem('last_order_id', orderId);
      clearCart();
      setProcessing(false);
      // Order masih pending: arahkan ke halaman konfirmasi pembayaran.
      navigate(`/payment/confirm?order_id=${orderId}`);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
      setProcessing(false);
    }
  };

  return (
    <>
      <style>{cartStyles}</style>
      <div className="cart-wrap">
        <div className="cart-header">
          <div>
            <h1 className="cart-title">Keranjang Saya</h1>
            <p className="cart-subtitle">
              {totalItems > 0
                ? `${totalItems} item dalam keranjang`
                : 'Keranjang Anda masih kosong'}
            </p>
          </div>
          {items.length > 0 && (
            <button className="cart-clear" onClick={clearCart}>
              <FiTrash2 /> Kosongkan
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <FiShoppingCart size={40} />
            <p>Belum ada produk di keranjang.</p>
            <Link to="/shop" className="cart-empty-btn">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Daftar item */}
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.key} className="cart-item">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <h4>{item.title}</h4>
                    {item.variant && (
                      <span className="cart-item-variant">{item.variant}</span>
                    )}
                    <span className="cart-item-price">
                      {formatRupiah(item.price)}
                    </span>
                  </div>

                  <div className="cart-qty">
                    <button
                      onClick={() => updateQty(item.key, item.qty - 1)}
                      aria-label="Kurangi"
                    >
                      <FiMinus size={14} />
                    </button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.key, item.qty + 1)}
                      aria-label="Tambah"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>

                  <div className="cart-item-subtotal">
                    {formatRupiah(item.price * item.qty)}
                  </div>

                  <button
                    className="cart-item-remove"
                    onClick={() => removeItem(item.key)}
                    aria-label="Hapus item"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}

              <button className="cart-back" onClick={() => navigate('/shop')}>
                <FiArrowLeft /> Lanjut belanja
              </button>
            </div>

            {/* Ringkasan */}
            <div className="cart-summary">
              <h3>Ringkasan Belanja</h3>
              <div className="summary-row">
                <span>Total Item</span>
                <span>{totalItems}</span>
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatRupiah(totalPrice)}</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>{formatRupiah(totalPrice)}</span>
              </div>

              {isGuest && (
                <p className="summary-guest-note">
                  Anda harus <Link to="/login">masuk</Link> terlebih dahulu untuk
                  melakukan order.
                </p>
              )}

              {feedback && (
                <div className={`summary-feedback summary-feedback-${feedback.type}`}>
                  {feedback.type === 'success' && <FiCheckCircle />}
                  <span>{feedback.message}</span>
                </div>
              )}

              <button
                className="cart-checkout"
                onClick={handleCheckout}
                disabled={processing}
              >
                {processing
                  ? 'Memproses...'
                  : isGuest
                    ? 'Masuk untuk Checkout'
                    : 'Konfirmasi Pesanan'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const cartStyles = `
  .cart-wrap { font-family: 'Lato', sans-serif; }
  .cart-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    gap: 16px;
    flex-wrap: wrap;
  }
  .cart-title { margin: 0; font-size: 26px; font-weight: 700; color: #101828; }
  .cart-subtitle { margin: 4px 0 0; font-size: 14px; color: #667085; }
  .cart-clear {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid #fecdca;
    color: #b42318;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;
  }
  .cart-clear:hover { background: #fef3f2; }

  .cart-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 64px 16px;
    color: #98a2b3;
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 16px;
    text-align: center;
  }
  .cart-empty p { margin: 0; font-size: 15px; }
  .cart-empty-btn {
    margin-top: 8px;
    padding: 10px 24px;
    background: #101828;
    color: #fff;
    border-radius: 8px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
  }

  .cart-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 24px;
    align-items: start;
  }
  @media (max-width: 860px) {
    .cart-layout { grid-template-columns: 1fr; }
  }

  .cart-items {
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 16px;
    padding: 8px 20px;
  }
  .cart-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 18px 0;
    border-bottom: 1px solid #f3f4f6;
  }
  .cart-item:last-of-type { border-bottom: none; }
  .cart-item-img {
    width: 64px;
    height: 64px;
    border-radius: 10px;
    object-fit: cover;
    background: #f3f4f6;
    flex-shrink: 0;
  }
  .cart-item-info { flex: 1; min-width: 0; }
  .cart-item-info h4 {
    margin: 0 0 4px;
    font-size: 15px;
    font-weight: 600;
    color: #101828;
  }
  .cart-item-price { font-size: 13px; color: #667085; }
  .cart-item-variant { display: block; font-size: 12px; color: #98a2b3; margin: 2px 0; }

  .cart-qty {
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid #d0d5dd;
    border-radius: 8px;
    padding: 4px;
  }
  .cart-qty button {
    width: 28px;
    height: 28px;
    border: none;
    background: #f9fafb;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #344054;
    transition: background 0.15s;
  }
  .cart-qty button:hover { background: #f3f4f6; }
  .cart-qty span { min-width: 20px; text-align: center; font-size: 14px; font-weight: 600; color: #101828; }

  .cart-item-subtotal {
    font-size: 15px;
    font-weight: 700;
    color: #101828;
    min-width: 110px;
    text-align: right;
  }
  .cart-item-remove {
    background: transparent;
    border: none;
    color: #98a2b3;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: flex;
    transition: background 0.15s, color 0.15s;
  }
  .cart-item-remove:hover { background: #fef3f2; color: #b42318; }

  .cart-back {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: none;
    color: #101828;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    padding: 16px 0 8px;
    font-family: inherit;
  }

  .cart-summary {
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 16px;
    padding: 24px;
    position: sticky;
    top: 24px;
  }
  .cart-summary h3 {
    margin: 0 0 18px;
    font-size: 16px;
    font-weight: 700;
    color: #101828;
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #475467;
    margin-bottom: 12px;
  }
  .summary-divider {
    height: 1px;
    background: #f3f4f6;
    margin: 8px 0 16px;
  }
  .summary-total {
    font-size: 18px;
    font-weight: 700;
    color: #101828;
  }
  .cart-checkout {
    width: 100%;
    margin-top: 20px;
    padding: 12px;
    background: #101828;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
    font-family: inherit;
  }
  .cart-checkout:hover { background: #000000; }
  .cart-checkout:disabled { opacity: 0.6; cursor: not-allowed; }

  .summary-guest-note {
    margin: 16px 0 0;
    font-size: 12px;
    color: #667085;
    line-height: 1.5;
  }
  .summary-guest-note a { color: #101828; font-weight: 600; }

  .summary-feedback {
    margin-top: 16px;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .summary-feedback-success { background: #ecfdf3; color: #067647; border: 1px solid #abefc6; }
  .summary-feedback-pending { background: #fffaeb; color: #b54708; border: 1px solid #fedf89; }
  .summary-feedback-error { background: #fef3f2; color: #b42318; border: 1px solid #fecdca; }
`;

export default Keranjang;
