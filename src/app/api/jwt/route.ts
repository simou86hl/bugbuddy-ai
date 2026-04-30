import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { extractJSON } from '@/lib/server-utils';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;
    if (!token) {
      return NextResponse.json({ error: 'JWT token is required' }, { status: 400 });
    }

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a JWT (JSON Web Token) security analysis expert. Analyze the provided JWT token for security issues. Always respond with valid JSON only.`
        },
        {
          role: 'user',
          content: `Analyze this JWT token: ${token}

Decode and analyze the token. Return JSON with this exact structure:
{
  "header": {"alg": "algorithm", "typ": "JWT", "kid": "key id if present"},
  "payload": {"iss": "issuer", "sub": "subject", "aud": "audience", "exp": "expiration timestamp", "iat": "issued at", "nbf": "not before", "jti": "jwt id", "roles": "roles if present"},
  "signature": {"algorithm": "signing algorithm", "valid": false, "notes": "notes about signature verification"},
  "vulnerabilities": [
    {
      "type": "none algorithm|weak signing|missing validation|expired token|sensitive data|missing claims|other",
      "severity": "critical|high|medium|low|info",
      "description": "detailed description of the vulnerability",
      "remediation": "how to fix this issue"
    }
  ],
  "summary": "brief overall security assessment"
}`
        }
      ],
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const result = extractJSON(raw);

    await db.scan.create({
      data: {
        tool: 'jwt',
        targetUrl: 'jwt-analysis',
        result,
        status: 'completed',
      }
    });

    return NextResponse.json(JSON.parse(result));
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'JWT analysis failed' }, { status: 500 });
  }
}
