"use client";

import { ChangelogEntry } from "@/app/page";

interface ChangelogViewProps {
  entries: ChangelogEntry[];
}

const typeConfig: Record<string, { label: string; className: string }> = {
  init: { label: "初始收录", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  added: { label: "平台扩充", className: "bg-amber-50 text-amber-700 border-amber-200" },
  changed: { label: "动态变更", className: "bg-blue-50 text-blue-700 border-blue-200" },
  expired: { label: "额度调整", className: "bg-warn-50 text-warn-600 border-warn-200" },
  unreachable: { label: "可达性", className: "bg-ink-100 text-ink-600 border-ink-200" },
};

export default function ChangelogView({ entries }: ChangelogViewProps) {
  // 按日期归类
  const groupedByDate: Record<string, ChangelogEntry[]> = {};
  for (const entry of entries) {
    if (!groupedByDate[entry.date]) {
      groupedByDate[entry.date] = [];
    }
    groupedByDate[entry.date].push(entry);
  }

  const sortedDates = Object.keys(groupedByDate).sort().reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-surface-border">
        <div>
          <h2 className="text-lg font-bold text-ink-900">
            国内模型免费额度 · 变更日报
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            GitHub Actions 每日自动核验爬取 · 监测各平台最新政策与页面变动
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 font-medium">
          <span className="live-pulse"></span>
          持续监控中
        </div>
      </div>

      <div className="space-y-8">
        {sortedDates.map((date) => (
          <div key={date} className="relative">
            <div className="sticky top-14 z-10 py-1 bg-surface-base/90 backdrop-blur-sm">
              <span className="inline-block rounded-md bg-surface-hover px-2.5 py-1 text-xs font-bold font-mono text-ink-700 border border-surface-border">
                📅 {date}
              </span>
            </div>

            <div className="mt-3 space-y-3 pl-2 border-l-2 border-surface-border ml-3">
              {groupedByDate[date].map((item, idx) => {
                const conf = typeConfig[item.type] ?? typeConfig.changed;
                return (
                  <div
                    key={idx}
                    className="aihot-card p-4 relative -ml-[17px] ml-1 transition-all"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${conf.className}`}
                      >
                        {conf.label}
                      </span>
                      <span className="text-xs font-bold text-ink-900">
                        {item.platform}
                      </span>
                      {item.verified && (
                        <span className="text-[10px] text-emerald-600 font-medium">
                          ✓ 人工复核确认
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-ink-900 leading-snug">
                      {item.title}
                    </h4>

                    <p className="mt-1 text-xs text-ink-600 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
