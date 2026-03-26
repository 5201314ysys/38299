import { NextResponse } from 'next/server';
import { getCommercialOverview } from '@/lib/commercial-store';

export async function GET() {
  return NextResponse.json({ success: true, data: getCommercialOverview() });
}
