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

const statusBadgeClass: Record<string, string> = {
  upcoming: 'bg-blue-50 text-blue-700',
  running:  'bg-green-600 text-white',
  finished: 'bg-gray-100 text-gray-500',
}

const statusLabel: Record<string, string> = {
  upcoming: 'Before',
  running:  'Running',
  finished: 'Finished',
}

const styles = {
  wrapper:      '',
  header:       'flex justify-between items-center mb-4',
  title:        'text-xl font-bold m-0',
  createBtn:    'bg-blue-700 text-white border-none rounded px-4 py-1.5 font-semibold cursor-pointer text-sm',
  loading:      'text-gray-400',
  table:        'w-full border-collapse text-sm',
  thead:        'bg-gray-100',
  th:           'px-3 py-2 text-left text-xs font-bold text-gray-500 border-b-2 border-gray-200',
  rowEven:      'bg-white border-b border-gray-100',
  rowOdd:       'bg-gray-50 border-b border-gray-100',
  td:           'px-3 py-2.5',
  tdMuted:      'px-3 py-2.5 text-gray-400',
  tdNowrap:     'px-3 py-2.5 whitespace-nowrap',
  titleLink:    'text-blue-700 font-semibold no-underline',
  badge:        'text-xs px-2 py-0.5 rounded font-bold',
  empty:        'px-3 py-6 text-center text-gray-400',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`${styles.badge} ${statusBadgeClass[status] || ''}`}>
      {statusLabel[status]}
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
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Contests</h2>
        {localStorage.getItem('token') && (
          <Link to="/contests/new">
            <button className={styles.createBtn}>+ Create Contest</button>
          </Link>
        )}
      </div>

      {loading ? <p className={styles.loading}>Loading...</p> : (
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Type</th>
              <th className={styles.th}>Start</th>
              <th className={styles.th}>Duration</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>By</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((c, i) => (
              <tr key={c.id} className={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td className={styles.td}>
                  <Link to={`/contests/${c.id}`} className={styles.titleLink}>{c.title}</Link>
                </td>
                <td className={styles.tdMuted}>{c.type}</td>
                <td className={styles.tdNowrap}>{new Date(c.startTime).toLocaleString()}</td>
                <td className={styles.td}>{formatDuration(c.startTime, c.endTime)}</td>
                <td className={styles.td}><StatusBadge status={getStatus(c.startTime, c.endTime)} /></td>
                <td className={styles.tdMuted}>{c.createdby?.username}</td>
              </tr>
            ))}
            {ordered.length === 0 && (
              <tr><td colSpan={6} className={styles.empty}>No contests yet</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
