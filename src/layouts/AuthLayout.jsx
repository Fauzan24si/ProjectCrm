import { Outlet } from 'react-router-dom';

const authLayoutStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500&display=swap');

  .auth-layout {
    display: flex;
    min-height: 100vh;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  /* Left side — brand panel */
  .auth-brand {
    width: 50%;
    background: #1C1714;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 60px 5%;
    color: #fff;
    position: relative;
    overflow: hidden;
  }

  /* Signature element — SVG wood grain lines ambient in background */
  .auth-brand-grain {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.045;
    pointer-events: none;
  }

  .auth-brand-content {
    position: relative;
    z-index: 1;
    max-width: 380px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* Logo — double-border engraving style */
  .auth-logo {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 36px;
  }

  .auth-logo-icon {
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 2px;
    color: #C4A882;
    position: relative;
  }
  .auth-logo-icon::before {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid #C4A882;
  }
  .auth-logo-icon::after {
    content: '';
    position: absolute;
    inset: 3px;
    border: 1px solid rgba(196,168,130,0.35);
  }

  .auth-logo-text {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 3.5px;
    color: #E8DFD0;
    text-transform: uppercase;
  }

  /* Headline */
  .auth-brand-content h1 {
    font-family: 'DM Serif Display', 'Georgia', serif;
    font-size: 36px;
    font-weight: 400;
    letter-spacing: -0.5px;
    color: #E8DFD0;
    margin: 0 0 6px 0;
    line-height: 1.18;
  }

  /* "grain" — stretched tracking, oak color, like wood fibers pulling apart */
  .auth-grain-word {
    color: #C4A882;
    letter-spacing: 6px;
    font-style: italic;
    text-transform: lowercase;
    margin-right: -6px;
  }

  /* Separator — full-width inlay rule */
  .auth-inlay {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 28px 0 24px;
  }

  .auth-inlay-dot {
    width: 4px;
    height: 4px;
    background: #C4A882;
    flex-shrink: 0;
  }

  .auth-inlay-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, #C4A882, rgba(196,168,130,0.12));
  }

  /* Feature list */
  .auth-features {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 11px;
  }

  .auth-features li {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: rgba(232, 223, 208, 0.55);
    font-weight: 400;
    letter-spacing: 0.2px;
  }

  .auth-features li::before {
    content: '';
    width: 18px;
    height: 1px;
    background: #6B5744;
    flex-shrink: 0;
  }

  /* Right side — form area */
  .auth-form-area {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f2ed;
    padding: 40px;
  }

  .auth-form-wrapper {
    width: 100%;
    max-width: 420px;
    background: #ffffff;
    padding: 40px;
    border-radius: 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    border: 1px solid #e3ddd5;
  }

  @media (max-width: 900px) {
    .auth-brand { display: none; }
    .auth-form-area { width: 100%; background: #f5f2ed; }
  }

  @media (prefers-reduced-motion: reduce) {
    .auth-brand-grain { display: none; }
  }
`;

const AuthLayout = () => {
  return (
    <>
      <style>{authLayoutStyles}</style>
      <div className="auth-layout">
        <div className="auth-brand">
          {/* Signature element: SVG wood grain lines */}
          <svg className="auth-brand-grain" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <filter id="grain-turbulence">
              <feTurbulence type="fractalNoise" baseFrequency="0.015 0.4" numOctaves="4" seed="8" result="noise"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G"/>
            </filter>
            {Array.from({ length: 28 }).map((_, i) => (
              <line
                key={i}
                x1="0" y1={`${(i / 27) * 100}%`}
                x2="100%" y2={`${(i / 27) * 100 + (i % 3 === 0 ? 3 : i % 3 === 1 ? -2 : 1.5)}%`}
                stroke="#C4A882"
                strokeWidth={i % 4 === 0 ? "1.5" : "0.8"}
                filter="url(#grain-turbulence)"
              />
            ))}
          </svg>

          <div className="auth-brand-content">
            <div className="auth-logo">
              <div className="auth-logo-icon">FC</div>
              <span className="auth-logo-text">Furniture</span>
            </div>

            <h1>
              Your furniture<br />
              business, tracked<br />
              down to the{' '}
              <span className="auth-grain-word">grain.</span>
            </h1>

            <div className="auth-inlay">
              <div className="auth-inlay-dot" />
              <div className="auth-inlay-line" />
            </div>

            <ul className="auth-features">
              <li>Inventory management</li>
              <li>Customer relationships</li>
              <li>Order tracking</li>
              <li>Sales reports</li>
            </ul>
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
