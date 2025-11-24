import React from 'react';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="4" fill="#FF6B4A"/>
        <circle cx="22" cy="10" r="4" fill="#FF6B4A"/>
        <circle cx="16" cy="22" r="4" fill="#FF6B4A"/>
        <line x1="10" y1="10" x2="16" y2="22" stroke="#FF6B4A" strokeWidth="3" strokeLinecap="round"/>
        <line x1="22" y1="10" x2="16" y2="22" stroke="#FF6B4A" strokeWidth="3" strokeLinecap="round"/>
        <line x1="10" y1="10" x2="22" y2="10" stroke="#FF6B4A" strokeWidth="3" strokeLinecap="round"/>
      </svg>
      <span className="font-['Fredoka'] text-[#FF6B4A]" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
        Partage
      </span>
    </div>
  );
}
