"use client";

import { useState } from "react";
import { Platform } from "@/app/page";

interface PlatformCardProps {
  platform: Platform;
  index: number;
  isStarred: boolean;
  onToggleStar: (id: string) => void;
  isRead: boolean;
  onMarkRead: (id: string) => void;
}

export default function PlatformCard({
  platform,
  index,
  isStarred,
  onToggleStar,
  isRead,
  onMarkRead,
}: PlatformCardProps) {
  const [copied, setCopied] = useState(false);
  const ft = platform.freeTier;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(platform.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = platform.url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClick = () => {
    onMarkRead(platform.id);
  };

  const rankStr = String(index + 1).padStart(2, "0");

  return (
    <article
      onClick={handleClick}
      className={`aihot-card p-5 cursor-pointer flex flex-col justify-between group relative ${
        isRead ? "fc-read" : ""
      }`}
    >
      <div>
        {/* 卡片顶栏：序号徽章、平台名称、收藏 */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold font-mono ${
                index === 0
                  ? "bg-amber-500 text-white shadow-sm"
                  : index === 1
                  ? "bg-amber-400 text-amber-950 font-bold"
                  : index === 2
                  ? "bg-amber-200 text-amber-900"
                  : "bg-surface-hover text-ink-500"
              }`}
            >
              {rankStr}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-ink-900 group-hover:text-brand-accent transition-colors">
                {platform.name}
              </h3>
              <p className="truncate text-xs text-ink-400 font-mono">
                {platform.nameEn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800">
              <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
              已核验
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(platform.id);
              }}
              className={`p-1 rounded-lg text-sm transition-colors ${
                isStarred
                  ? "text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950"
                  : "text-ink-400 hover:text-ink-700 hover:bg-surface-hover"
              }`}
              title={isStarred ? "取消收藏" : "收藏该平台"}
            >
              {isStarred ? "★" : "☆"}
            </button>
          </div>
        </div>

        {/* 额度亮点 */}
        <div className="mt-3.5">
          <div className="text-lg font-bold text-brand-accent leading-snug">
            {ft.amount}
          </div>
          <p className="mt-1.5 text-xs text-ink-600 leading-relaxed line-clamp-3">
            {ft.detail}
          </p>
        </div>

        {/* 属性标签 */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-[11px]">
          {platform.tags.map((t) => (
            <span
              key={t}
              className="rounded-md bg-surface-hover px-2 py-0.5 text-ink-600 border border-surface-border font-medium"
            >
              {t}
            </span>
          ))}
          {!ft.requiresRealName ? (
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700 font-semibold border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800">
              免实名
            </span>
          ) : (
            <span className="rounded-md bg-surface-hover px-2 py-0.5 text-ink-500 border border-surface-border">
              需实名
            </span>
          )}
        </div>
      </div>

      {/* 卡片底栏 */}
      <div className="mt-4 pt-3 border-t border-surface-border">
        <div className="text-[11px] text-ink-400 mb-2.5 flex items-center justify-between">
          <span className="truncate">有效期：{ft.expiry}</span>
          <span className="shrink-0">{platform.lastVerified}</span>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-ink-600 hover:text-ink-900 rounded-lg px-2 py-1 bg-surface-hover border border-surface-border hover:bg-surface-border transition-colors"
            title="复制官网地址"
          >
            {copied ? (
              <span className="text-emerald-600 font-medium">✓ 已复制</span>
            ) : (
              <span>📋 复制链接</span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <a
              href={platform.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-ink-500 hover:text-ink-700 hover:underline"
            >
              核验 ↗
            </a>
            <a
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 rounded-lg bg-brand-accent px-2.5 py-1 font-medium text-white hover:bg-brand-hover shadow-sm transition-colors"
            >
              直达 🚀
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}