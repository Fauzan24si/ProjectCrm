import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiUser,
  FiBox,
  FiUsers,
  FiTrendingUp,
  FiLogOut,
  FiClock,
  FiShoppingCart,
  FiShoppingBag,
  FiMapPin,
  FiHeart,
  FiTag,
  FiSearch,
} from 'react-icons/fi';
import SidebarReusable from '../Reusable/Sidebar';
import { getCurrentUser, logout } from '../services/auth';

// Definisi menu per-role, dikelompokkan dalam section bergaya Untitled UI.
const ADMIN_NAV = [
  {
    label: 'Menu',
    items: [
      { to: '/admin/dashboard', icon: FiGrid, text: 'Dashboard', end: true },
      { to: '/orders', icon: FiShoppingBag, text: 'Pesanan' },
      { to: '/users', icon: FiUser, text: 'Users' },
      { to: '/products', icon: FiBox, text: 'Products' },
      { to: '/customers', icon: FiUsers, text: 'Customer' },
    ],
  },
  {
    label: 'Laporan',
    items: [
      { to: '/sales-report', icon: FiTrendingUp, text: 'Sales Report' },
    ],
  },
];

const MEMBER_NAV = [
  {
    label: 'Menu',
    items: [
      { to: '/member', icon: FiGrid, text: 'Dashboard', end: true },
      { to: '/member/transactions', icon: FiClock, text: 'Riwayat Transaksi' },
      { to: '/member/track', icon: FiMapPin, text: 'Lacak Pesanan' },
      { to: '/member/vouchers', icon: FiTag, text: 'Voucher' },
      { to: '/member/cart', icon: FiShoppingCart, text: 'Keranjang' },
    ],
  },
  {
    label: 'Akun',
    items: [
      { to: '/member/address', icon: FiMapPin, text: 'Alamat' },
      { to: '/member/wishlist', icon: FiHeart, text: 'Wishlist' },
      { to: '/member/profile', icon: FiUser, text: 'Profil' },
    ],
  },
];

const sidebarStyles = `
  .sidebar {
    width: 280px;
    min-width: 280px;
    background: #ffffff;
    border-right: 1px solid #eaecf0;
    display: flex;
    flex-direction: column;
    height: 100vh;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .sidebar-logo {
    padding: 24px 20px 16px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
  .sidebar-logo img {
    height: 40px;
    object-fit: contain;
  }

  .sidebar-search {
    padding: 0 16px 8px;
    flex-shrink: 0;
  }
  .sidebar-search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    background: #fff;
    border: 1px solid #d0d5dd;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(16,24,40,0.05);
  }
  .sidebar-search-box svg { color: #667085; flex-shrink: 0; }
  .sidebar-search-box input {
    border: none;
    outline: none;
    font-size: 14px;
    color: #101828;
    width: 100%;
    background: transparent;
    font-family: inherit;
  }
  .sidebar-search-box input::placeholder { color: #667085; }

  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 8px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .sidebar-nav::-webkit-scrollbar { display: none; }
  .sidebar-nav { -ms-overflow-style: none; scrollbar-width: none; }

  .nav-section + .nav-section { margin-top: 16px; }
  .nav-section-label {
    font-size: 12px;
    font-weight: 600;
    color: #98a2b3;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 8px 12px 4px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    padding: 9px 12px;
    border-radius: 8px;
    cursor: pointer;
    color: #475467;
    transition: background 0.15s, color 0.15s;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    gap: 12px;
  }
  .nav-item:hover {
    background: #f9fafb;
    color: #101828;
  }
  .nav-icon { font-size: 20px; flex-shrink: 0; }

  .nav-item.active {
    background: #f9f5ff;
    color: #101828;
    font-weight: 600;
  }
  .nav-item.active .nav-icon { color: #101828; }

  .sidebar-footer {
    padding: 12px 16px 16px;
    border-top: 1px solid #f3f4f6;
    flex-shrink: 0;
  }
  .profile-widget {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    border-radius: 10px;
    transition: background 0.15s;
  }
  .profile-widget:hover { background: #f9fafb; }
  .profile-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }
  .profile-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }
  .profile-name {
    font-size: 14px;
    font-weight: 600;
    color: #101828;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .profile-email {
    font-size: 12px;
    color: #667085;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .profile-logout-btn {
    background: transparent;
    border: none;
    color: #667085;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
  }
  .profile-logout-btn:hover { background: #f3f4f6; color: #b42318; }
`;

const Sidebar = () => {
  const navigate = useNavigate();
  const session = getCurrentUser();
  const isAdmin = session?.role === 'admin';
  const [query, setQuery] = useState('');

  const handleSignout = () => {
    logout();
    navigate('/login');
  };

  const navSections = isAdmin ? ADMIN_NAV : MEMBER_NAV;
  const q = query.trim().toLowerCase();

  // Filter item berdasarkan pencarian, buang section yang jadi kosong.
  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.text.toLowerCase().includes(q)
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      <style>{sidebarStyles}</style>
      <SidebarReusable className="sidebar">
        <div className="sidebar-logo">
          <img src="/assets/images/image.png" alt="Logo" />
        </div>

        <div className="sidebar-search">
          <div className="sidebar-search-box">
            <FiSearch size={18} />
            <input
              type="text"
              placeholder="Cari menu..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Cari menu"
            />
          </div>
        </div>

        <nav className="sidebar-nav">
          {filteredSections.map((section) => (
            <div className="nav-section" key={section.label}>
              <span className="nav-section-label">{section.label}</span>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `nav-item${isActive ? ' active' : ''}`
                    }
                  >
                    <Icon className="nav-icon" />
                    <span>{item.text}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="profile-widget">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                session?.name || (isAdmin ? 'Admin' : 'Member')
              )}&background=101828&color=fff`}
              alt={session?.name || 'User'}
              className="profile-avatar"
            />
            <div className="profile-info">
              <h4 className="profile-name">
                {session?.name || (isAdmin ? 'Admin User' : 'Member')}
              </h4>
              <p className="profile-email">{session?.email || ''}</p>
            </div>
            <button
              className="profile-logout-btn"
              onClick={handleSignout}
              title="Sign out"
              aria-label="Sign out"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      </SidebarReusable>
    </>
  );
};

export default Sidebar;
