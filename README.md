# CN Free Token Hub

> Token 赠送、限时免费、折扣与低价调用雷达 · 同时展示 API 和产品内专用额度

[![GitHub](https://img.shields.io/badge/GitHub-nasated/cn--free--token--hub-blue)](https://github.com/nasated/cn-free-token-hub)
[![Deploy](https://github.com/nasated/cn-free-token-hub/actions/workflows/deploy.yml/badge.svg)](https://github.com/nasated/cn-free-token-hub/actions)

## 这是什么

首页展示公开新闻和社区中发现的 Token 活动线索，以及人工核对报道或官方规则的活动。旧版固定平台额度保留在“全部额度”。

**收录范围**：国内和海外、主流与新产品的 Token 赠送、限时免费、价格折扣和低价调用。API 可调用、产品内专用、使用场景未明会分别标注。

**当前收录（13 家）**：智谱 BigModel、阿里百炼 DashScope、硅基流动 SiliconFlow、DeepSeek、Kimi API、讯飞星火 Spark、ModelScope 魔搭、零一万物 01.AI、腾讯混元 Hunyuan、百川智能 Baichuan、MiniMax、阶跃星辰 StepFun、CodeGeeX。

## 项目文档速查

- 🕒 **[活动雷达设计与核验规则](docs/ACTIVITY_RADAR.md)**：来源、时间字段、人工核验与覆盖边界。
- 🔎 **[活动内容缺失的根因分析](docs/ROOT_CAUSE_ANALYSIS.md)**：旧版为何漏掉限时活动，以及本次修复的验证边界。
- 📖 **[原项目背景与架构设计文档](docs/PROJECT_OVERVIEW.md)**：记录初版 API 额度站的历史设计；其旧收录边界已由活动雷达方案取代。
- 📈 **[项目进度与演进里程碑记录](docs/PROGRESS.md)**：记录立项、13 家平台扩充、UI 重构及后续活动雷达改造。
- 🌐 **[自定义域名绑定指南](docs/CUSTOM_DOMAIN_GUIDE.md)**：介绍如何零成本为本项目绑定专属独立顶级域名的操作步骤。

## 部署与自动化更新

本项目采用 GitHub Actions 与 GitHub Pages：
1. **公开线索**：计划每 30 分钟搜索 Google News RSS、V2EX Atom 和 Bluesky 公共帖；新增线索先标为“待核实”，有数据变化时重建静态站。
2. **固定平台额度**：每日检查旧版平台页面的可达性和关键词，仅作为弱信号，不自动证明额度有效。
3. **人工整理活动**：只核对到媒体报道的标为“报道待官方核实”；直接核对官方规则的标为“规则已核验”。领取和使用窗口分开记录，来源仅给日期时不补造具体时刻。

定时任务和搜索引擎索引都有延迟，不能保证全网帖子在 30–60 分钟内出现；登录墙、图片内活动和未接入的来源需要通过[活动线索模板](https://github.com/nasated/cn-free-token-hub/issues/new/choose)补充。

详见 [`.github/workflows/discover.yml`](.github/workflows/discover.yml) 与 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)。

## 本地开发

```bash
npm install
npm run dev        # 本地预览
npm run crawl      # 手动跑一次核验
npm run discover   # 搜索公开新闻和社区线索
npm run validate:activities
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
- `data/leads.json` — 自动发现、尚未核实的公开线索
- `data/campaigns.json` — 人工核对报道或官方规则的活动与时间范围

## 数据贡献

如果你发现新产品、限时 Token 赠送或价格折扣，欢迎用活动线索模板提供：

- 原始活动链接和平台名称
- 赠送额度或折扣前后价格、计费单位
- API 可调用还是产品内专用
- 领取开始与截止、使用开始与截止、时区
- 会员、实名、地区等条件；未知项请写“未公布”

## License

MIT

## 部署状态

网站地址：https://nasated.github.io/cn-free-token-hub/ 。活动雷达的定时发现与发布结果可在 [GitHub Actions](https://github.com/nasated/cn-free-token-hub/actions) 查看；首次部署后仍需核对线上页面和定时任务。
