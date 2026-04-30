'use client'

import { useState } from 'react'
import { CardShell, SectionHeader, LoadingSpinner, ErrorDisplay, SeverityBadge, CopyBtn } from '@/lib/utils'
import { Zap, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const TARGET_TYPES = [
  { value: 'XSS', label: 'XSS (Cross-Site Scripting)' },
  { value: 'SQLi', label: 'SQL Injection' },
  { value: 'SSRF', label: 'SSRF (Server-Side Request Forgery)' },
  { value: 'Path Traversal', label: 'Path Traversal' },
  { value: 'Command Injection', label: 'Command Injection' },
  { value: 'LDAP Injection', label: 'LDAP Injection' },
  { value: 'XML Injection', label: 'XML Injection' },
  { value: 'SSTI', label: 'SSTI (Server-Side Template Injection)' },
  { value: 'Deserialization', label: 'Insecure Deserialization' },
]

export default function PayloadsPage() {
  const [targetType, setTargetType] = useState('')
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleGenerate = async () => {
    if (!targetType || !target.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/payloads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetType, target: target.trim() }) })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Payload Generator" description="Generate security testing payloads for authorized penetration testing" />
      <CardShell>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={targetType} onValueChange={setTargetType}>
            <SelectTrigger className="w-full sm:w-[280px] bg-zinc-800/50 border-zinc-700 text-white">
              <SelectValue placeholder="Select attack type" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              {TARGET_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value} className="text-zinc-300 focus:text-emerald-400">{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input placeholder="Target endpoint or parameter" value={target} onChange={(e) => setTarget(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium">
            <Search className="w-4 h-4 mr-2" />{loading ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      </CardShell>
      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}
      {result && (
        <div className="space-y-4">
          {result.warnings?.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <p className="text-yellow-400 text-sm font-medium mb-1">⚠️ Ethical Usage Notice</p>
              {result.warnings.map((w: string, i: number) => (
                <p key={i} className="text-yellow-400/70 text-xs">{w}</p>
              ))}
            </div>
          )}
          <CardShell>
            <h3 className="text-lg font-semibold text-white mb-4">
              Generated Payloads ({result.payloads?.length || 0})
            </h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {result.payloads?.map((p: any, i: number) => (
                <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-emerald-400 font-medium text-sm">{p.type}</span>
                    <SeverityBadge severity={p.severity} />
                    {p.context && <span className="text-zinc-500 text-xs">{p.context}</span>}
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-900 rounded px-3 py-2 mb-2">
                    <code className="text-red-400 text-xs font-mono flex-1 break-all">{p.payload}</code>
                    <CopyBtn text={p.payload} />
                  </div>
                  <p className="text-zinc-400 text-sm">{p.description}</p>
                  {p.expected && <p className="text-zinc-500 text-xs mt-1">Expected: {p.expected}</p>}
                </div>
              ))}
            </div>
          </CardShell>
          {result.tips?.length > 0 && (
            <CardShell>
              <h3 className="text-lg font-semibold text-white mb-3">Testing Tips</h3>
              <ul className="space-y-2">{result.tips.map((t: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-zinc-400 text-sm"><span className="text-emerald-400">•</span>{t}</li>
              ))}</ul>
            </CardShell>
          )}
        </div>
      )}
    </div>
  )
}
