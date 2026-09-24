/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const repoName = "cn-free-token-hub";

const nextConfig = {
  // 静态导出：发布到 GitHub Pages，零服务器
  output: "export",
  // 国内平台页面多为移动端适配，允许图片不优化以避免构建依赖
  images: {
    unoptimized: true,
  },
  // GitHub Pages 子路径部署：必须匹配仓库路径，避免 CSS/JS 丢失
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}` : undefined,
};

export default nextConfig;