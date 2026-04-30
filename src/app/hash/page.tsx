'use client'

import { useState } from 'react'
import { CardShell, SectionHeader, LoadingSpinner, ErrorDisplay, SeverityBadge } from '@/lib/utils'
import { Hash, Search, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { identifyHash } from '@/lib/utils'

export default function HashPage() {
  const [hash, setHash] = useState('')
  const [identified, setIdentified] = useState<any[] | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleIdentify = () => {
    if (!hash.trim()) return
    setError('')
    try {
      const results = identifyHash(hash.trim())
      setIdentified(results)
    } catch (e: any) { setError(e.message) }
  }

  const handleAiAnalysis = async () => {
    if (!hash.trim()) return
    setAiLoading(true); setError(''); setAiResult(null)
    try {
      const res = await fetch('/api/hash', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hash: hash.trim() }) })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setAiResult(data)
    } catch (e: any) { setError(e.message) }
    finally { setAiLoading(false) }
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Hash Identifier" description="Identify hash types and get cracking suggestions" />
      <CardShell>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input placeholder="Paste hash value here..." value={hash} onChange={(e) => setHash(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleIdentify()}
              className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 font-mono" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleIdentify} variant="outline" className="border-zinc-700 text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/50">
              <Search className="w-4 h-4 mr-2" />Identify
            </Button>
            <Button onClick={handleAiAnalysis} disabled={aiLoading} className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium">
              <Bot className="w-4 h-4 mr-2" />{aiLoading ? 'Analyzing...' : 'AI Analysis'}
            </Button>
          </div>
        </div>
      </CardShell>

      {error && <ErrorDisplay message={error} />}

      {/* Client-side identification */}
      {identified && (
        <CardShell>
          <h3 className="text-lg font-semibold text-white mb-4">Identification Results</h3>
          <div className="space-y-2">
            {identified.map((info, i) => (
              <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-emerald-400 font-mono font-medium">{info.algorithm}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-zinc-700 text-zinc-300">{info.category}</span>
                </div>
                <p className="text-zinc-400 text-sm">{info.description}</p>
                <p className="text-zinc-500 text-xs mt-1">Length: {hash.trim().length} chars (expected: {info.length})</p>
              </div>
            ))}
          </div>
        </CardShell>
      )}

      {aiLoading && <LoadingSpinner />}

      {/* AI analysis results */}
      {aiResult && (
        <div className="space-y-4">
          {aiResult.crackingTools?.length > 0 && (
            <CardShell>
              <h3 className="text-lg font-semibold text-white mb-4">Cracking Tools</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {aiResult.crackingTools.map((tool: any, i: number) => (
                  <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <h4 className="text-white font-medium text-sm">{tool.name}</h4>
                    <p className="text-zinc-400 text-xs mt-1">{tool.description}</p>
                    {tool.bestFor && <p className="text-emerald-400 text-xs mt-1">Best for: {tool.bestFor}</p>}
                  </div>
                ))}
              </div>
            </CardShell>
          )}
          {aiResult.methods?.length > 0 && (
            <CardShell>
              <h3 className="text-lg font-semibold text-white mb-4">Recommended Methods</h3>
              <div className="space-y-2">
                {aiResult.methods.map((m: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                    <SeverityBadge severity={m.method === 'brute force' ? 'high' : m.method === 'dictionary attack' ? 'medium' : 'low'} />
                    <div>
                      <span className="text-white text-sm font-medium">{m.method}</span>
                      <p className="text-zinc-400 text-xs">{m.description}</p>
                    </div>
                    {m.estimatedTime && <span className="ml-auto text-zinc-500 text-xs">{m.estimatedTime}</span>}
                  </div>
                ))}
              </div>
            </CardShell>
          )}
          {aiResult.recommendations?.length > 0 && (
            <CardShell>
              <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
              <ul className="space-y-2">{aiResult.recommendations.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-zinc-400 text-sm"><span className="text-emerald-400">•</span>{r}</li>
              ))}</ul>
            </CardShell>
          )}
        </div>
      )}
    </div>
  )
}
