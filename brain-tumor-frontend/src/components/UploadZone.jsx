import React, { useRef } from 'react'

export default function UploadZone({ file, preview, onFileSelect, disabled }) {
  const inputRef = useRef()

  const handleDrop = (e) => {
    e.preventDefault()
    if (disabled) return
    const dropped = e.dataTransfer.files[0]
    if (dropped) onFileSelect(dropped)
  }

  const handleClick = () => {
    if (disabled) return
    inputRef.current.click()
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        style={{
          border: `2px dashed ${disabled ? '#e2e8f0' : file ? '#6366f1' : '#c7d2fe'}`,
          borderRadius: 16,
          padding: preview ? '1rem' : '3rem 2rem',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: disabled ? '#f8fafc' : file ? '#f5f3ff' : '#fafafe',
          transition: 'all 0.2s',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {preview ? (
          <div style={{ position: 'relative' }}>
            <img
              src={preview}
              alt="MRI Preview"
              style={{
                maxHeight: 280,
                maxWidth: '100%',
                borderRadius: 10,
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto'
              }}
            />
            <div style={{
              marginTop: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              color: '#6366f1',
              fontSize: '0.85rem',
              fontWeight: 500
            }}>
              <span>✓</span> {file.name}
              <span style={{ color: '#94a3b8', fontWeight: 400 }}>— click to change</span>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              width: 56, height: 56,
              background: '#eef2ff',
              borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem',
              margin: '0 auto 1rem'
            }}>🫁</div>
            <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.3rem' }}>
              {disabled ? 'Fill patient details to enable upload' : 'Drop MRI scan here'}
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              {disabled ? 'All 4 fields above are required' : 'or click to browse — JPEG, PNG supported'}
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          style={{ display: 'none' }}
          onChange={e => e.target.files[0] && onFileSelect(e.target.files[0])}
        />
      </div>
    </div>
  )
}