import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

interface Contest {
  id: number
  title: string
  type: string
  startTime: string
  endTime: string
  createdby: { username: string }
}

function getStatus(start: string, end: string) {
  const now = Date.now()
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (now < s) return 'upcoming'
  if (now <= e) return 'running'
  return 'finished'
}

function formatDuration(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}h ${m}m`
}

function CountDown({ to }: { to: string }) {
  const calc = () => {
    const diff = new Date(to).getTime() - Date.now()
    if (diff <= 0) return 'Starting now'
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
  }

  const [display, setDisplay] = useState(calc)
  useEffect(() => {
    const t = setInterval(() => setDisplay(calc()), 1000)
    return () => clearInterval(t)
  }, [to])

  return <span style={{ fontFamily: 'monospace', color: '#e03030', fontWeight: 700 }}>{display}</span>
}

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    upcoming: { label: 'Before',  color: '#1a1aff', bg: '#eef' },
    running:  { label: 'Running', color: '#fff',    bg: '#2a9d2a' },
    finished: { label: 'Finished',color: '#666',    bg: '#eee' },
  }
  const s = map[status]
  return (
    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '3px', background: s.bg, color: s.color, fontWeight: 700 }}>
      {s.label}
    </span>
  )
}

export default function Home() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/contests')
      .then(res => setContests(res.data))
      .finally(() => setLoading(false))
  }, [])

  const upcoming  = contests.filter(c => getStatus(c.startTime, c.endTime) === 'upcoming')
  const running   = contests.filter(c => getStatus(c.startTime, c.endTime) === 'running')
  const finished  = contests.filter(c => getStatus(c.startTime, c.endTime) === 'finished')
  const ordered   = [...running, ...upcoming, ...finished]

  return (
    <div>
      <h2>Contests</h2>

      {loading && <p style={{ color: '#999' }}>Loading...</p>}

      {!loading && ordered.length === 0 && (
        <p style={{ color: '#999', marginTop: '20px' }}>No contests yet.</p>
      )}

      {!loading && ordered.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
              <th style={th}>Name</th>
              <th style={th}>Writers</th>
              <th style={th}>Start</th>
              <th style={th}>Duration</th>
              <th style={th}>Status</th>
              <th style={th}>Countdown</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((c, i) => {
              const status = getStatus(c.startTime, c.endTime)
              return (
                <tr key={c.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9', borderBottom: '1px solid #e8e8e8' }}>
                  <td style={td}>
                    <Link to={`/contests/${c.id}`} style={{ color: '#1a1aff', textDecoration: 'none', fontWeight: 600 }}>
                      {c.title}
                    </Link>
                    <span style={{ marginLeft: '8px', fontSize: '11px', color: '#888', background: '#eee', padding: '1px 6px', borderRadius: '3px' }}>
                      {c.type}
                    </span>
                  </td>
                  <td style={{ ...td, color: '#666' }}>{c.createdby?.username}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{new Date(c.startTime).toLocaleString()}</td>
                  <td style={td}>{formatDuration(c.startTime, c.endTime)}</td>
                  <td style={td}>{statusBadge(status)}</td>
                  <td style={td}>
                    {status === 'upcoming' && <CountDown to={c.startTime} />}
                    {status === 'running'  && <CountDown to={c.endTime} />}
                    {status === 'finished' && <span style={{ color: '#aaa', fontSize: '12px' }}>—</span>}
                  </td>
                  <td style={td}>
                    {status !== 'finished' && (
                      <Link to={`/contests/${c.id}`} style={{ fontSize: '12px', color: '#1a1aff' }}>
                        {status === 'running' ? 'Enter →' : 'Register →'}
                      </Link>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

const th: React.CSSProperties = { padding: '8px 12px', fontWeight: 700, fontSize: '12px', color: '#555', borderBottom: '2px solid #ddd' }
const td: React.CSSProperties = { padding: '10px 12px' }
