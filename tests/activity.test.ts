import assert from "node:assert/strict";
import test from "node:test";
import { activityState, formatActivityRange, formatActivityTime, type Activity } from "../lib/activity";

const base: Activity = {
  id: "example", title: "示例活动", platform: "示例平台", kind: "gift", accessType: "product", claimWindowApplicable: true,
  reviewStatus: "verified", sourceUrl: "https://example.com/post", sourceName: "示例", sourceType: "official",
  officialUrl: "https://example.com/rules", publishedAt: "2026-09-24T08:00:00+08:00",
  discoveredAt: "2026-09-24T08:30:00+08:00", verifiedAt: "2026-09-24T09:00:00+08:00",
  claimStartAt: "2026-09-24T23:00:00+08:00", claimEndAt: "2026-09-28T09:00:00+08:00",
  claimStartDate: null, claimEndDate: null, claimWindowText: null,
  useStartAt: "2026-09-24T23:00:00+08:00", useEndAt: "2026-09-30T09:00:00+08:00",
  useStartDate: null, useEndDate: null, useWindowText: null,
  validityRule: null, amount: "3 亿 Token", discount: null, eligibility: null, evidence: null,
};

test("unverified news never appears as an active offer", () => {
  assert.equal(activityState({ ...base, reviewStatus: "unverified" }, new Date("2026-09-25T00:00:00Z")), "待核实线索");
  assert.equal(activityState({ ...base, reviewStatus: "reported" }, new Date("2026-09-25T00:00:00Z")), "报道待官方核实");
});

test("reported date-only range expires after its last Beijing calendar day", () => {
  const report = { ...base, reviewStatus: "reported" as const, claimStartAt: null, claimEndAt: null, useStartAt: null, useEndAt: null, claimStartDate: "2026-09-28", claimEndDate: "2026-10-07" };
  assert.equal(activityState(report, new Date("2026-09-27T15:59:00Z")), "报道即将开始");
  assert.equal(activityState(report, new Date("2026-10-07T15:59:00Z")), "报道待官方核实");
  assert.equal(activityState(report, new Date("2026-10-07T16:00:00Z")), "报道领取期已结束");
});

test("reported exact expiry is respected without treating the report as official verification", () => {
  const report = { ...base, reviewStatus: "reported" as const };
  assert.equal(activityState(report, new Date("2026-09-24T14:59:00Z")), "报道即将开始");
  assert.equal(activityState(report, new Date("2026-09-28T01:00:00Z")), "报道领取期已结束");
  assert.equal(activityState(report, new Date("2026-09-30T01:00:00Z")), "报道使用期已结束");
});

test("verified date-only claim period uses Beijing dates and preserves separate usage expiry", () => {
  const dated = { ...base, claimStartAt: null, claimEndAt: null, claimStartDate: "2026-09-28", claimEndDate: "2026-09-29", useStartAt: null, useEndAt: null, useStartDate: "2026-10-01", useEndDate: "2026-10-03" };
  assert.equal(activityState(dated, new Date("2026-09-27T15:59:00Z")), "即将开始");
  assert.equal(activityState(dated, new Date("2026-09-27T16:00:00Z")), "今日可领 · 具体时刻未公布");
  assert.equal(activityState(dated, new Date("2026-09-28T16:00:00Z")), "领取日期内 · 具体时刻未公布");
  assert.equal(activityState(dated, new Date("2026-09-29T16:00:00Z")), "领取结束 · 尚未生效");
  assert.equal(activityState(dated, new Date("2026-10-02T16:00:00Z")), "领取结束 · 已领额度仍可用");
  assert.equal(activityState(dated, new Date("2026-10-03T16:00:00Z")), "已结束");
  assert.equal(formatActivityRange(null, null, dated.claimStartDate, dated.claimEndDate), "2026-09-28（具体时刻未公布） — 2026-09-29（具体时刻未公布）");
});

test("claim and usage windows are distinct", () => {
  assert.equal(activityState(base, new Date("2026-09-24T14:59:00Z")), "即将开始");
  assert.equal(activityState(base, new Date("2026-09-25T00:00:00Z")), "领取中");
  assert.equal(activityState(base, new Date("2026-09-28T01:00:00Z")), "领取结束 · 已领额度仍可用");
  assert.equal(activityState(base, new Date("2026-09-30T01:00:00Z")), "已结束");
});

test("unknown deadline remains unknown and time is shown in Beijing time", () => {
  assert.equal(activityState({ ...base, claimEndAt: null }, new Date("2026-09-25T00:00:00Z")), "领取截止未公布");
  assert.equal(formatActivityTime(null), "未公布／待核实");
  assert.match(formatActivityTime("2026-09-24T15:00:00Z"), /2026\/09\/24.*23:00.*北京时间/);
});

test("usage cannot be called active before its start or after its end", () => {
  assert.equal(activityState({ ...base, useStartAt: "2026-09-29T00:00:00+08:00" }, new Date("2026-09-28T02:00:00Z")), "领取结束 · 尚未生效");
  assert.equal(activityState({ ...base, claimEndAt: null }, new Date("2026-09-30T01:00:00Z")), "已结束");
});

test("direct free access and discounts use their usage window rather than a claim window", () => {
  const free = { ...base, kind: "free_access" as const, claimWindowApplicable: false, claimStartAt: null, claimEndAt: null };
  assert.equal(activityState(free, new Date("2026-09-24T14:59:00Z")), "即将开始");
  assert.equal(activityState(free, new Date("2026-09-25T00:00:00Z")), "免费使用中");
  assert.equal(activityState({ ...free, kind: "discount" }, new Date("2026-09-25T00:00:00Z")), "优惠进行中");
  assert.equal(activityState({ ...free, useStartAt: null, useEndAt: null }, new Date("2026-09-25T00:00:00Z")), "核验时有效 · 时限未公布");
  assert.equal(activityState({ ...free, useStartAt: null, useEndAt: null }, new Date("2026-09-27T00:00:00Z")), "核验已超 24 小时 · 待复核");
});
