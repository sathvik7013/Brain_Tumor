import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const BADGE = {
  glioma: { bg: '#fef2f2', color: '#dc2626' },
  meningioma: { bg: '#fff7ed', color: '#ea580c' },
  pituitary: { bg: '#f5f3ff', color: '#7c3aed' },
  notumor: { bg: '#ecfdf5', color: '#059669' },
}

export default function History() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(API + '/history?limit=20')
      .then(res => { setRecords(res.data); setLoading(false); setError('') })
      .catch(() => { setLoading(false); setError('Could not load history right now.') })
  }, [])

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Scan History</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Recent MRI scan analyses</p>
      </div>

      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
      }}>
        {error ? (
          <div style={{ padding: '1rem 1.25rem', color: '#b91c1c', background: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
            {error}
          </div>
        ) : null}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{
              width: 36, height: 36,
              border: '3px solid #e2e8f0',
              borderTop: '3px solid #6366f1',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto'
            }} />
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗂️</div>
            <p style={{ fontWeight: 500 }}>No scans yet</p>
            <p style={{ fontSize: '0.85rem' }}>Upload an MRI scan to see results here</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Patient', 'File', 'Result', 'Confidence', 'Date'].map(h => (
                  <th key={h} style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r._id} style={{
                  borderBottom: i < records.length - 1 ? '1px solid #f1f5f9' : 'none',
                  transition: 'background 0.1s'
                }}>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.patient?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{r.patient?.patientId || 'No ID'}</div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{r.filename}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: 99,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      background: BADGE[r.prediction]?.bg || '#f1f5f9',
                      color: BADGE[r.prediction]?.color || '#475569'
                    }}>{r.prediction}</span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: '#6366f1' }}>{r.confidence}%</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(r.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}