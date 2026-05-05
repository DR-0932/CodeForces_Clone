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
  if (now < new Date(start).getTime()) return 'upcoming'
  if (now <= new Date(end).getTime()) return 'running'
  return 'finished'
}

function formatDuration(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}h ${m}m`
}

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    upcoming: { label: 'Before',   color: '#1a1aff', bg: '#eef' },
    running:  { label: 'Running',  color: '#fff',    bg: '#2a9d2a' },
    finished: { label: 'Finished', color: '#666',    bg: '#eee' },
  }
  const s = map[status]
  return (
    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '3px', background: s.bg, color: s.color, fontWeight: 700 }}>
      {s.label}
    </span>
  )
}

export default function Contests() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/contests').then(res => setContests(res.data)).finally(() => setLoading(false))
  }, [])

  const ordered = [
    ...contests.filter(c => getStatus(c.startTime, c.endTime) === 'running'),
    ...contests.filter(c => getStatus(c.startTime, c.endTime) === 'upcoming'),
    ...contests.filter(c => getStatus(c.startTime, c.endTime) === 'finished'),
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>Contests</h2>
        {localStorage.getItem('token') && (
          <Link to="/contests/new">
            <button style={{ background: '#1a1aff', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>
              + Create Contest
            </button>
          </Link>
        )}
      </div>

      {loading ? <p style={{ color: '#999' }}>Loading...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={th}>Name</th>
              <th style={th}>Type</th>
              <th style={th}>Start</th>
              <th style={th}>Duration</th>
              <th style={th}>Status</th>
              <th style={th}>By</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((c, i) => (
              <tr key={c.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9', borderBottom: '1px solid #eee' }}>
                <td style={td}>
                  <Link to={`/contests/${c.id}`} style={{ color: '#1a1aff', textDecoration: 'none', fontWeight: 600 }}>
                    {c.title}
                  </Link>
                </td>
                <td style={{ ...td, color: '#888' }}>{c.type}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{new Date(c.startTime).toLocaleString()}</td>
                <td style={td}>{formatDuration(c.startTime, c.endTime)}</td>
                <td style={td}>{statusBadge(getStatus(c.startTime, c.endTime))}</td>
                <td style={{ ...td, color: '#888' }}>{c.createdby?.username}</td>
              </tr>
            ))}
            {ordered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#999' }}>No contests yet</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

const th: React.CSSProperties = { padding: '8px 12px', textAlign: 'left', fontWeight: 700, fontSize: '12px', color: '#555', borderBottom: '2px solid #ddd' }
const td: React.CSSProperties = { padding: '10px 12px' }
