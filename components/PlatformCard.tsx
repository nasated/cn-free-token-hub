"use client";

import { useState } from "react";
import { Platform } from "@/app/page";

interface PlatformCardProps {
  platform: Platform;
}

const categoryLabels: Record<string, string> = {
  llm: "大模型",
  image: "图像",
  speech: "语音",
  embed: "向量",
  code: "代码",
};

const statusConfig: Record<string, { label: string; className: string }> = {
  verified: { label: "已核验", className: "bg-free-50 text-free-600 border-free-200" },
  needs_verification: { label: "待复查", className: "bg-accent-50 text-accent-700 border-accent-200" },
  unknown: { label: "未知", className: "bg-ink-100 text-ink-600 border-ink-200" },
};

export default function PlatformCard({ platform }: PlatformCardProps) {
  const [copied, setCopied] = useState(false);
  const ft = platform.freeTier;
  const status = statusConfig[platform.verifyStatus] ?? statusConfig.unknown;
  const category = categoryLabels[platform.category] ?? platform.category;

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(platform.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 降级兜底
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

  return (
    <article className="card p-4 transition-all duration-200 hover:shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-ink-900 dark:text-ink-50">
              {platform.name}
            </h3>
            <p className="truncate text-xs text-ink-500 dark:text-ink-400">
              {platform.nameEn}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${status.className}`}
            >
              {status.label}
            </span>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-base sm:text-lg font-bold text-accent-700 leading-snug">
            {ft.amount}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-ink-700 dark:text-ink-300">
            {ft.detail}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-ink-600 dark:bg-ink-700 dark:text-ink-300">
            {category}
          </span>
          {platform.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-ink-100 px-2 py-0.5 text-ink-600 dark:bg-ink-700 dark:text-ink-300"
            >
              {t}
            </span>
          ))}
          {platform.apiUsable ? (
            <span className="rounded-full bg-free-50 px-2 py-0.5 text-free-600 font-medium border border-free-200">
              API 可调用
            </span>
          ) : null}
          {!ft.requiresRealName ? (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600 font-medium border border-emerald-200">
              免实名
            </span>
          ) : (
            <span className="rounded-full bg-warn-50 px-2 py-0.5 text-warn-600 border border-warn-200">
              需实名
            </span>
          )}
          {ft.requiresCard ? (
            <span className="rounded-full bg-warn-50 px-2 py-0.5 text-warn-600 border border-warn-200">
              需信用卡
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-ink-100 dark:border-ink-800">
        <div className="text-[11px] text-ink-500 dark:text-ink-400 mb-2.5 flex items-center justify-between">
          <span className="truncate">有效期：{ft.expiry}</span>
          <span className="shrink-0 text-ink-400">核验：{platform.lastVerified}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-xs text-ink-600 hover:text-ink-900 dark:text-ink-400 dark:hover:text-ink-100 transition-colors py-1 px-2 rounded hover:bg-ink-100 dark:hover:bg-ink-800"
            title="复制平台控制台网址"
          >
            {copied ? (
              <span className="text-free-600 font-medium">✓ 已复制网址</span>
            ) : (
              <span>📋 复制网址</span>
            )}
          </button>

          <div className="flex items-center gap-3">
            <a
              href={platform.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-ink-500 hover:text-ink-700 dark:text-ink-400 hover:underline"
              title="查看额度依据与官方核验页"
            >
              核验源 ↗
            </a>
            <a
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-accent-700 hover:text-accent-800 hover:underline py-1 px-2.5 bg-accent-50 hover:bg-accent-100 rounded-md transition-colors"
            >
              直达平台 🚀
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}