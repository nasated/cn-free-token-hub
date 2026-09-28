"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, activityState, formatActivityRange, formatActivityTime } from "@/lib/activity";

const KIND_LABEL: Record<Activity["kind"], string> = {
  gift: "赠送额度",
  discount: "限时折扣",
  free_access: "免费使用",
  low_price: "低价调用",
};

const ACCESS_LABEL: Record<Activity["accessType"], string> = {
  api: "API 可调用",
  product: "产品内专用",
  unknown: "使用场景待核实",
};

export default function ActivityFeed({ activities }: { activities: Activity[] }) {
  const [access, setAccess] = useState("all");
  const [kind, setKind] = useState("all");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const filtered = useMemo(() => activities
    .filter((item) => access === "all" || item.accessType === access)
    .filter((item) => kind === "all" || item.kind === kind)
    .sort((a, b) => {
      const priority = { verified: 0, reported: 1, unverified: 2 };
      return priority[a.reviewStatus] - priority[b.reviewStatus] || Date.parse(b.publishedAt || b.discoveredAt) - Date.parse(a.publishedAt || a.discoveredAt);
    }),
  [activities, access, kind]);

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-surface-border bg-surface-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-light px-2.5 py-1 text-xs font-bold text-brand-dark">活动雷达</span>
          <span className="text-xs text-ink-600">公开来源计划每 30 分钟搜索一次；实际发现速度受来源和定时任务影响</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-ink-950">新送 Token、限时免费与低价活动</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-700">
          同时关注 API 额度和产品内专用额度。新闻线索会先标为待核实；活动是否可领、领取与使用时间以原始活动规则为准。
        </p>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="活动筛选">
        <select value={access} onChange={(event) => setAccess(event.target.value)} aria-label="使用场景" className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm text-ink-900">
          <option value="all">全部使用场景</option>
          <option value="api">API 可调用</option>
          <option value="product">产品内专用</option>
          <option value="unknown">场景待核实</option>
        </select>
        <select value={kind} onChange={(event) => setKind(event.target.value)} aria-label="活动类型" className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm text-ink-900">
          <option value="all">全部活动类型</option>
          <option value="gift">赠送额度</option>
          <option value="discount">限时折扣</option>
          <option value="free_access">免费使用</option>
          <option value="low_price">低价调用</option>
        </select>
        <span className="self-center text-sm text-ink-600">{filtered.length} 条</span>
      </div>

      {filtered.length === 0 ? (
        <div className="aihot-card p-8 text-center text-ink-700">
          当前筛选下暂无活动线索。固定的新用户额度仍可在“全部额度”查看。
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const state = item.reviewStatus === "unverified" ? "待核实线索" : now ? activityState(item, now) : "状态计算中";
            const claimText = item.claimWindowApplicable === false ? "无需单独领取" : item.claimWindowText || formatActivityRange(item.claimStartAt, item.claimEndAt, item.claimStartDate, item.claimEndDate);
            const useText = item.useWindowText || formatActivityRange(item.useStartAt, item.useEndAt, item.useStartDate, item.useEndDate);
            return (
              <article key={item.id} className="aihot-card p-4 sm:p-5">
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  {item.reviewStatus === "verified" && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">规则已核验</span>}
                  <span className={item.reviewStatus === "verified" ? "rounded-full bg-surface-hover px-2.5 py-1 text-ink-700" : "rounded-full bg-amber-50 px-2.5 py-1 text-amber-800"}>{state}</span>
                  <span className="rounded-full bg-surface-hover px-2.5 py-1 text-ink-700">{item.reviewStatus === "verified" ? KIND_LABEL[item.kind] : item.reviewStatus === "reported" ? `报道：${KIND_LABEL[item.kind]}` : `疑似${KIND_LABEL[item.kind]}`}</span>
                  <span className="rounded-full bg-surface-hover px-2.5 py-1 text-ink-700">{ACCESS_LABEL[item.accessType]}</span>
                </div>
                <h2 className="mt-3 line-clamp-3 text-lg font-bold leading-snug text-ink-950">{item.title}</h2>
                <p className="mt-1 text-sm text-ink-700">{item.platform} · 来源：{item.sourceName}</p>
                {item.reviewStatus !== "unverified" && (item.amount || item.discount || item.eligibility) && (
                  <p className="mt-2 text-sm text-ink-900">{item.reviewStatus === "reported" ? "报道内容：" : ""}{[item.amount, item.discount, item.eligibility].filter(Boolean).join(" · ")}</p>
                )}
                <dl className="mt-3 grid gap-x-4 gap-y-2 border-t border-surface-border pt-3 text-sm sm:grid-cols-2">
                  <div><dt className="inline text-ink-600">消息发布：</dt><dd className="inline text-ink-900">{formatActivityTime(item.publishedAt)}</dd></div>
                  <div><dt className="inline text-ink-600">本站发现：</dt><dd className="inline text-ink-900">{formatActivityTime(item.discoveredAt)}</dd></div>
                  {item.verifiedAt && <div><dt className="inline text-ink-600">官方核验：</dt><dd className="inline text-ink-900">{formatActivityTime(item.verifiedAt)}</dd></div>}
                </dl>
                {item.reviewStatus === "unverified" ? (
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">领取、使用和优惠期限：待核实</p>
                ) : (
                  <div className="mt-3 grid gap-3 rounded-xl border border-surface-border bg-surface-hover p-3 text-sm sm:grid-cols-2">
                    <div><span className="block text-xs font-semibold text-ink-600">领取／发放时间</span><strong className="mt-1 block font-semibold leading-relaxed text-ink-950">{claimText}</strong></div>
                    <div><span className="block text-xs font-semibold text-ink-600">使用／优惠时间</span><strong className="mt-1 block font-semibold leading-relaxed text-ink-950">{useText}</strong></div>
                    {item.validityRule && <p className="text-ink-700 sm:col-span-2">规则：{item.validityRule}</p>}
                  </div>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-accent hover:underline">{item.sourceUrl.startsWith("https://news.google.com/") ? "查看聚合报道 ↗" : item.sourceType === "news" ? "查看报道 ↗" : "查看原消息 ↗"}</a>
                  {item.officialUrl && item.officialUrl !== item.sourceUrl && <a href={item.officialUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink-700 hover:underline">{item.reviewStatus === "verified" ? "查看官方规则 ↗" : "查看官方消息 ↗"}</a>}
                  {item.reviewStatus === "reported" && <span className="text-ink-600">已核对报道内容，尚未直接确认官方规则和到账后使用期限。</span>}
                  {item.reviewStatus === "unverified" && <span className="text-ink-600">{item.sourceType === "community" ? "社区消息可能含推广或推荐码；" : ""}尚未确认额度、条件及期限，请勿仅凭标题判断可领取。</span>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
