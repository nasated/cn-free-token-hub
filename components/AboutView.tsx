"use client";

export default function AboutView() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="pb-3 border-b border-surface-border">
        <h2 className="text-xl font-bold text-ink-900">
          关于 CN Free Token Hub
        </h2>
        <p className="text-xs text-ink-500 mt-1">
          专为中国开发者打造的国内大模型免费 API 额度雷达
        </p>
      </div>

      <div className="aihot-card p-6 space-y-4">
        <h3 className="text-base font-bold text-brand-accent flex items-center gap-2">
          <span>🎯</span> 本站初衷与原则
        </h3>
        <p className="text-sm text-ink-700 leading-relaxed">
          市面上的模型导航站往往混杂了大量需外币信用卡、需国外网络环境的海外模型，或者夹带大量不可通过 API 调用的 App 个人积分。
        </p>
        <p className="text-sm text-ink-700 leading-relaxed">
          <strong>CN Free Token Hub 坚守三大原则：</strong>
        </p>
        <ul className="space-y-2 text-xs sm:text-sm text-ink-600 list-disc list-inside">
          <li><strong>只收录中国境内平台</strong>：无需特殊网络，直连流畅。</li>
          <li><strong>100% 必须 API 可直接编程调用</strong>：纯前端或仅 App 积分者一律不收录。</li>
          <li><strong>真实额度核验</strong>：区分免实名与需实名，标注官方申请渠道。</li>
        </ul>
      </div>

      <div className="aihot-card p-6 space-y-4">
        <h3 className="text-base font-bold text-brand-accent flex items-center gap-2">
          <span>🔄</span> 自动化更新机制（仿 AI-Search 零成本架构）
        </h3>
        <p className="text-sm text-ink-700 leading-relaxed">
          本项目不需要昂贵服务器，不需要持久化数据库，完全借助 <strong>GitHub Actions</strong> 与 <strong>GitHub Pages</strong> 实现永续自动化运行：
        </p>
        <ol className="space-y-2.5 text-xs sm:text-sm text-ink-600 list-decimal list-inside">
          <li>
            <strong>每日自动抓取（北京时间 06:17）</strong>：GitHub Actions 定时启动爬虫任务，核验各平台官方页面的可达性与关键词命中。
          </li>
          <li>
            <strong>快照提交</strong>：抓取产生的数据差异自动提交回 GitHub 仓库，生成透明可溯源的变更日志。
          </li>
          <li>
            <strong>静态站重建</strong>：Next.js 15 静态编译为纯 HTML/JS 产物，发布至 GitHub Pages 全球 CDN，秒级打开。
          </li>
        </ol>
      </div>

      <div className="aihot-card p-6 space-y-3">
        <h3 className="text-base font-bold text-brand-accent flex items-center gap-2">
          <span>🤝</span> 参与贡献与交流
        </h3>
        <p className="text-sm text-ink-700 leading-relaxed">
          如果您发现有新的国内模型提供了免费 API 额度，或者某平台的额度政策发生变动，欢迎在 GitHub 开 Issue 或提交 PR。
        </p>
        <div className="pt-2">
          <a
            href="https://github.com/nasated/cn-free-token-hub"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-surface-hover px-3.5 py-2 text-xs font-semibold text-ink-800 border border-surface-border hover:bg-surface-border transition-colors"
          >
            <span>⭐ 在 GitHub 上 Star 支持</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
