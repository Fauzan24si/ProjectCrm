import { Outlet } from 'react-router-dom';
import { FiUser, FiSearch, FiPhone } from 'react-icons/fi';

const authLayoutStyles = `
  .auth-layout {
    display: flex;
    min-height: 100vh;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  /* Left side */
  .auth-brand {
    width: 50%;
    background: #2764E8;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 10%;
    color: #fff;
  }

  .auth-brand h1 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 40px;
    margin-left: 20px;
  }

  .auth-feature-list {
    display: flex;
    flex-direction: column;
    gap: 32px;
    max-width: 320px;
    margin-left: 20px;
  }

  .auth-feature-item {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .af-icon-circle {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #fff;
    font-size: 20px;
  }
  
  .af-icon-1 { background: #0F3B9C; }
  .af-icon-2 { background: #1DC9B7; }
  .af-icon-3 { background: #10C44C; }

  .af-text {
    font-size: 13px;
    line-height: 1.5;
    color: rgba(255,255,255,0.95);
  }

  /* Right side */
  .auth-form-area {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    padding: 40px;
  }

  .auth-form-wrapper {
    width: 100%;
    max-width: 380px;
  }

  @media (max-width: 900px) {
    .auth-brand { display: none; }
  }
`;

const AuthLayout = () => {
  return (
    <>
      <style>{authLayoutStyles}</style>
      <div className="auth-layout">
        <div className="auth-brand">
          <h1>How it works?</h1>
          
          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="af-icon-circle af-icon-1">
                <FiUser />
              </div>
              <div className="af-text">
                Join us
              </div>
            </div>
            
            <div className="auth-feature-item">
              <div className="af-icon-circle af-icon-2">
                <FiSearch />
              </div>
              <div className="af-text">
                Bring your own talent pool or let us match your posts with the best ones
              </div>
            </div>
            
            <div className="auth-feature-item">
              <div className="af-icon-circle af-icon-3">
                <FiPhone />
              </div>
              <div className="af-text">
                Get in touch with the talents with just a few clicks without cold calls or emails
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

