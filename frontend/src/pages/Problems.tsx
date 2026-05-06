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

const styles = {
  header:        'flex justify-between items-center mb-4',
  title:         'text-xl font-bold',
  searchForm:    'flex gap-2',
  searchInput:   'w-56 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none',
  searchBtn:     'px-3 py-1.5 text-sm border border-gray-300 rounded bg-gray-100 cursor-pointer',
  filterBar:     'mb-3 text-sm text-gray-600 flex items-center gap-2',
  clearBtn:      'text-xs border border-gray-300 rounded px-2 py-0.5 cursor-pointer bg-white',
  table:         'w-full border-collapse text-sm',
  thead:         'bg-gray-100',
  th:            'px-3 py-2 text-left text-xs font-bold text-gray-500 border-b-2 border-gray-200',
  rowEven:       'bg-white border-b border-gray-100',
  rowOdd:        'bg-gray-50 border-b border-gray-100',
  codeCell:      'px-3 py-2.5 text-gray-400 w-16',
  titleCell:     'px-3 py-2.5',
  titleLink:     'text-blue-700 font-semibold no-underline',
  tagsCell:      'px-3 py-2.5',
  tagsRow:       'flex gap-1 flex-wrap',
  tag:           'text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded cursor-pointer',
  diffCell:      'px-3 py-2.5 font-bold',
  empty:         'px-3 py-6 text-center text-gray-400 col-span-4',
  pagination:    'flex gap-2 mt-4 justify-center items-center',
  pageBtn:       'px-3 py-1.5 text-sm border border-gray-300 rounded bg-white cursor-pointer',
  pageLabel:     'text-sm px-3 py-1.5',
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
  const [problems, setProblems]     = useState<Problem[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
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
      <div className={styles.header}>
        <h2 className={styles.title}>Problemset</h2>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input className={styles.searchInput} type="text" placeholder="Search problems..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <button type="submit" className={styles.searchBtn}>Search</button>
        </form>
      </div>

      {tag && (
        <div className={styles.filterBar}>
          Filtering by tag: <strong>{tag}</strong>
          <button onClick={() => setSearchParams({})} className={styles.clearBtn}>✕ Clear</button>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>#</th>
              <th className={styles.th}>Title</th>
              <th className={styles.th}>Tags</th>
              <th className={styles.th}>Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((p, i) => (
              <tr key={p.code} className={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td className={styles.codeCell}>{p.code}</td>
                <td className={styles.titleCell}>
                  <Link to={`/problems/${p.code}`} className={styles.titleLink}>{p.title}</Link>
                </td>
                <td className={styles.tagsCell}>
                  <div className={styles.tagsRow}>
                    {p.tags.map(t => (
                      <span key={t.tag.name} className={styles.tag}
                        onClick={() => setSearchParams({ tag: t.tag.name })}>
                        {t.tag.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className={styles.diffCell} style={{ color: difficultyColor(p.difficulty) }}>{p.difficulty}</td>
              </tr>
            ))}
            {problems.length === 0 && (
              <tr><td colSpan={4} className={styles.empty}>No problems found</td></tr>
            )}
          </tbody>
        </table>
      )}

      <div className={styles.pagination}>
        {page > 1 && (
          <button className={styles.pageBtn}
            onClick={() => setSearchParams({ ...(tag && { tag }), page: String(page - 1) })}>← Prev</button>
        )}
        <span className={styles.pageLabel}>Page {page}</span>
        {problems.length === 50 && (
          <button className={styles.pageBtn}
            onClick={() => setSearchParams({ ...(tag && { tag }), page: String(page + 1) })}>Next →</button>
        )}
      </div>
    </div>
  )
}
