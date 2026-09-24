/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出：发布到 GitHub Pages，零服务器
  output: "export",
  // 国内平台页面多为移动端适配，允许图片不优化以避免构建依赖
  images: {
    unoptimized: true,
  },
  // 便于 GitHub Pages 子路径部署；仓库名为根时为空即可
  basePath: "",
  assetPrefix: "",
};

export default nextConfig;