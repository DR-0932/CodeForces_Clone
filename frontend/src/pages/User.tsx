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

const verdictClass: Record<string, string> = {
  ACCEPTED:             'text-green-600',
  WRONG_ANSWER:         'text-red-500',
  TIME_LIMIT_EXCEEDED:  'text-orange-400',
  MEMORY_LIMIT_EXCEEDED:'text-orange-400',
  RUNTIME_ERROR:        'text-purple-700',
  COMPILATION_ERROR:    'text-gray-500',
  PENDING:              'text-blue-700',
}

const styles = {
  wrapper:      'max-w-4xl',
  profileCard:  'flex gap-5 items-center mb-6 p-5 border border-gray-200 rounded-lg',
  avatar:       'w-18 h-18 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400 font-bold shrink-0',
  username:     'text-2xl font-bold',
  rankRow:      'text-sm text-gray-400 mt-0.5',
  statsRow:     'flex gap-5 mt-2 text-sm',
  statRating:   'text-blue-700 font-bold',
  statSolved:   'text-green-600 font-bold',
  statMax:      'font-bold',
  sectionTitle: 'font-bold mb-3',
  table:        'w-full border-collapse text-sm',
  thead:        'bg-gray-100',
  th:           'px-3 py-2 text-left text-xs font-bold text-gray-500 border-b-2 border-gray-200',
  rowEven:      'bg-white border-b border-gray-100',
  rowOdd:       'bg-gray-50 border-b border-gray-100',
  td:           'px-3 py-2.5',
  tdMuted:      'px-3 py-2.5 text-gray-400',
  tdTime:       'px-3 py-2.5 text-gray-400 text-xs',
  problemLink:  'text-blue-700 no-underline',
  verdictLink:  'no-underline font-semibold',
  empty:        'px-3 py-5 text-center text-gray-400',
  loading:      'text-gray-400',
}

export default function User() {
  const { username } = useParams<{ username: string }>()
  const [user, setUser]         = useState<User | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api.get(`/users/${username}`)
      .then(res => setUser(res.data))
      .catch(() => setNotFound(true))
  }, [username])

  if (notFound) return <p className={styles.loading}>User not found.</p>
  if (!user)    return <p className={styles.loading}>Loading...</p>

  return (
    <div className={styles.wrapper}>
      <div className={styles.profileCard}>
        <div className={styles.avatar}>{user.username[0].toUpperCase()}</div>
        <div>
          <div className={styles.username}>{user.username}</div>
          <div className={styles.rankRow}>{user.rank}{user.country && ` · ${user.country}`}</div>
          <div className={styles.statsRow}>
            <span>Rating: <strong className={styles.statRating}>{user.rating}</strong></span>
            <span>Max: <strong className={styles.statMax}>{user.maxRating}</strong></span>
            <span>Solved: <strong className={styles.statSolved}>{user.totalSolved}</strong></span>
          </div>
        </div>
      </div>

      <h3 className={styles.sectionTitle}>Recent Submissions</h3>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>Problem</th>
            <th className={styles.th}>Verdict</th>
            <th className={styles.th}>Language</th>
            <th className={styles.th}>Time</th>
          </tr>
        </thead>
        <tbody>
          {user.recentSubmissions.map((s, i) => (
            <tr key={s.id} className={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
              <td className={styles.td}>
                <Link to={`/problems/${s.problem.code}`} className={styles.problemLink}>
                  {s.problem.code}. {s.problem.title}
                </Link>
              </td>
              <td className={`${styles.td} ${verdictClass[s.verdict] || 'text-gray-700'}`}>
                <Link to={`/submissions/${s.id}`} className={styles.verdictLink} style={{ color: 'inherit' }}>
                  {s.verdict.replace(/_/g, ' ')}
                </Link>
              </td>
              <td className={styles.tdMuted}>{s.language}</td>
              <td className={styles.tdTime}>{new Date(s.submittedAt).toLocaleString()}</td>
            </tr>
          ))}
          {user.recentSubmissions.length === 0 && (
            <tr><td colSpan={4} className={styles.empty}>No submissions yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
