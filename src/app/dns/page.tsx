'use client'

import { useState } from 'react'
import { CardShell, SectionHeader, LoadingSpinner, ErrorDisplay, CopyBtn } from '@/lib/utils'
import { Server, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function DnsPage() {
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleScan = async () => {
    if (!target.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/dns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target: target.trim() }) })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const renderRecordList = (title: string, records: any[], keys: string[]) => (
    records && records.length > 0 ? (
      <CardShell>
        <h3 className="text-lg font-semibold text-white mb-3">{title} ({records.length})</h3>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {records.map((r: any, i: number) => (
            <div key={i} className="flex items-center gap-2 bg-zinc-800/50 rounded px-3 py-2 text-xs font-mono">
              {keys.map((k, ki) => (
                <span key={ki} className={ki === 0 ? 'text-emerald-400' : 'text-zinc-400'}>{r[k]}{ki < keys.length - 1 && <span className="text-zinc-600 mx-2">→</span>}</span>
              ))}
              <div className="ml-auto"><CopyBtn text={JSON.stringify(r)} /></div>
            </div>
          ))}
        </div>
      </CardShell>
    ) : null
  )

  return (
    <div className="space-y-6">
      <SectionHeader title="DNS Recon" description="Analyze DNS records, SPF, DKIM, DMARC, and DNSSEC configuration" />
      <CardShell>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input placeholder="example.com" value={target} onChange={(e) => setTarget(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
          </div>
          <Button onClick={handleScan} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium">
            <Search className="w-4 h-4 mr-2" />{loading ? 'Scanning...' : 'Scan DNS'}
          </Button>
        </div>
      </CardShell>
      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}
      {result && (
        <div className="space-y-4">
          {/* Security Checks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {result.spf && <CardShell>
              <div className="flex items-center gap-2 mb-2"><h4 className="text-sm font-semibold text-white">SPF</h4>
                <span className={`px-2 py-0.5 rounded-full text-xs ${result.spf.valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{result.spf.valid ? 'VALID' : 'INVALID'}</span>
              </div>
              <p className="text-xs text-zinc-400 font-mono break-all">{result.spf.record || 'Not found'}</p>
            </CardShell>}
            {result.dkim && <CardShell>
              <div className="flex items-center gap-2 mb-2"><h4 className="text-sm font-semibold text-white">DKIM</h4>
                <span className={`px-2 py-0.5 rounded-full text-xs ${result.dkim.found ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{result.dkim.found ? 'FOUND' : 'NOT FOUND'}</span>
              </div>
              <p className="text-xs text-zinc-400 font-mono break-all max-h-16 overflow-y-auto">{result.dkim.record || 'No DKIM record'}</p>
            </CardShell>}
            {result.dmarc && <CardShell>
              <div className="flex items-center gap-2 mb-2"><h4 className="text-sm font-semibold text-white">DMARC</h4>
                <span className={`px-2 py-0.5 rounded-full text-xs ${result.dmarc.valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{result.dmarc.valid ? 'VALID' : 'INVALID'}</span>
              </div>
              <p className="text-xs text-zinc-400 font-mono break-all">{result.dmarc.record || 'Not found'}</p>
            </CardShell>}
            <CardShell>
              <div className="flex items-center gap-2 mb-2"><h4 className="text-sm font-semibold text-white">DNSSEC</h4>
                <span className={`px-2 py-0.5 rounded-full text-xs ${result.dnssec ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{result.dnssec ? 'ENABLED' : 'NOT ENABLED'}</span>
              </div>
              <p className="text-xs text-zinc-400">{result.dnssec ? 'DNSSEC is properly configured' : 'DNSSEC is not configured for this domain'}</p>
            </CardShell>
          </div>
          {renderRecordList('A Records', result.aRecords, ['address', 'ttl'])}
          {renderRecordList('AAAA Records', result.aaaaRecords, ['address', 'ttl'])}
          {renderRecordList('MX Records', result.mxRecords, ['priority', 'exchange'])}
          {renderRecordList('NS Records', result.nsRecords, ['host'])}
          {renderRecordList('TXT Records', result.txtRecords, ['value'])}
          {renderRecordList('CNAME Records', result.cnameRecords, ['alias', 'canonical'])}
        </div>
      )}
    </div>
  )
}
