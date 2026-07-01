import { useState } from 'react'
import axios from 'axios'
import Navbar from './components/navbar.jsx'
import PatientForm from './components/patientForm.jsx'
import UploadZone from './components/UploadZone.jsx'
import ResultCard from './components/ResultCard.jsx'
import History from './pages/History.jsx'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const TUMOR_INFO = {
  glioma: { severity: 'High', treatment: 'Surgery, radiation therapy, and chemotherapy', desc: 'A tumor arising from glial cells in the brain or spine.' },
  meningioma: { severity: 'Medium', treatment: 'Observation, surgery, or stereotactic radiosurgery', desc: 'A tumor forming in the membranes surrounding the brain.' },
  pituitary: { severity: 'Low–Medium', treatment: 'Medication, transsphenoidal surgery, or radiation', desc: 'A tumor on the pituitary gland, usually benign.' },
  notumor: { severity: 'None', treatment: 'No treatment required', desc: 'No tumor detected. Brain tissue appears normal.' }
}

export default function App() {
  const [page, setPage] = useState('scan')
  const [patient, setPatient] = useState({ name: '', age: '', gender: '', patientId: '' })
  const [patientErrors, setPatientErrors] = useState({})
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isPatientValid = patient.name.trim() && patient.age && patient.gender && patient.patientId.trim()

  const validate = () => {
    const errs = {}
    if (!patient.name.trim()) errs.name = 'Name is required'
    if (!patient.age || patient.age < 1 || patient.age > 120) errs.age = 'Enter a valid age'
    if (!patient.gender) errs.gender = 'Select a gender'
    if (!patient.patientId.trim()) errs.patientId = 'Patient ID is required'
    setPatientErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleFileSelect = (f) => {
    if (!validate()) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setError('')
  }

  const handleAnalyze = async () => {
    if (!file || !validate()) return
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('patient', JSON.stringify(patient))
      const res = await axios.post(`${API}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(detail || 'Analysis failed. Please upload a valid MRI image (JPEG or PNG).')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError('')
    setPatient({ name: '', age: '', gender: '', patientId: '' })
    setPatientErrors({})
  }

  const downloadReport = () => {
    if (!result) return
    const info = TUMOR_INFO[result.prediction]
    const scoreRows = Object.entries(result.scores)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `<tr><td style="text-transform:capitalize">${k}</td><td><strong>${v}%</strong></td></tr>`)
      .join('')

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>NeuroScan Report — ${patient.patientId}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #0f172a; }
    h1 { color: #6366f1; font-size: 1.5rem; margin-bottom: 0.25rem; }
    .subtitle { color: #94a3b8; margin-bottom: 2rem; font-size: 0.9rem; }
    h2 { font-size: 1rem; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.4rem; margin: 1.5rem 0 0.75rem; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
    td, th { padding: 0.7rem 0.875rem; border: 1px solid #e2e8f0; font-size: 0.875rem; text-align: left; }
    th { background: #f8fafc; font-weight: 600; color: #475569; }
    .result-badge { display: inline-block; padding: 0.3rem 0.8rem; border-radius: 99px; font-weight: 700; font-size: 1rem; text-transform: capitalize; }
    .footer { margin-top: 2rem; padding: 1rem; background: #f8fafc; border-radius: 8px; font-size: 0.8rem; color: #94a3b8; border: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <h1>🧠 NeuroScan AI — Diagnostic Report</h1>
  <p class="subtitle">Generated on ${new Date().toLocaleString()}</p>

  <h2>Patient Information</h2>
  <table>
    <tr><th>Field</th><th>Value</th></tr>
    <tr><td>Full Name</td><td>${patient.name}</td></tr>
    <tr><td>Patient ID</td><td>${patient.patientId}</td></tr>
    <tr><td>Age</td><td>${patient.age} years</td></tr>
    <tr><td>Gender</td><td>${patient.gender}</td></tr>
    <tr><td>Scan File</td><td>${file.name}</td></tr>
  </table>

  <h2>Diagnosis Result</h2>
  <table>
    <tr><th>Parameter</th><th>Value</th></tr>
    <tr><td>AI Prediction</td><td><strong style="text-transform:capitalize;color:#6366f1">${result.prediction}</strong></td></tr>
    <tr><td>Confidence</td><td><strong>${result.confidence}%</strong></td></tr>
    <tr><td>Severity</td><td>${info.severity}</td></tr>
    <tr><td>Description</td><td>${info.desc}</td></tr>
    <tr><td>Recommended Treatment</td><td>${info.treatment}</td></tr>
  </table>

  <h2>Confidence Scores</h2>
  <table>
    <tr><th>Tumor Type</th><th>Confidence</th></tr>
    ${scoreRows}
  </table>

  <div class="footer">
    This report was generated by NeuroScan AI using EfficientNetB0 deep learning model.
    This is an AI-assisted tool intended for research and educational purposes.
    Always consult a qualified medical professional for clinical diagnosis.
  </div>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `neuroscan_${patient.patientId}_${Date.now()}.html`
    a.click()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Navbar page={page} setPage={setPage} />

      {page === 'history' ? (
        <History />
      ) : (
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '2rem' }}>

          {/* Page Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem' }}>
              Brain Tumor MRI Analysis
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Fill in patient details, upload an MRI scan, and get an AI-powered diagnosis.
            </p>
          </div>

          {/* Patient Form */}
          <PatientForm
            patient={patient}
            setPatient={setPatient}
            errors={patientErrors}
          />

          {/* Upload Zone */}
          <UploadZone
            file={file}
            preview={preview}
            onFileSelect={handleFileSelect}
            disabled={!isPatientValid}
          />

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!file || loading || !isPatientValid}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: (!file || loading || !isPatientValid)
                ? '#e2e8f0'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: (!file || loading || !isPatientValid) ? '#94a3b8' : '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: '1rem',
              fontWeight: 600,
              cursor: (!file || loading || !isPatientValid) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 18, height: 18,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite'
                }} />
                Analyzing MRI scan...
              </>
            ) : '🔍 Analyze MRI Scan'}
          </button>

          {/* Error */}
          {error && (
            <div style={{
              padding: '0.875rem 1rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 10,
              color: '#dc2626',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>⚠️ {error}</div>
          )}

          {/* Loading Card */}
          {loading && (
            <div style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              padding: '3rem',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
              <div style={{
                width: 48, height: 48,
                border: '3px solid #e2e8f0',
                borderTop: '3px solid #6366f1',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 1rem'
              }} />
              <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.3rem' }}>Analyzing MRI scan...</p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Running EfficientNetB0 model and generating Grad-CAM heatmap</p>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <>
              <ResultCard
                result={result}
                preview={preview}
                patient={patient}
                fileName={file?.name}
                onDownload={downloadReport}
              />
              <button
                onClick={handleReset}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginTop: '0.75rem',
                  background: 'transparent',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 10,
                  color: '#475569',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                ↩ Start New Scan
              </button>
            </>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}