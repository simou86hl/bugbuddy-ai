import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { extractJSON } from '@/lib/server-utils';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target } = body;
    if (!target) {
      return NextResponse.json({ error: 'Target domain is required' }, { status: 400 });
    }

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a subdomain enumeration expert. Generate common subdomains that are likely to exist for the given target domain. Provide realistic results. Always respond with valid JSON only.`
        },
        {
          role: 'user',
          content: `Enumerate subdomains for: ${target}

Return JSON with this exact structure:
{
  "subdomains": [
    {"subdomain": "www.example.com", "ip": "1.2.3.4", "takeoverRisk": false, "httpStatus": 200},
    {"subdomain": "api.example.com", "ip": "1.2.3.5", "takeoverRisk": true, "httpStatus": 0},
    {"subdomain": "mail.example.com", "ip": "1.2.3.6", "takeoverRisk": false, "httpStatus": 200}
  ],
  "total": 15,
  "takeoverRisks": 2,
  "summary": "brief summary of findings"
}`
        }
      ],
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const result = extractJSON(raw);

    await db.scan.create({
      data: {
        tool: 'subdomains',
        targetUrl: target,
        result,
        status: 'completed',
      }
    });

    return NextResponse.json(JSON.parse(result));
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Subdomain enumeration failed' }, { status: 500 });
  }
}
