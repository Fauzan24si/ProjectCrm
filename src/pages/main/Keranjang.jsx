import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowLeft,
  FiCheckCircle,
  FiTag,
  FiMapPin,
  FiPhone,
  FiEdit2,
  FiSave,
} from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { formatRupiah } from '../../lib/membership';
import { getCurrentUser } from '../../services/auth';
import { getUser, updateUser } from '../../services/users';
import { getUserVouchers } from '../../services/vouchers';
import { calculateDiscount, isVoucherEligible } from '../../lib/vouchers';
import { createTransaction } from '../../services/payment';

function Keranjang() {
  const { items, updateQty, removeItem, clearCart, totalItems, totalPrice } =
    useCart();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [selectedUv, setSelectedUv] = useState(null);

  // Alamat & no HP
  const [profile, setProfile] = useState(null);
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ address: '', phone: '' });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState(null);
  const [addressSaved, setAddressSaved] = useState(false);

  const session = getCurrentUser();
  const isGuest = !session;

  // Load profil user (alamat & no HP)
  useEffect(() => {
    if (!session) return;
    let active = true;
    getUser(session.id).then((data) => {
      if (!active) return;
      setProfile(data);
      setAddressForm({ address: data?.address || '', phone: data?.phone || '' });
      // Kalau belum ada alamat, langsung buka form edit
      if (!data?.address || !data?.phone) setEditingAddress(true);
    });
    return () => { active = false; };
  }, [session?.id]);

  // Load voucher user
  useEffect(() => {
    if (!session) return;
    let active = true;
    getUserVouchers(session.id)
      .then((data) => { if (active) setVouchers(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setVouchers([]); });
    return () => { active = false; };
  }, [session?.id]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
    setAddressError(null);
    setAddressSaved(false);
  };

  const handleSaveAddress = async () => {
    const phoneDigits = addressForm.phone.replace(/\D/g, '');
    if (!addressForm.address.trim()) {
      setAddressError('Alamat tidak boleh kosong.');
      return;
    }
    if (phoneDigits.length < 8) {
      setAddressError('Nomor HP minimal 8 digit.');
      return;
    }
    setSavingAddress(true);
    setAddressError(null);
    try {
      const updated = await updateUser(session.id, {
        address: addressForm.address.trim(),
        phone: addressForm.phone.trim(),
      });
      setProfile(updated);
      setEditingAddress(false);
      setAddressSaved(true);
      setTimeout(() => setAddressSaved(false), 3000);
    } catch (err) {
      setAddressError(err.message || 'Gagal menyimpan alamat.');
    } finally {
      setSavingAddress(false);
    }
  };

  const selectedVoucher = selectedUv ? selectedUv.vouchers : null;
  const discount = selectedVoucher
    ? calculateDiscount(selectedVoucher, totalPrice)
    : 0;
  const grandTotal = Math.max(totalPrice - discount, 0);

  const handleCheckout = async () => {
    if (!session) {
      navigate('/login', { state: { from: '/member/cart' } });
      return;
    }

    if (!profile?.address || !profile?.phone) {
      setFeedback({
        type: 'error',
        message: 'Lengkapi alamat & no HP pengiriman sebelum checkout.',
      });
      setEditingAddress(true);
      return;
    }

    setProcessing(true);
    setFeedback(null);

    try {
      const customer = {
        id: session?.id || null,
        name: session?.name || 'Guest',
        email: session?.email || '',
        phone: profile.phone,
        address: profile.address,
      };

      const voucher = selectedUv ? { userVoucherId: selectedUv.id } : null;
      const { orderId } = await createTransaction({ items, customer, voucher });
      sessionStorage.setItem('last_order_id', orderId);
      clearCart();
      setProcessing(false);
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

              {/* Alamat & No HP — hanya untuk member login */}
              {!isGuest && (
                <div className="cart-address-box">
                  <div className="cart-address-header">
                    <span className="cart-address-label">
                      <FiMapPin size={13} /> Alamat Pengiriman
                    </span>
                    {!editingAddress && profile?.address && (
                      <button
                        type="button"
                        className="cart-address-edit-btn"
                        onClick={() => setEditingAddress(true)}
                      >
                        <FiEdit2 size={12} /> Ubah
                      </button>
                    )}
                  </div>

                  {editingAddress ? (
                    <div className="cart-address-form">
                      <textarea
                        name="address"
                        rows={3}
                        value={addressForm.address}
                        onChange={handleAddressChange}
                        placeholder="Alamat lengkap pengiriman"
                        className="cart-address-textarea"
                      />
                      <div className="cart-address-phone-row">
                        <FiPhone size={13} />
                        <input
                          name="phone"
                          type="tel"
                          value={addressForm.phone}
                          onChange={handleAddressChange}
                          placeholder="No HP penerima"
                          className="cart-address-input"
                        />
                      </div>
                      {addressError && (
                        <p className="cart-address-error">{addressError}</p>
                      )}
                      <div className="cart-address-actions">
                        {profile?.address && (
                          <button
                            type="button"
                            className="cart-address-cancel"
                            onClick={() => {
                              setAddressForm({ address: profile.address || '', phone: profile.phone || '' });
                              setEditingAddress(false);
                              setAddressError(null);
                            }}
                          >
                            Batal
                          </button>
                        )}
                        <button
                          type="button"
                          className="cart-address-save"
                          onClick={handleSaveAddress}
                          disabled={savingAddress}
                        >
                          {savingAddress ? (
                            <>
                              <div className="cart-btn-spinner"></div>
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <FiSave size={13} />
                              Simpan
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="cart-address-display">
                      <p className="cart-address-text">{profile?.address}</p>
                      <p className="cart-address-phone">
                        <FiPhone size={12} /> {profile?.phone}
                      </p>
                    </div>
                  )}

                  {addressSaved && (
                    <p className="cart-address-saved">
                      <FiCheckCircle size={13} /> Alamat tersimpan.
                    </p>
                  )}
                </div>
              )}

              <div className="summary-row">
                <span>Total Item</span>
                <span>{totalItems}</span>
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatRupiah(totalPrice)}</span>
              </div>

              {/* Pilih voucher (hanya member login yang punya voucher) */}
              {!isGuest && vouchers.length > 0 && (
                <div className="cart-voucher">
                  <span className="cart-voucher-label">
                    <FiTag size={13} /> Voucher
                  </span>
                  <div className="cart-voucher-list">
                    {vouchers.map((uv) => {
                      const v = uv.vouchers;
                      if (!v) return null;
                      const eligible = isVoucherEligible(v, totalPrice);
                      const active = selectedUv?.id === uv.id;
                      return (
                        <button
                          key={uv.id}
                          type="button"
                          className={`voucher-chip ${active ? 'active' : ''}`}
                          disabled={!eligible}
                          title={
                            eligible
                              ? v.description || v.title
                              : `Min. belanja ${formatRupiah(v.min_purchase)}`
                          }
                          onClick={() => setSelectedUv(active ? null : uv)}
                        >
                          <span className="voucher-chip-title">{v.title}</span>
                          {!eligible && (
                            <span className="voucher-chip-note">
                              min {formatRupiah(v.min_purchase)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {discount > 0 && (
                <div className="summary-row summary-discount">
                  <span>Diskon</span>
                  <span>- {formatRupiah(discount)}</span>
                </div>
              )}

              <div className="summary-divider" />
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>{formatRupiah(grandTotal)}</span>
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
                {processing ? (
                  <span className="cart-btn-loading">
                    <div className="cart-btn-spinner"></div>
                    Memproses...
                  </span>
                ) : isGuest ? (
                  'Masuk untuk Checkout'
                ) : (
                  'Konfirmasi Pesanan'
                )}
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
  .summary-discount { color: #067647; font-weight: 600; }

  .cart-address-box {
    background: #f9fafb;
    border: 1px solid #eaecf0;
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 16px;
  }
  .cart-address-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .cart-address-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #667085;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .cart-address-edit-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: 1px solid #d0d5dd;
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 500;
    color: #344054;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;
  }
  .cart-address-edit-btn:hover { background: #f3f4f6; }

  .cart-address-display { display: flex; flex-direction: column; gap: 4px; }
  .cart-address-text { margin: 0; font-size: 13px; color: #101828; line-height: 1.5; }
  .cart-address-phone {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin: 0;
    font-size: 12px;
    color: #667085;
  }

  .cart-address-form { display: flex; flex-direction: column; gap: 8px; }
  .cart-address-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d0d5dd;
    border-radius: 8px;
    font-size: 13px;
    font-family: inherit;
    color: #101828;
    resize: vertical;
    outline: none;
    transition: border 0.15s;
    box-sizing: border-box;
  }
  .cart-address-textarea:focus { border-color: #101828; box-shadow: 0 0 0 3px rgba(16,24,40,0.1); }
  .cart-address-phone-row {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #98a2b3;
  }
  .cart-address-input {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid #d0d5dd;
    border-radius: 8px;
    font-size: 13px;
    font-family: inherit;
    color: #101828;
    outline: none;
    transition: border 0.15s;
  }
  .cart-address-input:focus { border-color: #101828; box-shadow: 0 0 0 3px rgba(16,24,40,0.1); }
  .cart-address-error { margin: 0; font-size: 12px; color: #b42318; }
  .cart-address-actions { display: flex; justify-content: flex-end; gap: 8px; }
  .cart-address-cancel {
    padding: 7px 14px;
    background: transparent;
    border: 1px solid #d0d5dd;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 500;
    color: #344054;
    cursor: pointer;
    font-family: inherit;
  }
  .cart-address-save {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    background: #101828;
    color: #fff;
    border: none;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;
  }
  .cart-address-save:hover:not(:disabled) { background: #000; }
  .cart-address-save:disabled { opacity: 0.6; cursor: not-allowed; }
  .cart-address-saved {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin: 6px 0 0;
    font-size: 12px;
    color: #067647;
  }
  
  .cart-btn-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid #ffffff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: cart-spin 0.6s linear infinite;
  }
  
  .cart-btn-loading {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  
  @keyframes cart-spin {
    to { transform: rotate(360deg); }
  }
  
  .cart-voucher-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #667085;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 8px;
  }
  .cart-voucher-list { display: flex; flex-direction: column; gap: 8px; }
  .voucher-chip {
    text-align: left;
    background: #fff;
    border: 1px solid #d0d5dd;
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    font-family: inherit;
    display: flex;
    flex-direction: column;
    gap: 2px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .voucher-chip:hover:not(:disabled) { border-color: #101828; }
  .voucher-chip.active {
    border-color: #101828;
    box-shadow: 0 0 0 3px rgba(16,24,40,0.1);
  }
  .voucher-chip:disabled { opacity: 0.5; cursor: not-allowed; }
  .voucher-chip-title { font-size: 13px; font-weight: 600; color: #101828; }
  .voucher-chip-note { font-size: 11px; color: #b42318; }
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
