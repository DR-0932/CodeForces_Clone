import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

interface TestCase {
  input: string
  expectedOutput: string
  isSample: boolean
  orderIndex: number
}

export default function CreateProblem() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    code: '', title: '', statement: '', inputFormat: '', outputFormat: '',
    notes: '', timeLimit: 1, memoryLimit: 256, difficulty: 800, isPublic: true, tags: '',
  })
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: '', expectedOutput: '', isSample: true, orderIndex: 1 },
  ])

  const addTestCase = () => setTestCases(prev => [...prev, { input: '', expectedOutput: '', isSample: false, orderIndex: prev.length + 1 }])
  const removeTestCase = (i: number) => setTestCases(prev => prev.filter((_, j) => j !== i).map((tc, j) => ({ ...tc, orderIndex: j + 1 })))
  const updateTestCase = (i: number, field: keyof TestCase, value: string | boolean) =>
    setTestCases(prev => prev.map((tc, j) => j === i ? { ...tc, [field]: value } : tc))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
      await api.post('/problems', { ...form, timeLimit: Number(form.timeLimit) * 60000, memoryLimit: Number(form.memoryLimit), difficulty: Number(form.difficulty), tags })
      const valid = testCases.filter(tc => tc.input && tc.expectedOutput)
      if (valid.length > 0) await api.post(`/problems/${form.code}/testcases`, { testcases: valid })
      navigate(`/problems/${form.code}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create problem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2>Create Problem</h2>
      {error && <div style={{ background: '#fff0f0', border: '1px solid #f5c6c6', color: '#c0392b', padding: '8px 12px', borderRadius: '4px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
          {field('Problem Code', 'code', form, setForm)}
          {field('Title', 'title', form, setForm)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          {field('Time Limit (minutes)', 'timeLimit', form, setForm, 'number')}
          {field('Memory Limit (MB)', 'memoryLimit', form, setForm, 'number')}
          {field('Difficulty', 'difficulty', form, setForm, 'number')}
        </div>
        {field('Tags (comma separated)', 'tags', form, setForm)}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" id="isPublic" checked={form.isPublic} onChange={e => setForm({ ...form, isPublic: e.target.checked })} />
          <label htmlFor="isPublic" style={{ fontSize: '13px' }}>Public</label>
        </div>
        {field('Problem Statement', 'statement', form, setForm, 'text', 6)}
        {field('Input Format', 'inputFormat', form, setForm, 'text', 3)}
        {field('Output Format', 'outputFormat', form, setForm, 'text', 3)}
        {field('Notes (optional)', 'notes', form, setForm, 'text', 2)}

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>Test Cases</h3>
            <button type="button" onClick={addTestCase}>+ Add</button>
          </div>
          {testCases.map((tc, i) => (
            <div key={i} style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ fontSize: '13px' }}>Test #{tc.orderIndex}</strong>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <label style={{ fontSize: '13px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input type="checkbox" checked={tc.isSample} onChange={e => updateTestCase(i, 'isSample', e.target.checked)} />
                    Sample
                  </label>
                  {testCases.length > 1 && (
                    <button type="button" onClick={() => removeTestCase(i)} style={{ color: 'red', fontSize: '12px' }}>Remove</button>
                  )}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Input</label>
                  <textarea rows={4} value={tc.input} onChange={e => updateTestCase(i, 'input', e.target.value)}
                    style={{ width: '100%', fontFamily: 'monospace', fontSize: '13px', marginTop: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Expected Output</label>
                  <textarea rows={4} value={tc.expectedOutput} onChange={e => updateTestCase(i, 'expectedOutput', e.target.value)}
                    style={{ width: '100%', fontFamily: 'monospace', fontSize: '13px', marginTop: '4px' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading}
          style={{ padding: '10px', background: loading ? '#999' : '#1a1aff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'default' : 'pointer' }}>
          {loading ? 'Creating...' : 'Create Problem'}
        </button>
      </form>
    </div>
  )
}

type FormState = Record<string, string | number | boolean>

function field(label: string, key: string, form: FormState, setForm: (f: FormState) => void, type = 'text', rows?: number) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '13px', fontWeight: 600 }}>{label}</label>
      {rows ? (
        <textarea rows={rows} value={form[key] as string}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
          style={{ width: '100%', fontFamily: 'inherit', fontSize: '13px', resize: 'vertical' }} />
      ) : (
        <input type={type} value={form[key] as string | number}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
          style={{ width: '100%' }} />
      )}
    </div>
  )
}
