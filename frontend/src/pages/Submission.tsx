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

const verdictStyle = (v: string): React.CSSProperties => {
  const map: Record<string, string> = {
    ACCEPTED: '#2a9d2a',
    WRONG_ANSWER: '#e03030',
    TIME_LIMIT_EXCEEDED: '#e08030',
    MEMORY_LIMIT_EXCEEDED: '#e08030',
    RUNTIME_ERROR: '#aa00aa',
    COMPILATION_ERROR: '#555',
    PENDING: '#1a1aff',
  }
  return { color: map[v] || '#333', fontWeight: 700, fontSize: '20px' }
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

  if (!submission) return <p style={{ color: '#999' }}>Loading...</p>

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link to={`/problems/${submission.problem.code}`} style={{ fontSize: '13px', color: '#1a1aff' }}>
          ← {submission.problem.code}. {submission.problem.title}
        </Link>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '20px', marginBottom: '20px' }}>
        <div style={verdictStyle(submission.verdict)}>
          {submission.verdict === 'PENDING' ? '⏳ Judging...' : submission.verdict.replace(/_/g, ' ')}
        </div>

        <div style={{ display: 'flex', gap: '24px', marginTop: '12px', fontSize: '13px', color: '#666' }}>
          <span>Language: <strong style={{ color: '#222' }}>{submission.language}</strong></span>
          {submission.timeUsed !== null && <span>Time: <strong style={{ color: '#222' }}>{submission.timeUsed}ms</strong></span>}
          {submission.memoryUsed !== null && <span>Memory: <strong style={{ color: '#222' }}>{(submission.memoryUsed / 1024).toFixed(1)}MB</strong></span>}
          {submission.failedTest !== null && <span>Failed on test: <strong style={{ color: '#e03030' }}>#{submission.failedTest}</strong></span>}
        </div>

        <div style={{ marginTop: '8px', fontSize: '12px', color: '#aaa' }}>
          Submitted by {submission.user.username} at {new Date(submission.submittedAt).toLocaleString()}
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '8px' }}>Code</h3>
        <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '16px', borderRadius: '6px', fontSize: '13px', overflowX: 'auto', lineHeight: 1.5 }}>
          {submission.code}
        </pre>
      </div>
    </div>
  )
}
