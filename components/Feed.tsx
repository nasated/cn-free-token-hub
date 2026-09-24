"use client";

import { useState } from "react";
import { Platform, ChangelogEntry } from "@/app/page";
import PlatformCard from "./PlatformCard";

const CATEGORIES = [
  { id: "all", label: "全部" },
  { id: "llm", label: "大模型" },
  { id: "image", label: "图像" },
  { id: "speech", label: "语音" },
  { id: "embed", label: "向量" },
  { id: "code", label: "代码" },
];

const SORTS = [
  { id: "value", label: "性价比优先" },
  { id: "newest", label: "最新核验" },
  { id: "name", label: "按名称" },
];

interface FeedProps {
  platforms: Platform[];
  changelog: ChangelogEntry[];
}

export default function Feed({ platforms, changelog }: FeedProps) {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("value");

  const filtered = platforms
    .filter((p) => category === "all" || p.category === category)
    .sort((a, b) => {
      if (sort === "value") return b.valueScore - a.valueScore;
      if (sort === "newest") return b.lastVerified.localeCompare(a.lastVerified);
      return a.name.localeCompare(b.name);
    });

  return (
    <section id="feed" className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-50">
            当前可用免费额度
          </h2>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            共收录 {platforms.length} 个平台 · 仅 API 可调用 · 每日自动核验
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-ink-500 dark:text-ink-400">排序</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-ink-200 bg-white px-2 py-1.5 text-sm text-ink-800 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              category === c.id
                ? "bg-accent-600 text-white"
                : "bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-700 dark:text-ink-300"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center text-ink-500 dark:text-ink-400">
          该分类下暂无平台。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PlatformCard key={p.id} platform={p} />
          ))}
        </div>
      )}
    </section>
  );
}