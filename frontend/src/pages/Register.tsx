import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'

const styles = {
  wrapper:      'max-w-sm mx-auto mt-16',
  title:        'text-xl font-bold mb-1',
  subtitle:     'text-sm text-gray-500 mb-5',
  error:        'bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded mb-4',
  form:         'flex flex-col gap-3',
  fieldWrapper: 'flex flex-col gap-1',
  label:        'text-sm font-semibold capitalize',
  input:        'w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none',
  submitBtn:    'mt-1 py-2 bg-blue-700 text-white font-semibold rounded text-sm cursor-pointer border-none',
  submitBtnOff: 'mt-1 py-2 bg-gray-400 text-white font-semibold rounded text-sm cursor-default border-none',
}

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ username: '', email: '', password: '' })
  const [error, setError]     = useState('')
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
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Register</h2>
      <p className={styles.subtitle}>
        Already have an account? <Link to="/login">Login</Link>
      </p>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={submit} className={styles.form}>
        {(['username', 'email', 'password'] as const).map(field => (
          <div key={field} className={styles.fieldWrapper}>
            <label className={styles.label}>{field}</label>
            <input
              className={styles.input}
              type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
              value={form[field]}
              onChange={e => setForm({ ...form, [field]: e.target.value })}
              required
            />
          </div>
        ))}
        <button type="submit" disabled={loading} className={loading ? styles.submitBtnOff : styles.submitBtn}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  )
}
