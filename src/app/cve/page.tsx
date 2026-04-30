'use client'

import { useState } from 'react'
import { CardShell, SectionHeader, LoadingSpinner, ErrorDisplay, SeverityBadge, CopyBtn } from '@/lib/utils'
import { AlertTriangle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function CvePage() {
  const [technology, setTechnology] = useState('')
  const [version, setVersion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleSearch = async () => {
    if (!technology.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/cve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ technology: technology.trim(), version: version.trim() }) })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="CVE Lookup" description="Search for known vulnerabilities by technology and version" />
      <CardShell>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input placeholder="Technology (e.g., Apache, nginx, WordPress)" value={technology} onChange={(e) => setTechnology(e.target.value)}
              className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
          </div>
          <Input placeholder="Version (optional)" value={version} onChange={(e) => setVersion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full sm:w-40 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
          <Button onClick={handleSearch} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium">
            <Search className="w-4 h-4 mr-2" />{loading ? 'Searching...' : 'Search CVEs'}
          </Button>
        </div>
      </CardShell>
      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <CardShell className="text-center">
              <p className="text-2xl font-bold text-white">{result.total || result.cves?.length || 0}</p>
              <p className="text-xs text-zinc-500">Total CVEs</p>
            </CardShell>
            <CardShell className="text-center">
              <p className="text-2xl font-bold text-red-400">{result.criticalCount || 0}</p>
              <p className="text-xs text-zinc-500">Critical</p>
            </CardShell>
            <CardShell className="text-center">
              <p className="text-2xl font-bold text-orange-400">{result.highCount || 0}</p>
              <p className="text-xs text-zinc-500">High</p>
            </CardShell>
          </div>
          <CardShell>
            <h3 className="text-lg font-semibold text-white mb-4">Vulnerabilities</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {result.cves?.map((cve: any, i: number) => (
                <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-mono font-medium text-sm">{cve.id}</span>
                      <SeverityBadge severity={cve.severity} />
                      {cve.exploits && <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">EXPLOIT EXISTS</span>}
                    </div>
                    <span className={`text-lg font-bold ${cve.cvss >= 7 ? 'text-red-400' : cve.cvss >= 4 ? 'text-yellow-400' : 'text-blue-400'}`}>
                      {cve.cvss}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-2">{cve.description}</p>
                  {cve.affectedVersions && <p className="text-zinc-500 text-xs mb-2">Affected: <span className="text-zinc-300 font-mono">{cve.affectedVersions}</span></p>}
                  {cve.remediation && (
                    <div className="bg-zinc-900 rounded p-2 text-xs text-zinc-400">
                      <span className="text-emerald-400 font-medium">Fix:</span> {cve.remediation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardShell>
        </div>
      )}
    </div>
  )
}
