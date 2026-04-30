'use client'

import { useState } from 'react'
import { CardShell, SectionHeader, LoadingSpinner, ErrorDisplay, CopyBtn } from '@/lib/utils'
import { ShieldAlert, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function WafPage() {
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleScan = async () => {
    if (!target.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/waf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target: target.trim() }) })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="WAF Detector" description="Detect Web Application Firewall and find bypass techniques" />
      <CardShell>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input placeholder="https://example.com" value={target} onChange={(e) => setTarget(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
          </div>
          <Button onClick={handleScan} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium">
            <Search className="w-4 h-4 mr-2" />{loading ? 'Detecting...' : 'Detect WAF'}
          </Button>
        </div>
      </CardShell>
      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}
      {result && (
        <div className="space-y-4">
          <CardShell>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${result.detected ? 'bg-orange-500/20' : 'bg-emerald-500/20'}`}>
                <ShieldAlert className={`w-6 h-6 ${result.detected ? 'text-orange-400' : 'text-emerald-400'}`} />
              </div>
              <div>
                <p className="text-white font-medium text-lg">{result.waf || 'No WAF Detected'}</p>
                {result.confidence && <p className="text-zinc-400 text-sm">Confidence: <span className="text-white font-medium">{result.confidence}%</span></p>}
              </div>
            </div>
          </CardShell>

          {result.fingerprints?.length > 0 && (
            <CardShell>
              <h3 className="text-lg font-semibold text-white mb-3">Fingerprints</h3>
              <div className="space-y-2">
                {result.fingerprints.map((f: string, i: number) => (
                  <div key={i} className="bg-zinc-800/50 rounded-lg p-3 text-sm text-zinc-400 border border-zinc-700">{f}</div>
                ))}
              </div>
            </CardShell>
          )}

          {result.bypassTips?.length > 0 && (
            <CardShell>
              <h3 className="text-lg font-semibold text-white mb-3">Bypass Techniques</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {result.bypassTips.map((tip: any, i: number) => (
                  <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white font-medium text-sm">{tip.technique}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        tip.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                        tip.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                      }`}>{tip.difficulty}</span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-2">{tip.description}</p>
                    {tip.payload && (
                      <div className="flex items-center gap-2 bg-zinc-900 rounded px-3 py-2">
                        <code className="text-emerald-400 text-xs font-mono flex-1">{tip.payload}</code>
                        <CopyBtn text={tip.payload} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardShell>
          )}
        </div>
      )}
    </div>
  )
}
