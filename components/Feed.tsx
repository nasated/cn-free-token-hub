"use client";

import { useState, useMemo } from "react";
import { Platform, ChangelogEntry } from "@/app/page";
import PlatformCard from "./PlatformCard";

const CATEGORIES = [
  { id: "all", label: "全部类别" },
  { id: "llm", label: "大语言模型" },
  { id: "image", label: "图像生成" },
  { id: "speech", label: "语音模型" },
  { id: "embed", label: "向量/嵌入" },
  { id: "code", label: "代码补全" },
];

const SORTS = [
  { id: "value", label: "推荐性价比优先" },
  { id: "newest", label: "最新核验优先" },
  { id: "name", label: "平台名称字母序" },
];

const QUICK_FILTERS = [
  { id: "all", label: "全部" },
  { id: "no_realname", label: "⚡ 仅看免实名" },
  { id: "permanent", label: "🎁 含永久免费" },
  { id: "high_score", label: "⭐ 高分推荐" },
];

interface FeedProps {
  platforms: Platform[];
  changelog: ChangelogEntry[];
}

export default function Feed({ platforms, changelog }: FeedProps) {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("value");
  const [quickFilter, setQuickFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    return platforms
      .filter((p) => {
        // 类别筛选
        if (category !== "all" && p.category !== category) return false;

        // 快捷特性筛选
        if (quickFilter === "no_realname" && p.freeTier.requiresRealName) return false;
        if (quickFilter === "permanent" && !p.freeTier.amount.includes("永久") && !p.tags.some(t => t.includes("永久"))) return false;
        if (quickFilter === "high_score" && p.valueScore < 8) return false;

        // 搜索词过滤（名称、英文名、标签、额度说明）
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchEn = p.nameEn.toLowerCase().includes(q);
          const matchTag = p.tags.some((t) => t.toLowerCase().includes(q));
          const matchDetail = p.freeTier.detail.toLowerCase().includes(q);
          const matchAmount = p.freeTier.amount.toLowerCase().includes(q);
          if (!matchName && !matchEn && !matchTag && !matchDetail && !matchAmount) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sort === "value") return b.valueScore - a.valueScore;
        if (sort === "newest") return b.lastVerified.localeCompare(a.lastVerified);
        return a.name.localeCompare(b.name, "zh-CN");
      });
  }, [platforms, category, quickFilter, searchQuery, sort]);

  return (
    <section id="feed" className="mx-auto max-w-5xl px-4 py-6">
      {/* 搜索与工具栏 */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索平台（如 DeepSeek、通义千问、Qwen、代码）..."
            className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2 pl-9 text-sm text-ink-900 placeholder:text-ink-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100 dark:placeholder:text-ink-500"
          />
          <span className="absolute left-3 top-2.5 text-ink-400 text-sm">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-ink-400 hover:text-ink-600 dark:hover:text-ink-200"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <label className="text-xs text-ink-500 dark:text-ink-400 font-medium">排序方式</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm text-ink-800 focus:border-accent-500 focus:outline-none dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 分类切换 */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
              category === c.id
                ? "bg-accent-600 text-white shadow-sm"
                : "bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-700 dark:text-ink-300"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 快捷特性过滤 */}
      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-ink-400 mr-1">快捷筛选:</span>
        {QUICK_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setQuickFilter(f.id)}
            className={`px-2.5 py-1 rounded-md transition-colors border ${
              quickFilter === f.id
                ? "bg-accent-50 text-accent-700 border-accent-300 dark:bg-accent-950 dark:border-accent-800"
                : "bg-white text-ink-600 border-ink-200 hover:bg-ink-50 dark:bg-ink-800 dark:text-ink-300 dark:border-ink-700"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-ink-400 font-medium">
          显示 {filtered.length} / {platforms.length} 个平台
        </span>
      </div>

      {/* 平台网格 */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-ink-500 dark:text-ink-400">
          <p className="text-lg">没有找到符合条件的平台</p>
          <p className="mt-1 text-xs text-ink-400">尝试清空搜索词或切换筛选分类</p>
          <button
            onClick={() => {
              setCategory("all");
              setQuickFilter("all");
              setSearchQuery("");
            }}
            className="mt-4 px-3 py-1.5 text-xs bg-ink-100 hover:bg-ink-200 text-ink-700 rounded-lg dark:bg-ink-700 dark:text-ink-200"
          >
            重置所有筛选
          </button>
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