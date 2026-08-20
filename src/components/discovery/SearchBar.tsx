import { Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'

const suggestions = ['study with me', 'student productivity', 'pomodoro']

export function SearchBar({ onSearch, loading, initialQuery = '' }: {
  onSearch: (query: string) => void
  loading: boolean
  initialQuery?: string
}) {
  const [query, setQuery] = useState(initialQuery)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (query.trim().length >= 2) onSearch(query.trim())
  }

  return (
    <section className="search-block" aria-label="YouTube creator search">
      <form className="search-form" onSubmit={submit}>
        <Search size={19} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a creator niche or topic" aria-label="Search query" />
        <Button type="submit" variant="primary" disabled={loading || query.trim().length < 2}>{loading ? 'Searching…' : 'Search YouTube'}</Button>
      </form>
      <div className="search-suggestions"><span>Try</span>{suggestions.map((value) => <button key={value} onClick={() => { setQuery(value); onSearch(value) }}>{value}</button>)}</div>
    </section>
  )
}
