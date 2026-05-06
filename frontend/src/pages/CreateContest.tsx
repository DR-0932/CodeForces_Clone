import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

const styles = {
  wrapper:    'max-w-lg',
  title:      'text-xl font-bold mb-4',
  error:      'bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded mb-4',
  form:       'flex flex-col gap-4',
  field:      'flex flex-col gap-1',
  label:      'text-sm font-semibold',
  input:      'w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none',
  textarea:   'w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none resize-y',
  select:     'w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none',
  submitBtn:  'py-2.5 bg-blue-700 text-white font-semibold rounded text-sm cursor-pointer border-none',
  submitOff:  'py-2.5 bg-gray-400 text-white font-semibold rounded text-sm cursor-default border-none',
}

export default function CreateContest() {
  const navigate = useNavigate()
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'ICPC',
    startTime: '',
    endTime: '',
  })

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/contests', form)
      navigate(`/contests/${res.data.id}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create contest')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Create Contest</h2>
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={submit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Title</label>
          <input className={styles.input} type="text" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} required />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea className={styles.textarea} rows={3} value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Type</label>
          <select className={styles.select} value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="ICPC">ICPC</option>
            <option value="CF">CF</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Start Time</label>
          <input className={styles.input} type="datetime-local" value={form.startTime}
            onChange={e => setForm({ ...form, startTime: e.target.value })} required />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>End Time</label>
          <input className={styles.input} type="datetime-local" value={form.endTime}
            onChange={e => setForm({ ...form, endTime: e.target.value })} required />
        </div>

        <button type="submit" disabled={loading} className={loading ? styles.submitOff : styles.submitBtn}>
          {loading ? 'Creating...' : 'Create Contest'}
        </button>
      </form>
    </div>
  )
}
