import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

// Local extractJSON - no dependency on server-utils per spec
function extractJSON(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  }
  try { JSON.parse(cleaned); return cleaned; } catch {}
  const jsonPatterns = [/\{[\s\S]*\}/, /\[[\s\S]*\]/];
  for (const pattern of jsonPatterns) {
    const match = cleaned.match(pattern);
    if (match) {
      let jsonStr = match[0];
      try { JSON.parse(jsonStr); return jsonStr; } catch {}
      jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1");
      try { JSON.parse(jsonStr); return jsonStr; } catch {}
    }
  }
  cleaned = cleaned.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
  try { JSON.parse(cleaned); return cleaned; } catch {}
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetType, target } = body;
    if (!targetType || !target) {
      return NextResponse.json({ error: 'Target type and target are required' }, { status: 400 });
    }

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a penetration testing payload generation expert. Generate test payloads for authorized security testing only. Include appropriate disclaimers. Always respond with valid JSON only.`
        },
        {
          role: 'user',
          content: `Generate payloads for ${targetType} targeting: ${target}

Return JSON with this exact structure:
{
  "payloads": [
    {
      "type": "XSS|SQLi|SSRF|Path Traversal|Command Injection|LDAP Injection|XML Injection|XXE|Other",
      "payload": "the actual payload string",
      "description": "what this payload tests for",
      "severity": "high|medium|low",
      "context": "where to use this payload (URL parameter, header, body, etc.)",
      "expected": "what a vulnerable application would return"
    }
  ],
  "warnings": ["ethical usage warning"],
  "tips": ["testing tip 1", "testing tip 2"]
}`
        }
      ],
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const result = extractJSON(raw);

    await db.scan.create({
      data: {
        tool: 'payloads',
        targetUrl: target,
        result,
        status: 'completed',
      }
    });

    return NextResponse.json(JSON.parse(result));
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Payload generation failed' }, { status: 500 });
  }
}
