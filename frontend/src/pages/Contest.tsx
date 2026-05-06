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

const styles = {
  wrapper:       '',
  header:        'mb-5',
  contestTitle:  'text-xl font-bold mb-1',
  metaRow:       'text-sm text-gray-500 flex gap-4',
  actionRow:     'flex gap-3 items-center mb-4',
  registerBtn:   'bg-blue-700 text-white border-none rounded px-4 py-1.5 font-semibold cursor-pointer text-sm',
  registerOff:   'bg-gray-400 text-white border-none rounded px-4 py-1.5 font-semibold cursor-default text-sm',
  msgOk:         'text-sm text-green-600',
  msgErr:        'text-sm text-red-500',
  tabs:          'flex border-b-2 border-gray-200 mb-4',
  tabActive:     'px-4 py-2 border-none bg-none font-bold text-sm cursor-pointer border-b-2 border-blue-700 text-blue-700 -mb-0.5 capitalize',
  tabInactive:   'px-4 py-2 border-none bg-none font-bold text-sm cursor-pointer border-b-2 border-transparent text-gray-500 -mb-0.5 capitalize',
  table:         'w-full border-collapse text-sm',
  thead:         'bg-gray-100',
  th:            'px-3 py-2 text-left text-xs font-bold text-gray-500 border-b-2 border-gray-200',
  rowEven:       'bg-white border-b border-gray-100',
  rowOdd:        'bg-gray-50 border-b border-gray-100',
  td:            'px-3 py-2.5',
  tdLabel:       'px-3 py-2.5 font-bold w-12',
  tdMuted:       'px-3 py-2.5 text-gray-400',
  tdRank:        'px-3 py-2.5 text-gray-400',
  problemLink:   'text-blue-700 font-semibold no-underline',
  problemMuted:  'text-gray-400',
  userLink:      'text-blue-700 font-semibold no-underline',
  empty:         'px-3 py-5 text-center text-gray-400',
  addForm:       'flex gap-2 items-center mt-4',
  addInput:      'border border-gray-300 rounded px-2 py-1.5 text-sm outline-none',
  addInputWide:  'w-44 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none',
  addInputSmall: 'w-24 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none',
  addBtn:        'bg-blue-700 text-white border-none rounded px-3 py-1.5 font-semibold cursor-pointer text-sm',
  addBtnOff:     'bg-gray-400 text-white border-none rounded px-3 py-1.5 font-semibold cursor-default text-sm',
  addError:      'text-sm text-red-500',
  loading:       'text-gray-400',
}

export default function Contest() {
  const { id } = useParams<{ id: string }>()
  const [contest, setContest]     = useState<Contest | null>(null)
  const [standings, setStandings] = useState<Standing[]>([])
  const [tab, setTab]             = useState<'problems' | 'standings'>('problems')
  const [registering, setRegistering] = useState(false)
  const [message, setMessage]     = useState('')
  const [addForm, setAddForm]     = useState({ problemCode: '', label: '' })
  const [adding, setAdding]       = useState(false)
  const [addError, setAddError]   = useState('')

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

  const addProblem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAddError('')
    setAdding(true)
    try {
      await api.post(`/contests/${id}/problems`, addForm)
      const res = await api.get(`/contests/${id}`)
      setContest(res.data)
      setAddForm({ problemCode: '', label: '' })
    } catch (err: any) {
      setAddError(err.response?.data?.error || 'Failed to add problem')
    } finally {
      setAdding(false)
    }
  }

  if (!contest) return <p className={styles.loading}>Loading...</p>

  const now      = Date.now()
  const started  = now >= new Date(contest.startTime).getTime()
  const finished = now > new Date(contest.endTime).getTime()
  const isOwner  = localStorage.getItem('username') === contest.createdby?.username

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.contestTitle}>{contest.title}</h2>
        <div className={styles.metaRow}>
          <span>{contest.type}</span>
          <span>{new Date(contest.startTime).toLocaleString()} → {new Date(contest.endTime).toLocaleString()}</span>
          <span>By {contest.createdby?.username}</span>
        </div>
      </div>

      <div className={styles.actionRow}>
        {!finished && (
          <button onClick={register} disabled={registering} className={registering ? styles.registerOff : styles.registerBtn}>
            {registering ? 'Registering...' : 'Register'}
          </button>
        )}
        {message && (
          <span className={message.includes('success') ? styles.msgOk : styles.msgErr}>{message}</span>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {(['problems', 'standings'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? styles.tabActive : styles.tabInactive}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'problems' && (
        <>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th}>#</th>
                <th className={styles.th}>Problem</th>
                <th className={styles.th}>Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {contest.problems.map((cp, i) => (
                <tr key={cp.label} className={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td className={styles.tdLabel}>{cp.label}</td>
                  <td className={styles.td}>
                    {started ? (
                      <Link to={`/problems/${cp.problem.code}`} className={styles.problemLink}>
                        {cp.problem.title}
                      </Link>
                    ) : (
                      <span className={styles.problemMuted}>{cp.problem.title}</span>
                    )}
                  </td>
                  <td className={styles.tdMuted}>{cp.problem.difficulty}</td>
                </tr>
              ))}
              {contest.problems.length === 0 && (
                <tr><td colSpan={3} className={styles.empty}>No problems added yet</td></tr>
              )}
            </tbody>
          </table>

          {isOwner && (
            <form onSubmit={addProblem} className={styles.addForm}>
              <input
                type="text"
                placeholder="Problem code (e.g. 1A)"
                value={addForm.problemCode}
                onChange={e => setAddForm({ ...addForm, problemCode: e.target.value })}
                required
                className={styles.addInputWide}
              />
              <input
                type="text"
                placeholder="Label (e.g. A)"
                value={addForm.label}
                onChange={e => setAddForm({ ...addForm, label: e.target.value })}
                required
                className={styles.addInputSmall}
              />
              <button type="submit" disabled={adding} className={adding ? styles.addBtnOff : styles.addBtn}>
                {adding ? 'Adding...' : '+ Add Problem'}
              </button>
              {addError && <span className={styles.addError}>{addError}</span>}
            </form>
          )}
        </>
      )}

      {tab === 'standings' && (
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>#</th>
              <th className={styles.th}>User</th>
              <th className={styles.th}>Solved</th>
              <th className={styles.th}>Penalty</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => (
              <tr key={s.userId} className={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td className={styles.tdRank}>{i + 1}</td>
                <td className={styles.td}>
                  <Link to={`/users/${s.username}`} className={styles.userLink}>{s.username}</Link>
                </td>
                <td className={`${styles.td} font-bold`}>{s.solved}</td>
                <td className={styles.tdMuted}>{s.penalty}</td>
              </tr>
            ))}
            {standings.length === 0 && (
              <tr><td colSpan={4} className={styles.empty}>No submissions yet</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
