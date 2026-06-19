import { Outlet } from 'react-router-dom';
import { FiDatabase, FiUsers, FiTrendingUp } from 'react-icons/fi';
import authBg from '../assets/auth-bg.png';

const authLayoutStyles = `
  .auth-layout {
    display: flex;
    min-height: 100vh;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  /* Left side */
  .auth-brand {
    width: 50%;
    background-size: cover;
    background-position: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 60px 5%;
    color: #fff;
    position: relative;
  }

  .auth-brand-content {
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 56px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    max-width: 580px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 40px;
    animation: authFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes authFadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .auth-brand-content h1 {
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: linear-gradient(to right, #ffffff, #e2e8f0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }

  .auth-feature-list {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .auth-feature-item {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    transition: transform 0.25s ease;
  }

  .auth-feature-item:hover {
    transform: translateX(6px);
  }

  .af-icon-circle {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 20px;
  }
  
  .af-icon-1 { 
    background: rgba(110, 57, 200, 0.25); 
    border: 1px solid rgba(110, 57, 200, 0.4); 
    color: #c2a1fd; 
  }
  .af-icon-2 { 
    background: rgba(14, 165, 233, 0.25); 
    border: 1px solid rgba(14, 165, 233, 0.4); 
    color: #38bdf8; 
  }
  .af-icon-3 { 
    background: rgba(245, 158, 11, 0.25); 
    border: 1px solid rgba(245, 158, 11, 0.4); 
    color: #fbbf24; 
  }

  .af-text {
    font-size: 15px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.85);
  }

  .af-title {
    font-size: 17px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 6px;
  }

  .af-desc {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
  }

  /* Right side */
  .auth-form-area {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    padding: 40px;
  }

  .auth-form-wrapper {
    width: 100%;
    max-width: 480px;
    background: #ffffff;
    padding: 48px;
    border-radius: 20px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
    border: 1px solid #e2e8f0;
  }

  @media (max-width: 900px) {
    .auth-brand { display: none; }
    .auth-form-area { width: 100%; background: #f8fafc; }
  }
`;

const AuthLayout = () => {
  return (
    <>
      <style>{authLayoutStyles}</style>
      <div className="auth-layout">
        <div 
          className="auth-brand" 
          style={{ 
            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.55), rgba(15, 23, 42, 0.65)), url(${authBg})` 
          }}
        >
          <div className="auth-brand-content">
            <h1>Welcome to FurniCRM</h1>
            
            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <div className="af-icon-circle af-icon-1">
                  <FiDatabase />
                </div>
                <div className="af-text">
                  <div className="af-title">Track Furniture Catalog</div>
                  <div className="af-desc">Manage premium products, categories, pricing, and real-time stocks.</div>
                </div>
              </div>
              
              <div className="auth-feature-item">
                <div className="af-icon-circle af-icon-2">
                  <FiUsers />
                </div>
                <div className="af-text">
                  <div className="af-title">Understand Customer Habits</div>
                  <div className="af-desc">View customer accounts, wishlists, and shopping cart insights.</div>
                </div>
              </div>
              
              <div className="auth-feature-item">
                <div className="af-icon-circle af-icon-3">
                  <FiTrendingUp />
                </div>
                <div className="af-text">
                  <div className="af-title">Analyze Sales Performance</div>
                  <div className="af-desc">Gain clear visibility into sales reports, analytics, and revenue trends.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-area">
          <div className="auth-form-wrapper">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;

