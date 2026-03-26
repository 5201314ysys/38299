export interface ProductCatalogItem {
  id: string;
  name: string;
  type: string;
  unitPrice: number;
  roiMonths: number;
  valueSummary: string;
}

export const productCatalog: ProductCatalogItem[] = [
  {
    id: 'C20',
    name: '智能体征监测床垫 C20',
    type: '核心物联终端',
    unitPrice: 3200,
    roiMonths: 2.4,
    valueSummary: '降低翻身漏签和夜间巡护漏项，直接减少医保扣减风险。',
  },
  {
    id: 'EXO-01',
    name: '康复机器人下肢外骨骼',
    type: '康复评级设备',
    unitPrice: 45000,
    roiMonths: 5.1,
    valueSummary: '提升康复项目标准化达标率，拉高机构评级和补贴等级。',
  },
  {
    id: 'GW-01',
    name: '智能中枢控制屏网关',
    type: '中控平台设备',
    unitPrice: 6500,
    roiMonths: 8,
    valueSummary: '统一设备告警与护理事件流，节省夜班排班成本。',
  },
];

export interface SubscriptionPlan {
  id: string;
  planName: string;
  monthlyPrice: number;
  target: string;
  highlights: string[];
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    planName: 'Starter 合规版',
    monthlyPrice: 3999,
    target: '100床以内机构',
    highlights: ['AI稽核日报', '基础脱敏报表', '违规预警短信'],
  },
  {
    id: 'growth',
    planName: 'Growth 增长版',
    monthlyPrice: 8999,
    target: '100-300床机构',
    highlights: ['多院区看板', '自动排班建议', '设备ROI模型'],
  },
  {
    id: 'enterprise',
    planName: 'Enterprise 政企版',
    monthlyPrice: 16800,
    target: '300床以上集团',
    highlights: ['医保稽核沙盘', '专属客户成功经理', '接口定制和私有部署'],
  },
];

export function estimateAnnualRevenue(monthlyPrice: number, customerCount: number) {
  return monthlyPrice * customerCount * 12;
}
