import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, total, limit, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const max = 5;
    let start = Math.max(1, currentPage - 2);
    let end   = Math.min(totalPages, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const from = (currentPage - 1) * limit + 1;
  const to   = Math.min(currentPage * limit, total);

  const Btn = ({ onClick, disabled, active, children, title }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        minWidth: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 10px', borderRadius: 9, border: `1px solid ${active ? '#00FF7F' : '#1A1D25'}`,
        background: active ? '#00FF7F' : 'transparent',
        color: active ? '#080A0F' : disabled ? '#2A2D35' : '#6A6A62',
        fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: active ? 700 : 400,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all .18s',
      }}
      onMouseEnter={e => { if (!disabled && !active) { e.currentTarget.style.borderColor = '#2A2D35'; e.currentTarget.style.color = '#E8E8E0'; e.currentTarget.style.background = '#0D0F16'; } }}
      onMouseLeave={e => { if (!disabled && !active) { e.currentTarget.style.borderColor = '#1A1D25'; e.currentTarget.style.color = '#6A6A62'; e.currentTarget.style.background = 'transparent'; } }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ padding: '14px 22px', borderTop: '1px solid #1A1D25', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: '#080A0F' }}>
      {/* count */}
      <div style={{ fontSize: 11, fontFamily: "'Space Mono',monospace", color: '#3A3D45', whiteSpace: 'nowrap' }}>
        <span style={{ color: '#00FF7F' }}>{from}–{to}</span> of {total}
      </div>

      {/* controls */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        <Btn onClick={() => onPageChange(1)}              disabled={currentPage === 1}          title="First">  <ChevronsLeft  size={13}/></Btn>
        <Btn onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}          title="Previous"><ChevronLeft  size={13}/></Btn>

        {getPageNumbers().map(n => (
          <Btn key={n} onClick={() => onPageChange(n)} active={currentPage === n}>{n}</Btn>
        ))}

        <Btn onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} title="Next">    <ChevronRight  size={13}/></Btn>
        <Btn onClick={() => onPageChange(totalPages)}       disabled={currentPage === totalPages} title="Last">    <ChevronsRight size={13}/></Btn>
      </div>
    </div>
  );
};

export default Pagination;