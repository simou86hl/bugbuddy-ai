'use client'

import { useState } from 'react'
import { CardShell, SectionHeader, LoadingSpinner, ErrorDisplay } from '@/lib/utils'
import { Globe, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SeverityBadge } from '@/lib/utils'

export default function SubdomainsPage() {
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleScan = async () => {
    if (!target.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/subdomains', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
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
      <SectionHeader title="Subdomain Finder" description="Enumerate subdomains for a given domain" />
      <CardShell>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input placeholder="example.com" value={target} onChange={(e) => setTarget(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
          </div>
          <Button onClick={handleScan} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium">
            <Search className="w-4 h-4 mr-2" />{loading ? 'Scanning...' : 'Scan'}
          </Button>
        </div>
      </CardShell>
      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <CardShell className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{result.total || result.subdomains?.length || 0}</p>
              <p className="text-xs text-zinc-500">Subdomains</p>
            </CardShell>
            <CardShell className="text-center">
              <p className="text-2xl font-bold text-red-400">{result.takeoverRisks || 0}</p>
              <p className="text-xs text-zinc-500">Takeover Risks</p>
            </CardShell>
          </div>
          <CardShell>
            <h3 className="text-lg font-semibold text-white mb-4">Discovered Subdomains</h3>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-zinc-400 border-b border-zinc-800">
                  <th className="text-left py-2 px-2 font-medium">Subdomain</th>
                  <th className="text-left py-2 px-2 font-medium">IP</th>
                  <th className="text-left py-2 px-2 font-medium">Status</th>
                  <th className="text-left py-2 px-2 font-medium">Risk</th>
                </tr></thead>
                <tbody>
                  {result.subdomains?.map((s: any, i: number) => (
                    <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-2 px-2 text-emerald-400 font-mono text-xs">{s.subdomain}</td>
                      <td className="py-2 px-2 text-zinc-400 font-mono text-xs">{s.ip || '-'}</td>
                      <td className="py-2 px-2 text-zinc-400 text-xs">{s.httpStatus || '-'}</td>
                      <td className="py-2 px-2">
                        {s.takeoverRisk ? <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">TAKEOVER</span> : <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">OK</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardShell>
        </div>
      )}
    </div>
  )
}
