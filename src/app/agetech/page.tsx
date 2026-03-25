'use client';
import React from 'react';
import { Card, Row, Col, Typography, Button, Tag, Divider, Statistic, Rate } from 'antd';
import { ShoppingCartOutlined, FireOutlined, VerifiedOutlined, CustomerServiceOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function AgeTechPage() {
  const products = [
    {
      name: '翔宇医疗 - 智能体征监测床垫 C20 (温江厂供)',
      type: '核心物联终端',
      desc: '专解：重度失能老人夜间翻身频率不够，被医保局穿透式查处并处以高额退回的痼疾。铺在席梦思下方，毫秒级感知病人受压面积更换，自动对齐长护险“翻身”动作打卡数据库。从此杜绝扣款。',
      price: '￥ 3,200',
      roi: '2.4 个月',
      subsidy: '高危项目拦截，单院每月多拿补贴约 1.4万',
      tags: ['银发经济创新试点', '防漏扣神器', '包对接医保API'],
      rating: 5
    },
    {
      name: 'Lokomat - 康复机器人下肢外骨骼 (基础型)',
      type: '康复评级设备',
      desc: '专解：人工护工为老人康复动作不达标定额，被系统拒绝给付。自带数字孪生康复物理参数日志，严格契合政府康复硬性标准，将机构级别拉升。',
      price: '￥ 45,000',
      roi: '5.1 个月',
      subsidy: '评级升档挂钩，单床补贴上涨300元/月',
      tags: ['动态出厂底价', '硬件补贴可达30%'],
      rating: 4.5
    },
    {
       name: '普宙医疗 - 智能中枢控制屏网关',
       type: '中控大屏',
       desc: '解决机构数字盲区，替代护士站白板。集成人员呼叫、门禁、体征告警等。一键串联所有辅具设备。',
       price: '￥ 6,500',
       roi: '8 个月',
       subsidy: '降低 1.5个 夜间巡房护工的人力成本',
       tags: ['基建类', '免布线'],
       rating: 4
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500 gap-4">
        <div>
          <Title level={4} className="!mb-1">AgeTech 聚合推荐引擎 (院长端采购内参)</Title>
          <Text type="secondary" className="text-[13px]">模型已自动将您的长护险【防扣款红线】与温江区【26家智能智造企业库】打通。不再买废弃设备，每套设备附带清晰的 ROI 回本模型算账。</Text>
        </div>
        <div className="flex gap-8">
           <Statistic title="测算可省漏扣罚单" value={14000} prefix="¥" valueStyle={{ color: '#ef4444', fontWeight: 'bold' }} />
           <Statistic title="温江区政府补贴名额" value={5} suffix="家" valueStyle={{ color: '#10b981', fontWeight: 'bold' }} />
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {products.map((p, idx) => (
          <Col xs={24} md={12} lg={8} key={idx}>
            <Card className="shadow-sm rounded-xl h-full border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div>
                 <div className="flex justify-between items-start mb-4">
                   <Title level={5} className="!font-bold text-gray-800 pr-2">{p.name}</Title>
                   <Tag color={idx === 0 ? 'red' : 'blue'} icon={idx === 0 ? <FireOutlined /> : <VerifiedOutlined />} className="m-0 whitespace-nowrap">
                     {p.type}
                   </Tag>
                 </div>
                 <div className="space-x-1 mb-4 flex flex-wrap gap-y-2">
                    {p.tags.map(t => <Tag key={t} className="bg-gray-100 border-none text-gray-600">{t}</Tag>)}
                 </div>
                 <Paragraph className="text-gray-500 text-[13px] min-h-[90px] leading-relaxed">{p.desc}</Paragraph>
              </div>
              
              <div className="mt-auto">
                 <Divider className="my-3"/>
                 <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg mb-4 space-y-2">
                   <div className="flex justify-between items-center">
                     <Text className="text-gray-500 text-xs">护险挽损增益预测</Text>
                     <Text className="text-[13px] font-semibold text-orange-600 text-right">{p.subsidy}</Text>
                   </div>
                   <div className="flex justify-between items-center">
                     <Text className="text-gray-500 text-xs">测算设备回本周期(ROI)</Text>
                     <Text className="text-lg font-bold text-green-600">{p.roi}</Text>
                   </div>
                 </div>

                 <div className="flex items-center justify-between mb-4">
                    <Rate disabled defaultValue={p.rating} allowHalf className="text-sm text-yellow-400" />
                    <span className="text-xs text-gray-400">已有 12 家机构采纳</span>
                 </div>

                 <div className="flex justify-between items-center">
                    <Text className="text-2xl font-black text-gray-800 tracking-tighter">{p.price}</Text>
                    <Button type={idx === 0 ? "primary" : "default"} icon={idx === 0 ? <ShoppingCartOutlined /> : <CustomerServiceOutlined />} className={idx === 0 ? "bg-indigo-600 shadow" : ""}>
                      {idx === 0 ? '一键直供下单' : '联系厂家支持'}
                    </Button>
                 </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
