import { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

/* ─── config ─────────────────────────────────────────────── */
const DURATION = 4000;
const MAX      = 5;

const TYPE_CONFIG = {
  success: { icon: CheckCircle,   accent: '#00FF7F', bg: '#00FF7F0D', border: '#00FF7F30' },
  error:   { icon: AlertCircle,   accent: '#FF4444', bg: '#FF44440D', border: '#FF444430' },
  warning: { icon: AlertTriangle, accent: '#FF9B3B', bg: '#FF9B3B0D', border: '#FF9B3B30' },
  info:    { icon: Info,          accent: '#00C8FF', bg: '#00C8FF0D', border: '#00C8FF30' },
};

/* ─── module-level singleton ─────────────────────────────── */
// Holds the setter injected by the auto-mounted renderer.
// Calling showNotification before the renderer mounts queues
// toasts and flushes them on mount.
let _dispatch = null;
const _queue  = [];

const _enqueue = (toast) => {
  if (_dispatch) {
    _dispatch(toast);
  } else {
    _queue.push(toast);
  }
};

/* ─── auto-mount: inject a hidden root once into document.body ── */
let _mounted = false;

const ensureMounted = () => {
  if (_mounted || typeof document === 'undefined') return;
  _mounted = true;

  // Create a dedicated mount point so we never stomp on app DOM
  const el = document.createElement('div');
  el.id = '__toast-root__';
  document.body.appendChild(el);

  // Lazy-import React DOM to avoid bundler issues
  import('react-dom/client').then(({ createRoot }) => {
    import('react').then((React) => {
      const root = createRoot(el);
      root.render(React.createElement(ToastRenderer));
    });
  });
};

/* ─── single toast ───────────────────────────────────────── */
const Toast = ({ id, message, type, onDismiss }) => {
  const [visible,  setVisible]  = useState(false);
  const [leaving,  setLeaving]  = useState(false);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef(null);
  const startRef    = useRef(null);
  const pausedRef   = useRef(false);
  const elapsed     = useRef(0);

  const cfg  = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const Icon = cfg.icon;

  /* entrance */
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  /* countdown */
  const startCountdown = useCallback(() => {
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const spent = elapsed.current + (Date.now() - startRef.current);
      const pct   = Math.max(0, 100 - (spent / DURATION) * 100);
      setProgress(pct);
      if (pct <= 0) dismiss();
    }, 30);
  }, []);

  const pauseCountdown = () => {
    if (pausedRef.current) return;
    pausedRef.current = true;
    elapsed.current += Date.now() - startRef.current;
    clearInterval(intervalRef.current);
  };

  const resumeCountdown = () => {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    startRef.current  = Date.now();
    startCountdown();
  };

  useEffect(() => {
    startCountdown();
    return () => clearInterval(intervalRef.current);
  }, []);

  const dismiss = useCallback(() => {
    clearInterval(intervalRef.current);
    setLeaving(true);
    setTimeout(() => onDismiss(id), 280);
  }, [id, onDismiss]);

  return (
    <div
      onMouseEnter={pauseCountdown}
      onMouseLeave={resumeCountdown}
      style={{
        display:      'flex',
        alignItems:   'flex-start',
        gap:          10,
        padding:      '12px 14px',
        background:   '#0D0F16',
        border:       `1px solid ${cfg.border}`,
        borderLeft:   `3px solid ${cfg.accent}`,
        borderRadius: 12,
        boxShadow:    `0 8px 32px rgba(0,0,0,.5), 0 0 0 1px ${cfg.accent}10`,
        width:        340,
        maxWidth:     'calc(100vw - 32px)',
        position:     'relative',
        overflow:     'hidden',
        cursor:       'default',
        transform:    visible && !leaving ? 'translateX(0) scale(1)'   : 'translateX(20px) scale(.96)',
        opacity:      visible && !leaving ? 1                           : 0,
        transition:   'transform .28s cubic-bezier(.16,1,.3,1), opacity .26s ease',
        fontFamily:   "'DM Sans','Helvetica Neue',sans-serif",
      }}
    >
      {/* icon */}
      <div style={{ width:28, height:28, borderRadius:8, background:`${cfg.accent}15`, border:`1px solid ${cfg.accent}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
        <Icon size={14} color={cfg.accent}/>
      </div>

      {/* message */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.08em', color:cfg.accent, marginBottom:3 }}>
          {type}
        </div>
        <div style={{ fontSize:13, color:'#C8C8C0', lineHeight:1.55, wordBreak:'break-word' }}>
          {message}
        </div>
      </div>

      {/* dismiss */}
      <button
        onClick={dismiss}
        style={{ width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', color:'#3A3D45', cursor:'pointer', flexShrink:0, borderRadius:5, transition:'all .15s', padding:0 }}
        onMouseEnter={e => { e.currentTarget.style.background='#FF444415'; e.currentTarget.style.color='#FF6666'; }}
        onMouseLeave={e => { e.currentTarget.style.background='none';       e.currentTarget.style.color='#3A3D45'; }}
      >
        <X size={11}/>
      </button>

      {/* progress bar */}
      <div style={{ position:'absolute', bottom:0, left:0, height:2, background:'#1A1D25', right:0 }}>
        <div style={{ height:'100%', width:`${progress}%`, background:cfg.accent, transition:'width .03s linear', borderRadius:2 }}/>
      </div>
    </div>
  );
};

/* ─── self-mounting renderer ─────────────────────────────── */
// Rendered into its own detached root — lives completely outside
// the app's React tree, so no Provider is ever needed.
const ToastRenderer = () => {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  // Register the singleton dispatcher and flush any queued toasts
  useEffect(() => {
    _dispatch = ({ message, type }) => {
      const id = ++counter.current;
      setToasts(prev => {
        const next = [...prev, { id, message, type }];
        return next.length > MAX ? next.slice(next.length - MAX) : next;
      });
    };

    // Flush toasts that were fired before we mounted
    _queue.splice(0).forEach(_dispatch);

    return () => { _dispatch = null; };
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  if (!toasts.length) return null;

  return createPortal(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Space+Mono&display=swap');
      `}</style>
      <div style={{
        position:      'fixed',
        bottom:        24,
        right:         24,
        zIndex:        99999,
        display:       'flex',
        flexDirection: 'column',
        gap:           10,
        alignItems:    'flex-end',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <Toast {...t} onDismiss={dismiss}/>
          </div>
        ))}
      </div>
    </>,
    document.body
  );
};

/* ─── hook ───────────────────────────────────────────────── */
// Calling useToast() auto-mounts the renderer the first time.
// No <ToastProvider> wrapper ever needed.
export const useToast = () => {
  ensureMounted();

  return useCallback((message, type = 'info') => {
    _enqueue({ message, type });
  }, []);
};

/*
 * ─── USAGE ───────────────────────────────────────────────
 *
 * No setup, no provider. Just import the hook:
 *
 *   import { useToast } from './notifications/ToastSystem';
 *
 *   // Inside any component (including your Globals provider):
 *   const showNotification = useToast();
 *
 *   // Then call it exactly as before:
 *   showNotification('Exam saved successfully',       'success');
 *   showNotification('Failed to load questions',      'error');
 *   showNotification('Select at least one topic',     'warning');
 *   showNotification('Generating your exam…',         'info');
 *
 * Types: 'success' | 'error' | 'warning' | 'info'
 *
 * The first useToast() call anywhere in the tree auto-mounts
 * a detached React root into document.body. Toasts fired before
 * that root finishes mounting are queued and flushed automatically.
 */