"use client";

interface MobileTabBarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export default function MobileTabBar({ currentTab, onSelectTab }: MobileTabBarProps) {
  const tabs = [
    { id: "featured", label: "精选", icon: "⚡" },
    { id: "no_realname", label: "免实名", icon: "🎁" },
    { id: "permanent", label: "永久免费", icon: "♾️" },
    { id: "changelog", label: "日报", icon: "📰" },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-surface-border bg-surface-base/95 backdrop-blur-md px-2 py-1.5 pb-safe shadow-lg"
      aria-label="移动端快捷导航"
    >
      {tabs.map((t) => {
        const isActive = currentTab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelectTab(t.id)}
            className={`flex flex-col items-center gap-0.5 rounded-lg py-1 px-3 text-xs transition-colors ${
              isActive
                ? "text-brand-accent font-semibold"
                : "text-ink-500 hover:text-ink-800"
            }`}
          >
            <span className="text-lg leading-none">{t.icon}</span>
            <span className="text-[11px]">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
