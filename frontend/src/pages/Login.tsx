import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('username', res.data.safeUser.username)
      window.dispatchEvent(new Event('localStorageChange'))
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '380px', margin: '60px auto' }}>
      <h2 style={{ marginBottom: '4px' }}>Login</h2>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>

      {error && (
        <div style={{ background: '#fff0f0', border: '1px solid #f5c6c6', color: '#c0392b', padding: '8px 12px', borderRadius: '4px', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600 }}>Username or Email</label>
          <input
            type="text"
            value={form.identifier}
            onChange={e => setForm({ ...form, identifier: e.target.value })}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600 }}>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            style={{ width: '100%' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: '4px', padding: '8px', background: loading ? '#999' : '#1a1aff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '14px', cursor: loading ? 'default' : 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
