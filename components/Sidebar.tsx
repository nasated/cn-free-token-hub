"use client";

import ThemeToggle from "./ThemeToggle";

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  platformCount: number;
  noRealNameCount: number;
  starredCount: number;
  lastUpdated: string;
}

export default function Sidebar({
  currentTab,
  onSelectTab,
  platformCount,
  noRealNameCount,
  starredCount,
  lastUpdated,
}: SidebarProps) {
  const navItems = [
    { id: "featured", label: "精选热门", icon: "⚡", badge: null },
    { id: "all", label: "全部额度", icon: "📋", badge: platformCount },
    { id: "no_realname", label: "免实名专区", icon: "🎁", badge: noRealNameCount },
    { id: "permanent", label: "永久免费", icon: "♾️", badge: "长期" },
    { id: "changelog", label: "额度日报", icon: "📰", badge: "NEW" },
    { id: "starred", label: "我的收藏", icon: "⭐", badge: starredCount > 0 ? starredCount : null },
  ];

  const categoryItems = [
    { id: "cat_llm", label: "大语言模型", icon: "💬" },
    { id: "cat_code", label: "代码大模型", icon: "💻" },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col justify-between border-r border-surface-border bg-surface-base p-4 shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="mb-6 px-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white font-bold text-lg shadow-sm shadow-amber-500/20">
              🪙
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-ink-900">
                  CN FREE
                </span>
                <span className="rounded bg-brand-light px-1.5 py-0.5 text-[10px] font-bold text-brand-dark">
                  API
                </span>
              </div>
              <p className="text-[11px] text-ink-500 font-medium">
                国内模型免费额度雷达
              </p>
            </div>
          </div>

          {/* 自动更新状态微标 */}
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-surface-card px-2.5 py-1.5 border border-surface-border text-[11px] text-ink-600">
            <span className="live-pulse"></span>
            <span className="truncate">每日 06:17 自动核验更新</span>
          </div>
        </div>

        {/* 主导航区 */}
        <nav className="space-y-1">
          <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
            内容导航
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-accent text-white shadow-sm shadow-brand-accent/20 font-semibold"
                    : "text-ink-700 hover:bg-surface-hover hover:text-ink-950"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-surface-hover text-ink-500 group-hover:bg-surface-border group-hover:text-ink-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 类别索引 */}
        <div className="mt-6 space-y-1">
          <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
            模型类别
          </div>
          {categoryItems.map((cat) => {
            const isActive = currentTab === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectTab(cat.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-accent text-white font-semibold"
                    : "text-ink-700 hover:bg-surface-hover hover:text-ink-950"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 资源与开源 */}
        <div className="mt-6 space-y-1">
          <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
            项目与开源
          </div>
          <a
            href="https://github.com/nasated/cn-free-token-hub"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-700 hover:bg-surface-hover hover:text-ink-950 transition-colors"
          >
            <span className="text-base">🐙</span>
            <span>GitHub 仓库</span>
            <span className="ml-auto text-xs text-ink-400">↗</span>
          </a>
          <button
            type="button"
            onClick={() => onSelectTab("about")}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              currentTab === "about"
                ? "bg-brand-accent text-white font-semibold"
                : "text-ink-700 hover:bg-surface-hover hover:text-ink-950"
            }`}
          >
            <span className="text-base">ℹ️</span>
            <span>自动化架构与原则</span>
          </button>
        </div>
      </div>

      {/* 侧边栏底部 */}
      <div className="pt-4 border-t border-surface-border space-y-3">
        <ThemeToggle />
        <div className="text-[11px] text-ink-400 px-1 leading-relaxed">
          <div>核验基准：{lastUpdated}</div>
          <div className="mt-0.5 text-[10px]">纯静态托管 · GitHub Actions 驱动</div>
        </div>
      </div>
    </aside>
  );
}
