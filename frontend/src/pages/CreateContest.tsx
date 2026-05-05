import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function CreateContest() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    type: 'ICPC',
    startTime: '',
    endTime: '',
  })

  const submit = async (e: React.FormEvent) => {
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
    <div style={{ maxWidth: '500px' }}>
      <h2>Create Contest</h2>
      {error && (
        <div style={{ background: '#fff0f0', border: '1px solid #f5c6c6', color: '#c0392b', padding: '8px 12px', borderRadius: '4px', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600 }}>Title</label>
          <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={{ width: '100%' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600 }}>Type</label>
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: '100%' }}>
            <option value="ICPC">ICPC</option>
            <option value="CF">CF</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600 }}>Start Time</label>
          <input type="datetime-local" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required style={{ width: '100%' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600 }}>End Time</label>
          <input type="datetime-local" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required style={{ width: '100%' }} />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '9px', background: loading ? '#999' : '#1a1aff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '14px', cursor: loading ? 'default' : 'pointer' }}
        >
          {loading ? 'Creating...' : 'Create Contest'}
        </button>
      </form>
    </div>
  )
}
