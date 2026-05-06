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
  label:        'text-sm font-semibold',
  input:        'w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none',
  submitBtn:    'mt-1 py-2 bg-blue-700 text-white font-semibold rounded text-sm cursor-pointer border-none',
  submitBtnOff: 'mt-1 py-2 bg-gray-400 text-white font-semibold rounded text-sm cursor-default border-none',
}

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ identifier: '', password: '' })
  const [error, setError]     = useState('')
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
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Login</h2>
      <p className={styles.subtitle}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={submit} className={styles.form}>
        <div className={styles.fieldWrapper}>
          <label className={styles.label}>Username or Email</label>
          <input className={styles.input} type="text" value={form.identifier}
            onChange={e => setForm({ ...form, identifier: e.target.value })} required />
        </div>
        <div className={styles.fieldWrapper}>
          <label className={styles.label}>Password</label>
          <input className={styles.input} type="password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>
        <button type="submit" disabled={loading} className={loading ? styles.submitBtnOff : styles.submitBtn}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
