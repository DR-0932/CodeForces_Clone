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

  return <span className="font-mono text-red-500 font-bold">{display}</span>
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
  title:        'text-xl font-bold mb-4',
  loading:      'text-gray-400',
  empty:        'text-gray-400 mt-5',
  table:        'w-full border-collapse text-sm',
  thead:        'bg-gray-100 text-left',
  th:           'px-3 py-2 text-xs font-bold text-gray-500 border-b-2 border-gray-200',
  rowEven:      'bg-white border-b border-gray-100',
  rowOdd:       'bg-gray-50 border-b border-gray-100',
  td:           'px-3 py-2.5',
  tdMuted:      'px-3 py-2.5 text-gray-400',
  tdNowrap:     'px-3 py-2.5 whitespace-nowrap',
  contestLink:  'text-blue-700 font-semibold no-underline',
  typeBadge:    'ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded',
  badge:        'text-xs px-2 py-0.5 rounded font-bold',
  finishedDash: 'text-gray-300 text-sm',
  actionLink:   'text-xs text-blue-700 no-underline',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`${styles.badge} ${statusBadgeClass[status] || ''}`}>
      {statusLabel[status]}
    </span>
  )
}

export default function Home() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading]   = useState(true)

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
      <h2 className={styles.title}>Contests</h2>

      {loading && <p className={styles.loading}>Loading...</p>}
      {!loading && ordered.length === 0 && <p className={styles.empty}>No contests yet.</p>}

      {!loading && ordered.length > 0 && (
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Writers</th>
              <th className={styles.th}>Start</th>
              <th className={styles.th}>Duration</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Countdown</th>
              <th className={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((c, i) => {
              const status = getStatus(c.startTime, c.endTime)
              return (
                <tr key={c.id} className={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td className={styles.td}>
                    <Link to={`/contests/${c.id}`} className={styles.contestLink}>{c.title}</Link>
                    <span className={styles.typeBadge}>{c.type}</span>
                  </td>
                  <td className={styles.tdMuted}>{c.createdby?.username}</td>
                  <td className={styles.tdNowrap}>{new Date(c.startTime).toLocaleString()}</td>
                  <td className={styles.td}>{formatDuration(c.startTime, c.endTime)}</td>
                  <td className={styles.td}><StatusBadge status={status} /></td>
                  <td className={styles.td}>
                    {status === 'upcoming' && <CountDown to={c.startTime} />}
                    {status === 'running'  && <CountDown to={c.endTime} />}
                    {status === 'finished' && <span className={styles.finishedDash}>—</span>}
                  </td>
                  <td className={styles.td}>
                    {status !== 'finished' && (
                      <Link to={`/contests/${c.id}`} className={styles.actionLink}>
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
