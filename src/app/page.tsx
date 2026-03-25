'use client';
import React, { useState } from 'react';
import { Card, Statistic, Table, Tag, Button, Alert, Typography } from 'antd';
import { UploadOutlined, ThunderboltFilled, WarningOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const { Text } = Typography;

const MOCK_DATA = [
  { patientId: 'P001', caregiverId: 'C100', actionType: 'turn_over', startTime: '2026-03-25T08:00:00Z', endTime: '2026-03-25T08:15:00Z' },
  { patientId: 'P002', caregiverId: 'C100', actionType: 'feed', startTime: '2026-03-25T08:10:00Z', endTime: '2026-03-25T08:40:00Z' }, 
  { patientId: 'P001', caregiverId: 'C100', actionType: 'turn_over', startTime: '2026-03-25T11:00:00Z', endTime: '2026-03-25T11:15:00Z' }
];

export default function Dashboard() {
  const [auditResult, setAuditResult] = useState<any>(null);
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (data: any[]) => {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('上传解析失败');
      return res.json();
    },
    onSuccess: (data) => setAuditResult(data.data),
  });

  const getFundFunnelOption = () => {
    const deductions = auditResult?.estimatedDeductionRisk || 0;
    return {
      title: { text: '长护险月度资金存留漏斗预估', textStyle: { fontSize: 15, fontWeight: 'bold' }, left: 'center' },
      tooltip: { trigger: 'item', formatter: '{b} : {c}元' },
      color: ['#3b82f6', '#f59e0b', '#10b981'],
      series: [{
        type: 'funnel', left: '10%', top: 60, bottom: 20, width: '80%', min: 0, max: 300000, minSize: '20%', maxSize: '100%',
        sort: 'desc', label: { show: true, position: 'inside', formatter: '{b}\n¥{c}' },
        data: [
          { value: 300000, name: '报满理论值' },
          { value: 245000, name: '现阶段机构申报' },
          { value: 245000 - deductions, name: '医保局核拨到账估算' },
        ]
      }]
    };
  };

  const getRoiLineOption = () => ({
    title: { text: 'AgeTech 硬件 ROI 降损对比曲线', textStyle: { fontSize: 15, fontWeight: 'bold' }, left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['纯人工手写(扣款高)', '搭载智能床垫(防漏防套)'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '50', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: ['1月(实)', '2月(实)', '3月(本月)', '4月(预)', '5月(预)', '6月(预)'] },
    yAxis: { type: 'value', name: '月度罚损额(元)' },
    series: [
      { name: '纯人工手写(扣款高)', type: 'line', data: [45000, 52000, 48000, 50000, 55000, 49000], itemStyle: { color: '#ef4444' }, areaStyle: { color: 'rgba(239, 68, 68, 0.1)' } },
      { name: '搭载智能床垫(防漏防套)', type: 'line', data: [45000, 52000, 48000, 15000, 8000, 5000], itemStyle: { color: '#10b981' }, areaStyle: { color: 'rgba(16, 185, 129, 0.1)' } }
    ]
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm rounded-xl border-t-4 border-t-indigo-500" variant="borderless" styles={{ body: { padding: '24px' } }}>
            <Text className="text-indigo-600 font-semibold mb-3 tracking-wider text-xs block">护工排表数据中心</Text>
            <Button type="primary" size="large" icon={<UploadOutlined />} block onClick={() => mutation.mutate(MOCK_DATA)} loading={mutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 shadow-md font-bold">
              {mutation.isPending ? 'OCR+大模型核对中' : '执行模拟稽核算力'}
            </Button>
        </Card>
        <Card className="shadow-sm rounded-xl border border-gray-100" variant="borderless" styles={{ body: { padding: '24px' } }}>
          <Statistic title={<span className="text-gray-500 font-medium">基准资金池 (上限)</span>} value={300000} prefix="¥" formatter={(v) => <span style={{ color: '#1f2937', fontWeight: 700 }}>{v}</span>} />
        </Card>
        <Card className="shadow-sm rounded-xl border border-red-100 bg-red-50" variant="borderless" styles={{ body: { padding: '24px' } }}>
          <Statistic title={<span className="text-red-800 font-bold">侦测到的风险敞口</span>} value={auditResult ? auditResult.estimatedDeductionRisk : '---'} prefix="¥"
                      formatter={(v) => <span style={{ color: '#dc2626', fontWeight: 700 }}>{v}</span>} suffix={<WarningOutlined className="text-xl ml-2" />} />
        </Card>
        <Card className="shadow-sm rounded-xl border border-green-100" variant="borderless" styles={{ body: { padding: '24px' } }}>
          <Statistic title={<span className="text-gray-500 font-medium">单床真实毛利预测</span>} value={auditResult ? 18.4 : '---'} precision={1} suffix="%" formatter={(v) => <span style={{ color: '#10b981', fontWeight: 700 }}>{v}</span>} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="borderless" className="shadow-sm rounded-xl border border-gray-100"><ReactECharts option={getFundFunnelOption()} style={{ height: '350px' }} /></Card>
        <Card variant="borderless" className="shadow-sm rounded-xl border border-gray-100"><ReactECharts option={getRoiLineOption()} style={{ height: '350px' }} /></Card>
      </div>

      <Card title={<span className="text-lg font-bold text-gray-800">当月底层稽核异常日志数据表</span>} variant="borderless" className="shadow-sm rounded-xl border border-gray-100">
        {auditResult && auditResult.details.length > 0 && (
          <Alert 
            className="mb-6 border border-orange-300 shadow-sm rounded-lg"
            title={<span className="font-bold text-orange-800 text-base">算法预警：存在【时间错位跨越】及【翻身服务缺失】违规</span>}
            description={
              <div className="mt-2 text-sm text-gray-700 leading-relaxed">
                <strong>解决方案提示：</strong> AI 建议导入 <strong>[智能体征监测床垫C20]</strong>，替代手写表单，可降低 90% 人维漏签。
              </div>
            }
            type="warning" showIcon icon={<ThunderboltFilled className="text-2xl mt-1 text-orange-500" />}
            action={<Button type="primary" danger onClick={() => router.push('/agetech')} className="font-bold shadow">了解此硬件设备推荐</Button>}
          />
        )}
        <Table 
          rowKey={(record, index) => String(index)}
          dataSource={auditResult ? auditResult.details : []} 
          locale={{ emptyText: '点击左上角执行算力以载入数据' }}
          pagination={false}
          columns={[
            { title: '病人ID', dataIndex: 'patientId', render: (id) => <Tag color="blue">{id}</Tag> },
            { title: '责任护工护士号', dataIndex: 'caregiverId', render: (id) => <Text code>{id}</Text> },
            { title: '违规分类定级', dataIndex: 'severity', render: (sev) => <Tag color={sev.indexOf('致命')>-1 ? 'red':'volcano'}>{sev}</Tag> },
            { title: '医保规则防线描述', dataIndex: 'description' },
            { title: '穿透没收预估额', dataIndex: 'impactEstimation', render: (val) => <Text type="danger" strong>-¥{Math.abs(val)}</Text> },
          ]} 
        />
      </Card>
    </div>
  );
}
