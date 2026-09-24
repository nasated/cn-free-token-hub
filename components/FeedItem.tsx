"use client";

import { useState } from "react";
import { Platform } from "@/app/page";

interface FeedItemProps {
  platform: Platform;
  index: number;
  isStarred: boolean;
  onToggleStar: (id: string) => void;
  isRead: boolean;
  onMarkRead: (id: string) => void;
}

export default function FeedItem({
  platform,
  index,
  isStarred,
  onToggleStar,
  isRead,
  onMarkRead,
}: FeedItemProps) {
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
    <div
      onClick={handleClick}
      className={`aihot-card group relative p-4 sm:p-5 cursor-pointer transition-all ${
        isRead ? "fc-read" : ""
      }`}
    >
      <div className="flex items-start gap-3.5 sm:gap-4">
        {/* 排行序号徽标 */}
        <div
          className={`shrink-0 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-xs sm:text-sm font-bold font-mono ${
            index === 0
              ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30"
              : index === 1
              ? "bg-amber-400 text-amber-950 font-bold"
              : index === 2
              ? "bg-amber-200 text-amber-900"
              : "bg-surface-hover text-ink-500"
          }`}
        >
          {rankStr}
        </div>

        {/* 内容主体 */}
        <div className="min-w-0 flex-1">
          {/* 第一行：平台名称、英文名、状态、操作 */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-ink-900 group-hover:text-brand-accent transition-colors">
                {platform.name}
              </h3>
              <span className="text-xs text-ink-400 font-mono">
                {platform.nameEn}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800">
                <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                已核验
              </span>
            </div>

            {/* 右侧收藏按钮 */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(platform.id);
              }}
              className={`p-1.5 rounded-lg text-sm transition-colors ${
                isStarred
                  ? "text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950"
                  : "text-ink-400 hover:text-ink-700 hover:bg-surface-hover"
              }`}
              title={isStarred ? "取消收藏" : "收藏该平台"}
            >
              {isStarred ? "★" : "☆"}
            </button>
          </div>

          {/* 第二行：额度大字高亮 */}
          <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-brand-accent tracking-tight">
              {ft.amount}
            </span>
          </div>

          {/* 第三行：详细描述 */}
          <p className="mt-1.5 text-xs sm:text-sm text-ink-600 leading-relaxed">
            {ft.detail}
          </p>

          {/* 第四行：标签与属性 */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
            {platform.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-surface-hover px-2 py-0.5 text-ink-600 border border-surface-border font-medium"
              >
                {tag}
              </span>
            ))}
            {!ft.requiresRealName ? (
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700 font-semibold border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800">
                免实名认证
              </span>
            ) : (
              <span className="rounded-md bg-surface-hover px-2 py-0.5 text-ink-500 border border-surface-border">
                需实名
              </span>
            )}
            <span className="rounded-md bg-surface-hover px-2 py-0.5 text-ink-500 border border-surface-border">
              有效期：{ft.expiry}
            </span>
          </div>

          {/* 第五行：底栏操作与直达 */}
          <div className="mt-3.5 pt-2.5 border-t border-surface-border flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-ink-400">
              最后自动核验：{platform.lastVerified}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-lg px-2.5 py-1 text-ink-600 hover:text-ink-900 hover:bg-surface-hover border border-surface-border transition-colors flex items-center gap-1"
                title="复制官网地址"
              >
                {copied ? (
                  <span className="text-emerald-600 font-medium">✓ 已复制</span>
                ) : (
                  <span>📋 复制链接</span>
                )}
              </button>
              <a
                href={platform.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded-lg px-2 py-1 text-ink-500 hover:text-ink-700 hover:underline"
              >
                官方依据 ↗
              </a>
              <a
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded-lg bg-brand-accent px-3 py-1 font-medium text-white hover:bg-brand-hover shadow-sm transition-colors flex items-center gap-1"
              >
                直达平台 🚀
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
