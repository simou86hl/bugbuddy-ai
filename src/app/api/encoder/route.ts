import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, operation, encoding } = body;
    if (!input || !operation || !encoding) {
      return NextResponse.json({ error: 'Input, operation, and encoding are required' }, { status: 400 });
    }

    let output = '';

    const encode = operation === 'encode';

    switch (encoding) {
      case 'base64':
        output = encode ? Buffer.from(input).toString('base64') : Buffer.from(input, 'base64').toString('utf-8');
        break;
      case 'url':
        output = encode ? encodeURIComponent(input) : decodeURIComponent(input);
        break;
      case 'hex':
        if (encode) {
          output = Buffer.from(input).toString('hex');
        } else {
          output = Buffer.from(input, 'hex').toString('utf-8');
        }
        break;
      case 'html':
        if (encode) {
          output = input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        } else {
          output = input
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
        }
        break;
      default:
        return NextResponse.json({ error: 'Unsupported encoding. Use: base64, url, hex, html' }, { status: 400 });
    }

    return NextResponse.json({ input, output, operation, encoding });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Encoding/decoding failed' }, { status: 500 });
  }
}
