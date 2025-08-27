import { useMemo, useState } from 'react'
import './App.css'

type ShortenResponse = {
  url: string
  short: string
  expiry: number
  rate_limit: number
  rate_limit_reset: number
}

function App() {
  const apiBase = useMemo(() => import.meta.env.VITE_API_BASE || 'http://localhost:3000', [])
  const [url, setUrl] = useState('')
  const [custom, setCustom] = useState('')
  const [expiry, setExpiry] = useState<number>(24)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ShortenResponse | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`${apiBase}/api/v1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, short: custom || undefined, expiry })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as any).error || `Request failed with ${res.status}`)
      }
      const data = (await res.json()) as ShortenResponse
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: 16 }}>
      <h1>URL Shortener</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          <div>URL to shorten</div>
          <input
            type="url"
            required
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          />
        </label>
        <label>
          <div>Custom alias (optional)</div>
          <input
            type="text"
            placeholder="myid"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          />
        </label>
        <label>
          <div>Expiry in hours</div>
          <input
            type="number"
            min={1}
            value={expiry}
            onChange={(e) => setExpiry(Number(e.target.value))}
            style={{ width: '100%', padding: 8 }}
          />
        </label>
        <button type="submit" disabled={loading} style={{ padding: 10 }}>
          {loading ? 'Shortening…' : 'Shorten URL'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'white', background: '#c0392b', padding: 8, marginTop: 12 }}>{error}</div>
      )}

      {result && (
        <div style={{ marginTop: 16, padding: 12, border: '1px solid #ddd' }}>
          <div><strong>Original:</strong> {result.url}</div>
          <div>
            <strong>Short:</strong>{' '}
            <a href={result.short} target="_blank" rel="noreferrer">
              {result.short}
            </a>
          </div>
          <div><strong>Expires in:</strong> {result.expiry} hours</div>
          <div><strong>Rate remaining:</strong> {result.rate_limit}</div>
          <div><strong>Rate resets in:</strong> {result.rate_limit_reset} minutes</div>
        </div>
      )}
    </div>
  )
}

export default App
