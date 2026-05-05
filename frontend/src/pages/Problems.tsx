import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/client'

interface Problem {
  code: string
  title: string
  difficulty: number
  tags: { tag: { name: string } }[]
  _count: { submissions: number }
}

function difficultyColor(d: number) {
  if (d < 1200) return '#808080'
  if (d < 1600) return '#008000'
  if (d < 1900) return '#03a89e'
  if (d < 2100) return '#0000ff'
  if (d < 2400) return '#aa00aa'
  return '#ff0000'
}

export default function Problems() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()

  const tag  = searchParams.get('tag') || ''
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    setLoading(true)
    api.get('/problems', { params: { tag, search, page, limit: 50 } })
      .then(res => setProblems(res.data))
      .finally(() => setLoading(false))
  }, [tag, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams({ ...(tag && { tag }), search, page: '1' })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>Problemset</h2>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '220px' }}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {tag && (
        <div style={{ marginBottom: '12px', fontSize: '13px' }}>
          Filtering by tag: <strong>{tag}</strong>
          <button onClick={() => setSearchParams({})} style={{ marginLeft: '8px', fontSize: '12px' }}>✕ Clear</button>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#999' }}>Loading...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={th}>#</th>
              <th style={th}>Title</th>
              <th style={th}>Tags</th>
              <th style={th}>Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((p, i) => (
              <tr key={p.code} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9', borderBottom: '1px solid #eee' }}>
                <td style={{ ...td, color: '#888', width: '60px' }}>{p.code}</td>
                <td style={td}>
                  <Link to={`/problems/${p.code}`} style={{ color: '#1a1aff', textDecoration: 'none', fontWeight: 600 }}>
                    {p.title}
                  </Link>
                </td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {p.tags.map(t => (
                      <span
                        key={t.tag.name}
                        onClick={() => setSearchParams({ tag: t.tag.name })}
                        style={{ fontSize: '11px', padding: '2px 7px', background: '#e8f0fe', color: '#1a1aff', borderRadius: '3px', cursor: 'pointer' }}
                      >
                        {t.tag.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ ...td, fontWeight: 700, color: difficultyColor(p.difficulty) }}>{p.difficulty}</td>
              </tr>
            ))}
            {problems.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#999' }}>No problems found</td></tr>
            )}
          </tbody>
        </table>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
        {page > 1 && (
          <button onClick={() => setSearchParams({ ...(tag && { tag }), page: String(page - 1) })}>← Prev</button>
        )}
        <span style={{ padding: '5px 12px', fontSize: '13px' }}>Page {page}</span>
        {problems.length === 50 && (
          <button onClick={() => setSearchParams({ ...(tag && { tag }), page: String(page + 1) })}>Next →</button>
        )}
      </div>
    </div>
  )
}

const th: React.CSSProperties = { padding: '8px 12px', textAlign: 'left', fontWeight: 700, fontSize: '12px', color: '#555', borderBottom: '2px solid #ddd' }
const td: React.CSSProperties = { padding: '10px 12px' }
