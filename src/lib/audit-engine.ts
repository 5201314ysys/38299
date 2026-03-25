export interface CareRecord {
  patientId: string;
  caregiverId: string;
  actionType: 'turn_over' | 'feed' | 'clean' | 'medication';
  startTime: string; // ISO String
  endTime: string;   // ISO String
  deviceId?: string;
}

export interface AuditIssue {
  patientId: string;
  caregiverId?: string;
  type: string;
  severity: string;
  description: string;
  impactEstimation: number;
}

const RULES = {
  TURN_OVER_MAX_INTERVAL_HOURS: 2.0,
  OVERLAP_TIME_THRESHOLD_MINS: 0,
};

export class LongTermCareAuditEngine {
  processRecords(records: CareRecord[]): AuditIssue[] {
    const issues: AuditIssue[] = [];
    
    // Sort records by start time globally
    const sortedRecords = [...records].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    // Group by patient
    const byPatient: Record<string, CareRecord[]> = {};
    const byCaregiver: Record<string, CareRecord[]> = {};

    sortedRecords.forEach(r => {
      if (!byPatient[r.patientId]) byPatient[r.patientId] = [];
      byPatient[r.patientId].push(r);

      if (!byCaregiver[r.caregiverId]) byCaregiver[r.caregiverId] = [];
      byCaregiver[r.caregiverId].push(r);
    });

    // 1. Check missing items (e.g. Turn over frequency)
    for (const [patientId, ptRecords] of Object.entries(byPatient)) {
      const turnOvers = ptRecords.filter(r => r.actionType === 'turn_over');
      for (let i = 1; i < turnOvers.length; i++) {
        const prevTime = new Date(turnOvers[i - 1].startTime).getTime();
        const currTime = new Date(turnOvers[i].startTime).getTime();
        const hoursDiff = (currTime - prevTime) / (1000 * 60 * 60);

        if (hoursDiff > RULES.TURN_OVER_MAX_INTERVAL_HOURS) {
          issues.push({
            patientId,
            type: '缺失风险 (Missing Record)',
            severity: '高 (High Risk)',
            description: `翻身记录间隔大于2小时 (实际间隔: ${hoursDiff.toFixed(1)}小时)`,
            impactEstimation: -50.00
          });
        }
      }
    }

    // 2. Check Logical Conflicts (Same caregiver overlapping service times)
    for (const [caregiverId, cgRecords] of Object.entries(byCaregiver)) {
      for (let i = 1; i < cgRecords.length; i++) {
        const prevEnd = new Date(cgRecords[i - 1].endTime).getTime();
        const currStart = new Date(cgRecords[i].startTime).getTime();
        
        if (prevEnd > currStart) {
          issues.push({
            patientId: cgRecords[i].patientId,
            caregiverId,
            type: '逻辑冲突 (Time Conflict)',
            severity: '致命 (100% 拒付 / Fatal)',
            description: `护工记录时间冲突：前服务(${cgRecords[i-1].endTime})与新服务(${cgRecords[i].startTime})重叠`,
            impactEstimation: -150.00
          });
        }
      }
    }

    return issues;
  }
}