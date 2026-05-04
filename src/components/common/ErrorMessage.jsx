import React, { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorMessage = ({ error, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!error) { setVisible(false); setProgress(100); return; }

    setVisible(true);
    setProgress(100);

    // countdown progress bar — updates every 30ms
    const DURATION = 1000;
    const INTERVAL = 100;
    const steps = DURATION / INTERVAL;
    let step = 0;

    const ticker = setInterval(() => {
      step++;
      setProgress(Math.max(0, 100 - (step / steps) * 100));
    }, INTERVAL);

    // auto-hide after 30s
    const hider = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, DURATION);

    return () => { clearInterval(ticker); clearTimeout(hider); };
  }, [error]);

  if (!error || !visible) return null;

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  return (
    <>
      <style>{`
        @keyframes errSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
      <div
        style={{
          display: 'flex', flexDirection: 'column',
          background: '#160A0A', border: '1px solid #FF444440',
          borderRadius: 12, overflow: 'hidden',
          marginBottom: 16, animation: 'errSlideIn .25s ease forwards',
          boxShadow: '0 4px 24px #FF444410',
        }}
      >
        {/* main row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FF444420', border: '1px solid #FF444430', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertCircle size={14} color="#FF6666" />
            </div>
            <span style={{ fontSize: 13, color: '#FF9999', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5 }}>
              {error}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {/* countdown label */}
            <span style={{ fontSize: 10, fontFamily: "'Space Mono',monospace", color: '#FF444480', whiteSpace: 'nowrap' }}>
              auto-hide in {Math.ceil((progress / 100) * 30)}s
            </span>

            {onClose && (
              <button
                onClick={handleClose}
                style={{ width: 24, height: 24, borderRadius: 6, background: 'none', border: '1px solid #FF444430', color: '#FF6666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', padding: 0 }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FF444420'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* progress drain bar */}
        <div style={{ height: 2, background: '#FF444420' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg,#FF4444,#FF8888)',
              transition: 'width .3s linear',
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ErrorMessage;