import React from 'react'

export default function Navbar({ page, setPage }) {
  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{
          width: 36, height: 36,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem'
        }}>🧠</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', lineHeight: 1.2 }}>NeuroScan AI</div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1 }}>Brain Tumor Detection</div>
        </div>
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[
          { id: 'scan', label: 'New Scan' },
          { id: 'history', label: 'History' },
        ].map(item => (
          <button key={item.id} onClick={() => setPage(item.id)} style={{
            padding: '0.4rem 1rem',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.875rem',
            background: page === item.id ? '#eef2ff' : 'transparent',
            color: page === item.id ? '#6366f1' : '#475569',
            transition: 'all 0.15s'
          }}>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}