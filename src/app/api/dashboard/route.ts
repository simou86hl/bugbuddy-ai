import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const totalScans = await db.scan.count();
    const totalReports = await db.report.count();
    const totalVulnerabilities = await db.vulnerability.count();

    const recentScans = await db.scan.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Scans by tool
    const scansByToolRaw = await db.scan.groupBy({
      by: ['tool'],
      _count: { id: true },
    });
    const scansByTool: Record<string, number> = {};
    for (const item of scansByToolRaw) {
      scansByTool[item.tool] = item._count.id;
    }

    // Vulnerabilities by severity
    const vulnsBySeverityRaw = await db.vulnerability.groupBy({
      by: ['severity'],
      _count: { id: true },
    });
    const vulnerabilitiesBySeverity: Record<string, number> = {};
    for (const item of vulnsBySeverityRaw) {
      vulnerabilitiesBySeverity[item.severity] = item._count.id;
    }

    // Scans today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scansToday = await db.scan.count({
      where: { createdAt: { gte: today } },
    });

    return NextResponse.json({
      totalScans,
      totalReports,
      totalVulnerabilities,
      scansToday,
      scansByTool,
      recentScans,
      vulnerabilitiesBySeverity,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
