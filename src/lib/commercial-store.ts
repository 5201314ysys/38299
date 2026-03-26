export interface SalesLead {
  id: string;
  name: string;
  phone: string;
  organization: string;
  beds: number;
  interest: string;
  source: string;
  budget: number;
  status: 'new' | 'contacted' | 'proposal' | 'won';
  createdAt: string;
}

export interface ProductOrder {
  id: string;
  productId: string;
  productName: string;
  organization: string;
  contactName: string;
  amount: number;
  quantity: number;
  status: 'pending' | 'paid' | 'fulfilled';
  createdAt: string;
}

const leads: SalesLead[] = [
  {
    id: 'LEAD-202603-001',
    name: '周院长',
    phone: '13800138000',
    organization: '温江康养中心A区',
    beds: 180,
    interest: '智能体征监测床垫 C20',
    source: '官网试算工具',
    budget: 68000,
    status: 'proposal',
    createdAt: '2026-03-20T09:10:00.000Z',
  },
  {
    id: 'LEAD-202603-002',
    name: '冯主任',
    phone: '13900139000',
    organization: '银龄护理院B栋',
    beds: 120,
    interest: 'AI脱敏报表 + IoT网关',
    source: '线下会展',
    budget: 42000,
    status: 'contacted',
    createdAt: '2026-03-22T13:45:00.000Z',
  },
];

const orders: ProductOrder[] = [
  {
    id: 'ORD-202603-001',
    productId: 'C20',
    productName: '智能体征监测床垫 C20',
    organization: '温江康养中心A区',
    contactName: '周院长',
    amount: 32000,
    quantity: 10,
    status: 'paid',
    createdAt: '2026-03-24T08:00:00.000Z',
  },
  {
    id: 'ORD-202603-002',
    productId: 'GW-01',
    productName: '智能中枢控制屏网关',
    organization: '银龄护理院B栋',
    contactName: '冯主任',
    amount: 19500,
    quantity: 3,
    status: 'pending',
    createdAt: '2026-03-25T11:20:00.000Z',
  },
];

function genId(prefix: string) {
  const random = Math.floor(Math.random() * 900 + 100);
  return `${prefix}-${Date.now()}-${random}`;
}

export function listLeads() {
  return [...leads].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function createLead(payload: Omit<SalesLead, 'id' | 'createdAt' | 'status'>) {
  const lead: SalesLead = {
    id: genId('LEAD'),
    status: 'new',
    createdAt: new Date().toISOString(),
    ...payload,
  };
  leads.push(lead);
  return lead;
}

export function listOrders() {
  return [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function createOrder(payload: Omit<ProductOrder, 'id' | 'createdAt' | 'status'>) {
  const order: ProductOrder = {
    id: genId('ORD'),
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...payload,
  };
  orders.push(order);
  return order;
}

export function getCommercialOverview() {
  const allLeads = listLeads();
  const allOrders = listOrders();
  const annualPipeline = allLeads.reduce((sum, item) => sum + item.budget, 0) * 12;
  const confirmedRevenue = allOrders
    .filter((item) => item.status === 'paid' || item.status === 'fulfilled')
    .reduce((sum, item) => sum + item.amount, 0);
  const conversionRate = allLeads.length === 0 ? 0 : Number(((allOrders.length / allLeads.length) * 100).toFixed(1));

  return {
    leads: allLeads,
    orders: allOrders,
    metrics: {
      annualPipeline,
      confirmedRevenue,
      conversionRate,
      avgDealSize: allOrders.length === 0 ? 0 : Math.round(allOrders.reduce((s, item) => s + item.amount, 0) / allOrders.length),
    },
  };
}
