import { NextResponse } from 'next/server';
import { LongTermCareAuditEngine, CareRecord } from '@/lib/audit-engine';
import { CareRecordListSchema } from '@/lib/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = CareRecordListSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ success: false, error: '合规验证失败', details: parseResult.error.issues }, { status: 400 });
    }
    const records: CareRecord[] = parseResult.data;
    const engine = new LongTermCareAuditEngine();
    const issues = engine.processRecords(records);
    const totalImpact = issues.reduce((sum, issue) => sum + Math.abs(issue.impactEstimation), 0);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return NextResponse.json({ success: true, data: { issuesProcessed: records.length, totalIssuesFound: issues.length, estimatedDeductionRisk: totalImpact, details: issues } });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}
