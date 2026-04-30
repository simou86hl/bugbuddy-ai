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
          content: `You are a web security headers expert. Analyze security HTTP headers for the given target. Evaluate their presence, correctness, and effectiveness. Always respond with valid JSON only.`
        },
        {
          role: 'user',
          content: `Analyze security headers for: ${target}

Check these headers and their proper configuration:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security
- Referrer-Policy
- Permissions-Policy
- Cross-Origin-Opener-Policy
- Cross-Origin-Resource-Policy
- Cross-Origin-Embedder-Policy

Return JSON with this exact structure:
{
  "headers": [
    {"name": "header name", "value": "header value or empty if missing", "status": "present|missing", "severity": "high|medium|low|info", "description": "what this header does and why it matters"}
  ],
  "score": 0-100,
  "grade": "A|B|C|D|F",
  "recommendations": ["recommendation 1", "recommendation 2"],
  "summary": "brief summary of the security posture"
}`
        }
      ],
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const result = extractJSON(raw);

    await db.scan.create({
      data: {
        tool: 'headers',
        targetUrl: target,
        result,
        status: 'completed',
      }
    });

    return NextResponse.json(JSON.parse(result));
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Header analysis failed' }, { status: 500 });
  }
}
