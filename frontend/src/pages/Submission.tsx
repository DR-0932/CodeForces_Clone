import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'

interface Submission {
  id: number
  verdict: string
  language: string
  code: string
  timeUsed: number | null
  memoryUsed: number | null
  failedTest: number | null
  submittedAt: string
  problem: { code: string; title: string }
  user: { username: string }
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
  wrapper:      'max-w-3xl',
  backLink:     'text-sm text-blue-700 no-underline mb-4 block',
  card:         'border border-gray-200 rounded-lg p-5 mb-5',
  verdictText:  'text-xl font-bold',
  metaRow:      'flex gap-6 mt-3 text-sm text-gray-500',
  metaStrong:   'text-gray-800 font-semibold',
  failedStrong: 'text-red-500 font-semibold',
  submitted:    'mt-2 text-xs text-gray-400',
  codeTitle:    'font-bold mb-2',
  codePre:      'bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto leading-relaxed font-mono',
  loading:      'text-gray-400',
}

export default function Submission() {
  const { id } = useParams<{ id: string }>()
  const [submission, setSubmission] = useState<Submission | null>(null)

  useEffect(() => {
    const poll = async () => {
      const res = await api.get(`/submissions/${id}`)
      setSubmission(res.data)
      if (res.data.verdict === 'PENDING') {
        setTimeout(poll, 1500)
      }
    }
    poll()
  }, [id])

  if (!submission) return <p className={styles.loading}>Loading...</p>

  const vc = verdictClass[submission.verdict] || 'text-gray-700'

  return (
    <div className={styles.wrapper}>
      <Link to={`/problems/${submission.problem.code}`} className={styles.backLink}>
        ← {submission.problem.code}. {submission.problem.title}
      </Link>

      <div className={styles.card}>
        <div className={`${styles.verdictText} ${vc}`}>
          {submission.verdict === 'PENDING' ? '⏳ Judging...' : submission.verdict.replace(/_/g, ' ')}
        </div>

        <div className={styles.metaRow}>
          <span>Language: <strong className={styles.metaStrong}>{submission.language}</strong></span>
          {submission.timeUsed !== null && (
            <span>Time: <strong className={styles.metaStrong}>{submission.timeUsed}ms</strong></span>
          )}
          {submission.memoryUsed !== null && (
            <span>Memory: <strong className={styles.metaStrong}>{(submission.memoryUsed / 1024).toFixed(1)}MB</strong></span>
          )}
          {submission.failedTest !== null && (
            <span>Failed on test: <strong className={styles.failedStrong}>#{submission.failedTest}</strong></span>
          )}
        </div>

        <div className={styles.submitted}>
          Submitted by {submission.user.username} at {new Date(submission.submittedAt).toLocaleString()}
        </div>
      </div>

      <div>
        <h3 className={styles.codeTitle}>Code</h3>
        <pre className={styles.codePre}>{submission.code}</pre>
      </div>
    </div>
  )
}
