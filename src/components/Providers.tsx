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
            colorPrimary: '#0f766e',
            colorInfo: '#0891b2',
            colorSuccess: '#15803d',
            colorWarning: '#b45309',
            colorError: '#b91c1c',
            borderRadius: 10,
            colorBgContainer: '#ffffff',
            fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Source Han Sans SC", sans-serif'
          },
          components: {
            Card: {
              borderRadiusLG: 16,
            },
            Button: {
              borderRadius: 10,
              fontWeight: 600,
            },
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
