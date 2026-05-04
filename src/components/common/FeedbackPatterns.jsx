import React from 'react';
import { AlertTriangle, FileSearch, Loader2, RefreshCw } from 'lucide-react';

const TOKENS = {
  panel: '#0D0F16',
  border: '#1A1D25',
  textPrimary: '#E8E8E0',
  textSecondary: '#5A5D65',
  success: '#00FF7F',
  danger: '#FF6666',
  muted: '#3A3D45',
};

const RetryButton = ({ onRetry, label = 'Try again', disabled = false }) => {
  if (!onRetry) return null;
  return (
    <button
      onClick={onRetry}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px',
        background: 'transparent', border: `1px solid ${TOKENS.border}`, borderRadius: 100,
        color: TOKENS.textPrimary, fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <RefreshCw size={13} />
      {label}
    </button>
  );
};

const LoadingIcon = ({ size = 24 }) => <Loader2 size={size} color={TOKENS.success} style={{ animation: 'spin .9s linear infinite' }} />;

export const AppLoading = ({ message = 'Loading your workspace…' }) => (
  <div style={{ minHeight: '100vh', background: '#080A0F', display: 'grid', placeItems: 'center' }}>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}`}</style>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg,#00FF7F,#00C8FF)', display: 'grid', placeItems: 'center', margin: '0 auto 24px', fontSize: 36 }}>📖</div>
      <div style={{ marginBottom: 16 }}><LoadingIcon size={32} /></div>
      <p style={{ fontSize: 12, color: TOKENS.muted, letterSpacing: '0.12em', textTransform: 'uppercase', animation: 'pulse 2s ease-in-out infinite' }}>{message}</p>
    </div>
  </div>
);

export const SectionLoading = ({ message = 'Loading content…', minHeight = 220 }) => (
  <div style={{ minHeight, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <LoadingIcon size={22} />
    <span style={{ fontSize: 13, color: TOKENS.textSecondary }}>{message}</span>
  </div>
);

export const InlineLoading = ({ message = 'Loading…' }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: TOKENS.textSecondary, fontSize: 12 }}>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <LoadingIcon size={14} />
    <span>{message}</span>
  </div>
);

export const EmptyState = ({ title = 'Nothing here yet', description = 'Content will appear here once available.', icon: Icon = FileSearch, action }) => (
  <div style={{ padding: '52px 24px', textAlign: 'center' }}>
    <div style={{ width: 64, height: 64, borderRadius: '50%', background: TOKENS.border, display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
      <Icon size={24} color={TOKENS.muted} />
    </div>
    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 17, color: TOKENS.textPrimary, marginBottom: 8 }}>{title}</div>
    <p style={{ fontSize: 13, color: TOKENS.textSecondary, maxWidth: 340, margin: '0 auto 24px', lineHeight: 1.7 }}>{description}</p>
    {action}
  </div>
);

export const ErrorState = ({ title = 'We could not load this section', description = 'Please retry. If the issue continues, refresh the page.', onRetry, retryLabel }) => (
  <div style={{ padding: '20px', border: `1px solid ${TOKENS.danger}30`, background: `${TOKENS.danger}12`, borderRadius: 12, color: '#FF9A9A' }}>
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <AlertTriangle size={16} style={{ marginTop: 1 }} />
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{title}</div>
        <p style={{ fontSize: 13, color: '#FFB3B3', marginBottom: onRetry ? 12 : 0 }}>{description}</p>
        <RetryButton onRetry={onRetry} label={retryLabel} />
      </div>
    </div>
  </div>
);

export { RetryButton };
