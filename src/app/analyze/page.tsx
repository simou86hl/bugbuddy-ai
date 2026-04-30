'use client'

import { useState } from 'react'
import { CardShell, SectionHeader, LoadingSpinner, ErrorDisplay, SeverityBadge, CopyBtn } from '@/lib/utils'
import { Crosshair, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AnalyzePage() {
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleAnalyze = async () => {
    if (!target.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target.trim() }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Target Analyzer" description="Analyze a target for technologies, attack surfaces, and risk assessment" />
      <CardShell>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Crosshair className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="https://example.com"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
          <Button onClick={handleAnalyze} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium">
            <Search className="w-4 h-4 mr-2" />
            {loading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </CardShell>

      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}

      {result && (
        <div className="space-y-4">
          {/* Risk Assessment */}
          {result.riskAssessment && (
            <CardShell>
              <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment</h3>
              <div className="flex items-center gap-4 mb-3">
                <div className={`text-4xl font-bold ${result.riskAssessment.score >= 70 ? 'text-red-400' : result.riskAssessment.score >= 40 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                  {result.riskAssessment.score}/100
                </div>
                <SeverityBadge severity={result.riskAssessment.level} />
              </div>
              <p className="text-zinc-400 text-sm">{result.riskAssessment.summary}</p>
            </CardShell>
          )}

          {/* Technologies */}
          {result.technologies && result.technologies.length > 0 && (
            <CardShell>
              <h3 className="text-lg font-semibold text-white mb-4">Technologies Detected</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.technologies.map((t: any, i: number) => (
                  <div key={i} className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    {t.version && <p className="text-zinc-500 text-xs mt-1">v{t.version}</p>}
                    <span className="text-emerald-400 text-xs">{t.category}</span>
                  </div>
                ))}
              </div>
            </CardShell>
          )}

          {/* Attack Surfaces */}
          {result.attackSurfaces && result.attackSurfaces.length > 0 && (
            <CardShell>
              <h3 className="text-lg font-semibold text-white mb-4">Attack Surfaces</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {result.attackSurfaces.map((a: any, i: number) => (
                  <div key={i} className="flex items-start justify-between gap-3 bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium text-sm">{a.type}</span>
                        <SeverityBadge severity={a.severity} />
                      </div>
                      <p className="text-zinc-400 text-xs">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardShell>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <CardShell>
              <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
              <ul className="space-y-2">
                {result.recommendations.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-zinc-400 text-sm">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </CardShell>
          )}
        </div>
      )}
    </div>
  )
}
