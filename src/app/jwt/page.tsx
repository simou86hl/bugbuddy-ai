'use client'

import { useState } from 'react'
import { CardShell, SectionHeader, LoadingSpinner, ErrorDisplay, SeverityBadge, CopyBtn } from '@/lib/utils'
import { KeyRound, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function JwtPage() {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleAnalyze = async () => {
    if (!token.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/jwt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: token.trim() }) })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const renderJsonBlock = (title: string, data: any) => (
    data && Object.keys(data).length > 0 ? (
      <CardShell>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <CopyBtn text={JSON.stringify(data, null, 2)} />
        </div>
        <pre className="bg-zinc-900 rounded-lg p-3 text-xs font-mono text-emerald-400 overflow-x-auto max-h-48 overflow-y-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardShell>
    ) : null
  )

  return (
    <div className="space-y-6">
      <SectionHeader title="JWT Analyzer" description="Decode and analyze JWT tokens for security vulnerabilities" />
      <CardShell>
        <Textarea placeholder="Paste your JWT token here (eyJhbGciOiJIUzI1NiIs...)"
          value={token} onChange={(e) => setToken(e.target.value)}
          className="min-h-[100px] bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 font-mono text-sm resize-none" />
        <div className="mt-3 flex justify-end">
          <Button onClick={handleAnalyze} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium">
            <KeyRound className="w-4 h-4 mr-2" />{loading ? 'Analyzing...' : 'Analyze JWT'}
          </Button>
        </div>
      </CardShell>
      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderJsonBlock('Header', result.header)}
            {renderJsonBlock('Payload', result.payload)}
          </div>
          {result.signature && (
            <CardShell>
              <h3 className="text-sm font-semibold text-white mb-2">Signature Analysis</h3>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-full text-xs ${result.signature.valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {result.signature.valid ? 'VALID' : 'INVALID'}
                </span>
                <span className="text-zinc-400 text-sm">Algorithm: <span className="text-white font-mono">{result.signature.algorithm}</span></span>
                {result.signature.notes && <p className="text-zinc-500 text-xs">{result.signature.notes}</p>}
              </div>
            </CardShell>
          )}
          {result.vulnerabilities?.length > 0 && (
            <CardShell>
              <h3 className="text-lg font-semibold text-white mb-3">Vulnerabilities Found</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {result.vulnerabilities.map((v: any, i: number) => (
                  <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white font-medium text-sm">{v.type}</span>
                      <SeverityBadge severity={v.severity} />
                    </div>
                    <p className="text-zinc-400 text-sm mb-2">{v.description}</p>
                    {v.remediation && (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded px-3 py-2 text-xs text-emerald-400">
                        <span className="font-medium">Remediation:</span> {v.remediation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardShell>
          )}
          {(!result.vulnerabilities || result.vulnerabilities.length === 0) && (
            <CardShell>
              <div className="text-center text-emerald-400 py-4">
                <KeyRound className="w-8 h-8 mx-auto mb-2" />
                <p>No vulnerabilities detected in this token.</p>
              </div>
            </CardShell>
          )}
        </div>
      )}
    </div>
  )
}
