/**
 * 公开新闻与社区源只是活动线索，不是活动规则的证明。
 * 此脚本只追加待核实条目；不会自动填写领取/使用期限或把线索标为 verified。
 */
import { createHash } from "node:crypto";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { XMLParser } from "fast-xml-parser";
import type { Activity } from "../lib/activity";
import { candidateLead, kindFromTitle, platformFromTitle } from "./lib/discovery-classifier";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const leadsPath = join(root, "data", "leads.json");
const campaignsPath = join(root, "data", "campaigns.json");
const queries = [
  { q: '"AI" "Token" "免费" when:3d', language: "zh" },
  { q: '"大模型" "额度" "活动" when:3d', language: "zh" },
  { q: '"模型" "Token" "免费" when:3d', language: "zh" },
  { q: '"AI API" "折扣" when:7d', language: "zh" },
  { q: '"模型 API" "降价" when:7d', language: "zh" },
  { q: '"ZCode" "免费" when:3d', language: "zh" },
  { q: '"AutoClaw" "免费" when:3d', language: "zh" },
  { q: '"Cavoti" "免费" when:7d', language: "zh" },
  { q: '"LLM API" "free credits" when:7d', language: "en" },
  { q: '"AI model" "token giveaway" when:7d', language: "en" },
  { q: '"LLM API" "discount" when:7d', language: "en" },
] as const;
const communityFeeds = [
  "https://www.v2ex.com/feed/promotions.xml",
  "https://www.v2ex.com/feed/create.xml",
] as const;
const socialQueries = ["free tokens AI", "free API credits LLM", "LLM API discount"] as const;

type NewsItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  source?: string | { "#text"?: string; "@_url"?: string };
};

type AtomEntry = {
  title?: string;
  link?: { "@_href"?: string } | { "@_href"?: string }[];
  published?: string;
};

type SocialPost = {
  uri?: string;
  indexedAt?: string;
  author?: { handle?: string };
  record?: { text?: string; createdAt?: string };
};

type RawLead = {
  title: string;
  url: string;
  publishedAt: string;
  sourceName: string;
  sourceType: Activity["sourceType"];
};

type LeadsData = {
  meta: { description: string; lastDataChange: string | null };
  activities: Activity[];
};

const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
async function fetchText(url: URL | string): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000), headers: { "User-Agent": "CN-Free-Token-Hub/1.0 (+https://github.com/nasated/cn-free-token-hub)" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

function readItems(xml: string): NewsItem[] {
  const parsed = parser.parse(xml) as { rss?: { channel?: { item?: NewsItem | NewsItem[] } } };
  if (!parsed.rss?.channel) throw new Error("新闻源未返回 RSS channel");
  const items = parsed.rss?.channel?.item;
  return items ? (Array.isArray(items) ? items : [items]) : [];
}

async function fetchNews(query: (typeof queries)[number]): Promise<NewsItem[]> {
  const url = new URL("https://news.google.com/rss/search");
  url.searchParams.set("q", query.q);
  url.searchParams.set("hl", query.language === "zh" ? "zh-CN" : "en-US");
  url.searchParams.set("gl", query.language === "zh" ? "CN" : "US");
  url.searchParams.set("ceid", query.language === "zh" ? "CN:zh-Hans" : "US:en");
  return readItems(await fetchText(url));
}

async function fetchAtom(url: string): Promise<AtomEntry[]> {
  const parsed = parser.parse(await fetchText(url)) as { feed?: { entry?: AtomEntry | AtomEntry[] } };
  if (!parsed.feed) throw new Error("社区源未返回 Atom feed");
  const entries = parsed.feed?.entry;
  return entries ? (Array.isArray(entries) ? entries : [entries]) : [];
}

async function fetchSocial(query: string): Promise<SocialPost[]> {
  const url = new URL("https://api.bsky.app/xrpc/app.bsky.feed.searchPosts");
  url.searchParams.set("q", query);
  url.searchParams.set("sort", "latest");
  url.searchParams.set("limit", "30");
  const result = JSON.parse(await fetchText(url)) as { posts?: SocialPost[] };
  if (!Array.isArray(result.posts)) throw new Error("社交搜索未返回 posts 数组");
  return result.posts;
}

function sourceName(item: NewsItem): string {
  if (typeof item.source === "string") return item.source;
  return item.source?.["#text"] || "公开新闻源";
}

async function main() {
  const data = JSON.parse(readFileSync(leadsPath, "utf8")) as LeadsData;
  const campaigns = JSON.parse(readFileSync(campaignsPath, "utf8")) as { activities: Activity[] };
  const sourceLeadIds = new Set(campaigns.activities.flatMap((item) => item.sourceLeadIds || []));
  const existing = new Set([...data.activities.map((item) => item.id), ...sourceLeadIds]);
  const now = new Date();
  const oldest = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const leadRetentionMs = 14 * 24 * 60 * 60 * 1000;
  const health = {
    news: { succeeded: 0, failed: 0 },
    community: { succeeded: 0, failed: 0 },
    social: { succeeded: 0, failed: 0 },
  };
  let additions = 0;

  function addLead(raw: RawLead) {
    const title = raw.title.replace(/\s+/g, " ").trim().slice(0, 220);
    const published = new Date(raw.publishedAt);
    if (!title || !raw.url || Number.isNaN(published.getTime()) || published.getTime() < oldest || published.getTime() > now.getTime() + 60_000 || !candidateLead(title, raw.sourceType)) return;
    try {
      if (!["http:", "https:"].includes(new URL(raw.url).protocol)) return;
    } catch { return; }
    const id = createHash("sha256").update(`${title.toLowerCase()}\n${published.toISOString().slice(0, 10)}`).digest("hex").slice(0, 20);
    if (existing.has(id)) return;
    existing.add(id);
    data.activities.push({
      id, title, platform: platformFromTitle(title), kind: kindFromTitle(title), accessType: "unknown", claimWindowApplicable: null,
      reviewStatus: "unverified", sourceUrl: raw.url, sourceName: raw.sourceName, sourceType: raw.sourceType, officialUrl: null,
      publishedAt: published.toISOString(), discoveredAt: now.toISOString(), verifiedAt: null,
      claimStartAt: null, claimEndAt: null, claimStartDate: null, claimEndDate: null, claimWindowText: null,
      useStartAt: null, useEndAt: null, useStartDate: null, useEndDate: null, useWindowText: null,
      validityRule: null, amount: null, discount: null, eligibility: null, evidence: null,
    });
    additions++;
  }

  for (const feed of communityFeeds) {
    try {
      const entries = await fetchAtom(feed);
      health.community.succeeded++;
      for (const entry of entries) {
        const links = entry.link ? (Array.isArray(entry.link) ? entry.link : [entry.link]) : [];
        const link = links.find((item) => item["@_href"]?.startsWith("https://www.v2ex.com/t/"))?.["@_href"];
        if (entry.title && link && entry.published) addLead({ title: entry.title, url: link, publishedAt: entry.published, sourceName: feed.includes("promotions") ? "V2EX · 推广" : "V2EX · 分享创造", sourceType: "community" });
      }
      console.log(`订阅：${feed} → ${entries.length} 条帖子`);
    } catch (error) {
      health.community.failed++;
      console.warn(`订阅失败：${feed} → ${String(error)}`);
    }
  }

  for (const query of socialQueries) {
    try {
      const posts = await fetchSocial(query);
      health.social.succeeded++;
      for (const post of posts) {
        const handle = post.author?.handle;
        const rkey = post.uri?.split("/").at(-1);
        const body = post.record?.text;
        if (!handle || !/^[a-z0-9.-]+$/i.test(handle) || !rkey || !/^[a-z0-9]+$/i.test(rkey) || !body) continue;
        addLead({ title: body, url: `https://bsky.app/profile/${handle}/post/${rkey}`, publishedAt: post.record?.createdAt || post.indexedAt || "", sourceName: `Bluesky · @${handle}`, sourceType: "community" });
      }
      console.log(`社交搜索：${query} → ${posts.length} 条帖子`);
    } catch (error) {
      health.social.failed++;
      console.warn(`社交搜索失败：${query} → ${String(error)}`);
    }
  }

  for (const query of queries) {
    try {
      const items = await fetchNews(query);
      health.news.succeeded++;
      for (const item of items) {
        const fullTitle = item.title?.trim() || "";
        const link = item.link?.trim() || "";
        const publisher = sourceName(item);
        const title = fullTitle.endsWith(` - ${publisher}`) ? fullTitle.slice(0, -(publisher.length + 3)) : fullTitle;
        if (title && link && item.pubDate) addLead({ title, url: link, publishedAt: item.pubDate, sourceName: publisher, sourceType: "news" });
      }
      console.log(`检索：${query.q} → ${items.length} 条新闻`);
    } catch (error) {
      health.news.failed++;
      console.warn(`检索失败：${query.q} → ${String(error)}`);
    }
  }

  const healthLine = `来源健康：新闻 ${health.news.succeeded}/${queries.length}，社区 ${health.community.succeeded}/${communityFeeds.length}，社交 ${health.social.succeeded}/${socialQueries.length}`;
  console.log(healthLine);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      `### 活动发现来源健康\n\n| 来源 | 成功 | 失败 |\n| --- | ---: | ---: |\n| 新闻搜索 | ${health.news.succeeded} | ${health.news.failed} |\n| 社区订阅 | ${health.community.succeeded} | ${health.community.failed} |\n| 社交搜索 | ${health.social.succeeded} | ${health.social.failed} |\n\n`, "utf8");
  }
  if (health.news.failed > 0 || health.community.failed > 0 || health.social.failed > 0) {
    console.warn(`::warning::活动发现有来源失败；${healthLine}`);
  }
  if (health.news.succeeded === 0) throw new Error("新闻搜索全部失败，不能视为完成本轮活动发现；请检查 Action 日志和来源可达性");
  // 待核实线索最多保留 14 天；人工整理的活动在 campaigns.json 中独立保存。
  const retained = data.activities.filter((item) => !sourceLeadIds.has(item.id) && candidateLead(item.title, item.sourceType) && Date.parse(item.discoveredAt) >= now.getTime() - leadRetentionMs);
  let normalized = 0;
  for (const item of retained) {
    if (item.reviewStatus === "unverified") {
      const nextKind = kindFromTitle(item.title);
      const nextPlatform = platformFromTitle(item.title);
      if (item.kind !== nextKind || item.platform !== nextPlatform) normalized++;
      item.kind = nextKind;
      item.platform = nextPlatform;
      if (item.claimWindowApplicable !== null) {
        item.claimWindowApplicable = null;
        normalized++;
      }
      if (item.claimWindowText !== null || item.useWindowText !== null) {
        item.claimWindowText = null;
        item.useWindowText = null;
        normalized++;
      }
      if (item.claimStartDate !== null || item.claimEndDate !== null || item.useStartDate !== null || item.useEndDate !== null) {
        item.claimStartDate = null;
        item.claimEndDate = null;
        item.useStartDate = null;
        item.useEndDate = null;
        normalized++;
      }
    }
  }
  const removed = data.activities.length - retained.length;
  data.activities = retained.sort((a, b) => Date.parse(b.discoveredAt) - Date.parse(a.discoveredAt)).slice(0, 100);
  if (additions > 0 || removed > 0 || normalized > 0) {
    data.meta.lastDataChange = now.toISOString();
    writeFileSync(leadsPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  }
  console.log(`新增待核实线索：${additions}；保留：${data.activities.length}；移除过期：${removed}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
