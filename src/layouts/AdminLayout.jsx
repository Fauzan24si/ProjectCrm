import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FiSearch, FiBell, FiMoon, FiSun } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import { getCurrentUser } from '../services/auth';

const DARK_KEY = 'admin_dark_mode';

const adminLayoutStyles = `
  .admin-root {
    display: flex;
    height: 100vh;
    background: #F4F5F7;
    font-family: 'Lato', sans-serif;
  }

  .admin-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }

  .admin-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 32px;
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0;
  }

  .admin-search-box {
    display: flex;
    align-items: center;
    background: #F4F5F7;
    border-radius: 10px;
    padding: 10px 16px;
    width: 360px;
    border: 1px solid #e5e7eb;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .admin-search-box:focus-within {
    border-color: #054C73;
    box-shadow: 0 0 0 2px rgba(5, 76, 115, 0.1);
  }

  .admin-search-box input {
    background: transparent;
    border: none;
    outline: none;
    margin-left: 12px;
    width: 100%;
    font-size: 14px;
    color: #374151;
    font-family: 'Lato', sans-serif;
  }

  .admin-header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .admin-notif-btn {
    position: relative;
    padding: 8px;
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    transition: color 0.2s;
    font-size: 20px;
    display: flex;
    align-items: center;
  }

  .admin-notif-btn:hover { color: #054C73; }

  .admin-notif-dot {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 9px;
    height: 9px;
    background: #ef4444;
    border-radius: 50%;
    border: 2px solid #fff;
  }

  .admin-profile {
    display: flex;
    align-items: center;
    gap: 12px;
    border-left: 1px solid #e5e7eb;
    padding-left: 16px;
    margin-left: 4px;
    cursor: pointer;
  }

  .admin-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .admin-name {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin: 0;
  }

  .admin-role {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
  }

  .admin-content {
    flex: 1;
    overflow-y: auto;
    padding: 32px;
  }

  .admin-page-title {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  .admin-page-subtitle {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 32px 0;
  }

  @media (max-width: 768px) {
    .admin-content { padding: 20px; }
    .admin-search-box { width: 200px; }
  }

  /* ---------- Dark mode (hanya area dashboard) ---------- */
  .admin-root.dark { background: #0f172a; color: #e5e7eb; }

  .admin-root.dark .sidebar {
    background: #111827;
    border-right-color: #1f2937;
    color: #cbd5e1;
  }
  .admin-root.dark .nav-item { color: #9ca3af; }
  .admin-root.dark .nav-item:hover { background: #1f2937; color: #f3f4f6; }
  .admin-root.dark .nav-item.active { background: #312e81; color: #c4b5fd; }
  .admin-root.dark .nav-item.active::before { background: #c4b5fd; }
  .admin-root.dark .nav-item.active .nav-icon { color: #c4b5fd; }
  .admin-root.dark .profile-email { color: rgba(255,255,255,0.7); }

  .admin-root.dark .admin-header {
    background: #111827;
    border-bottom-color: #1f2937;
  }
  .admin-root.dark .admin-search-box {
    background: #1f2937;
    border-color: #1f2937;
  }
  .admin-root.dark .admin-search-box input { color: #e5e7eb; }
  .admin-root.dark .admin-search-box input::placeholder { color: #6b7280; }
  .admin-root.dark .admin-notif-btn { color: #9ca3af; }
  .admin-root.dark .admin-notif-btn:hover { color: #c4b5fd; }
  .admin-root.dark .admin-notif-dot { border-color: #111827; }
  .admin-root.dark .admin-profile {
    border-left-color: #1f2937;
  }
  .admin-root.dark .admin-name { color: #f3f4f6; }
  .admin-root.dark .admin-role { color: #9ca3af; }

  .admin-root.dark .admin-content { background: #0f172a; }

  .admin-root.dark .admin-page-title,
  .admin-root.dark .table-main-title,
  .admin-root.dark .member-section-title,
  .admin-root.dark .greet-name,
  .admin-root.dark h1,
  .admin-root.dark h2,
  .admin-root.dark h3 { color: #f3f4f6; }
  .admin-root.dark .admin-page-subtitle,
  .admin-root.dark .table-sub-title,
  .admin-root.dark .greet-hello,
  .admin-root.dark .greet-email { color: #94a3b8; }

  /* Generic cards / tables / modals dalam dashboard */
  .admin-root.dark .table-container,
  .admin-root.dark .reusable-card,
  .admin-root.dark .member-section,
  .admin-root.dark .action-card,
  .admin-root.dark .info-item-icon,
  .admin-root.dark .stat-card,
  .admin-root.dark .card {
    background: #1e293b !important;
    border-color: #334155 !important;
    color: #e5e7eb;
  }
  .admin-root.dark .table-search-row { background: #0f172a; border-bottom-color: #334155; }
  .admin-root.dark .theme-table thead th { background: #1e293b; color: #cbd5e1; border-bottom-color: #334155; }
  .admin-root.dark .theme-table tbody tr { border-bottom-color: #334155; }
  .admin-root.dark .theme-table tbody tr:hover { background: #273449; }
  .admin-root.dark .theme-table tbody td,
  .admin-root.dark .text-gray { color: #cbd5e1 !important; }
  .admin-root.dark .user-name-text,
  .admin-root.dark .prod-name-text { color: #f3f4f6; }

  .admin-root.dark .info-item-label { color: #94a3b8; }
  .admin-root.dark .info-item-value { color: #f3f4f6; }
  .admin-root.dark .info-item-icon { background: #334155; color: #c4b5fd; }
  .admin-root.dark .action-card-icon { background: #312e81; color: #c4b5fd; }
  .admin-root.dark .action-card-body p { color: #94a3b8; }

  .admin-root.dark .btn-icon { color: #94a3b8; }
  .admin-root.dark .btn-icon:hover { background: #334155; color: #f3f4f6; }
  .admin-root.dark .btn-icon--danger:hover { background: #7f1d1d; color: #fecaca; }

  /* Tombol toggle dark mode di header */
  .admin-theme-toggle {
    background: transparent;
    border: 1px solid transparent;
    color: #6b7280;
    padding: 6px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.2s;
  }
  .admin-theme-toggle:hover { background: #F4F5F7; color: #054C73; }
  .admin-root.dark .admin-theme-toggle {
    color: #fde68a;
  }
  .admin-root.dark .admin-theme-toggle:hover { background: #1f2937; }
`;

const AdminLayout = () => {
  const session = getCurrentUser();
  const displayName = session?.name || 'Admin User';
  const displayRole = session?.role === 'admin' ? 'Super Admin' : 'Member';
  const avatarBg = session?.role === 'admin' ? '054C73' : '6E39CB';
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${avatarBg}&color=fff`;

  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem(DARK_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(DARK_KEY, dark ? '1' : '0');
    } catch {
      /* ignore storage errors */
    }
  }, [dark]);

  return (
    <>
      <style>{adminLayoutStyles}</style>
      <div className={`admin-root${dark ? ' dark' : ''}`}>
        <Sidebar />

        <div className="admin-main">
          <header className="admin-header">
            <div className="admin-search-box">
              <FiSearch style={{ fontSize: 18, flexShrink: 0 }} />
              <input type="text" placeholder="Search anything here..." />
            </div>

            <div className="admin-header-right">
              <button
                type="button"
                className="admin-theme-toggle"
                onClick={() => setDark((v) => !v)}
                title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
              <button className="admin-notif-btn">
                <FiBell />
                <span className="admin-notif-dot"></span>
              </button>
              <div className="admin-profile">
                <img
                  src={avatar}
                  alt={displayName}
                  className="admin-avatar"
                />
                <div>
                  <p className="admin-name">{displayName}</p>
                  <p className="admin-role">{displayRole}</p>
                </div>
              </div>
            </div>
          </header>

          <div className="admin-content">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
