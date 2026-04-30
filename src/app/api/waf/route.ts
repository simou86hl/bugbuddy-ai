import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { extractJSON } from '@/lib/server-utils';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target } = body;
    if (!target) {
      return NextResponse.json({ error: 'Target URL is required' }, { status: 400 });
    }

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a WAF (Web Application Firewall) detection expert. Detect which WAF is protecting the given target and provide bypass tips. Always respond with valid JSON only.`
        },
        {
          role: 'user',
          content: `Detect WAF for: ${target}

Analyze the target for WAF fingerprints. Return JSON with this exact structure:
{
  "detected": true,
  "waf": "Cloudflare|AWS WAF|Akamai|Imperva|ModSecurity|F5|Sucuri|Wordfence|Custom|None",
  "confidence": 0-100,
  "fingerprints": ["fingerprint 1: description", "fingerprint 2: description"],
  "bypassTips": [
    {"technique": "technique name", "description": "how to attempt bypass", "difficulty": "easy|medium|hard", "payload": "example payload"}
  ],
  "responseHeaders": {"server": "cloudflare", "cf-ray": "abc123"},
  "summary": "brief summary of WAF detection"
}`
        }
      ],
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const result = extractJSON(raw);

    await db.scan.create({
      data: {
        tool: 'waf',
        targetUrl: target,
        result,
        status: 'completed',
      }
    });

    return NextResponse.json(JSON.parse(result));
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'WAF detection failed' }, { status: 500 });
  }
}
