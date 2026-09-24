"use client";

import { useState } from "react";
import { ChangelogEntry } from "@/app/page";

const TYPE_CONFIG: Record<
  ChangelogEntry["type"],
  { label: string; dot: string; className: string }
> = {
  init: { label: "上线", dot: "●", className: "text-ink-500" },
  added: { label: "新增", dot: "●", className: "text-free-600" },
  changed: { label: "变化", dot: "●", className: "text-accent-600" },
  expired: { label: "失效", dot: "●", className: "text-warn-600" },
  unreachable: { label: "核验失败", dot: "●", className: "text-warn-600" },
};

interface ChangelogProps {
  entries: ChangelogEntry[];
}

export default function Changelog({ entries }: ChangelogProps) {
  const [filter, setFilter] = useState<string>("all");

  const types = ["all", "added", "changed", "expired", "unreachable"];
  const typeLabels: Record<string, string> = {
    all: "全部",
    added: "新增",
    changed: "变化",
    expired: "失效",
    unreachable: "核验失败",
  };

  const filtered =
    filter === "all" ? entries : entries.filter((e) => e.type === filter);

  return (
    <section id="changelog" className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-50">
          变更日志
        </h2>
        <p className="text-sm text-ink-500 dark:text-ink-400">
          每次核验发现的额度变化。自动检测条目需人工复查确认。
        </p>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === t
                ? "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900"
                : "bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-700 dark:text-ink-300"
            }`}
          >
            {typeLabels[t]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center text-ink-500 dark:text-ink-400">
          暂无该类型变更记录。
        </div>
      ) : (
        <ol className="relative space-y-4">
          {filtered.map((e, i) => {
            const cfg = TYPE_CONFIG[e.type] ?? TYPE_CONFIG.init;
            return (
              <li key={`${e.date}-${e.platform}-${i}`} className="card flex gap-3 p-4">
                <div className="flex flex-col items-center pt-0.5">
                  <span className={`text-sm ${cfg.className}`}>{cfg.dot}</span>
                  {i < filtered.length - 1 && (
                    <span className="my-1 h-6 w-px bg-ink-200 dark:bg-ink-700" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${cfg.className} border-current bg-opacity-10`}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-sm font-medium text-ink-900 dark:text-ink-50">
                      {e.platform}
                    </span>
                    <span className="text-xs text-ink-400">{e.date}</span>
                    {!e.verified && (
                      <span className="text-[11px] text-warn-600">待复查</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-700 dark:text-ink-300">
                    {e.title}
                  </p>
                  <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                    {e.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}