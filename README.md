# CN Free Token Hub

> 国内模型免费 API 额度资讯站 · 每日自动核验 · 只收录 API 可调用的免费额度

[![GitHub](https://img.shields.io/badge/GitHub-nasated/cn--free--token--hub-blue)](https://github.com/nasated/cn-free-token-hub)
[![Deploy](https://github.com/nasated/cn-free-token-hub/actions/workflows/deploy.yml/badge.svg)](https://github.com/nasated/cn-free-token-hub/actions)

## 这是什么

不用挨个平台翻活动页——这个站每日自动核验国内主流模型平台的免费 API 额度，
把当前可用的额度整理在一个页面里，支持分类筛选和性价比排序。

**收录范围**：仅中国境内模型平台、且 API 可直接调用的免费额度（不含 App 内专用积分）。

**当前收录（13 家）**：智谱 BigModel、阿里百炼 DashScope、硅基流动 SiliconFlow、DeepSeek、Kimi API、讯飞星火 Spark、ModelScope 魔搭、零一万物 01.AI、腾讯混元 Hunyuan、百川智能 Baichuan、MiniMax、阶跃星辰 StepFun、CodeGeeX。

## 项目文档速查

- 📖 **[项目背景与架构设计文档](docs/PROJECT_OVERVIEW.md)**：深入介绍项目初衷、核心痛点、三大收录原则、仿 aihot 视觉设计哲学与系统架构。
- 📈 **[项目进度与演进里程碑记录](docs/PROGRESS.md)**：详细记录立项、卡点攻克、13 家平台扩充、UI 全面重构、故障排查至完美上线的全过程与路线图。
- 🌐 **[自定义域名绑定指南](docs/CUSTOM_DOMAIN_GUIDE.md)**：介绍如何零成本为本项目绑定专属独立顶级域名的操作步骤。

## 部署与自动化更新

本项目采用 GitHub 零成本自动化方案：
1. **定时抓取核验**：GitHub Actions 每日（北京时间 06:17）自动抓取各平台页面，检测免费额度变动，提交快照到仓库；
2. **静态站自动重建**：Next.js 15 静态站自动构建并部署到 GitHub Pages 全球 CDN，零服务器、免运维、永久自更新。

详见 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)。

## 本地开发

```bash
npm install
npm run dev        # 本地预览
npm run crawl      # 手动跑一次核验
npm run build      # 构建静态站
```

## 核验脚本的设计取舍

`scripts/crawl.ts` 的核验是**弱信号**，不是额度解析器：

- ✅ 能做：检测页面可达性、检测免费额度关键词是否消失、发现明显变化
- ❌ 不做：解析具体额度数字、判断额度是否"仍然有效"
- ⚠️ 抓取失败**不会**把平台标成"已失效"，只会标 `needs_verification` 人工复查

免费额度政策变化很快，自动核验只是辅助，最终以各平台官方页面为准。

## 数据格式

- `data/platforms.json` — 平台额度源数据
- `data/changelog.json` — 额度变更日志（站点"最新动态"栏目的数据来源）

## 数据贡献

如果你发现某个平台的免费额度信息有误或过期，欢迎开 Issue，按以下格式提供：

- 平台名称
- 当前活动链接
- 免费额度形式（金额 / 代金券 / 积分）
- 是否 API 可用
- 是否需要实名 / 信用卡
- 截至日期

## License

MIT

## 部署状态

✅ 已上线：https://nasated.github.io/cn-free-token-hub/ （2026-09-24）
