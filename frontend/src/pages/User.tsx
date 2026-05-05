import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'

interface Submission {
  id: number
  verdict: string
  language: string
  submittedAt: string
  problem: { code: string; title: string }
}

interface User {
  id: number
  username: string
  rating: number
  maxRating: number
  rank: string
  country: string | null
  createdAt: string
  totalSolved: number
  recentSubmissions: Submission[]
}

const verdictColor: Record<string, string> = {
  ACCEPTED: '#2a9d2a',
  WRONG_ANSWER: '#e03030',
  TIME_LIMIT_EXCEEDED: '#e08030',
  MEMORY_LIMIT_EXCEEDED: '#e08030',
  RUNTIME_ERROR: '#aa00aa',
  COMPILATION_ERROR: '#555',
  PENDING: '#1a1aff',
}

export default function User() {
  const { username } = useParams<{ username: string }>()
  const [user, setUser] = useState<User | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api.get(`/users/${username}`)
      .then(res => setUser(res.data))
      .catch(() => setNotFound(true))
  }, [username])

  if (notFound) return <p style={{ color: '#999' }}>User not found.</p>
  if (!user) return <p style={{ color: '#999' }}>Loading...</p>

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Profile header */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px', padding: '20px', border: '1px solid #ddd', borderRadius: '6px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#888' }}>
          {user.username[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 700 }}>{user.username}</div>
          <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>{user.rank} {user.country && `· ${user.country}`}</div>
          <div style={{ marginTop: '8px', display: 'flex', gap: '20px', fontSize: '13px' }}>
            <span>Rating: <strong style={{ color: '#1a1aff' }}>{user.rating}</strong></span>
            <span>Max: <strong>{user.maxRating}</strong></span>
            <span>Solved: <strong style={{ color: '#2a9d2a' }}>{user.totalSolved}</strong></span>
          </div>
        </div>
      </div>

      {/* Recent submissions */}
      <h3 style={{ marginBottom: '12px' }}>Recent Submissions</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={th}>Problem</th>
            <th style={th}>Verdict</th>
            <th style={th}>Language</th>
            <th style={th}>Time</th>
          </tr>
        </thead>
        <tbody>
          {user.recentSubmissions.map((s, i) => (
            <tr key={s.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9', borderBottom: '1px solid #eee' }}>
              <td style={td}>
                <Link to={`/problems/${s.problem.code}`} style={{ color: '#1a1aff', textDecoration: 'none' }}>
                  {s.problem.code}. {s.problem.title}
                </Link>
              </td>
              <td style={{ ...td, color: verdictColor[s.verdict] || '#333', fontWeight: 600 }}>
                <Link to={`/submissions/${s.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {s.verdict.replace(/_/g, ' ')}
                </Link>
              </td>
              <td style={{ ...td, color: '#888' }}>{s.language}</td>
              <td style={{ ...td, color: '#aaa', fontSize: '12px' }}>{new Date(s.submittedAt).toLocaleString()}</td>
            </tr>
          ))}
          {user.recentSubmissions.length === 0 && (
            <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No submissions yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

const th: React.CSSProperties = { padding: '8px 12px', textAlign: 'left', fontWeight: 700, fontSize: '12px', color: '#555', borderBottom: '2px solid #ddd' }
const td: React.CSSProperties = { padding: '10px 12px' }
