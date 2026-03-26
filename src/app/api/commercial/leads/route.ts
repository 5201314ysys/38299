import { NextResponse } from 'next/server';
import { createLead, listLeads } from '@/lib/commercial-store';
import { SalesLeadPayloadSchema } from '@/lib/schema';

export async function GET() {
  return NextResponse.json({ success: true, data: listLeads() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = SalesLeadPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: '线索参数校验失败',
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const lead = createLead(parsed.data);
    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: '服务器处理失败' }, { status: 500 });
  }
}
