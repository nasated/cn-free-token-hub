"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import MobileTabBar from "@/components/MobileTabBar";
import Feed from "@/components/Feed";
import ChangelogView from "@/components/ChangelogView";
import AboutView from "@/components/AboutView";
import ThemeToggle from "@/components/ThemeToggle";
import ActivityFeed from "@/components/ActivityFeed";
import { Activity } from "@/lib/activity";
import platformsData from "@/data/platforms.json";
import changelogData from "@/data/changelog.json";
import campaignsData from "@/data/campaigns.json";
import leadsData from "@/data/leads.json";

export interface Platform {
  id: string;
  name: string;
  nameEn: string;
  url: string;
  verifyUrl: string;
  category: string;
  tags: string[];
  apiUsable: boolean;
  freeTier: {
    amount: string;
    detail: string;
    expiry: string;
    requiresCard: boolean;
    requiresRealName: boolean;
    inviteBonus: string | null;
  };
  lastVerified: string;
  verifyStatus: "verified" | "needs_verification" | "unknown";
  keywordHits?: number;
  valueScore: number;
}

export interface ChangelogEntry {
  date: string;
  platform: string;
  type: "init" | "added" | "changed" | "expired" | "unreachable";
  title: string;
  detail: string;
  verified: boolean;
}

const platforms = platformsData.platforms as unknown as Platform[];
const changelogEntries = changelogData.entries as unknown as ChangelogEntry[];
const campaigns = campaignsData.activities as Activity[];
const sourceLeadIds = new Set(campaigns.flatMap((item) => item.sourceLeadIds || []));
const activities = [...campaigns, ...(leadsData.activities as Activity[]).filter((item) => !sourceLeadIds.has(item.id))];
const lastVerified = platforms.map((p) => p.lastVerified).sort().pop() || "今日";
const noRealNameCount = platforms.filter((p) => !p.freeTier.requiresRealName).length;

export default function Home() {
  const [currentTab, setCurrentTab] = useState<string>("activities");
  const [starredIds, setStarredIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const savedStars = localStorage.getItem("cn-free-stars");
      if (savedStars) {
        setStarredIds(JSON.parse(savedStars));
      }
    } catch {}
  }, []);

  const handleToggleStar = (id: string) => {
    setStarredIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("cn-free-stars", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-surface-base text-ink-900 transition-colors">
      {/* PC 侧边栏 */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        platformCount={platforms.length}
        noRealNameCount={noRealNameCount}
        starredCount={starredIds.length}
        lastUpdated={lastVerified}
      />

      {/* 主展示区 */}
      <div className="flex flex-1 flex-col min-w-0 pb-20 md:pb-8">
        {/* 移动端顶栏 */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-surface-border bg-surface-base/90 backdrop-blur-md px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪙</span>
            <div>
              <span className="text-sm font-bold tracking-tight text-ink-900">
                TOKEN HUB
              </span>
              <p className="text-[10px] text-ink-500 font-medium">
                Token 活动雷达
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* 主体内容 */}
        <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex-1">
          {/* Hero 区域（仅在精选/全部页面呈现） */}
          {["featured", "all", "no_realname", "permanent"].includes(currentTab) && (
            <div className="mb-6 rounded-2xl border border-surface-border bg-gradient-to-br from-surface-card via-surface-card to-surface-hover/50 p-5 sm:p-7 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  固定平台额度 · 每日页面检查
                </span>
                <span className="text-xs text-ink-400">
                资料日期：{lastVerified}
                </span>
              </div>

              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-950">
                国内模型免费 API 额度，一站看全
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-ink-600 max-w-2xl leading-relaxed">
                这里保留初版收录的国内 API 平台固定额度。页面检查仅提供变化线索，具体政策和有效期仍以官方规则为准。
              </p>

              {/* 核心指标统计 */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
                  <div className="text-lg sm:text-xl font-bold font-mono text-brand-accent">
                    {platforms.length} 家
                  </div>
                  <div className="text-[11px] text-ink-500 font-medium">
                    收录国内主流大模型
                  </div>
                </div>
                <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
                  <div className="text-lg sm:text-xl font-bold font-mono text-emerald-600">
                    {noRealNameCount} 家
                  </div>
                  <div className="text-[11px] text-ink-500 font-medium">
                    免实名直接领用
                  </div>
                </div>
                <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
                  <div className="text-lg sm:text-xl font-bold font-mono text-brand-accent">
                    100%
                  </div>
                  <div className="text-[11px] text-ink-500 font-medium">
                    API 直接编程调用
                  </div>
                </div>
                <div className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-2xs">
                  <div className="text-lg sm:text-xl font-bold font-mono text-ink-700">
                    06:17
                  </div>
                  <div className="text-[11px] text-ink-500 font-medium">
                    每天定时自动重建
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 动态视图渲染 */}
          {currentTab === "activities" ? (
            <ActivityFeed activities={activities} />
          ) : currentTab === "changelog" ? (
            <ChangelogView entries={changelogEntries} />
          ) : currentTab === "about" ? (
            <AboutView />
          ) : (
            <Feed
              platforms={platforms}
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              starredIds={starredIds}
              onToggleStar={handleToggleStar}
            />
          )}
        </main>

        {/* 底部版权 */}
        <footer className="mt-12 border-t border-surface-border pt-6 pb-2 text-center text-xs text-ink-400">
          <p>
            CN Free Token Hub · 活动线索与固定额度
          </p>
          <p className="mt-1">
            新闻线索仅供发现活动；领取条件和期限以原始规则为准
          </p>
        </footer>
      </div>

      {/* 移动端底部 Tab 栏 */}
      <MobileTabBar currentTab={currentTab} onSelectTab={setCurrentTab} />
    </div>
  );
}
