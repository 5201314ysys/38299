import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import DashboardLayout from "@/components/DashboardLayout";

export const metadata: Metadata = {
  title: "银龄增长引擎 | 长护险合规与经营平台",
  description: "覆盖合规稽核、AgeTech成交、机构运营与增长转化的一体化平台",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen m-0 app-shell">
        <Providers>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </Providers>
      </body>
    </html>
  );
}
