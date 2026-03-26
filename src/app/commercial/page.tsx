'use client';

import React from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Typography, Button, Space } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { DollarOutlined, RiseOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface OverviewResponse {
  leads: Array<{
    id: string;
    name: string;
    organization: string;
    interest: string;
    budget: number;
    status: 'new' | 'contacted' | 'proposal' | 'won';
    createdAt: string;
  }>;
  orders: Array<{
    id: string;
    productName: string;
    organization: string;
    amount: number;
    quantity: number;
    status: 'pending' | 'paid' | 'fulfilled';
    createdAt: string;
  }>;
  metrics: {
    annualPipeline: number;
    confirmedRevenue: number;
    conversionRate: number;
    avgDealSize: number;
  };
}

function statusColor(status: string) {
  if (status === 'won' || status === 'fulfilled') return 'green';
  if (status === 'proposal' || status === 'paid') return 'blue';
  if (status === 'contacted' || status === 'pending') return 'orange';
  return 'default';
}

export default function CommercialPage() {
  const router = useRouter();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['commercial-overview'],
    queryFn: async () => {
      const res = await fetch('/api/commercial/overview');
      if (!res.ok) throw new Error('商业数据获取失败');
      const payload = await res.json();
      return payload.data as OverviewResponse;
    },
  });

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-0 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Title level={3} className="!mb-1 !text-white">商业增长驾驶舱</Title>
            <Text className="text-emerald-50">把线索、订单、交付与续约统一到一个经营看板，盯住现金流与复购率。</Text>
          </div>
          <Space>
            <Button onClick={() => refetch()}>刷新经营数据</Button>
            <Button type="primary" className="!bg-white !text-emerald-700" onClick={() => router.push('/agetech')}>进入设备成交页</Button>
          </Space>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <Card loading={isLoading} className="rounded-xl">
            <Statistic title="年度线索管道金额" value={data?.metrics.annualPipeline ?? 0} prefix="¥" styles={{ content: { color: '#0f766e' } }} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card loading={isLoading} className="rounded-xl">
            <Statistic title="已确认营收" value={data?.metrics.confirmedRevenue ?? 0} prefix={<DollarOutlined />} styles={{ content: { color: '#16a34a' } }} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card loading={isLoading} className="rounded-xl">
            <Statistic title="当前转化率" value={data?.metrics.conversionRate ?? 0} suffix="%" prefix={<RiseOutlined />} styles={{ content: { color: '#0284c7' } }} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card loading={isLoading} className="rounded-xl">
            <Statistic title="平均客单价" value={data?.metrics.avgDealSize ?? 0} prefix={<TeamOutlined />} styles={{ content: { color: '#b45309' } }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={13}>
          <Card title="最新销售线索" className="rounded-xl">
            <Table
              rowKey="id"
              dataSource={data?.leads ?? []}
              pagination={{ pageSize: 5 }}
              columns={[
                { title: '机构', dataIndex: 'organization' },
                { title: '联系人', dataIndex: 'name' },
                { title: '意向', dataIndex: 'interest' },
                { title: '预算', dataIndex: 'budget', render: (v: number) => `¥${v.toLocaleString()}` },
                { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusColor(s)}>{s}</Tag> },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} xl={11}>
          <Card title="订单执行列表" className="rounded-xl">
            <Table
              rowKey="id"
              dataSource={data?.orders ?? []}
              pagination={{ pageSize: 5 }}
              columns={[
                { title: '产品', dataIndex: 'productName' },
                { title: '机构', dataIndex: 'organization' },
                { title: '数量', dataIndex: 'quantity' },
                { title: '金额', dataIndex: 'amount', render: (v: number) => `¥${v.toLocaleString()}` },
                { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusColor(s)}>{s}</Tag> },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
