import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiUser,
  FiBox,
  FiUsers,
  FiTrendingUp,
  FiMoreVertical
} from 'react-icons/fi';
import SidebarReusable from '../Reusable/Sidebar';
import NavItem from '../Reusable/NavItem';

const sidebarStyles = `
  .sidebar {
    width: 260px;
    min-width: 260px;
    background: #ffffff;
    border-right: 1px solid #eaecf0;
    display: flex;
    flex-direction: column;
    height: 100vh;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .sidebar-logo {
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .sidebar-logo img {
    height: 48px;
    object-fit: contain;
  }

  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 24px;
  }

  .sidebar-nav::-webkit-scrollbar {
    display: none;
  }
  .sidebar-nav {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .nav-item {
    display: flex;
    align-items: center;
    padding: 10px 14px;
    border-radius: 8px;
    cursor: pointer;
    color: #475467;
    transition: all 0.2s;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    gap: 12px;
  }

  .nav-item:hover {
    background: #f9fafb;
    color: #101828;
  }

  .nav-icon {
    font-size: 18px;
  }

  .nav-item.active {
    background: #EBE4FF;
    color: #6E39CB;
    position: relative;
    font-weight: 600;
  }
  .nav-item.active .nav-icon {
    color: #6E39CB;
  }
  
  .nav-item.active::before {
    content: '';
    position: absolute;
    left: -16px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 32px;
    background: #6E39CB;
    border-radius: 0 4px 4px 0;
  }

  .sidebar-footer {
    padding: 16px;
  }

  .profile-widget {
    background: #6E39CB;
    border-radius: 12px;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #fff;
    position: relative;
    box-shadow: 0 4px 12px rgba(110, 57, 203, 0.2);
  }

  .profile-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.8);
  }

  .profile-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .profile-name {
    font-size: 13px;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .profile-email {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .profile-menu-btn {
    background: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }
  .profile-menu-btn:hover {
    background: rgba(255,255,255,0.1);
  }
`;

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{sidebarStyles}</style>
      <SidebarReusable className="sidebar">
        <div className="sidebar-logo">
          <img src="/assets/images/image.png" alt="Logo" />
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <FiGrid className="nav-icon" />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/users" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <FiUser className="nav-icon" />
            <span>Users</span>
          </NavLink>
          
          <NavLink to="/products" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <FiBox className="nav-icon" />
            <span>Products</span>
          </NavLink>
          
          <NavLink to="/customers/1" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <FiUsers className="nav-icon" />
            <span>Customer</span>
          </NavLink>
          
          <NavItem
            onClick={() => navigate('/sales-report')}
            icon={<FiTrendingUp className="nav-icon" />}
            className="nav-item"
            style={{ cursor: 'pointer' }}
          >
            Sales Report
          </NavItem>
        </nav>

        <div className="sidebar-footer">
          <div className="profile-widget">
            <img 
              src="https://ui-avatars.com/api/?name=Admin+User&background=f9fafb&color=101828" 
              alt="Admin" 
              className="profile-avatar" 
            />
            <div className="profile-info">
              <h4 className="profile-name">Admin User</h4>
              <p className="profile-email">admin@furniture.com</p>
            </div>
            <button 
              className="profile-menu-btn" 
              onClick={() => navigate('/login')}
              title="Signout"
            >
              <FiMoreVertical size={18} />
            </button>
          </div>
        </div>
      </SidebarReusable>
    </>
  );
};

export default Sidebar;
