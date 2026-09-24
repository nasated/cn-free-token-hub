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
  const ft = platform.freeTier;
  const status = statusConfig[platform.verifyStatus] ?? statusConfig.unknown;
  const category = categoryLabels[platform.category] ?? platform.category;

  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-ink-900 dark:text-ink-50">
            {platform.name}
          </h3>
          <p className="truncate text-xs text-ink-500 dark:text-ink-400">
            {platform.nameEn}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-3">
        <div className="text-lg font-bold text-accent-700">{ft.amount}</div>
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
          <span className="rounded-full bg-free-50 px-2 py-0.5 text-free-600">API 可调用</span>
        ) : null}
        {ft.requiresRealName ? (
          <span className="rounded-full bg-warn-50 px-2 py-0.5 text-warn-600">需实名</span>
        ) : null}
        {ft.requiresCard ? (
          <span className="rounded-full bg-warn-50 px-2 py-0.5 text-warn-600">需信用卡</span>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3 dark:border-ink-800">
        <div className="text-[11px] text-ink-500 dark:text-ink-400">
          有效期：{ft.expiry}
        </div>
        <a
          href={platform.verifyUrl}
          target="_blank"
          rel="noopener"
          className="text-[11px] text-accent-600 hover:underline"
        >
          核验页面 →
        </a>
      </div>

      <div className="mt-2 text-[11px] text-ink-400 dark:text-ink-500">
        最后核验：{platform.lastVerified}
        {platform.verifyStatus === "needs_verification" ? " · 建议人工复查" : ""}
      </div>
    </article>
  );
}