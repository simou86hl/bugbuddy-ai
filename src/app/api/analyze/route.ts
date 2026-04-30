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
          content: `You are a cybersecurity reconnaissance expert. Analyze the given target and provide detailed information. Always respond with valid JSON only, no markdown or explanation outside the JSON.`
        },
        {
          role: 'user',
          content: `Analyze the target: ${target}

Provide a comprehensive analysis. Return JSON with this exact structure:
{
  "technologies": [{"name": "technology name", "version": "version if known", "category": "Web Server|CMS|Framework|Library|CDN|Other"}],
  "attackSurfaces": [{"type": "XSS|SQLi|CSRF|SSRF|IDOR|RCE|LFI|RFI|Open Redirect|Other", "description": "description of the attack surface", "severity": "critical|high|medium|low|info"}],
  "riskAssessment": {"score": 0-100, "level": "critical|high|medium|low", "summary": "brief risk summary"},
  "recommendations": ["recommendation 1", "recommendation 2", "..."],
  "endpoints": [{"path": "/path", "method": "GET|POST|PUT|DELETE", "description": "what this endpoint does"}],
  "cookies": [{"name": "cookie name", "flags": "Secure;HttpOnly;SameSite", "risk": "description of any risk"}],
  "metaInfo": {"title": "page title", "description": "meta description", "generator": "generator tag if found"}
}`
        }
      ],
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const result = extractJSON(raw);

    await db.scan.create({
      data: {
        tool: 'analyze',
        targetUrl: target,
        result,
        status: 'completed',
      }
    });

    return NextResponse.json(JSON.parse(result));
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}
