'use client';
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

  const menuItems = [
    { key: '/', icon: <DashboardOutlined className="text-lg" />, label: <Link href="/">长护险绩效大屏</Link> },
    { key: '/reports', icon: <FileSearchOutlined className="text-lg" />, label: <Link href="/reports">AI 智能报表脱敏</Link> },
    { key: '/agetech', icon: <ThunderboltFilled className="text-lg" />, label: <Link href="/agetech">AgeTech 优选算力</Link> },
    { key: '/staff', icon: <UserOutlined className="text-lg" />, label: <Link href="/staff">机构人员矩阵</Link> },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#F3F4F6' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={260} theme="light" className="shadow-sm z-10 border-r border-gray-200" breakpoint="lg">
        <div className="p-5 flex items-center justify-center border-b border-gray-100 mb-2">
          <BankOutlined className="text-3xl text-indigo-600 mr-3" />
          {!collapsed && <span className="font-bold text-gray-800 text-xl tracking-wide">千岁银龄</span>}
        </div>
        <Menu theme="light" selectedKeys={[pathname]} mode="inline" className="border-r-0 text-[15px] p-2 space-y-1" items={menuItems} />
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
