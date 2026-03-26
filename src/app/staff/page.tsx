'use client';
import React from 'react';
import { Card, Table, Tag, Typography, Progress, Badge, Avatar, Button, Space, App } from 'antd';
import { AreaChartOutlined, UserOutlined, ThunderboltFilled, TeamOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface StaffRecord {
  key: string;
  name: string;
  type: string;
  patients: number;
  riskScore: number;
  errCount: number;
  hrs: number;
  trend: 'up' | 'down' | 'flat';
}

export default function StaffPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const queryClient = useQueryClient();

  const staffData: StaffRecord[] = [
    { key: 'C100', name: '王淑芬', type: '资深护工', patients: 8, riskScore: 88, errCount: 12, hrs: 210, trend: 'up' },
    { key: 'C101', name: '李梅', type: '中级护工', patients: 5, riskScore: 15, errCount: 1, hrs: 160, trend: 'down' },
    { key: 'C102', name: '张国强', type: '初级护工', patients: 4, riskScore: 40, errCount: 4, hrs: 120, trend: 'up' },
    { key: 'R001', name: '自动化IoT网关', type: '数字终端', patients: 200, riskScore: 0, errCount: 0, hrs: 720, trend: 'flat' },
  ];

  const interventionMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/commercial/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '运营管理员',
          phone: '13800138001',
          organization: '示范机构-高风险片区',
          beds: 80,
          source: '人员页风险干预',
          budget: 48000,
          interest: '高风险分区自动化改造',
        }),
      });
      if (!res.ok) throw new Error('干预计划提交失败');
      return res.json();
    },
    onSuccess: () => {
      message.success('干预工单已提交至商业中心');
      queryClient.invalidateQueries({ queryKey: ['commercial-overview'] });
      router.push('/commercial');
    },
    onError: () => message.error('提交失败，请稍后重试'),
  });

  const handleExportStaffCsv = () => {
    const header = ['编号', '姓名', '职级岗属', '床位数', '工时', '差错次数', '风险指数'];
    const rows = staffData.map((row) => [row.key, row.name, row.type, row.patients, row.hrs, row.errCount, row.riskScore]);
    const content = [header, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `staff-performance-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    message.success('绩效报表已导出');
  };

  const columns = [
    { 
      title: '人员/设备标号', dataIndex: 'key', 
      render: (t: string, r: StaffRecord) => (
         <div className="flex items-center gap-3">
            <Avatar icon={<UserOutlined />} className={r.type === '数字终端' ? "bg-blue-500" : "bg-gray-300"} />
            <div>
               <Text strong className="block">{r.name}</Text>
               <Text type="secondary" className="text-xs font-mono">{t}</Text>
            </div>
         </div>
      )
    },
    { title: '职级岗属', dataIndex: 'type', render: (t: string) => <Tag color={t.includes('数字') ? 'cyan' : 'default'} className="rounded-full shadow-sm">{t}</Tag> },
    { title: '护管老人(床位)', dataIndex: 'patients', render: (t: number) => <span className="font-semibold text-gray-700">{t} 张床</span> },
    { title: '本月工时累积', dataIndex: 'hrs', render: (t: number) => <Text>{t} 小时</Text> },
    { 
      title: '手记差错率(直接背锅项)', dataIndex: 'errCount', 
        render: (t: number) => (
          <div className="flex items-center gap-2">
              <Badge status={t > 5 ? 'error' : t === 0 ? 'success' : 'warning'} />
              <Text type={t > 5 ? 'danger' : 'secondary'} className="font-bold">{t} 次</Text>
          </div>
      )
    },
    { 
      title: '长护险扣款红线指数', dataIndex: 'riskScore', 
      render: (t: number) => (
         <div className="w-[150px]">
            <Progress percent={t} size="small" status={t > 50 ? 'exception' : 'active'} strokeColor={t > 50 ? '#ef4444' : '#10b981'} />
         </div>
      ) 
    },
  ];

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <Title level={4} className="!mb-1">机构护工画像与成本矩阵分析</Title>
            <Text type="secondary">基于护工每天手写的护理数据，由系统反推其“做账能力”。找出最容易导致机构罚单的漏洞人员。</Text>
          </div>
          <Space wrap>
            <Button icon={<AreaChartOutlined />} size="large" onClick={handleExportStaffCsv}>下载本月员工绩效总表</Button>
            <Button icon={<TeamOutlined />} size="large" onClick={() => router.push('/reports')}>安排专项培训</Button>
            <Button type="primary" className="!bg-teal-700" icon={<ThunderboltFilled />} size="large" loading={interventionMutation.isPending} onClick={() => interventionMutation.mutate()}>
              发起高风险区硬件改造
            </Button>
          </Space>
       </div>

       <Card variant="borderless" className="shadow-sm rounded-xl border border-gray-100 p-0 overflow-hidden">
          <Table 
            rowKey="key"
            dataSource={staffData} 
            pagination={false} 
            columns={columns} 
            rowClassName={(record) => record.riskScore > 50 ? 'bg-red-50' : ''}
          />
          <div className="p-4 bg-gray-50 text-sm text-gray-600 border-t border-gray-100">
            <strong>算法人事建议：</strong> 侦测到 <Text mark>王淑芬 (C100)</Text> 存在极端的时间记录管理缺陷，为机构带来的隐形罚款已经超过其个人工资体系。建议立刻在该员工管理的分区部署自动物联网感应硬件。
          </div>
       </Card>
    </div>
  );
}
