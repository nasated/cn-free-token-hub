import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CN Free Token Hub · 国内模型免费额度资讯站",
  description:
    "每日自动核验中国境内 API 平台的免费额度：智谱、阿里百炼、硅基流动、Kimi、ModelScope 等。只收录 API 可直接调用的免费额度，持续更新。",
  keywords: [
    "免费额度",
    "免费 Token",
    "API 免费",
    "智谱",
    "百炼",
    "硅基流动",
    "Kimi",
    "ModelScope",
    "国内模型",
  ],
  authors: [{ name: "nasated" }],
  openGraph: {
    title: "CN Free Token Hub",
    description: "国内模型免费 API 额度资讯站 · 每日自动核验",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}