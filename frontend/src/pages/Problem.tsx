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

const styles = {
  layout:       'grid grid-cols-2 gap-6 h-[calc(100vh-120px)]',
  leftPane:     'overflow-y-auto pr-3',
  titleRow:     'flex items-baseline gap-3 mb-1',
  problemTitle: 'text-xl font-bold m-0',
  diffLabel:    'text-sm text-gray-400',
  tagsRow:      'flex gap-1.5 flex-wrap mb-3',
  tag:          'text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded',
  limitsRow:    'text-xs text-gray-500 mb-4 flex gap-4',
  section:      'mb-4',
  sectionTitle: 'text-base font-bold mb-1',
  body:         'leading-relaxed whitespace-pre-wrap text-sm',
  exampleBlock: 'mb-3',
  exampleGrid:  'grid grid-cols-2 gap-2',
  exampleLabel: 'text-xs font-bold mb-1 text-gray-500',
  examplePre:   'bg-gray-100 p-2 rounded text-xs m-0 font-mono',
  rightPane:    'flex flex-col gap-2',
  toolbar:      'flex gap-2 items-center',
  langSelect:   'text-sm border border-gray-300 rounded px-2 py-1 outline-none',
  errorMsg:     'text-red-500 text-sm',
  submitBtn:    'ml-auto px-5 py-1.5 bg-blue-700 text-white font-semibold rounded text-sm cursor-pointer border-none',
  submitBtnOff: 'ml-auto px-5 py-1.5 bg-gray-400 text-white font-semibold rounded text-sm cursor-default border-none',
  editorWrap:   'flex-1 border border-gray-200 rounded overflow-hidden',
  loading:      'text-gray-400',
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

  if (!problem) return <p className={styles.loading}>Loading...</p>

  return (
    <div className={styles.layout}>
      {/* Left — problem statement */}
      <div className={styles.leftPane}>
        <div className={styles.titleRow}>
          <h2 className={styles.problemTitle}>{problem.code}. {problem.title}</h2>
          <span className={styles.diffLabel}>{problem.difficulty}</span>
        </div>

        <div className={styles.tagsRow}>
          {problem.tags.map(t => (
            <span key={t.tag.name} className={styles.tag}>{t.tag.name}</span>
          ))}
        </div>

        <div className={styles.limitsRow}>
          <span>Time: {problem.timeLimit / 60000} min</span>
          <span>Memory: {problem.memoryLimit}MB</span>
        </div>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Problem Statement</h3>
          <p className={styles.body}>{problem.statement}</p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Input Format</h3>
          <p className={styles.body}>{problem.inputFormat}</p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Output Format</h3>
          <p className={styles.body}>{problem.outputFormat}</p>
        </section>

        {problem.testCases.map((tc, i) => (
          <div key={i} className={styles.exampleBlock}>
            <h3 className={styles.sectionTitle}>Example {i + 1}</h3>
            <div className={styles.exampleGrid}>
              <div>
                <div className={styles.exampleLabel}>Input</div>
                <pre className={styles.examplePre}>{tc.input}</pre>
              </div>
              <div>
                <div className={styles.exampleLabel}>Output</div>
                <pre className={styles.examplePre}>{tc.expectedOutput}</pre>
              </div>
            </div>
          </div>
        ))}

        {problem.notes && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Notes</h3>
            <p className={styles.body}>{problem.notes}</p>
          </section>
        )}
      </div>

      {/* Right — editor */}
      <div className={styles.rightPane}>
        <div className={styles.toolbar}>
          <select className={styles.langSelect} value={language} onChange={e => changeLanguage(e.target.value)}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          {error && <span className={styles.errorMsg}>{error}</span>}
          <button onClick={submit} disabled={submitting} className={submitting ? styles.submitBtnOff : styles.submitBtn}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        <div className={styles.editorWrap}>
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
