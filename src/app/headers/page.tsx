'use client'

import { useState } from 'react'
import { CardShell, SectionHeader, LoadingSpinner, ErrorDisplay, SeverityBadge } from '@/lib/utils'
import { Shield, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function HeadersPage() {
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleScan = async () => {
    if (!target.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/headers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target: target.trim() }) })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const gradeColor: Record<string, string> = { A: 'text-emerald-400', B: 'text-blue-400', C: 'text-yellow-400', D: 'text-orange-400', F: 'text-red-400' }

  return (
    <div className="space-y-6">
      <SectionHeader title="Security Headers" description="Analyze HTTP security headers and get a security score" />
      <CardShell>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input placeholder="https://example.com" value={target} onChange={(e) => setTarget(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
          </div>
          <Button onClick={handleScan} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium">
            <Search className="w-4 h-4 mr-2" />{loading ? 'Analyzing...' : 'Analyze Headers'}
          </Button>
        </div>
      </CardShell>
      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}
      {result && (
        <div className="space-y-4">
          <CardShell>
            <div className="flex items-center gap-6">
              <div className={`text-6xl font-bold ${gradeColor[result.grade] || 'text-zinc-400'}`}>{result.grade || 'N/A'}</div>
              <div>
                <p className="text-white font-medium">Security Score: <span className="text-2xl">{result.score || 0}</span>/100</p>
                {result.summary && <p className="text-zinc-400 text-sm mt-1">{result.summary}</p>}
              </div>
            </div>
          </CardShell>
          <CardShell>
            <h3 className="text-lg font-semibold text-white mb-4">Header Analysis</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {result.headers?.map((h: any, i: number) => (
                <div key={i} className="flex items-start gap-3 bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                  <SeverityBadge severity={h.severity} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm font-mono">{h.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${h.status === 'present' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {h.status}
                      </span>
                    </div>
                    {h.value && <p className="text-zinc-500 text-xs font-mono truncate mb-1">{h.value}</p>}
                    <p className="text-zinc-400 text-xs">{h.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardShell>
          {result.recommendations?.length > 0 && (
            <CardShell>
              <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
              <ul className="space-y-2">{result.recommendations.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-zinc-400 text-sm"><span className="text-emerald-400">•</span>{r}</li>
              ))}</ul>
            </CardShell>
          )}
        </div>
      )}
    </div>
  )
}
