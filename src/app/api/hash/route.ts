import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { identifyHash } from '@/lib/server-utils';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hash } = body;
    if (!hash) {
      return NextResponse.json({ error: 'Hash value is required' }, { status: 400 });
    }

    const identified = identifyHash(hash);

    // Get cracking suggestions from AI
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a password hash cracking expert. Given a hash and its identified algorithm, suggest the best tools and methods to crack it. Always respond with valid JSON only.`
        },
        {
          role: 'user',
          content: `Hash: ${hash}
Identified algorithm(s): ${identified.map(i => i.algorithm).join(', ')}

Suggest cracking tools and methods. Return JSON with:
{
  "crackingTools": [
    {"name": "tool name", "description": "what it does", "url": "official website or documentation URL", "bestFor": "what this tool is best for"}
  ],
  "methods": [
    {"method": "dictionary attack|brute force|rainbow tables|rule-based|mask attack", "description": "description of this method", "estimatedTime": "estimated time frame"}
  ],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`
        }
      ],
    });

    let aiSuggestions: any = { crackingTools: [], methods: [], recommendations: [] };
    try {
      const raw = completion.choices[0]?.message?.content || '{}';
      const cleaned = raw.trim();
      if (cleaned.startsWith('```')) {
        const jsonStr = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
        aiSuggestions = JSON.parse(jsonStr);
      } else {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) aiSuggestions = JSON.parse(match[0]);
      }
    } catch {}

    await db.scan.create({
      data: {
        tool: 'hash',
        targetUrl: 'hash-identify',
        result: JSON.stringify({ hash, identified, aiSuggestions }),
        status: 'completed',
      }
    });

    return NextResponse.json({
      hash,
      identified,
      ...aiSuggestions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Hash identification failed' }, { status: 500 });
  }
}
