import React from 'react'

const COLORS = {
  glioma: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', bar: '#ef4444' },
  meningioma: { bg: '#fff7ed', border: '#fed7aa', text: '#ea580c', bar: '#f97316' },
  pituitary: { bg: '#f5f3ff', border: '#ddd6fe', text: '#7c3aed', bar: '#8b5cf6' },
  notumor: { bg: '#ecfdf5', border: '#a7f3d0', text: '#059669', bar: '#10b981' },
}

const INFO = {
  glioma: {
    label: 'Glioma Tumor',
    icon: '⚠️',
    desc: 'A tumor arising from glial cells in the brain or spine.',
    severity: 'High',
    severityColor: '#dc2626',
    treatment: 'Surgery, radiation therapy, and chemotherapy'
  },
  meningioma: {
    label: 'Meningioma Tumor',
    icon: '⚠️',
    desc: 'A tumor forming in the membranes surrounding the brain and spinal cord.',
    severity: 'Medium',
    severityColor: '#ea580c',
    treatment: 'Observation, surgery, or stereotactic radiosurgery'
  },
  pituitary: {
    label: 'Pituitary Tumor',
    icon: '⚠️',
    desc: 'A tumor on the pituitary gland at the base of the brain. Usually benign.',
    severity: 'Low–Medium',
    severityColor: '#7c3aed',
    treatment: 'Medication, transsphenoidal surgery, or radiation'
  },
  notumor: {
    label: 'No Tumor Detected',
    icon: '✅',
    desc: 'No tumor detected. Brain tissue appears normal on this scan.',
    severity: 'None',
    severityColor: '#059669',
    treatment: 'No treatment required'
  }
}

export default function ResultCard({ result, preview, patient, fileName, onDownload }) {
  const info = INFO[result.prediction]
  const color = COLORS[result.prediction]

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      marginTop: '1.5rem'
    }}>
      {/* Result Header */}
      <div style={{
        background: color.bg,
        borderBottom: `1px solid ${color.border}`,
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '1.3rem' }}>{info.icon}</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: color.text }}>{info.label}</h2>
            </div>
            <p style={{ color: '#475569', fontSize: '0.9rem' }}>{info.desc}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: color.text, lineHeight: 1 }}>
              {result.confidence}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>AI Confidence</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {/* Patient Summary */}
        <Section title="Patient" icon="👤">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {[
              { label: 'Name', value: patient.name },
              { label: 'Patient ID', value: patient.patientId },
              { label: 'Age', value: patient.age + ' yrs' },
              { label: 'Gender', value: patient.gender },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: '#f8fafc',
                borderRadius: 8,
                padding: '0.75rem',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>{label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{value}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* GradCAM */}
        <Section title="Grad-CAM Visualization" icon="🔬">
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
            Red/yellow areas show where the AI focused to make its prediction.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <ScanBox label="Original MRI Scan" src={preview} />
            <ScanBox
              label="AI Focus Heatmap"
              src={result.gradcam ? 'data:image/png;base64,' + result.gradcam : null}
              fallback="Heatmap unavailable"
            />
          </div>
        </Section>

        {/* Confidence Scores */}
        <Section title="Confidence Scores" icon="📊">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(result.scores).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  width: 100,
                  fontSize: '0.85rem',
                  textTransform: 'capitalize',
                  fontWeight: k === result.prediction ? 700 : 400,
                  color: k === result.prediction ? COLORS[k].text : '#475569'
                }}>{k}</span>
                <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                  <div style={{
                    width: v + '%',
                    height: '100%',
                    background: COLORS[k].bar,
                    borderRadius: 99,
                    transition: 'width 1s ease'
                  }} />
                </div>
                <span style={{
                  width: 52,
                  textAlign: 'right',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: k === result.prediction ? COLORS[k].text : '#94a3b8'
                }}>{v}%</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Diagnosis Info */}
        <Section title="Clinical Information" icon="🏥">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <InfoBox label="Tumor Type" value={result.prediction} valueColor={color.text} capitalize />
            <InfoBox label="Severity Level">
              <span style={{
                background: color.bg,
                color: color.text,
                padding: '0.2rem 0.6rem',
                borderRadius: 99,
                fontSize: '0.85rem',
                fontWeight: 600,
                border: `1px solid ${color.border}`
              }}>{info.severity}</span>
            </InfoBox>
            <InfoBox label="Recommended Treatment" value={info.treatment} fullWidth />
          </div>
        </Section>

        {/* Download Button */}
        <button
          onClick={onDownload}
          style={{
            width: '100%',
            padding: '0.875rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          📄 Download Diagnostic Report
        </button>
      </div>
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        marginBottom: '0.75rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid #f1f5f9'
      }}>
        <span style={{ fontSize: '0.9rem' }}>{icon}</span>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function ScanBox({ label, src, fallback }) {
  return (
    <div style={{
      background: '#f8fafc',
      borderRadius: 10,
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      textAlign: 'center'
    }}>
      <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>{label}</p>
      {src
        ? <img src={src} alt={label} style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 6 }} />
        : <div style={{ padding: '2rem', color: '#cbd5e1', fontSize: '0.85rem' }}>{fallback}</div>
      }
    </div>
  )
}

function InfoBox({ label, value, valueColor, capitalize, fullWidth, children }) {
  return (
    <div style={{
      background: '#f8fafc',
      borderRadius: 8,
      padding: '0.875rem',
      border: '1px solid #e2e8f0',
      gridColumn: fullWidth ? '1 / -1' : undefined
    }}>
      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>{label}</div>
      {children || (
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: valueColor || '#0f172a', textTransform: capitalize ? 'capitalize' : undefined }}>{value}</div>
      )}
    </div>
  )
}