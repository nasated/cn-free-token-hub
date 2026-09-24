import Header from "@/components/Header";
import Feed from "@/components/Feed";
import Changelog from "@/components/Changelog";
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

const lastVerified = platformsData.platforms
  .map((p) => p.lastVerified)
  .sort()
  .pop();

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pt-10 pb-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-3 py-1 text-xs font-medium text-accent-700">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
          每日自动核验 · 仅收录国内 API 可调用免费额度
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-ink-900 dark:text-ink-50 sm:text-4xl">
          国内模型免费 API 额度，一站看齐
        </h1>
        <p className="mt-2 max-w-2xl text-base text-ink-600 dark:text-ink-300">
          不用挨个平台翻活动页。我们每日自动核验智谱、阿里百炼、硅基流动、Kimi、
          ModelScope 等平台的免费额度变化，把当前可用的额度整理在这里。
        </p>
        <p className="mt-1 text-xs text-ink-400">
          最后核验：{lastVerified} · 数据由 GitHub Actions 每日自动刷新
        </p>
      </section>

      <Feed
        platforms={platformsData.platforms as unknown as Platform[]}
        changelog={changelogData.entries as unknown as ChangelogEntry[]}
      />

      <Changelog
        entries={changelogData.entries as unknown as ChangelogEntry[]}
      />

      {/* Footer */}
      <footer className="border-t border-ink-200 dark:border-ink-800">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-ink-500 dark:text-ink-400">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>
              CN Free Token Hub · 只收录 API 可调用的国内模型免费额度。额度以各平台官方页面为准，
              本站仅做聚合与核验，不保证永久有效。
            </p>
            <p>
              <a
                href="https://github.com/nasated/cn-free-token-hub"
                target="_blank"
                rel="noopener"
              >
                GitHub
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}