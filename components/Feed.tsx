"use client";

import { useState, useMemo, useEffect } from "react";
import { Platform } from "@/app/page";
import PlatformCard from "./PlatformCard";
import FeedItem from "./FeedItem";

const SORTS = [
  { id: "value", label: "🔥 推荐性价比优先" },
  { id: "newest", label: "⏱️ 最新核验优先" },
  { id: "name", label: "🔤 平台名称拼音序" },
];

interface FeedProps {
  platforms: Platform[];
  currentTab: string;
  onTabChange?: (tab: string) => void;
  starredIds: string[];
  onToggleStar: (id: string) => void;
}

export default function Feed({
  platforms,
  currentTab,
  starredIds,
  onToggleStar,
}: FeedProps) {
  // 视图模式：'stream' (条目流，类似 aihot 经典资讯流) 或 'grid' (卡片矩阵)
  const [viewMode, setViewMode] = useState<"stream" | "grid">("stream");
  const [sort, setSort] = useState("value");
  const [searchQuery, setSearchQuery] = useState("");
  const [readIds, setReadIds] = useState<string[]>([]);

  // 读取已读记录
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cn-free-read-items");
      if (saved) {
        setReadIds(JSON.parse(saved));
      }
      const savedView = localStorage.getItem("cn-free-view-mode");
      if (savedView === "grid" || savedView === "stream") {
        setViewMode(savedView);
      }
    } catch {}
  }, []);

  const handleMarkRead = (id: string) => {
    if (!readIds.includes(id)) {
      const next = [...readIds, id];
      setReadIds(next);
      try {
        localStorage.setItem("cn-free-read-items", JSON.stringify(next));
      } catch {}
    }
  };

  const handleViewChange = (mode: "stream" | "grid") => {
    setViewMode(mode);
    try {
      localStorage.setItem("cn-free-view-mode", mode);
    } catch {}
  };

  const filtered = useMemo(() => {
    return platforms
      .filter((p) => {
        // Tab 过滤
        if (currentTab === "no_realname" && p.freeTier.requiresRealName) return false;
        if (currentTab === "permanent" && !p.freeTier.amount.includes("永久") && !p.tags.some(t => t.includes("永久"))) return false;
        if (currentTab === "starred" && !starredIds.includes(p.id)) return false;
        if (currentTab === "cat_llm" && p.category !== "llm") return false;
        if (currentTab === "cat_code" && p.category !== "code") return false;

        // 搜索词过滤
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
  }, [platforms, currentTab, starredIds, searchQuery, sort]);

  const tabTitleMap: Record<string, string> = {
    featured: "精选热门免费额度",
    all: "全部收录平台",
    no_realname: "免实名即可领用平台",
    permanent: "包含永久/长期免费模型平台",
    starred: "我的收藏平台",
    cat_llm: "大语言模型（LLM）开放平台",
    cat_code: "代码大模型平台",
  };

  const title = tabTitleMap[currentTab] || "平台额度列表";

  return (
    <div className="space-y-5">
      {/* 顶部工具栏与统计 */}
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-ink-900">
              {title}
            </h2>
            <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs font-semibold text-ink-600 border border-surface-border">
              {filtered.length} 个
            </span>
          </div>
          <p className="text-xs text-ink-500 mt-1">
            仅收录中国境内 API 可直接调用的额度 · 每日定时核验
          </p>
        </div>

        {/* 视图模式切换与排序 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 视图切换按钮 */}
          <div className="flex items-center rounded-lg bg-surface-hover p-1 border border-surface-border text-xs">
            <button
              type="button"
              onClick={() => handleViewChange("stream")}
              className={`flex items-center gap-1 rounded px-2.5 py-1 transition-all ${
                viewMode === "stream"
                  ? "bg-surface-card text-brand-accent shadow-sm font-semibold"
                  : "text-ink-600 hover:text-ink-900"
              }`}
              title="切换为条目资讯流视图"
            >
              <span>📋</span>
              <span className="hidden sm:inline">条目流</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewChange("grid")}
              className={`flex items-center gap-1 rounded px-2.5 py-1 transition-all ${
                viewMode === "grid"
                  ? "bg-surface-card text-brand-accent shadow-sm font-semibold"
                  : "text-ink-600 hover:text-ink-900"
              }`}
              title="切换为卡片矩阵视图"
            >
              <span>🗂️</span>
              <span className="hidden sm:inline">卡片阵</span>
            </button>
          </div>

          {/* 排序下拉 */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-surface-border bg-surface-card px-2.5 py-1.5 text-xs text-ink-800 focus:border-brand-accent focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索模型或平台（如 DeepSeek、通义千问、Qwen2.5、百炼、免实名）..."
          className="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2.5 pl-9 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all shadow-sm"
        />
        <span className="absolute left-3 top-3 text-ink-400 text-sm">🔍</span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-2.5 rounded px-1 text-xs text-ink-400 hover:text-ink-700"
          >
            ✕ 清空
          </button>
        )}
      </div>

      {/* 渲染列表 */}
      {filtered.length === 0 ? (
        <div className="aihot-card p-12 text-center text-ink-500">
          <p className="text-base font-semibold">没有找到符合条件的平台</p>
          <p className="mt-1 text-xs text-ink-400">
            {currentTab === "starred"
              ? "您还没有收藏任何平台，点击列表右侧的小星星 ⭐ 即可添加收藏"
              : "尝试清空搜索词或切换侧边栏分类"}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 px-3 py-1.5 text-xs bg-surface-hover hover:bg-surface-border text-ink-700 rounded-lg transition-colors font-medium"
            >
              清空搜索词
            </button>
          )}
        </div>
      ) : viewMode === "stream" ? (
        <div className="space-y-3">
          {filtered.map((p, idx) => (
            <FeedItem
              key={p.id}
              platform={p}
              index={idx}
              isStarred={starredIds.includes(p.id)}
              onToggleStar={onToggleStar}
              isRead={readIds.includes(p.id)}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, idx) => (
            <PlatformCard
              key={p.id}
              platform={p}
              index={idx}
              isStarred={starredIds.includes(p.id)}
              onToggleStar={onToggleStar}
              isRead={readIds.includes(p.id)}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}