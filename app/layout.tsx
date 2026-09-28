import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CN Free Token Hub · Token 活动与优惠雷达",
  description:
    "发现大模型 Token 赠送、限时免费与折扣线索；区分 API 可调用和产品内专用额度，明确来源与领取、使用期限。",
  keywords: [
    "免费额度",
    "Token 活动",
    "Token 折扣",
    "限时免费",
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
    description: "大模型 Token 赠送、限时免费与折扣活动雷达",
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
