# 自定义域名绑定指南

> 本指南用于帮助用户将本项目绑定到自己的独立顶级域名（例如类似 `aihot.news`、`tokenhub.cn` 或 `freetoken.ai` 的网址）。  
> **说明**：此步骤为**可选体验升级**。当前默认分配的 `https://nasated.github.io/cn-free-token-hub/` 已经可以全球免费访问并自动更新。

---

## 一、 为什么可以绑定独立域名？

本项目部署在 **GitHub Pages** 上。GitHub Pages 官方原生支持为仓库免费绑定自定义域名（Custom Domain），并且：
- 自动免费签发 **HTTPS SSL 安全证书**；
- 享受 GitHub 全球 CDN 节点分发加速；
- 每日 06:17 的 Actions 自动化更新不受任何影响。

---

## 二、 绑定操作三步走

### 第一步：购买并准备一个域名
在任意主流域名服务商（如腾讯云、阿里云/万网、Cloudflare、Namecheap 等）注册一个您喜欢的域名，例如 `your-token-domain.com`。

### 第二步：添加 DNS 解析记录（CNAME）
登录您的域名解析控制台，添加解析记录：

| 记录类型 | 主机记录（RR） | 记录值 | 说明 |
|---|---|---|---|
| **CNAME** | `@` 或 `www` | `nasated.github.io` | 将域名指向 GitHub 托管服务器 |

*(注：如果想用 `api.yourdomain.com` 这样的子域名，主机记录填 `api` 即可。)*

### 第三步：在代码仓库中启用域名
有两种便捷方式（二选一）：

#### 方式 A：在 GitHub 网页端设置（最简单）
1. 浏览器打开仓库页面：`https://github.com/nasated/cn-free-token-hub`；
2. 点击 **Settings**（设置） → 侧边栏 **Pages**；
3. 在 **Custom domain** 输入框中填入您的域名（如 `your-token-domain.com`），点击 **Save**；
4. 勾选 **Enforce HTTPS**（强制 HTTPS）。

#### 方式 B：通过代码提交 CNAME 文件
1. 在项目 `public/` 目录下创建一个名为 `CNAME` 的文本文件（无后缀），内容直接写您的域名：
   ```
   your-token-domain.com
   ```
2. 并在 `next.config.mjs` 中将 `basePath` 改为空字符串（因为独立域名下网站就位于根目录了）：
   ```javascript
   basePath: "",
   ```
3. 提交并推送代码到 main 分支，流水线会自动完成切换绑定。
