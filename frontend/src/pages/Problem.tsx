import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import api from '../api/client'

interface Problem {
  id: number
  code: string
  title: string
  statement: string
  inputFormat: string
  outputFormat: string
  notes: string
  timeLimit: number
  memoryLimit: number
  difficulty: number
  tags: { tag: { name: string } }[]
  testCases: { input: string; expectedOutput: string; orderIndex: number }[]
}

const LANGUAGES = ['CPP', 'PYTHON', 'JAVA', 'JAVASCRIPT']
const MONACO_LANG: Record<string, string> = {
  CPP: 'cpp', PYTHON: 'python', JAVA: 'java', JAVASCRIPT: 'javascript',
}
const DEFAULT_CODE: Record<string, string> = {
  CPP: '#include<iostream>\nusing namespace std;\nint main(){\n    \n    return 0;\n}',
  PYTHON: '# your code here\n',
  JAVA: 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}',
  JAVASCRIPT: 'const lines = require("fs").readFileSync("/dev/stdin","utf8").split("\\n");\n',
}

export default function Problem() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [language, setLanguage] = useState('CPP')
  const [userCode, setUserCode] = useState(DEFAULT_CODE['CPP'])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/problems/${code}`).then(res => setProblem(res.data))
  }, [code])

  const changeLanguage = (lang: string) => {
    setLanguage(lang)
    setUserCode(DEFAULT_CODE[lang])
  }

  const submit = async () => {
    if (!localStorage.getItem('token')) { setError('Login to submit'); return }
    setError('')
    setSubmitting(true)
    try {
      const res = await api.post('/submissions', { problemCode: code, language, code: userCode })
      navigate(`/submissions/${res.data.id}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (!problem) return <p style={{ color: '#999' }}>Loading...</p>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', height: 'calc(100vh - 120px)' }}>

      {/* Left — problem statement */}
      <div style={{ overflowY: 'auto', paddingRight: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '4px' }}>
          <h2 style={{ margin: 0 }}>{problem.code}. {problem.title}</h2>
          <span style={{ fontSize: '13px', color: '#888' }}>{problem.difficulty}</span>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {problem.tags.map(t => (
            <span key={t.tag.name} style={{ fontSize: '11px', padding: '2px 8px', background: '#e8f0fe', color: '#1a1aff', borderRadius: '3px' }}>
              {t.tag.name}
            </span>
          ))}
        </div>

        <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px', display: 'flex', gap: '16px' }}>
          <span>Time: {problem.timeLimit / 60000} min</span>
          <span>Memory: {problem.memoryLimit}MB</span>
        </div>

        <section style={{ marginBottom: '16px' }}>
          <h3>Problem Statement</h3>
          <p style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{problem.statement}</p>
        </section>

        <section style={{ marginBottom: '16px' }}>
          <h3>Input Format</h3>
          <p style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{problem.inputFormat}</p>
        </section>

        <section style={{ marginBottom: '16px' }}>
          <h3>Output Format</h3>
          <p style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{problem.outputFormat}</p>
        </section>

        {problem.testCases.map((tc, i) => (
          <div key={i} style={{ marginBottom: '12px' }}>
            <h3>Example {i + 1}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#555' }}>Input</div>
                <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px', margin: 0, fontSize: '13px' }}>{tc.input}</pre>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#555' }}>Output</div>
                <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px', margin: 0, fontSize: '13px' }}>{tc.expectedOutput}</pre>
              </div>
            </div>
          </div>
        ))}

        {problem.notes && (
          <section>
            <h3>Notes</h3>
            <p style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{problem.notes}</p>
          </section>
        )}
      </div>

      {/* Right — editor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select value={language} onChange={e => changeLanguage(e.target.value)} style={{ fontSize: '13px' }}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          {error && <span style={{ color: '#c0392b', fontSize: '13px' }}>{error}</span>}
          <button
            onClick={submit}
            disabled={submitting}
            style={{ marginLeft: 'auto', padding: '6px 20px', background: submitting ? '#999' : '#1a1aff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: submitting ? 'default' : 'pointer' }}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
          <Editor
            height="100%"
            language={MONACO_LANG[language]}
            value={userCode}
            onChange={v => setUserCode(v || '')}
            theme="vs-dark"
            options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false }}
          />
        </div>
      </div>
    </div>
  )
}
