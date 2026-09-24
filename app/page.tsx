"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import MobileTabBar from "@/components/MobileTabBar";
import Feed from "@/components/Feed";
import ChangelogView from "@/components/ChangelogView";
import AboutView from "@/components/AboutView";
import ThemeToggle from "@/components/ThemeToggle";
import platformsData from "@/data/platforms.json";
import changelogData from "@/data/changelog.json";

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
const lastVerified = platforms.map((p) => p.lastVerified).sort().pop() || "今日";
const noRealNameCount = platforms.filter((p) => !p.freeTier.requiresRealName).length;

export default function Home() {
  const [currentTab, setCurrentTab] = useState<string>("featured");
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
                CN FREE API
              </span>
              <p className="text-[10px] text-ink-500 font-medium">
                国内模型额度雷达
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
                  <span className="live-pulse"></span>
                  每日自动核验 · 纯境内 API 免费额度
                </span>
                <span className="text-xs text-ink-400">
                  基准日期：{lastVerified}
                </span>
              </div>

              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-950">
                国内模型免费 API 额度，一站看全
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-ink-600 max-w-2xl leading-relaxed">
                不用挨个翻官方控制台。每日自动核验智谱、阿里百炼、硅基流动、DeepSeek、Kimi、讯飞星火、零一万物、腾讯混元等 13+ 国内主流大模型平台的免费额度政策。
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
          {currentTab === "changelog" ? (
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
            CN Free Token Hub · 借鉴 aihot 风格架构与 AI-Search 零成本自动更新机制
          </p>
          <p className="mt-1">
            数据由 GitHub Actions 每日自动核验 · 仅收录合法合规境内模型 API
          </p>
        </footer>
      </div>

      {/* 移动端底部 Tab 栏 */}
      <MobileTabBar currentTab={currentTab} onSelectTab={setCurrentTab} />
    </div>
  );
}