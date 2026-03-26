'use client';
import React, { useState } from 'react';
import { Layout, Menu, Typography, Spin, Button, Space } from 'antd';
import {
  DashboardOutlined,
  FileSearchOutlined,
  ThunderboltFilled,
  UserOutlined,
  CloudServerOutlined,
  BankOutlined,
  DollarCircleOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  if (!pathname) return <div className="h-screen w-screen flex justify-center items-center bg-gray-50"><Spin size="large" /></div>;

  const menuItems = [
    { key: '/', icon: <DashboardOutlined className="text-lg" />, label: <Link href="/">经营总览</Link> },
    { key: '/commercial', icon: <DollarCircleOutlined className="text-lg" />, label: <Link href="/commercial">商业增长中心</Link> },
    { key: '/reports', icon: <FileSearchOutlined className="text-lg" />, label: <Link href="/reports">合规报表工厂</Link> },
    { key: '/agetech', icon: <ThunderboltFilled className="text-lg" />, label: <Link href="/agetech">AgeTech 成交页</Link> },
    { key: '/staff', icon: <UserOutlined className="text-lg" />, label: <Link href="/staff">人员效能中心</Link> },
  ];

  const selectedKey = menuItems.find((item) => pathname === item.key || pathname.startsWith(`${item.key}/`))?.key ?? '/';

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={260} theme="light" className="shadow-sm z-10 border-r border-gray-200" breakpoint="lg">
        <div className="p-5 flex items-center justify-center border-b border-gray-100 mb-2">
          <BankOutlined className="text-3xl text-teal-700 mr-3" />
          {!collapsed && <span className="font-bold text-gray-800 text-xl tracking-wide">银龄增长引擎</span>}
        </div>
        <Menu theme="light" selectedKeys={[selectedKey]} mode="inline" className="border-r-0 text-[15px] p-2 space-y-1" items={menuItems} />
      </Sider>
      <Layout className="bg-transparent">
        <Header className="glass-surface border-b border-teal-100 flex px-4 md:px-8 items-center justify-between shadow-sm z-0 relative gap-3 h-[72px]">
          <Title level={4} className="!mb-0 text-gray-800 !mt-0 font-bold text-base md:text-lg">温江区示范站点：200床位机构增长版</Title>
          <Space wrap>
            <span className="hidden xl:flex bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full border border-emerald-200 items-center text-sm font-medium shadow-inner">
              <CloudServerOutlined className="mr-2 text-lg" /> 数据沙箱运行稳定
            </span>
            <Button icon={<RocketOutlined />} onClick={() => router.push('/commercial')}>查看成交漏斗</Button>
            <Button type="primary" className="!bg-teal-700" onClick={() => router.push('/agetech')}>立即促成下单</Button>
          </Space>
        </Header>
        <Content className="p-6 md:p-8 flex flex-col gap-6 h-[calc(100vh-72px)] overflow-y-auto">
          <div className="max-w-[1600px] w-full mx-auto">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
