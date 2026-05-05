import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'

interface ContestProblem {
  label: string
  problem: { code: string; title: string; difficulty: number }
}

interface Standing {
  userId: number
  username: string
  solved: number
  penalty: number
}

interface Contest {
  id: number
  title: string
  type: string
  startTime: string
  endTime: string
  problems: ContestProblem[]
  createdby: { username: string }
}

export default function Contest() {
  const { id } = useParams<{ id: string }>()
  const [contest, setContest] = useState<Contest | null>(null)
  const [standings, setStandings] = useState<Standing[]>([])
  const [tab, setTab] = useState<'problems' | 'standings'>('problems')
  const [registering, setRegistering] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get(`/contests/${id}`).then(res => setContest(res.data))
    api.get(`/contests/${id}/standings`).then(res => setStandings(res.data))
  }, [id])

  const register = async () => {
    if (!localStorage.getItem('token')) { setMessage('Login to register'); return }
    setRegistering(true)
    try {
      await api.post(`/contests/${id}/register`)
      setMessage('Registered successfully!')
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to register')
    } finally {
      setRegistering(false)
    }
  }

  if (!contest) return <p style={{ color: '#999' }}>Loading...</p>

  const now = Date.now()
  const started  = now >= new Date(contest.startTime).getTime()
  const finished = now > new Date(contest.endTime).getTime()

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '4px' }}>{contest.title}</h2>
        <div style={{ fontSize: '13px', color: '#666', display: 'flex', gap: '16px' }}>
          <span>{contest.type}</span>
          <span>{new Date(contest.startTime).toLocaleString()} → {new Date(contest.endTime).toLocaleString()}</span>
          <span>By {contest.createdby?.username}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
        {!finished && (
          <button
            onClick={register}
            disabled={registering}
            style={{ background: '#1a1aff', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}
          >
            {registering ? 'Registering...' : 'Register'}
          </button>
        )}
        {message && <span style={{ fontSize: '13px', color: message.includes('success') ? '#2a9d2a' : '#e03030' }}>{message}</span>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '16px' }}>
        {(['problems', 'standings'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ padding: '8px 16px', border: 'none', background: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', borderBottom: tab === t ? '2px solid #1a1aff' : '2px solid transparent', color: tab === t ? '#1a1aff' : '#555', marginBottom: '-2px', textTransform: 'capitalize' }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'problems' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={th}>#</th>
              <th style={th}>Problem</th>
              <th style={th}>Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {contest.problems.map((cp, i) => (
              <tr key={cp.label} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9', borderBottom: '1px solid #eee' }}>
                <td style={{ ...td, fontWeight: 700, width: '50px' }}>{cp.label}</td>
                <td style={td}>
                  {started ? (
                    <Link to={`/problems/${cp.problem.code}`} style={{ color: '#1a1aff', textDecoration: 'none', fontWeight: 600 }}>
                      {cp.problem.title}
                    </Link>
                  ) : (
                    <span style={{ color: '#888' }}>{cp.problem.title}</span>
                  )}
                </td>
                <td style={{ ...td, color: '#888' }}>{cp.problem.difficulty}</td>
              </tr>
            ))}
            {contest.problems.length === 0 && (
              <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No problems added yet</td></tr>
            )}
          </tbody>
        </table>
      )}

      {tab === 'standings' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={th}>#</th>
              <th style={th}>User</th>
              <th style={th}>Solved</th>
              <th style={th}>Penalty</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => (
              <tr key={s.userId} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9', borderBottom: '1px solid #eee' }}>
                <td style={{ ...td, color: '#888' }}>{i + 1}</td>
                <td style={td}>
                  <Link to={`/users/${s.username}`} style={{ color: '#1a1aff', textDecoration: 'none', fontWeight: 600 }}>
                    {s.username}
                  </Link>
                </td>
                <td style={{ ...td, fontWeight: 700 }}>{s.solved}</td>
                <td style={{ ...td, color: '#888' }}>{s.penalty}</td>
              </tr>
            ))}
            {standings.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No submissions yet</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

const th: React.CSSProperties = { padding: '8px 12px', textAlign: 'left', fontWeight: 700, fontSize: '12px', color: '#555', borderBottom: '2px solid #ddd' }
const td: React.CSSProperties = { padding: '10px 12px' }
