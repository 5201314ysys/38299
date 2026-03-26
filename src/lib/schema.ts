import { z } from 'zod';

// 严格的长护险护理记录规范（政企级合规防线）
export const CareRecordSchema = z.object({
  patientId: z.string()
    .min(1, '患者ID不能为空')
    .regex(/^P\d{3}$/, '患者ID格式必须为P+三位数字（如P001）'),
  caregiverId: z.string()
    .min(1, '护工ID不能为空')
    .regex(/^C\d{3}$/, '护工ID格式必须为C+三位数字（如C100）'),
  actionType: z.enum(['turn_over', 'feed', 'clean', 'medication']),
  startTime: z.string().datetime({ message: '开始时间必须是严格的ISO 8601全时间格式' }),
  endTime: z.string().datetime({ message: '结束时间必须是严格的ISO 8601全时间格式' }),
  deviceId: z.string().optional()
}).refine(data => new Date(data.startTime) <= new Date(data.endTime), {
  message: '物理逻辑错误：结束时间不能早于开始时间',
  path: ['endTime']
});

export const CareRecordListSchema = z.array(CareRecordSchema);

export const SalesLeadPayloadSchema = z.object({
  name: z.string().min(2, '联系人姓名至少2个字符').max(30, '联系人姓名过长'),
  phone: z.string().regex(/^1\d{10}$/, '手机号格式不正确'),
  organization: z.string().min(2, '机构名称至少2个字符').max(80, '机构名称过长'),
  beds: z.number().int().min(20, '床位数至少20').max(2000, '床位数过大'),
  interest: z.string().min(2, '意向产品不能为空').max(120, '意向产品描述过长'),
  source: z.string().min(2, '来源不能为空').max(50, '来源描述过长'),
  budget: z.number().int().min(1000, '预算金额过低').max(5000000, '预算金额过高'),
});

export const ProductOrderPayloadSchema = z.object({
  productId: z.string().min(2, '产品编号不能为空').max(30, '产品编号过长'),
  productName: z.string().min(2, '产品名称不能为空').max(120, '产品名称过长'),
  organization: z.string().min(2, '机构名称不能为空').max(80, '机构名称过长'),
  contactName: z.string().min(2, '联系人姓名不能为空').max(30, '联系人姓名过长'),
  amount: z.number().int().min(100, '订单金额过低').max(10000000, '订单金额过高'),
  quantity: z.number().int().min(1, '购买数量至少1').max(999, '购买数量过大'),
});
