import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Progress bar tipis di bagian atas layar yang muncul setiap kali
 * berpindah halaman, supaya transisi terasa lebih mulus.
 *
 * Tampilan mengikuti komponen `progress` DaisyUI (bar warna primary),
 * direplikasi dengan CSS murni agar tidak bergantung pada DaisyUI.
 */
function RouteProgress() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef([]);
  const firstRender = useRef(true);

  useEffect(() => {
    // Lewati animasi pada render pertama (load awal aplikasi).
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    // Bersihkan timer sebelumnya.
    timers.current.forEach(clearTimeout);
    timers.current = [];

    setVisible(true);
    setProgress(12);

    // Naikkan progress bertahap supaya terasa "loading".
    timers.current.push(setTimeout(() => setProgress(45), 90));
    timers.current.push(setTimeout(() => setProgress(72), 240));
    timers.current.push(setTimeout(() => setProgress(90), 480));

    // Selesaikan: penuhkan lalu sembunyikan.
    timers.current.push(setTimeout(() => setProgress(100), 620));
    timers.current.push(
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 900)
    );

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [location.pathname]);

  return (
    <>
      <style>{progressStyles}</style>
      <div
        className={`route-progress ${visible ? 'is-visible' : ''}`}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-hidden={!visible}
      >
        <div className="route-progress-bar" style={{ width: `${progress}%` }} />
      </div>
    </>
  );
}

const progressStyles = `
  .route-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: transparent;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
  }
  .route-progress.is-visible { opacity: 1; }
  .route-progress-bar {
    height: 100%;
    width: 0;
    background: #101828;
    border-radius: 0 3px 3px 0;
    box-shadow: 0 0 8px rgba(16, 24, 40, 0.6);
    transition: width 0.25s ease;
  }
`;

export default RouteProgress;
