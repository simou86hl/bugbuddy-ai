'use client'

import { useEffect, useState } from 'react'
import { CardShell, SectionHeader, LoadingSpinner } from '@/lib/utils'
import { Activity, FileText, Shield, Zap, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts'

interface DashboardData {
  totalScans: number
  totalReports: number
  totalVulnerabilities: number
  scansToday: number
  scansByTool: Record<string, number>
  recentScans: Array<{ id: string; tool: string; targetUrl: string; status: string; createdAt: string }>
  vulnerabilitiesBySeverity: Record<string, number>
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
  info: '#10b981',
}

const CHART_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4']

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />
  if (!data) return <div className="text-center text-zinc-400 py-12">Failed to load dashboard</div>

  const toolData = Object.entries(data.scansByTool).map(([tool, count]) => ({
    tool: tool.charAt(0).toUpperCase() + tool.slice(1),
    count,
  }))

  const severityData = Object.entries(data.vulnerabilitiesBySeverity).map(([severity, count]) => ({
    name: severity.charAt(0).toUpperCase() + severity.slice(1),
    value: count,
    color: SEVERITY_COLORS[severity] || '#71717a',
  }))

  const stats = [
    { label: 'Total Scans', value: data.totalScans, icon: Activity, color: 'text-emerald-400' },
    { label: 'Total Reports', value: data.totalReports, icon: FileText, color: 'text-yellow-400' },
    { label: 'Vulnerabilities', value: data.totalVulnerabilities, icon: Shield, color: 'text-red-400' },
    { label: 'Scans Today', value: data.scansToday, icon: Zap, color: 'text-blue-400' },
  ]

  return (
    <div className="space-y-6">
      <SectionHeader title="Dashboard" description="Overview of your security scanning activity" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <CardShell key={stat.label}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-zinc-800 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-zinc-400">{stat.label}</p>
              </div>
            </div>
          </CardShell>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CardShell>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Scans by Tool
          </h3>
          {toolData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={toolData}>
                <XAxis dataKey="tool" tick={{ fill: '#71717a', fontSize: 12 }} />
                <YAxis tick={{ fill: '#71717a', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 8 }}
                  labelStyle={{ color: '#fafafa' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {toolData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-zinc-500 py-16">No scan data yet. Start scanning!</div>
          )}
        </CardShell>

        <CardShell>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400" />
            Vulnerabilities by Severity
          </h3>
          {severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 8 }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: '#a1a1aa' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-zinc-500 py-16">No vulnerability data yet</div>
          )}
        </CardShell>
      </div>

      {/* Recent scans */}
      <CardShell>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Scans</h3>
        {data.recentScans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-800">
                  <th className="text-left py-3 px-2 font-medium">Tool</th>
                  <th className="text-left py-3 px-2 font-medium">Target</th>
                  <th className="text-left py-3 px-2 font-medium">Status</th>
                  <th className="text-left py-3 px-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {data.recentScans.map((scan) => (
                  <tr key={scan.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="py-3 px-2 text-emerald-400 font-mono text-xs">{scan.tool}</td>
                    <td className="py-3 px-2 text-zinc-300 font-mono text-xs max-w-[200px] truncate">{scan.targetUrl}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${scan.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-zinc-500 text-xs">
                      {new Date(scan.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-zinc-500 py-8">No recent scans. Use the tools in the sidebar to get started!</div>
        )}
      </CardShell>
    </div>
  )
}
