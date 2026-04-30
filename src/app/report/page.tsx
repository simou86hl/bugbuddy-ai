'use client'

import { useState } from 'react'
import { CardShell, SectionHeader, LoadingSpinner, ErrorDisplay, CopyBtn } from '@/lib/utils'
import { FileText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const VULN_TYPES = [
  'XSS (Cross-Site Scripting)',
  'SQL Injection',
  'SSRF',
  'IDOR',
  'RCE (Remote Code Execution)',
  'LFI/RFI',
  'Open Redirect',
  'CSRF',
  'Authentication Bypass',
  'Privilege Escalation',
  'Information Disclosure',
  'Business Logic Flaw',
]

const SEVERITIES = ['low', 'medium', 'high', 'critical']

export default function ReportPage() {
  const [target, setTarget] = useState('')
  const [vulnType, setVulnType] = useState('')
  const [severity, setSeverity] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleGenerate = async () => {
    if (!target.trim() || !vulnType) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target: target.trim(), vulnType, severity }) })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Report Writer" description="Generate professional bug bounty vulnerability reports" />
      <CardShell>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="Target URL" value={target} onChange={(e) => setTarget(e.target.value)}
              className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
            <Select value={vulnType} onValueChange={setVulnType}>
              <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                <SelectValue placeholder="Vulnerability type" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {VULN_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="text-zinc-300 focus:text-emerald-400">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {SEVERITIES.map((s) => (
                  <SelectItem key={s} value={s} className="text-zinc-300 focus:text-emerald-400 capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleGenerate} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium">
              <Sparkles className="w-4 h-4 mr-2" />{loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </div>
      </CardShell>
      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}
      {result && (
        <CardShell className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">{result.title}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-zinc-400 text-sm">{result.target}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  result.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                  result.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  result.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                }`}>{result.severity?.toUpperCase()}</span>
                {result.cvssScore && <span className="text-zinc-500 text-xs">CVSS: {result.cvssScore}</span>}
                {result.cweId && <span className="text-zinc-500 text-xs">{result.cweId}</span>}
              </div>
            </div>
            <CopyBtn text={JSON.stringify(result, null, 2)} />
          </div>

          {result.summary && (
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
              <h4 className="text-sm font-semibold text-white mb-1">Summary</h4>
              <p className="text-zinc-400 text-sm">{result.summary}</p>
            </div>
          )}

          {result.description && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Description</h4>
              <p className="text-zinc-400 text-sm whitespace-pre-wrap">{result.description}</p>
            </div>
          )}

          {result.steps?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Steps to Reproduce</h4>
              <ol className="space-y-2">
                {result.steps.map((step: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-400 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-medium">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {result.impact && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Impact</h4>
              <p className="text-zinc-400 text-sm whitespace-pre-wrap">{result.impact}</p>
            </div>
          )}

          {result.remediation && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-emerald-400 mb-2">Remediation</h4>
              <p className="text-zinc-400 text-sm whitespace-pre-wrap">{result.remediation}</p>
            </div>
          )}

          {result.references?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">References</h4>
              <ul className="space-y-1">
                {result.references.map((ref: any, i: number) => (
                  <li key={i} className="text-emerald-400 text-sm hover:underline">
                    {ref.url ? (
                      <a href={ref.url} target="_blank" rel="noopener noreferrer">{ref.title || ref.url}</a>
                    ) : (
                      ref.title || ref
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardShell>
      )}
    </div>
  )
}
