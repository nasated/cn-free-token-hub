/**
 * crawl.ts — 每日额度核验入口（GitHub Actions 调用）。
 *
 * 做什么：
 * 1. 读取 data/platforms.json（源数据）与 data/changelog.json（变更日志）
 * 2. 逐个抓取各平台 verifyUrl，做可达性 + 关键词弱信号核验
 * 3. 有变化时更新 lastVerified / verifyStatus，并追加变更日志
 * 4. 写回 data/，由 CI 提交
 *
 * 不做什么（重要）：
 * - 不解析具体额度数字，不保证额度仍然"有效"
 * - 抓取失败不会把平台标成"已失效"，只会标 needs_verification
 * - 变更日志条目一律标注 auto-detected，需人工复查
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { verifyPlatform } from "./lib/fetcher";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataDir = join(root, "data");

interface FreeTier {
  amount: string;
  detail: string;
  expiry: string;
  requiresCard: boolean;
  requiresRealName: boolean;
  inviteBonus: string | null;
}

interface Platform {
  id: string;
  name: string;
  verifyUrl: string;
  category: string;
  apiUsable: boolean;
  freeTier: FreeTier;
  lastVerified: string;
  verifyStatus: "verified" | "needs_verification" | "unknown";
  keywordHits?: number;
  valueScore: number;
}

interface PlatformsData {
  meta: { lastCrawl: string; lastManualVerify: string; platformCount: number };
  platforms: Platform[];
}

interface ChangelogEntry {
  date: string;
  platform: string;
  type: "init" | "added" | "changed" | "expired" | "unreachable";
  title: string;
  detail: string;
  verified: boolean;
}

interface ChangelogData {
  meta: { lastCrawl: string };
  entries: ChangelogEntry[];
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

function saveJson(path: string, data: unknown): void {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

async function main() {
  const platformsPath = join(dataDir, "platforms.json");
  const changelogPath = join(dataDir, "changelog.json");

  const platformsData = loadJson<PlatformsData>(platformsPath);
  const changelogData = loadJson<ChangelogData>(changelogPath);

  const now = new Date().toISOString();
  const todayStr = today();
  const newEntries: ChangelogEntry[] = [];
  let reachableCount = 0;
  let changedCount = 0;
  let unreachableCount = 0;

  console.log(`开始核验 ${platformsData.platforms.length} 个平台 — ${now}\n`);

  for (const p of platformsData.platforms) {
    const result = await verifyPlatform(p.verifyUrl, p.keywordHits);
    p.lastVerified = todayStr;

    if (!result.reachable) {
      unreachableCount++;
      p.verifyStatus = "needs_verification";
      p.keywordHits = 0;
      console.log(`[不可达] ${p.name} → ${p.verifyUrl} (${result.status || result.error})`);
      newEntries.push({
        date: todayStr,
        platform: p.name,
        type: "unreachable",
        title: `核验失败：${p.name} 页面无法访问`,
        detail: `抓取 ${p.verifyUrl} 失败（${result.status || result.error}）。额度状态未确认，需人工复查，不视为已失效。`,
        verified: false,
      });
      continue;
    }

    reachableCount++;
    p.keywordHits = result.keywordHits;

    if (result.signal === "no_free_keywords") {
      // 页面可达，但不再出现免费额度关键词。
      // 关键设计：自动化解析不了（JS 渲染/需登录）≠ 额度失效。
      // 已人工核验过的平台不被爬虫推翻，避免"页面改版"被误报为"额度变化"。
      const wasVerified = p.verifyStatus === "verified";
      if (wasVerified) {
        // 保持人工核验结论，仅更新核验日期，不降级、不写变更日志
        console.log(`[保持] ${p.name} → 页面未出现关键词，但保留人工核验结论`);
        continue;
      }
      p.verifyStatus = "needs_verification";
      changedCount++;
      console.log(`[存疑] ${p.name} → 页面未出现免费额度关键词，需人工复查`);
      newEntries.push({
        date: todayStr,
        platform: p.name,
        type: "changed",
        title: `${p.name} 页面内容变化（存疑）`,
        detail: `关键词命中从 ${result.previousHits ?? 0} 降至 0。可能为页面改版或额度政策调整，需人工复查官方页面。片段：${result.snippet || "(无)"}`,
        verified: false,
      });
      continue;
    }

    if (result.signal === "changed") {
      changedCount++;
      p.verifyStatus = "needs_verification";
      console.log(`[变化] ${p.name} → 关键词命中 ${result.previousHits ?? 0} → ${result.keywordHits}`);
      newEntries.push({
        date: todayStr,
        platform: p.name,
        type: "changed",
        title: `${p.name} 页面内容变化（自动检测）`,
        detail: `关键词命中数变化：${result.previousHits ?? 0} → ${result.keywordHits}。自动检测，需人工复查后确认额度是否真的变动。片段：${result.snippet || "(无)"}`,
        verified: false,
      });
      continue;
    }

    // stable
    if (p.verifyStatus !== "verified") {
      p.verifyStatus = "verified";
    }
    console.log(`[正常] ${p.name} → 命中 ${result.keywordHits} 个关键词`);
  }

  // 写回数据
  platformsData.meta.lastCrawl = now;
  platformsData.meta.platformCount = platformsData.platforms.length;
  changelogData.meta.lastCrawl = now;
  if (newEntries.length > 0) {
    changelogData.entries = [...newEntries, ...changelogData.entries];
  }

  saveJson(platformsPath, platformsData);
  saveJson(changelogPath, changelogData);

  // 汇总
  console.log("\n=== 本次核验汇总 ===");
  console.log(`可访问：${reachableCount} / ${platformsData.platforms.length}`);
  console.log(`不可达：${unreachableCount}`);
  console.log(`内容变化（需人工复查）：${changedCount}`);
  console.log(`新增变更日志：${newEntries.length} 条`);
  if (newEntries.length > 0) {
    console.log("\n变更条目：");
    for (const e of newEntries) {
      console.log(`  - [${e.type}] ${e.platform}：${e.title}`);
    }
  }
  console.log(`\n数据已写回 data/，CI 将提交。`);
}

main().catch((e) => {
  console.error("抓取流程异常：", e);
  process.exit(1);
});