import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Activity } from "../lib/activity";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = ["campaigns.json", "leads.json"];
const ids = new Set<string>();
let count = 0;

function validUrl(value: string | null): boolean {
  if (!value) return false;
  try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
}

function validTime(value: string | null): boolean {
  return value === null || (!Number.isNaN(Date.parse(value)) && /(?:Z|[+-]\d{2}:\d{2})$/.test(value));
}

function validDate(value: string | null): boolean {
  if (value === null) return true;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

for (const file of files) {
  const data = JSON.parse(readFileSync(join(root, "data", file), "utf8")) as { activities: Activity[] };
  if (!Array.isArray(data.activities)) throw new Error(`${file}: activities 必须是数组`);
  for (const item of data.activities) {
    count++;
    if (!item.id || ids.has(item.id)) throw new Error(`${file}: 活动 ID 缺失或重复：${item.id}`);
    ids.add(item.id);
    if (item.sourceLeadIds && (!Array.isArray(item.sourceLeadIds) || item.sourceLeadIds.some((leadId) => typeof leadId !== "string" || !leadId))) throw new Error(`${file}/${item.id}: sourceLeadIds 必须是线索 ID 数组`);
    if (!item.title || !validUrl(item.sourceUrl)) throw new Error(`${file}/${item.id}: 缺少标题或来源 URL`);
    if (item.officialUrl !== null && !validUrl(item.officialUrl)) throw new Error(`${file}/${item.id}: 官方规则 URL 无效`);
    if (!["gift", "discount", "free_access", "low_price"].includes(item.kind) || !["api", "product", "unknown"].includes(item.accessType) || !["official", "news", "community"].includes(item.sourceType)) {
      throw new Error(`${file}/${item.id}: 活动类型、使用场景或来源类型无效`);
    }
    if (typeof item.discoveredAt !== "string" || !validTime(item.discoveredAt)) throw new Error(`${file}/${item.id}: 缺少有效的发现时间`);
    for (const field of ["publishedAt", "discoveredAt", "verifiedAt", "claimStartAt", "claimEndAt", "useStartAt", "useEndAt"] as const) {
      if (!validTime(item[field])) throw new Error(`${file}/${item.id}: ${field} 必须为带时区的 ISO 时间或 null`);
    }
    for (const field of ["claimStartDate", "claimEndDate", "useStartDate", "useEndDate"] as const) {
      if (!validDate(item[field])) throw new Error(`${file}/${item.id}: ${field} 必须为 YYYY-MM-DD 或 null`);
    }
    for (const prefix of ["claim", "use"] as const) {
      for (const edge of ["Start", "End"] as const) {
        if (item[`${prefix}${edge}At`] && item[`${prefix}${edge}Date`]) throw new Error(`${file}/${item.id}: 同一时间端点不能同时填写精确时刻和仅有日期`);
      }
    }
    if (item.claimStartAt && item.claimEndAt && Date.parse(item.claimStartAt) >= Date.parse(item.claimEndAt)) throw new Error(`${file}/${item.id}: 领取截止不能早于开始`);
    if (item.useStartAt && item.useEndAt && Date.parse(item.useStartAt) >= Date.parse(item.useEndAt)) throw new Error(`${file}/${item.id}: 使用截止不能早于开始`);
    if (item.claimStartDate && item.claimEndDate && item.claimStartDate > item.claimEndDate) throw new Error(`${file}/${item.id}: 领取日期终点不能早于起点`);
    if (item.useStartDate && item.useEndDate && item.useStartDate > item.useEndDate) throw new Error(`${file}/${item.id}: 使用日期终点不能早于起点`);
    if (item.claimStartAt && item.useEndAt && Date.parse(item.claimStartAt) >= Date.parse(item.useEndAt)) throw new Error(`${file}/${item.id}: 使用期不能在领取开始前结束`);
    if (["claimWindowText", "useWindowText"].some((field) => item[field as "claimWindowText" | "useWindowText"] !== null && typeof item[field as "claimWindowText" | "useWindowText"] !== "string")) throw new Error(`${file}/${item.id}: 时间说明必须是文字或 null`);
    if (file === "leads.json" && (item.reviewStatus !== "unverified" || item.claimWindowApplicable !== null || item.claimWindowText !== null || item.useWindowText !== null || item.claimStartDate !== null || item.claimEndDate !== null || item.useStartDate !== null || item.useEndDate !== null)) throw new Error(`${file}/${item.id}: 自动线索不能标为已核验或推定活动期限`);
    if (file === "campaigns.json" && (!item.evidence || typeof item.claimWindowApplicable !== "boolean" || item.accessType === "unknown")) {
      throw new Error(`${file}/${item.id}: 人工整理活动须有证据摘要、领取方式和明确的使用场景`);
    }
    if (file === "campaigns.json" && item.reviewStatus === "reported" && item.verifiedAt !== null) throw new Error(`${file}/${item.id}: 仅核对报道的活动不能有官方核验时间`);
    if (file === "campaigns.json" && item.reviewStatus === "verified" && (!validUrl(item.officialUrl) || !item.verifiedAt)) throw new Error(`${file}/${item.id}: 已核验活动须有官方规则 URL 与核验时间`);
    if (file === "campaigns.json" && !["reported", "verified"].includes(item.reviewStatus)) throw new Error(`${file}/${item.id}: 人工整理活动须标为 reported 或 verified`);
    if (file === "campaigns.json" && item.claimWindowApplicable === false && (item.claimStartAt || item.claimEndAt || item.claimStartDate || item.claimEndDate)) throw new Error(`${file}/${item.id}: 无独立领取窗口的活动不能填写领取日期`);
    if (file === "campaigns.json" && ["discount", "low_price"].includes(item.kind) && !item.discount) throw new Error(`${file}/${item.id}: 低价活动须记录价格、币种和计费单位`);
  }
}

console.log(`活动数据校验通过：${count} 条`);
