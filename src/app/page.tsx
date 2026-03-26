'use client';
import React, { useState } from 'react';
import {
  Card,
  Statistic,
  Table,
  Tag,
  Button,
  Alert,
  Typography,
  Row,
  Col,
  Space,
  App,
  Modal,
  Form,
  Input,
  InputNumber,
} from 'antd';
import {
  UploadOutlined,
  ThunderboltFilled,
  WarningOutlined,
  LineChartOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { subscriptionPlans } from '@/lib/business-data';

const { Text } = Typography;

interface AuditIssueItem {
  patientId: string;
  caregiverId?: string;
  severity: string;
  description: string;
  impactEstimation: number;
}

interface AuditResult {
  estimatedDeductionRisk: number;
  details: AuditIssueItem[];
}

interface OverviewData {
  metrics: {
    annualPipeline: number;
    confirmedRevenue: number;
    conversionRate: number;
    avgDealSize: number;
  };
}

interface LeadFormValues {
  name: string;
  phone: string;
  organization: string;
  beds: number;
  budget: number;
  interest: string;
}

const MOCK_DATA = [
  { patientId: 'P001', caregiverId: 'C100', actionType: 'turn_over', startTime: '2026-03-25T08:00:00Z', endTime: '2026-03-25T08:15:00Z' },
  { patientId: 'P002', caregiverId: 'C100', actionType: 'feed', startTime: '2026-03-25T08:10:00Z', endTime: '2026-03-25T08:40:00Z' }, 
  { patientId: 'P001', caregiverId: 'C100', actionType: 'turn_over', startTime: '2026-03-25T11:00:00Z', endTime: '2026-03-25T11:15:00Z' }
];

export default function Dashboard() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [leadForm] = Form.useForm<LeadFormValues>();

  const { data: overview } = useQuery({
    queryKey: ['commercial-overview'],
    queryFn: async () => {
      const res = await fetch('/api/commercial/overview');
      if (!res.ok) throw new Error('经营数据拉取失败');
      const payload = await res.json();
      return payload.data as OverviewData;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof MOCK_DATA) => {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('上传解析失败');
      return res.json();
    },
    onSuccess: (data) => {
      setAuditResult(data.data);
      message.success('稽核完成，已生成风险与挽损建议');
    },
    onError: () => message.error('稽核执行失败，请稍后重试'),
  });

  const createLeadMutation = useMutation({
    mutationFn: async (payload: LeadFormValues) => {
      const res = await fetch('/api/commercial/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, source: '首页增长入口' }),
      });
      if (!res.ok) throw new Error('线索提交失败');
      return res.json();
    },
    onSuccess: () => {
      message.success('试点申请已提交，销售顾问将在30分钟内联系');
      setLeadModalOpen(false);
      leadForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['commercial-overview'] });
    },
    onError: () => message.error('申请提交失败，请检查字段后重试'),
  });

  const getFundFunnelOption = () => {
    const deductions = auditResult?.estimatedDeductionRisk || 0;
    const revenue = overview?.metrics.confirmedRevenue || 0;
    const pipeline = overview?.metrics.annualPipeline || 0;
    return {
      title: { text: '经营漏斗：管道到回款', textStyle: { fontSize: 15, fontWeight: 'bold' }, left: 'center' },
      tooltip: { trigger: 'item', formatter: '{b} : {c}元' },
      color: ['#0ea5e9', '#f59e0b', '#16a34a'],
      series: [{
        type: 'funnel', left: '10%', top: 60, bottom: 20, width: '80%', min: 0, max: Math.max(100000, pipeline), minSize: '20%', maxSize: '100%',
        sort: 'desc', label: { show: true, position: 'inside', formatter: '{b}\n¥{c}' },
        data: [
          { value: pipeline, name: '年度线索管道' },
          { value: Math.max(0, pipeline * 0.38), name: '方案报价阶段' },
          { value: Math.max(0, revenue - deductions), name: '预计净回款' },
        ]
      }]
    };
  };

  const getRoiLineOption = () => ({
    title: { text: '合规投入回报曲线（6个月）', textStyle: { fontSize: 15, fontWeight: 'bold' }, left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['传统人工模式', '平台+设备协同模式'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '50', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: ['1月(实)', '2月(实)', '3月(本月)', '4月(预)', '5月(预)', '6月(预)'] },
    yAxis: { type: 'value', name: '月度罚损额(元)' },
    series: [
      { name: '传统人工模式', type: 'line', data: [45000, 52000, 48000, 50000, 55000, 49000], itemStyle: { color: '#ef4444' }, areaStyle: { color: 'rgba(239, 68, 68, 0.1)' } },
      { name: '平台+设备协同模式', type: 'line', data: [45000, 52000, 48000, 15000, 8000, 5000], itemStyle: { color: '#16a34a' }, areaStyle: { color: 'rgba(22, 163, 74, 0.1)' } }
    ]
  });

  const quickActions = [
    { label: '进入增长中心', icon: <LineChartOutlined />, onClick: () => router.push('/commercial') },
    { label: '查看合规报表', icon: <SafetyCertificateOutlined />, onClick: () => router.push('/reports') },
    { label: '推进设备成交', icon: <ShopOutlined />, onClick: () => router.push('/agetech') },
    { label: '人员效能分析', icon: <TeamOutlined />, onClick: () => router.push('/staff') },
  ];

  const handleSubmitLead = async () => {
    const values = await leadForm.validateFields();
    createLeadMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-0 bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 text-white kpi-card" styles={{ body: { padding: '28px' } }}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-2">银龄机构增长总控台</h1>
            <p className="text-cyan-50 text-sm">从稽核到成交再到复购，统一用数据驱动现金流增长。</p>
          </div>
          <Space wrap>
            <Button size="large" icon={<UploadOutlined />} onClick={() => mutation.mutate(MOCK_DATA)} loading={mutation.isPending}>
              {mutation.isPending ? '稽核执行中' : '运行合规稽核'}
            </Button>
            <Button size="large" type="primary" className="!bg-white !text-teal-700" onClick={() => setLeadModalOpen(true)}>
              申请试点合作
            </Button>
          </Space>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="kpi-card" variant="borderless">
          <Statistic
            title="年度线索管道"
            value={overview?.metrics.annualPipeline ?? 0}
            prefix="¥"
            styles={{ content: { color: '#0f766e' } }}
          />
        </Card>
        <Card className="kpi-card" variant="borderless">
          <Statistic
            title="已确认营收"
            value={overview?.metrics.confirmedRevenue ?? 0}
            prefix="¥"
            styles={{ content: { color: '#16a34a' } }}
          />
        </Card>
        <Card className="kpi-card" variant="borderless">
          <Statistic
            title="成交转化率"
            value={overview?.metrics.conversionRate ?? 0}
            suffix="%"
            styles={{ content: { color: '#0284c7' } }}
          />
        </Card>
        <Card className="kpi-card" variant="borderless">
          <Statistic
            title={<span className="text-red-700 font-bold">合规风险敞口</span>}
            value={auditResult ? auditResult.estimatedDeductionRisk : 0}
            prefix="¥"
            styles={{ content: { color: '#b91c1c' } }}
            suffix={<WarningOutlined className="text-xl ml-2" />}
          />
        </Card>
      </div>

      <Card title="功能入口" className="kpi-card" variant="borderless">
        <Space wrap>
          {quickActions.map((action) => (
            <Button key={action.label} icon={action.icon} size="large" onClick={action.onClick}>
              {action.label}
            </Button>
          ))}
        </Space>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="borderless" className="kpi-card"><ReactECharts option={getFundFunnelOption()} style={{ height: '350px' }} /></Card>
        <Card variant="borderless" className="kpi-card"><ReactECharts option={getRoiLineOption()} style={{ height: '350px' }} /></Card>
      </div>

      <Row gutter={[16, 16]}>
        {subscriptionPlans.map((plan) => (
          <Col xs={24} md={8} key={plan.id}>
            <Card className="kpi-card h-full" title={plan.planName}>
              <Statistic value={plan.monthlyPrice} prefix="¥" suffix="/月" styles={{ content: { color: '#0f766e' } }} />
              <p className="text-xs text-gray-500 mt-2">目标机构：{plan.target}</p>
              <ul className="list-disc ml-4 mt-3 text-sm text-gray-700 space-y-1">
                {plan.highlights.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <Button type="primary" className="mt-4 !bg-teal-700" block onClick={() => setLeadModalOpen(true)}>
                申请方案报价
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title={<span className="text-lg font-bold text-gray-800">当月稽核异常与挽损建议</span>} variant="borderless" className="kpi-card">
        {!!auditResult && auditResult.details.length > 0 && (
          <Alert 
            className="mb-6 border border-orange-300 shadow-sm rounded-lg"
            title={<span className="font-bold text-orange-800 text-base">算法预警：存在【时间错位跨越】及【翻身服务缺失】违规</span>}
            description={
              <div className="mt-2 text-sm text-gray-700 leading-relaxed">
                <strong>解决方案提示：</strong> AI 建议导入 <strong>[智能体征监测床垫C20]</strong>，替代手写表单，可降低 90% 人维漏签。
              </div>
            }
            type="warning" showIcon icon={<ThunderboltFilled className="text-2xl mt-1 text-orange-500" />}
            action={<Button type="primary" danger onClick={() => router.push('/agetech')} className="font-bold shadow">转到设备成交页</Button>}
          />
        )}
        <Table 
          rowKey={(record: AuditIssueItem) => `${record.patientId}-${record.caregiverId ?? 'NA'}-${record.description}`}
          dataSource={auditResult ? auditResult.details : []}
          locale={{ emptyText: '点击左上角执行算力以载入数据' }}
          pagination={false}
          columns={[
            { title: '病人ID', dataIndex: 'patientId', render: (id) => <Tag color="blue">{id}</Tag> },
            { title: '责任护工护士号', dataIndex: 'caregiverId', render: (id) => <Text code>{id}</Text> },
            { title: '违规分类定级', dataIndex: 'severity', render: (sev: string) => <Tag color={sev.includes('致命') ? 'red' : 'volcano'}>{sev}</Tag> },
            { title: '医保规则防线描述', dataIndex: 'description' },
            { title: '穿透没收预估额', dataIndex: 'impactEstimation', render: (val: number) => <Text type="danger" strong>-¥{Math.abs(val)}</Text> },
          ]} 
        />
      </Card>

      <Modal
        title="申请机构试点合作"
        open={leadModalOpen}
        onCancel={() => setLeadModalOpen(false)}
        onOk={handleSubmitLead}
        okText="提交申请"
        confirmLoading={createLeadMutation.isPending}
      >
        <Form form={leadForm} layout="vertical">
          <Form.Item label="联系人" name="name" rules={[{ required: true, message: '请输入联系人' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item label="手机号" name="phone" rules={[{ required: true, message: '请输入手机号' }]}>
            <Input placeholder="11位手机号" />
          </Form.Item>
          <Form.Item label="机构名称" name="organization" rules={[{ required: true, message: '请输入机构名称' }]}>
            <Input placeholder="示例：温江康养中心" />
          </Form.Item>
          <Form.Item label="床位数" name="beds" rules={[{ required: true, message: '请输入床位数' }]}>
            <InputNumber className="w-full" min={20} max={2000} />
          </Form.Item>
          <Form.Item label="预计预算" name="budget" rules={[{ required: true, message: '请输入预算' }]}>
            <InputNumber className="w-full" min={1000} max={5000000} addonBefore="¥" />
          </Form.Item>
          <Form.Item label="重点意向" name="interest" rules={[{ required: true, message: '请输入意向内容' }]}>
            <Input placeholder="例：C20 + 报表脱敏服务" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
