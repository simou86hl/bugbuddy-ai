import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { extractJSON } from '@/lib/server-utils';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { technology, version } = body;
    if (!technology) {
      return NextResponse.json({ error: 'Technology name is required' }, { status: 400 });
    }

    const target = `${technology}${version ? ' ' + version : ''}`;

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a CVE (Common Vulnerabilities and Exposures) database expert. Search for known vulnerabilities in the given technology and version. Provide accurate, real CVE information. Always respond with valid JSON only.`
        },
        {
          role: 'user',
          content: `Search CVEs for: ${target}

Find known vulnerabilities. Return JSON with this exact structure:
{
  "cves": [
    {
      "id": "CVE-YYYY-NNNNN",
      "description": "description of the vulnerability",
      "severity": "critical|high|medium|low",
      "cvss": 0.0-10.0,
      "affectedVersions": "version ranges affected",
      "exploits": true,
      "remediation": "how to fix or mitigate"
    }
  ],
  "total": 5,
  "criticalCount": 1,
  "highCount": 2,
  "summary": "brief summary of vulnerability landscape"
}`
        }
      ],
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const result = extractJSON(raw);

    await db.vulnerability.create({
      data: {
        targetUrl: target,
        type: 'CVE Lookup',
        severity: 'medium',
        description: result,
        status: 'open',
      }
    });

    return NextResponse.json(JSON.parse(result));
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'CVE lookup failed' }, { status: 500 });
  }
}
