'use client';
import React, { useMemo, useState } from 'react';
import { Card, Row, Col, Typography, Button, Tag, Divider, Statistic, Rate, Modal, Form, Input, InputNumber, App, Space } from 'antd';
import { ShoppingCartOutlined, FireOutlined, VerifiedOutlined, CustomerServiceOutlined, DollarCircleOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { productCatalog } from '@/lib/business-data';

const { Title, Text, Paragraph } = Typography;

interface OrderFormValues {
  organization: string;
  contactName: string;
  quantity: number;
}

interface ConsultFormValues {
  name: string;
  phone: string;
  organization: string;
  beds: number;
}

export default function AgeTechPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(productCatalog[0].id);
  const [orderForm] = Form.useForm<OrderFormValues>();
  const [consultForm] = Form.useForm<ConsultFormValues>();

  const selectedProduct = useMemo(
    () => productCatalog.find((item) => item.id === selectedProductId) ?? productCatalog[0],
    [selectedProductId]
  );

  const orderMutation = useMutation({
    mutationFn: async (payload: OrderFormValues) => {
      const amount = payload.quantity * selectedProduct.unitPrice;
      const res = await fetch('/api/commercial/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          organization: payload.organization,
          contactName: payload.contactName,
          quantity: payload.quantity,
          amount,
        }),
      });
      if (!res.ok) throw new Error('下单失败');
      return res.json();
    },
    onSuccess: () => {
      message.success('订单创建成功，已进入待付款队列');
      setOrderModalOpen(false);
      orderForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['commercial-overview'] });
      router.push('/commercial');
    },
    onError: () => message.error('下单失败，请稍后重试'),
  });

  const consultMutation = useMutation({
    mutationFn: async (payload: ConsultFormValues) => {
      const res = await fetch('/api/commercial/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name,
          phone: payload.phone,
          organization: payload.organization,
          beds: payload.beds,
          source: 'AgeTech成交页咨询',
          budget: selectedProduct.unitPrice * 10,
          interest: selectedProduct.name,
        }),
      });
      if (!res.ok) throw new Error('咨询提交失败');
      return res.json();
    },
    onSuccess: () => {
      message.success('咨询线索已提交，售前顾问将尽快联系您');
      setConsultModalOpen(false);
      consultForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['commercial-overview'] });
    },
    onError: () => message.error('咨询提交失败，请稍后重试'),
  });

  const handleCreateOrder = async () => {
    const values = await orderForm.validateFields();
    orderMutation.mutate(values);
  };

  const handleCreateConsult = async () => {
    const values = await consultForm.validateFields();
    consultMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border-l-4 border-teal-600 gap-4">
        <div>
          <Title level={4} className="!mb-1">AgeTech 成交页（采购与实施一体化）</Title>
          <Text type="secondary" className="text-[13px]">每一款设备都绑定了 ROI 与合规场景，可直接下单或提交咨询线索，进入真实销售流程。</Text>
        </div>
        <div className="flex gap-8 flex-wrap justify-end">
            <Statistic title="测算可省漏扣罚单" value={14000} prefix="¥" styles={{ content: { color: '#ef4444', fontWeight: 'bold' } }} />
            <Statistic title="温江区政府补贴名额" value={5} suffix="家" styles={{ content: { color: '#10b981', fontWeight: 'bold' } }} />
           <Button icon={<DollarCircleOutlined />} onClick={() => router.push('/commercial')}>查看商业漏斗</Button>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {productCatalog.map((p, idx) => (
          <Col xs={24} md={12} lg={8} key={p.id}>
            <Card className="shadow-sm rounded-xl h-full border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div>
                 <div className="flex justify-between items-start mb-4">
                   <Title level={5} className="!font-bold text-gray-800 pr-2">{p.name}</Title>
                   <Tag color={idx === 0 ? 'red' : 'blue'} icon={idx === 0 ? <FireOutlined /> : <VerifiedOutlined />} className="m-0 whitespace-nowrap">
                     {p.type}
                   </Tag>
                 </div>
                 <div className="space-x-1 mb-4 flex flex-wrap gap-y-2">
                    <Tag className="bg-gray-100 border-none text-gray-600">可对接医保规则引擎</Tag>
                    <Tag className="bg-gray-100 border-none text-gray-600">支持实施交付</Tag>
                 </div>
                 <Paragraph className="text-gray-500 text-[13px] min-h-[90px] leading-relaxed">{p.valueSummary}</Paragraph>
              </div>
              
              <div className="mt-auto">
                 <Divider className="my-3"/>
                 <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg mb-4 space-y-2">
                   <div className="flex justify-between items-center">
                     <Text className="text-gray-500 text-xs">护险挽损增益预测</Text>
                     <Text className="text-[13px] font-semibold text-orange-600 text-right">预计月均减少罚损 8,000+ 元</Text>
                   </div>
                   <div className="flex justify-between items-center">
                     <Text className="text-gray-500 text-xs">测算设备回本周期(ROI)</Text>
                     <Text className="text-lg font-bold text-green-600">{p.roiMonths} 个月</Text>
                   </div>
                 </div>

                 <div className="flex items-center justify-between mb-4">
                    <Rate disabled defaultValue={idx === 0 ? 5 : idx === 1 ? 4.5 : 4} allowHalf className="text-sm text-yellow-400" />
                    <span className="text-xs text-gray-400">已有 12 家机构采纳</span>
                 </div>

                 <div className="flex justify-between items-center gap-2">
                    <Text className="text-2xl font-black text-gray-800 tracking-tighter">¥ {p.unitPrice.toLocaleString()}</Text>
                    <Space>
                      <Button
                        type="default"
                        icon={<CustomerServiceOutlined />}
                        onClick={() => {
                          setSelectedProductId(p.id);
                          setConsultModalOpen(true);
                        }}
                      >
                        获取实施方案
                      </Button>
                      <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        className="!bg-teal-700"
                        onClick={() => {
                          setSelectedProductId(p.id);
                          setOrderModalOpen(true);
                        }}
                      >
                        立即下单
                      </Button>
                    </Space>
                 </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={`下单产品：${selectedProduct.name}`}
        open={orderModalOpen}
        onCancel={() => setOrderModalOpen(false)}
        onOk={handleCreateOrder}
        okText="提交订单"
        confirmLoading={orderMutation.isPending}
      >
        <Form form={orderForm} layout="vertical" initialValues={{ quantity: 1 }}>
          <Form.Item name="organization" label="采购机构" rules={[{ required: true, message: '请输入采购机构' }]}>
            <Input placeholder="示例：温江康养中心" />
          </Form.Item>
          <Form.Item name="contactName" label="联系人" rules={[{ required: true, message: '请输入联系人' }]}>
            <Input placeholder="示例：张院长" />
          </Form.Item>
          <Form.Item name="quantity" label="采购数量" rules={[{ required: true, message: '请输入数量' }]}>
            <InputNumber className="w-full" min={1} max={999} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`咨询产品：${selectedProduct.name}`}
        open={consultModalOpen}
        onCancel={() => setConsultModalOpen(false)}
        onOk={handleCreateConsult}
        okText="提交咨询"
        confirmLoading={consultMutation.isPending}
      >
        <Form form={consultForm} layout="vertical">
          <Form.Item name="name" label="联系人" rules={[{ required: true, message: '请输入联系人' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="organization" label="机构名称" rules={[{ required: true, message: '请输入机构名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="beds" label="床位数" rules={[{ required: true, message: '请输入床位数' }]}>
            <InputNumber className="w-full" min={20} max={2000} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
