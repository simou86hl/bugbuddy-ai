import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { extractJSON } from '@/lib/server-utils';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input } = body;
    if (!input) {
      return NextResponse.json({ error: 'Input content is required' }, { status: 400 });
    }

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a secret/credential scanning expert. Scan the provided content for leaked secrets, API keys, passwords, tokens, and other sensitive data. Always respond with valid JSON only.`
        },
        {
          role: 'user',
          content: `Scan this content for secrets:\n\n${input}

Look for: API keys, AWS credentials, JWT tokens, private keys, database URLs, passwords, OAuth tokens, Stripe keys, GitHub tokens, etc.

Return JSON with this exact structure:
{
  "findings": [
    {
      "type": "AWS Access Key|GitHub Token|API Key|JWT|Private Key|Database URL|Password|OAuth Token|Other",
      "value": "masked value (show first and last 4 chars only)",
      "severity": "critical|high|medium|low|info",
      "line": 1,
      "regex": "regex pattern used to detect",
      "description": "what was found and why it's a risk"
    }
  ],
  "total": 3,
  "criticalCount": 1,
  "summary": "brief summary of scan results"
}`
        }
      ],
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const result = extractJSON(raw);

    await db.scan.create({
      data: {
        tool: 'secrets',
        targetUrl: 'code-scan',
        result,
        status: 'completed',
      }
    });

    return NextResponse.json(JSON.parse(result));
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Secret scan failed' }, { status: 500 });
  }
}
