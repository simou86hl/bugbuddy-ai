import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { extractJSON } from '@/lib/server-utils';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target, vulnType, severity } = body;
    if (!target || !vulnType) {
      return NextResponse.json({ error: 'Target and vulnerability type are required' }, { status: 400 });
    }

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a professional bug bounty report writer. Generate comprehensive, well-structured vulnerability reports suitable for submission to bug bounty platforms like HackerOne, Bugcrowd, etc. Always respond with valid JSON only.`
        },
        {
          role: 'user',
          content: `Generate a bug bounty report for:
- Target: ${target}
- Vulnerability Type: ${vulnType}
- Severity: ${severity || 'medium'}

Return JSON with this exact structure:
{
  "title": "Clear vulnerability title",
  "target": "${target}",
  "severity": "${severity || 'medium'}",
  "description": "Detailed description of the vulnerability including what it is and why it's significant",
  "steps": [
    "Step 1: Navigate to the target URL",
    "Step 2: Perform the specific action",
    "Step 3: Observe the vulnerable response"
  ],
  "impact": "Detailed impact assessment including potential damage",
  "remediation": "Specific steps to fix the vulnerability",
  "references": [
    {"title": "OWASP reference", "url": "https://..."},
    {"title": "CWE reference", "url": "https://..."}
  ],
  "cvssScore": 0.0-10.0,
  "cweId": "CWE-XXX",
  "summary": "One paragraph executive summary"
}`
        }
      ],
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const result = extractJSON(raw);
    const parsed = JSON.parse(result);

    await db.report.create({
      data: {
        targetUrl: target,
        title: parsed.title || 'Untitled Report',
        content: result,
        severity: parsed.severity || severity || 'medium',
        status: 'draft',
      }
    });

    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Report generation failed' }, { status: 500 });
  }
}
