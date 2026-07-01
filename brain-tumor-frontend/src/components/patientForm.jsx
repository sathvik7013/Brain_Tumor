import React from 'react'

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '0.6rem 0.875rem',
  border: `1.5px solid ${hasError ? '#ef4444' : '#e2e8f0'}`,
  borderRadius: 8,
  fontSize: '0.9rem',
  color: '#0f172a',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.15s',
})

const labelStyle = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '0.35rem',
  display: 'block'
}

export default function PatientForm({ patient, setPatient, errors }) {
  const update = (field, value) => {
    setPatient(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: 28, height: 28,
          background: '#eef2ff',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.85rem'
        }}>👤</div>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Patient Information</h2>
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.7rem',
          color: '#94a3b8',
          background: '#f8fafc',
          padding: '0.2rem 0.5rem',
          borderRadius: 99,
          border: '1px solid #e2e8f0'
        }}>Required before scan</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Name */}
        <div>
          <label style={labelStyle}>Full Name</label>
          <input
            type="text"
            placeholder="e.g. John Doe"
            value={patient.name}
            onChange={e => update('name', e.target.value)}
            style={inputStyle(errors.name)}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = errors.name ? '#ef4444' : '#e2e8f0'}
          />
          {errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name}</p>}
        </div>

        {/* Patient ID */}
        <div>
          <label style={labelStyle}>Patient ID</label>
          <input
            type="text"
            placeholder="e.g. PT-0001"
            value={patient.patientId}
            onChange={e => update('patientId', e.target.value)}
            style={inputStyle(errors.patientId)}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = errors.patientId ? '#ef4444' : '#e2e8f0'}
          />
          {errors.patientId && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.patientId}</p>}
        </div>

        {/* Age */}
        <div>
          <label style={labelStyle}>Age</label>
          <input
            type="number"
            placeholder="e.g. 45"
            min="1" max="120"
            value={patient.age}
            onChange={e => update('age', e.target.value)}
            style={inputStyle(errors.age)}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = errors.age ? '#ef4444' : '#e2e8f0'}
          />
          {errors.age && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.age}</p>}
        </div>

        {/* Gender */}
        <div>
          <label style={labelStyle}>Gender</label>
          <select
            value={patient.gender}
            onChange={e => update('gender', e.target.value)}
            style={{ ...inputStyle(errors.gender), cursor: 'pointer' }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = errors.gender ? '#ef4444' : '#e2e8f0'}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.gender}</p>}
        </div>
      </div>
    </div>
  )
}