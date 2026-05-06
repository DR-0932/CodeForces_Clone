import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

interface TestCase {
  input: string
  expectedOutput: string
  isSample: boolean
  orderIndex: number
}

const styles = {
  wrapper:        'max-w-3xl',
  title:          'text-xl font-bold mb-4',
  error:          'bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded mb-4',
  form:           'flex flex-col gap-4',
  grid2:          'grid grid-cols-[1fr_2fr] gap-3',
  grid3:          'grid grid-cols-3 gap-3',
  field:          'flex flex-col gap-1',
  label:          'text-sm font-semibold',
  input:          'w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none',
  textarea:       'w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none resize-y font-sans',
  checkRow:       'flex items-center gap-2',
  checkLabel:     'text-sm',
  tcHeader:       'flex justify-between items-center mb-3',
  tcTitle:        'text-base font-bold m-0',
  addBtn:         'text-sm border border-gray-300 rounded px-3 py-1 bg-white cursor-pointer',
  tcCard:         'border border-gray-200 rounded-lg p-3 mb-3',
  tcCardHeader:   'flex justify-between items-center mb-2',
  tcCardNum:      'text-sm font-bold',
  tcCardActions:  'flex gap-3 items-center',
  sampleLabel:    'text-sm flex gap-1.5 items-center',
  removeBtn:      'text-red-500 text-xs cursor-pointer border-none bg-none p-0',
  tcGrid:         'grid grid-cols-2 gap-3',
  tcLabel:        'text-xs font-bold mb-1',
  tcTextarea:     'w-full border border-gray-300 rounded px-2 py-1.5 text-xs outline-none font-mono resize-y',
  submitBtn:      'py-2.5 bg-blue-700 text-white font-semibold rounded text-sm cursor-pointer border-none',
  submitOff:      'py-2.5 bg-gray-400 text-white font-semibold rounded text-sm cursor-default border-none',
}

export default function CreateProblem() {
  const navigate = useNavigate()
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    code: '', title: '', statement: '', inputFormat: '', outputFormat: '',
    notes: '', timeLimit: 1, memoryLimit: 256, difficulty: 800, isPublic: true, tags: '',
  })
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: '', expectedOutput: '', isSample: true, orderIndex: 1 },
  ])

  const addTestCase = () =>
    setTestCases(prev => [...prev, { input: '', expectedOutput: '', isSample: false, orderIndex: prev.length + 1 }])

  const removeTestCase = (i: number) =>
    setTestCases(prev => prev.filter((_, j) => j !== i).map((tc, j) => ({ ...tc, orderIndex: j + 1 })))

  const updateTestCase = (i: number, field: keyof TestCase, value: string | boolean) =>
    setTestCases(prev => prev.map((tc, j) => j === i ? { ...tc, [field]: value } : tc))

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
      await api.post('/problems', {
        ...form,
        timeLimit: Number(form.timeLimit) * 60000,
        memoryLimit: Number(form.memoryLimit),
        difficulty: Number(form.difficulty),
        tags,
      })
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
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Create Problem</h2>
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={submit} className={styles.form}>
        <div className={styles.grid2}>
          <Field label="Problem Code" value={form.code} onChange={v => setForm({ ...form, code: v })} />
          <Field label="Title" value={form.title} onChange={v => setForm({ ...form, title: v })} />
        </div>

        <div className={styles.grid3}>
          <Field label="Time Limit (minutes)" type="number" value={String(form.timeLimit)} onChange={v => setForm({ ...form, timeLimit: +v })} />
          <Field label="Memory Limit (MB)" type="number" value={String(form.memoryLimit)} onChange={v => setForm({ ...form, memoryLimit: +v })} />
          <Field label="Difficulty" type="number" value={String(form.difficulty)} onChange={v => setForm({ ...form, difficulty: +v })} />
        </div>

        <Field label="Tags (comma separated)" value={form.tags} onChange={v => setForm({ ...form, tags: v })} />

        <div className={styles.checkRow}>
          <input type="checkbox" id="isPublic" checked={form.isPublic}
            onChange={e => setForm({ ...form, isPublic: e.target.checked })} />
          <label htmlFor="isPublic" className={styles.checkLabel}>Public</label>
        </div>

        <TextareaField label="Problem Statement" rows={6} value={form.statement} onChange={v => setForm({ ...form, statement: v })} />
        <TextareaField label="Input Format" rows={3} value={form.inputFormat} onChange={v => setForm({ ...form, inputFormat: v })} />
        <TextareaField label="Output Format" rows={3} value={form.outputFormat} onChange={v => setForm({ ...form, outputFormat: v })} />
        <TextareaField label="Notes (optional)" rows={2} value={form.notes} onChange={v => setForm({ ...form, notes: v })} />

        <div>
          <div className={styles.tcHeader}>
            <h3 className={styles.tcTitle}>Test Cases</h3>
            <button type="button" onClick={addTestCase} className={styles.addBtn}>+ Add</button>
          </div>

          {testCases.map((tc, i) => (
            <div key={i} className={styles.tcCard}>
              <div className={styles.tcCardHeader}>
                <span className={styles.tcCardNum}>Test #{tc.orderIndex}</span>
                <div className={styles.tcCardActions}>
                  <label className={styles.sampleLabel}>
                    <input type="checkbox" checked={tc.isSample}
                      onChange={e => updateTestCase(i, 'isSample', e.target.checked)} />
                    Sample
                  </label>
                  {testCases.length > 1 && (
                    <button type="button" onClick={() => removeTestCase(i)} className={styles.removeBtn}>Remove</button>
                  )}
                </div>
              </div>
              <div className={styles.tcGrid}>
                <div>
                  <div className={styles.tcLabel}>Input</div>
                  <textarea rows={4} value={tc.input} className={styles.tcTextarea}
                    onChange={e => updateTestCase(i, 'input', e.target.value)} />
                </div>
                <div>
                  <div className={styles.tcLabel}>Expected Output</div>
                  <textarea rows={4} value={tc.expectedOutput} className={styles.tcTextarea}
                    onChange={e => updateTestCase(i, 'expectedOutput', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading} className={loading ? styles.submitOff : styles.submitBtn}>
          {loading ? 'Creating...' : 'Create Problem'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none" />
    </div>
  )
}

function TextareaField({ label, rows, value, onChange }: {
  label: string; rows: number; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold">{label}</label>
      <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none resize-y font-sans" />
    </div>
  )
}
