import { Outlet } from 'react-router-dom';
import { FiSearch, FiBell } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';

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
    gap: 24px;
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
    padding-left: 24px;
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
`;

const AdminLayout = () => {
  return (
    <>
      <style>{adminLayoutStyles}</style>
      <div className="admin-root">
        <Sidebar />

        <div className="admin-main">
          <header className="admin-header">
            <div className="admin-search-box">
              <FiSearch style={{ color: '#9ca3af', fontSize: 18, flexShrink: 0 }} />
              <input type="text" placeholder="Search anything here..." />
            </div>

            <div className="admin-header-right">
              <button className="admin-notif-btn">
                <FiBell />
                <span className="admin-notif-dot"></span>
              </button>
              <div className="admin-profile">
                <img
                  src="https://ui-avatars.com/api/?name=Admin+User&background=054C73&color=fff"
                  alt="Admin"
                  className="admin-avatar"
                />
                <div>
                  <p className="admin-name">Admin User</p>
                  <p className="admin-role">Super Admin</p>
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
