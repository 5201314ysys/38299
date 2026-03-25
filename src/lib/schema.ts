import { z } from 'zod';

// 严格的长护险护理记录规范（政企级合规防线）
export const CareRecordSchema = z.object({
  patientId: z.string()
    .min(1, '患者ID不能为空')
    .regex(/^P\d{3}$/, '患者ID格式必须为P+三位数字（如P001）'),
  caregiverId: z.string()
    .min(1, '护工ID不能为空')
    .regex(/^C\d{3}$/, '护工ID格式必须为C+三位数字（如C100）'),
  actionType: z.enum(['turn_over', 'feed', 'clean', 'medication'], {
    errorMap: () => ({ message: '不受支持的护理动作类型（仅限合规白名单动作）' })
  }),
  startTime: z.string().datetime({ message: '开始时间必须是严格的ISO 8601全时间格式' }),
  endTime: z.string().datetime({ message: '结束时间必须是严格的ISO 8601全时间格式' }),
  deviceId: z.string().optional()
}).refine(data => new Date(data.startTime) <= new Date(data.endTime), {
  message: '物理逻辑错误：结束时间不能早于开始时间',
  path: ['endTime']
});

export const CareRecordListSchema = z.array(CareRecordSchema);
