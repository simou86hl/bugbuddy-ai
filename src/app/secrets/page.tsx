'use client'

import { useState } from 'react'
import { CardShell, SectionHeader, LoadingSpinner, ErrorDisplay, SeverityBadge, CopyBtn } from '@/lib/utils'
import { Eye, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function SecretsPage() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleScan = async () => {
    if (!input.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/secrets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: input.trim() }) })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Secret Scanner" description="Scan code or text for leaked secrets, API keys, tokens, and credentials" />
      <CardShell>
        <Textarea placeholder="Paste your code or configuration files here to scan for secrets..."
          value={input} onChange={(e) => setInput(e.target.value)}
          className="min-h-[120px] bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 font-mono text-sm resize-none" />
        <div className="mt-3 flex justify-end">
          <Button onClick={handleScan} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium">
            <Eye className="w-4 h-4 mr-2" />{loading ? 'Scanning...' : 'Scan for Secrets'}
          </Button>
        </div>
      </CardShell>
      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <CardShell className="text-center">
              <p className="text-2xl font-bold text-white">{result.total || result.findings?.length || 0}</p>
              <p className="text-xs text-zinc-500">Findings</p>
            </CardShell>
            <CardShell className="text-center">
              <p className="text-2xl font-bold text-red-400">{result.criticalCount || 0}</p>
              <p className="text-xs text-zinc-500">Critical</p>
            </CardShell>
          </div>
          <CardShell>
            <h3 className="text-lg font-semibold text-white mb-4">Findings</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {result.findings?.map((f: any, i: number) => (
                <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-medium text-sm">{f.type}</span>
                    <SeverityBadge severity={f.severity} />
                    {f.line && <span className="text-zinc-500 text-xs">Line {f.line}</span>}
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-900 rounded px-3 py-2 mb-2">
                    <code className="text-red-400 text-xs font-mono flex-1">{f.value}</code>
                    <CopyBtn text={f.value} />
                  </div>
                  <p className="text-zinc-400 text-sm">{f.description}</p>
                  {f.regex && <p className="text-zinc-600 text-xs mt-1 font-mono">Pattern: {f.regex}</p>}
                </div>
              ))}
              {(!result.findings || result.findings.length === 0) && (
                <div className="text-center text-emerald-400 py-8">
                  <Eye className="w-8 h-8 mx-auto mb-2" />
                  <p>No secrets detected. Your code looks clean!</p>
                </div>
              )}
            </div>
          </CardShell>
        </div>
      )}
    </div>
  )
}
