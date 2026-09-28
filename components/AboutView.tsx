"use client";

export default function AboutView() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="pb-3 border-b border-surface-border">
        <h2 className="text-xl font-bold text-ink-900">
          关于 CN Free Token Hub
        </h2>
        <p className="text-xs text-ink-500 mt-1">
          追踪 Token 赠送、限时免费和价格折扣；标明来源与有效时间
        </p>
      </div>

      <div className="aihot-card p-6 space-y-4">
        <h3 className="text-base font-bold text-brand-accent flex items-center gap-2">
          <span>🎯</span> 本站初衷与原则
        </h3>
        <p className="text-sm text-ink-700 leading-relaxed">
          活动可能来自国内或海外的新产品，额度可能适用于 API，也可能只能在某个产品内使用。本站将这些场景明确分开。
        </p>
        <p className="text-sm text-ink-700 leading-relaxed">
          <strong>活动信息按以下规则展示：</strong>
        </p>
        <ul className="space-y-2 text-xs sm:text-sm text-ink-600 list-disc list-inside">
          <li><strong>区分使用场景</strong>：API 可调用、产品内专用、暂不确定分别标注。</li>
          <li><strong>区分线索和已核验活动</strong>：聚合新闻标题只能作为线索；须核对原始规则后才能确认额度、价格和条件。</li>
          <li><strong>分开标注时间</strong>：发布时间、领取窗口、使用窗口与时区分别记录，未知信息不推算。</li>
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
            <strong>活动线索计划每半小时检索</strong>：GitHub Actions 从公开新闻 RSS 搜索候选消息。搜索引擎的收录延迟和定时任务延迟可能使发现时间晚于发帖时间。
          </li>
          <li>
            <strong>固定额度每天检查</strong>：原有平台页面仍在北京时间 06:17 做可达性与关键词弱信号检查，不能据此宣称优惠仍有效。
          </li>
          <li>
            <strong>新增线索时重建</strong>：新消息写入数据文件后，Next.js 构建并发布至 GitHub Pages。
          </li>
        </ol>
      </div>

      <div className="aihot-card p-6 space-y-3">
        <h3 className="text-base font-bold text-brand-accent flex items-center gap-2">
          <span>🤝</span> 参与贡献与交流
        </h3>
        <p className="text-sm text-ink-700 leading-relaxed">
          如果公开新闻搜索漏掉了产品内活动、社交平台帖子或新产品，请提交活动原始链接，并尽量附上领取和使用期限。
        </p>
        <div className="pt-2">
          <a
            href="https://github.com/nasated/cn-free-token-hub/issues/new/choose"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-surface-hover px-3.5 py-2 text-xs font-semibold text-ink-800 border border-surface-border hover:bg-surface-border transition-colors"
          >
            <span>提交活动线索</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
