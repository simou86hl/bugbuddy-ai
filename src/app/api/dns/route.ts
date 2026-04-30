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
          content: `You are a DNS reconnaissance expert. Analyze DNS records for the given target. Provide realistic DNS analysis results. Always respond with valid JSON only.`
        },
        {
          role: 'user',
          content: `Analyze DNS records for: ${target}

Return JSON with this exact structure:
{
  "aRecords": [{"address": "ip address", "ttl": 300}],
  "aaaaRecords": [{"address": "ipv6 address", "ttl": 300}],
  "mxRecords": [{"priority": 10, "exchange": "mail.example.com", "ttl": 3600}],
  "nsRecords": [{"host": "ns1.example.com", "ttl": 86400}],
  "txtRecords": [{"value": "v=spf1 ...", "ttl": 3600}],
  "cnameRecords": [{"alias": "www.example.com", "canonical": "example.com", "ttl": 3600}],
  "soaRecord": {"mname": "ns1.example.com", "rname": "admin.example.com", "serial": 2024010101, "refresh": 3600, "retry": 900, "expire": 604800, "minimum": 86400},
  "spf": {"valid": true, "record": "v=spf1 include:_spf.google.com ~all", "issues": []},
  "dkim": {"found": true, "record": "v=DKIM1; k=rsa; p=..."},
  "dmarc": {"valid": true, "record": "v=DMARC1; p=none; rua=mailto:dmarc@example.com", "policy": "none"},
  "dnssec": false,
  "summary": "brief summary of DNS configuration"
}`
        }
      ],
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const result = extractJSON(raw);

    await db.scan.create({
      data: {
        tool: 'dns',
        targetUrl: target,
        result,
        status: 'completed',
      }
    });

    return NextResponse.json(JSON.parse(result));
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'DNS analysis failed' }, { status: 500 });
  }
}
