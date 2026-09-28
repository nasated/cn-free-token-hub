export type ActivityKind = "gift" | "discount" | "free_access" | "low_price";
export type AccessType = "api" | "product" | "unknown";
export type ReviewStatus = "verified" | "reported" | "unverified";

export interface Activity {
  id: string;
  title: string;
  platform: string;
  kind: ActivityKind;
  accessType: AccessType;
  /** 是否有独立于使用期限的领取或发放窗口；线索阶段保持 null。 */
  claimWindowApplicable: boolean | null;
  reviewStatus: ReviewStatus;
  sourceUrl: string;
  sourceName: string;
  sourceType: "official" | "news" | "community";
  officialUrl: string | null;
  publishedAt: string | null;
  discoveredAt: string;
  verifiedAt: string | null;
  claimStartAt: string | null;
  claimEndAt: string | null;
  claimStartDate: string | null;
  claimEndDate: string | null;
  /** 仅有日期或相对规则时，记录来源原意而不臆造具体时刻。 */
  claimWindowText: string | null;
  useStartAt: string | null;
  useEndAt: string | null;
  useStartDate: string | null;
  useEndDate: string | null;
  useWindowText: string | null;
  validityRule: string | null;
  amount: string | null;
  discount: string | null;
  eligibility: string | null;
  evidence: string | null;
  /** 人工整理后可折叠进本活动的自动线索 ID。 */
  sourceLeadIds?: string[];
}

function beijingDate(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function activityState(activity: Activity, now = new Date()): string {
  const today = beijingDate(now);
  const time = now.getTime();
  const claimStart = activity.claimStartAt ? Date.parse(activity.claimStartAt) : null;
  const claimEnd = activity.claimEndAt ? Date.parse(activity.claimEndAt) : null;
  const useStart = activity.useStartAt ? Date.parse(activity.useStartAt) : null;
  const useEnd = activity.useEndAt ? Date.parse(activity.useEndAt) : null;
  if (activity.reviewStatus === "reported") {
    if (useEnd !== null && time >= useEnd) return "报道使用期已结束";
    if (activity.useEndDate && today > activity.useEndDate) return "报道使用期已结束";
    if (claimEnd !== null && time >= claimEnd) return "报道领取期已结束";
    if (activity.claimEndDate && today > activity.claimEndDate) return "报道领取期已结束";
    if (claimStart !== null && time < claimStart) return "报道即将开始";
    if (activity.claimStartDate && today < activity.claimStartDate) return "报道即将开始";
    if (activity.claimWindowApplicable === false && useStart !== null && time < useStart) return "报道即将开始";
    if (activity.claimWindowApplicable === false && activity.useStartDate && today < activity.useStartDate) return "报道即将开始";
    return "报道待官方核实";
  }
  if (activity.reviewStatus !== "verified") return "待核实线索";
  if (useEnd !== null && time >= useEnd) return "已结束";
  if (activity.useEndDate && today > activity.useEndDate) return "已结束";
  if (activity.claimWindowApplicable === false) {
    if (useStart !== null && time < useStart) return "即将开始";
    if (activity.useStartDate && today < activity.useStartDate) return "即将开始";
    if (useStart === null && !activity.useStartDate && useEnd === null && !activity.useEndDate && activity.verifiedAt) {
      return time - Date.parse(activity.verifiedAt) > 24 * 60 * 60 * 1000 ? "核验已超 24 小时 · 待复核" : "核验时有效 · 时限未公布";
    }
    if (useStart === null && !activity.useStartDate) return "开始时间未公布";
    if (activity.useStartDate === today && useStart === null) return "今日开始 · 具体时刻未公布";
    if (useEnd === null && !activity.useEndDate) return "截止时间未公布";
    if (useStart === null || useEnd === null) return "使用日期内 · 具体时刻未公布";
    return activity.kind === "discount" ? "优惠进行中" : activity.kind === "free_access" ? "免费使用中" : activity.kind === "low_price" ? "低价调用中" : "活动进行中";
  }
  if (activity.claimWindowApplicable !== true) return "活动时间待核实";
  if (claimStart !== null && time < claimStart) return "即将开始";
  if (activity.claimStartDate && today < activity.claimStartDate) return "即将开始";
  if ((claimEnd !== null && time >= claimEnd) || (activity.claimEndDate && today > activity.claimEndDate)) {
    if (useStart !== null && time < useStart) return "领取结束 · 尚未生效";
    if (activity.useStartDate && today < activity.useStartDate) return "领取结束 · 尚未生效";
    if (useStart === null && !activity.useStartDate) return "领取结束 · 使用开始未公布";
    if (useStart === null && activity.useStartDate === today) return "领取结束 · 使用开始时刻未公布";
    return useEnd === null && !activity.useEndDate ? "领取结束 · 使用截止未公布" : "领取结束 · 已领额度仍可用";
  }
  if (claimStart === null && !activity.claimStartDate) return "领取开始未公布";
  if (claimStart === null && activity.claimStartDate === today) return "今日可领 · 具体时刻未公布";
  if (claimEnd === null && !activity.claimEndDate) return "领取截止未公布";
  return claimStart === null || claimEnd === null ? "领取日期内 · 具体时刻未公布" : "领取中";
}

export function formatActivityRange(startAt: string | null, endAt: string | null, startDate: string | null, endDate: string | null): string {
  const start = startAt ? formatActivityTime(startAt) : startDate ? `${startDate}（具体时刻未公布）` : formatActivityTime(null);
  const end = endAt ? formatActivityTime(endAt) : endDate ? `${endDate}（具体时刻未公布）` : formatActivityTime(null);
  return `${start} — ${end}`;
}

export function formatActivityTime(value: string | null): string {
  if (!value) return "未公布／待核实";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未公布／待核实";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date) + "（北京时间）";
}
