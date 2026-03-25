const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const files = {
  'components/DashboardLayout.tsx': `'use client';
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Spin } from 'antd';
import { DashboardOutlined, FileSearchOutlined, ThunderboltFilled, UserOutlined, CloudServerOutlined, BankOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-screen w-screen flex justify-center items-center bg-gray-50"><Spin size="large" /></div>;

  return (
    <Layout style={{ minHeight: '100vh', background: '#F3F4F6' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={260} theme="light" className="shadow-sm z-10 border-r border-gray-200" breakpoint="lg">
        <div className="p-5 flex items-center justify-center border-b border-gray-100 mb-2">
          <BankOutlined className="text-3xl text-indigo-600 mr-3" />
          {!collapsed && <span className="font-bold text-gray-800 text-xl tracking-wide">千岁银龄</span>}
        </div>
        <Menu theme="light" selectedKeys={[pathname]} mode="inline" className="border-r-0 text-[15px] p-2 space-y-1">
          <Menu.Item key="/" icon={<DashboardOutlined className="text-lg" />} className="rounded-lg">
            <Link href="/">长护险绩效大屏</Link>
          </Menu.Item>
          <Menu.Item key="/reports" icon={<FileSearchOutlined className="text-lg" />} className="rounded-lg">
            <Link href="/reports">AI 智能报表脱敏</Link>
          </Menu.Item>
          <Menu.Item key="/agetech" icon={<ThunderboltFilled className="text-lg" />} className="rounded-lg">
            <Link href="/agetech">AgeTech 优选算力</Link>
          </Menu.Item>
          <Menu.Item key="/staff" icon={<UserOutlined className="text-lg" />} className="rounded-lg">
            <Link href="/staff">机构人员矩阵</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="bg-gray-50">
        <Header className="bg-white border-b border-gray-200 flex px-8 items-center justify-between shadow-sm z-0 relative">
          <Title level={4} className="!mb-0 text-gray-800 !mt-0 font-bold">温江区示范点：200床位特护中心版</Title>
          <div className="flex items-center">
            <span className="bg-green-50 text-green-700 px-4 py-1.5 rounded-full border border-green-200 flex items-center text-sm font-medium shadow-inner">
              <CloudServerOutlined className="mr-2 text-lg" /> 数据物理沙盒运作中
            </span>
          </div>
        </Header>
        <Content className="p-8 flex flex-col gap-6 h-[calc(100vh-64px)] overflow-y-auto">
          <div className="max-w-[1600px] w-full mx-auto">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
`,
  'app/layout.tsx': `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import DashboardLayout from "@/components/DashboardLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "银龄闭环绩效智能平台",
  description: "长护险政企级合规稽核与物联网智能平台",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={\`\${inter.className} min-h-screen bg-gray-50 m-0\`}>
        <Providers>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </Providers>
      </body>
    </html>
  );
}
`,
  'app/page.tsx': `'use client';
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
        sort: 'desc', label: { show: true, position: 'inside', formatter: '{b}\\n¥{c}' },
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
        <Card className="shadow-sm rounded-xl border-t-4 border-t-indigo-500" bordered={false} bodyStyle={{ padding: '24px' }}>
            <Text className="text-indigo-600 font-semibold mb-3 tracking-wider text-xs block">护工排表数据中心</Text>
            <Button type="primary" size="large" icon={<UploadOutlined />} block onClick={() => mutation.mutate(MOCK_DATA)} loading={mutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 shadow-md font-bold">
              {mutation.isPending ? 'OCR+大模型核对中' : '执行模拟稽核算力'}
            </Button>
        </Card>
        <Card className="shadow-sm rounded-xl border border-gray-100" bordered={false} bodyStyle={{ padding: '24px' }}>
          <Statistic title={<span className="text-gray-500 font-medium">基准资金池 (上限)</span>} value={300000} prefix="¥" valueStyle={{ color: '#1f2937', fontWeight: 700 }} />
        </Card>
        <Card className="shadow-sm rounded-xl border border-red-100 bg-red-50" bordered={false} bodyStyle={{ padding: '24px' }}>
          <Statistic title={<span className="text-red-800 font-bold">侦测到的风险敞口</span>} value={auditResult ? auditResult.estimatedDeductionRisk : '---'} prefix="¥"
                      valueStyle={{ color: '#dc2626', fontWeight: 700 }} suffix={<WarningOutlined className="text-xl ml-2" />} />
        </Card>
        <Card className="shadow-sm rounded-xl border border-green-100" bordered={false} bodyStyle={{ padding: '24px' }}>
          <Statistic title={<span className="text-gray-500 font-medium">单床真实毛利预测</span>} value={auditResult ? 18.4 : '---'} precision={1} suffix="%" valueStyle={{ color: '#10b981', fontWeight: 700 }} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card bordered={false} className="shadow-sm rounded-xl border border-gray-100"><ReactECharts option={getFundFunnelOption()} style={{ height: '350px' }} /></Card>
        <Card bordered={false} className="shadow-sm rounded-xl border border-gray-100"><ReactECharts option={getRoiLineOption()} style={{ height: '350px' }} /></Card>
      </div>

      <Card title={<span className="text-lg font-bold text-gray-800">当月底层稽核异常日志数据表</span>} bordered={false} className="shadow-sm rounded-xl border border-gray-100">
        {auditResult && auditResult.details.length > 0 && (
          <Alert 
            className="mb-6 border border-orange-300 shadow-sm rounded-lg"
            message={<span className="font-bold text-orange-800 text-base">算法预警：存在【时间错位跨越】及【翻身服务缺失】违规</span>}
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
`,
  'app/reports/page.tsx': `'use client';
import React, { useState } from 'react';
import { Card, Upload, Steps, Table, Typography, Space, Button, Alert } from 'antd';
import { InboxOutlined, LockOutlined, CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const { Text, Title } = Typography;

export default function ReportsPage() {
  const [step, setStep] = useState(0);

  const handleMockUpload = (options: any) => {
    setTimeout(() => {
        options.onSuccess("ok");
        setStep(1);
        setTimeout(() => setStep(2), 1500);
        setTimeout(() => setStep(3), 3000);
    }, 1000);
  };

  const dummyData = [
    { key: 1, raw: '李大爷 身份证:5101041935... 昨天上午9点翻了一下身', clean: 'P001 (Hash:a8b7...) | 动作: turn_over | 时戳: 09:00', risk: '合规' },
    { key: 2, raw: '张婆婆 身份证:5101221942... 早10点吃早饭，喂了半碗', clean: 'P002 (Hash:2f9d...) | 动作: feed | 时戳: 10:00', risk: '合规' },
    { key: 3, raw: '李大爷 身份证:5101041935... 早10点吃早饭', clean: 'P001 (Hash:a8b7...) | 动作: feed | 时戳: 10:00', risk: '冲突' }
  ];

  return (
    <div className="space-y-6">
       <Card bordered={false} className="shadow-sm rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
          <Title level={3} className="!text-white !mb-2">AI 智能脱敏工作台 (GDPR 级标准)</Title>
          <Text className="text-blue-100">所有数据在进行医保漏洞预测前，将在浏览器本地与云端物理沙盒中执行不可逆脱敏（删去姓名和身份证），并承诺使用结束48小时内销毁。确保养老机构核心隐私固若金汤。</Text>
       </Card>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card title={<span><InboxOutlined className="mr-2"/> 第 1 步: 零阻力原始底稿摄入</span>} className="shadow-sm rounded-xl">
           <Dragger customRequest={handleMockUpload} showUploadList={false} className="bg-gray-50 border-gray-300">
              <p className="ant-upload-drag-icon pt-4"><InboxOutlined className="text-indigo-500" /></p>
              <p className="ant-upload-text font-bold text-gray-700">点击此处或拖拽文件进行上传</p>
              <p className="ant-upload-hint px-8 pb-4 text-gray-500">支持高拍仪图片、系统导出的PDF或手工Excel排班表。不改变护士和前台的任何工作习惯。</p>
           </Dragger>
         </Card>

         <Card title={<span><SyncOutlined className="mr-2 text-indigo-500"/> 第 2 步: 算法端稽核步骤处理</span>} className="shadow-sm rounded-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4">
              <Tag color={step === 3 ? "green" : "processing"} className="text-sm">
                {step === 3 ? '脱敏完成' : step === 0 ? '等待上传' : '算法沙盒提取中'}
              </Tag>
           </div>
           <Steps current={step} direction="vertical" className="mt-4" size="small" items={[
             { title: '本地内存隔离', description: '文件已摄入本地安全执行域，断开外部传输网络。' },
             { title: 'OCR 视觉解构与脱敏', description: '自动识别文字，提取动作与时间。立即粉碎姓名及国籍身份标识，转为 P+暗网哈希。' },
             { title: '合规逻辑大图排异', description: '加载四川省长护险审计大模型，梳理逻辑冲突与漏项。' },
             { title: '生成无印记合规财报', description: '数据准备完毕，随时可供审查，随时可物理抹除。' }
           ]} />
         </Card>
       </div>

       {step === 3 && (
         <Card title={<span><LockOutlined className="text-green-600 mr-2"/> 第 3 步: 物理粉碎后落库密文（展示用）</span>} className="shadow-sm rounded-xl border-green-200 border-2">
            <Alert message="以下呈现为平台计算过程中保留的无风险数据骨架，原件已通过内存粉碎。" type="success" showIcon className="mb-4" />
            <Table dataSource={dummyData} pagination={false} columns={[
              { title: '拦截的原始高危明文 (仅演示可见)', dataIndex: 'raw', render: text => <Text delete type="secondary" className="text-xs">{text}</Text> },
              { title: '合规版 AI 标准结构数据 (最终落库)', dataIndex: 'clean', render: text => <Text code className="text-green-700 bg-green-50 px-2 py-1 rounded">{text}</Text> },
              { title: '大模型审查结论', dataIndex: 'risk', render: text => (
                 <Tag color={text === '合规' ? 'success' : 'error'} icon={text === '合规' ? <CheckCircleOutlined /> : <SyncOutlined />}>{text}</Tag>
              )}
            ]} />
            <div className="mt-6 flex justify-end">
              <Button type="primary" size="large" className="bg-indigo-600 shadow-md font-bold px-8">导出至医保局申报专用加密 Excel</Button>
            </div>
         </Card>
       )}
    </div>
  );
}
`,
  'app/agetech/page.tsx': `'use client';
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
`,
  'app/staff/page.tsx': `'use client';
import React from 'react';
import { Card, Table, Tag, Typography, Progress, Badge, Avatar } from 'antd';
import { AreaChartOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function StaffPage() {
  const staffData = [
    { key: 'C100', name: '王淑芬', type: '资深护工', patients: 8, riskScore: 88, errCount: 12, hrs: 210, trend: 'up' },
    { key: 'C101', name: '李梅', type: '中级护工', patients: 5, riskScore: 15, errCount: 1, hrs: 160, trend: 'down' },
    { key: 'C102', name: '张国强', type: '初级护工', patients: 4, riskScore: 40, errCount: 4, hrs: 120, trend: 'up' },
    { key: 'R001', name: '自动化IoT网关', type: '数字终端', patients: 200, riskScore: 0, errCount: 0, hrs: 720, trend: 'flat' },
  ];

  const columns = [
    { 
      title: '人员/设备标号', dataIndex: 'key', 
      render: (t: string, r: any) => (
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
      render: (t: number, record: any) => (
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
          <Button icon={<AreaChartOutlined />} size="large">下载本月员工绩效扣分总表</Button>
       </div>

       <Card bordered={false} className="shadow-sm rounded-xl border border-gray-100 p-0 overflow-hidden">
          <Table 
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
`
};

Object.keys(files).forEach(file => {
  const filePath = path.join(srcDir, file);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, files[file], 'utf-8');
});
console.log('所有子页面及完整侧边栏路由已构建落盘执行完毕。');
