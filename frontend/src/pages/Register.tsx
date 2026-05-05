import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/register', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('username', res.data.user.username)
      window.dispatchEvent(new Event('localStorageChange'))
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '380px', margin: '60px auto' }}>
      <h2 style={{ marginBottom: '4px' }}>Register</h2>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>

      {error && (
        <div style={{ background: '#fff0f0', border: '1px solid #f5c6c6', color: '#c0392b', padding: '8px 12px', borderRadius: '4px', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {(['username', 'email', 'password'] as const).map(field => (
          <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>{field}</label>
            <input
              type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
              value={form[field]}
              onChange={e => setForm({ ...form, [field]: e.target.value })}
              required
              style={{ width: '100%' }}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: '4px', padding: '8px', background: loading ? '#999' : '#1a1aff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '14px', cursor: loading ? 'default' : 'pointer' }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  )
}
