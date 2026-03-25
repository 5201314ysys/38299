'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';

export default function Providers({ children }: { children: React.ReactNode }) {
  // 单例模式，防止 SSR 和客户端水合时 QueryClient 多次被实例化
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // 聚焦时不自动刷新，以免图表抖动
        retry: 1, // 失败最多重试 1 次
      }
    }
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider 
        locale={zhCN} 
        theme={{ 
          token: { 
            colorPrimary: '#4F46E5', // 严谨且高级的紫色基调
            borderRadius: 6,
            colorBgContainer: '#ffffff',
            fontFamily: 'Inter, system-ui, sans-serif'
          },
          components: {
            Layout: {
              headerBg: '#ffffff',
              siderBg: '#ffffff',
            }
          }
        }}
      >
        <App>
          {children}
        </App>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
