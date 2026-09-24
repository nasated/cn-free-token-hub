# CN Free Token Hub — 项目交接文档

> 最后更新：2026-09-24 15:35 UTC
> 本文档供下一个 Agent 接手时阅读，包含项目背景、已完成工作、当前卡点和环境信息。

---

## 一、项目背景

用户（GitHub 账号 `nasated`，中文名用户，神经外科医学博士/生物信息学方向）想要一个：

- **国内模型免费 API 额度资讯站**，只收录中国境内 API 可调用的免费额度，不要国外的
- **每日自动更新**（接受 GitHub Actions 定时重建，不需要秒级实时）
- 借鉴 GitHub 上成熟部署方案（仿 aihot.news 形态 + AI-Search 部署架构）
- 不需要 AI 自动点评

**项目位置**：`D:\桌面\01_terminal\cn-free-token-hub\`
**GitHub 仓库**：`nasated/cn-free-token-hub`（已创建，public，Pages 待正确启用）
**预期上线地址**：`https://nasated.github.io/cn-free-token-hub/`

---

## 二、已完成工作（全部完成，无需重复）

### 2.1 项目结构（25 个文件，已推送到 GitHub main 分支）

```
cn-free-token-hub/
├── .github/workflows/deploy.yml   # 部署工作流（crawl + deploy 双任务）
├── .gitignore / .gitattributes / .env.example
├── README.md
├── package.json / next.config.mjs / tailwind.config.ts / postcss.config.mjs / tsconfig.json
├── next-env.d.ts
├── app/
│   ├── layout.tsx     # 根布局，SEO 元数据
│   ├── page.tsx       # 主页（服务端组件，读取 data JSON）
│   ├── globals.css    # 全局样式（暖金配色，支持暗色模式）
│   └── robots.txt
├── components/
│   ├── Header.tsx     # 顶栏 logo + 导航
│   ├── Feed.tsx       # 客户端：分类筛选 + 性价比排序 + 平台卡片网格
│   ├── PlatformCard.tsx # 平台卡片（额度/有效期/实名要求/核验状态）
│   └── Changelog.tsx  # 客户端：变更日志时间线 + 类型筛选
├── data/
│   ├── platforms.json  # 9 个平台额度源数据（5 verified + 4 needs_verification）
│   └── changelog.json  # 变更日志（1 条 init 记录）
├── scripts/
│   ├── crawl.ts        # 核验入口（被 GitHub Actions 调用）
│   └── lib/fetcher.ts  # 抓取/文本提取/关键词统计工具
└── public/
    ├── favicon.svg / logo.svg
```

### 2.2 技术方案

- **前端**：Next.js 15 App Router + Tailwind CSS + TypeScript，静态导出（`output: "export"`）
- **部署**：仿 AI-Search 方案，GitHub Actions crawl 任务抓取核验 + deploy 任务构建发布 Pages
- **核验脚本**：`crawl.ts` 是弱信号核验器，只做可达性检测 + 关键词命中统计，不解析额度数字。**关键设计：爬虫只能升标不能降标**（人工核验过的平台不会因爬虫解析不了 JS 页面被推翻）

### 2.3 本地验证已通过

- `npm run build` ✅ 编译成功
- 本地服务器 HTTP 200 ✅，24/24 关键内容命中
- `npm run crawl` ✅ 抓取脚本工作正常（8/9 平台可达，阶跃星辰 503）

### 2.4 GitHub 仓库状态

- 仓库 `nasated/cn-free-token-hub` ✅ 已创建（public）
- 代码已推送到 `main` 分支 ✅（最新 commit `0aeb55b`）
- Workflow 文件 `.github/workflows/deploy.yml` ✅ 已通过 API 创建在仓库中
- **Pages 未正确启用** ❌（当前状态：source=undefined, status=404）

---

## 三、先前卡点与最终解决（已圆满解决 ✅）

### 3.1 问题原因
1. Pages 最初配置为 `legacy`（branch 构建模式），触发了 GitHub 内置的 `dynamic/pages/pages-build-deployment` Jekyll 工作流。
2. 该内置工作流与自定义的 `Daily Free-Tier Verify & Deploy`（内含 `deploy-pages` 任务）在同一个 Pages 部署队列中争抢锁，导致部署被 cancel。

### 3.2 解决措施（已执行成功）
1. 通过 GitHub REST API 调用 `POST /repos/nasated/cn-free-token-hub/pages`，携带 `{"build_type": "workflow"}` 参数，直接将 Pages 源切换至 **GitHub Actions (workflow)** 模式，彻底绕过并停用了内置 Jekyll 构建。
2. 通过 API 触发 `workflow_dispatch` 启动工作流 `Daily Free-Tier Verify & Deploy`（Run ID: `36022514535`）。
3. 工作流中 `crawl` 抓取核验与 `deploy` 静态发布两个任务均 **100% 成功（success）**。
4. 线上验证：访问 `https://nasated.github.io/cn-free-token-hub/` 返回 **HTTP 200**，页面内容正常展示！

---

## 四、当前状态与后续步骤建议

### 4.1 当前运行状态
- **线上站点**：`https://nasated.github.io/cn-free-token-hub/` 正常运行中（HTTP 200）。
- **自动化工作流**：GitHub Actions 计划任务（每天北京时间 06:17）已启用，每日将自动运行核验并持续更新发布。
- **构建方式**：Next.js 15 静态导出 + Tailwind CSS。

### 4.2 接下来的推荐步骤
1. **数据准确性人工复核**：
   - 目前 9 个平台中有 4 个标记为 `needs_verification`（MiniMax、阶跃星辰、DeepSeek、CodeGeeX）。建议在官方控制台页面确认最新的免费额度数值，并在 `data/platforms.json` 中将 status 改为 `verified`。
2. **爬虫鲁棒性优化**：
   - 阶跃星辰在 Actions 中抓取返回 503（可能是由于防爬/反机器人策略）。可在 `scripts/lib/fetcher.ts` 中优化 User-Agent、添加常用浏览器请求头，或者设置重试机制。
3. **扩充更多国内平台**：
   - 可考虑加入零一万物（01.AI）、百川智能（Baichuan）、腾讯混元（Hunyuan）、科大讯飞星火（Spark）等国内开放 API 的平台。
4. **功能与交互增强**：
   - 支持移动端更便捷的卡片折叠/展开。
   - 增加平台官方 API Key 申请链接的"一键复制/直达"按钮。

---

## 五、数据内容（可直接使用）

### 平台清单（9 个，仅国内 API 可调用）

| ID | 名称 | 免费额度 | 核验状态 |
|---|---|---|---|
| bigmodel | 智谱 BigModel | 2000 万 Tokens | verified |
| dashscope | 阿里百炼 DashScope | 100 万 Token（新人） | verified |
| siliconflow | 硅基流动 SiliconFlow | 16 元代金券（需实名） | verified |
| kimi | Kimi API | 15 元代金券 | verified |
| modelscope | ModelScope 魔搭 | API Inference 免费/每日 2000 次 | verified |
| minimax | MiniMax Studio | 新人免费额度 | needs_verification |
| stepfun | 阶跃星辰 StepFun | 免费试用额度 | needs_verification |
| deepseek | DeepSeek | 免费额度（有限） | needs_verification |
| codegeex | CodeGeeX | 免费额度 | needs_verification |

---

## 六、关键文件路径速查

- 项目根：`D:\桌面\01_terminal\cn-free-token-hub\`
- 部署工作流：`D:\桌面\01_terminal\cn-free-token-hub\.github\workflows\deploy.yml`
- 核验脚本：`D:\桌面\01_terminal\cn-free-token-hub\scripts\crawl.ts`
- 平台数据：`D:\桌面\01_terminal\cn-free-token-hub\data\platforms.json`
- 主页：`D:\桌面\01_terminal\cn-free-token-hub\app\page.tsx`
- Token 存放：环境变量 `GH_TOKEN`（请妥善保管，勿推送到公共仓库）