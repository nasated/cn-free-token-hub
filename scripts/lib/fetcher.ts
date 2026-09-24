/**
 * fetcher.ts — 公开页面抓取与文本提取工具。
 *
 * 设计原则：
 * - 只抓取公开页面，不带任何凭证，不模拟登录。
 * - 抓不到 ≠ 额度失效：抓取失败一律标记为 needs_verification，由人工复查，
 *   绝不自动把平台标成"已失效"。
 * - 关键词命中数只是"页面是否还在讲免费额度"的弱信号，不作为额度准确性的证据。
 */

export interface FetchResult {
  ok: boolean;
  status?: number;
  text?: string;
  error?: string;
}

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "Sec-Ch-Ua": '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

/** 抓取页面 HTML，跟随重定向，15 秒超时，支持重试。 */
export async function fetchPage(
  url: string,
  timeoutMs = 15000,
  maxRetries = 2
): Promise<FetchResult> {
  let lastError: string | undefined;
  let lastStatus: number | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      // 延迟重试
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: BROWSER_HEADERS,
        redirect: "follow",
      });

      if (res.ok) {
        const html = await res.text();
        return { ok: true, status: res.status, text: html };
      }

      lastStatus = res.status;
      lastError = `HTTP ${res.status}`;
      // 如果是 404 等明确错误则不重试，5xx 或 403/429 可以重试
      if (res.status >= 400 && res.status < 500 && res.status !== 429 && res.status !== 403) {
        break;
      }
    } catch (e: any) {
      lastError = e?.message || String(e);
    } finally {
      clearTimeout(timer);
    }
  }

  return { ok: false, status: lastStatus, error: lastError };
}

/** 把 HTML 还原成可搜索的纯文本。 */
export function extractText(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** 默认关键词：用于判断页面是否仍在讲"免费额度"。 */
export const DEFAULT_KEYWORDS = [
  "免费",
  "free",
  "token",
  "额度",
  "代金券",
  "积分",
  "试用",
  "新人",
  "邀请",
  "赠送",
  "送",
];

export interface KeywordHits {
  keywords: string[];
  hits: number;
  snippet: string | null;
}

/** 统计关键词命中，返回命中数与首个上下文片段。 */
export function countKeywordHits(text: string, keywords: string[] = DEFAULT_KEYWORDS): KeywordHits {
  const lower = text.toLowerCase();
  let hits = 0;
  let firstSnippet: string | null = null;
  for (const kw of keywords) {
    const kwl = kw.toLowerCase();
    let idx = lower.indexOf(kwl);
    while (idx !== -1) {
      hits++;
      if (firstSnippet === null) {
        const start = Math.max(0, idx - 60);
        const end = Math.min(text.length, idx + kw.length + 60);
        firstSnippet = text.slice(start, end).replace(/\s+/g, " ");
      }
      idx = lower.indexOf(kwl, idx + kw.length);
      if (hits > 50) break; // 避免长页面把统计撑爆
    }
    if (hits > 50) break;
  }
  return { keywords, hits, snippet: firstSnippet };
}

export interface VerifyResult {
  platformId: string;
  reachable: boolean;
  status?: number;
  error?: string;
  keywordHits: number;
  previousHits?: number;
  signal: "stable" | "changed" | "unreachable" | "no_free_keywords";
  snippet: string | null;
}

/**
 * 核验一个平台：抓取 → 提取 → 关键词统计 → 与上次快照对比 → 给出弱信号。
 * 不解析具体额度数字，不做"已失效"结论。
 */
export async function verifyPlatform(
  url: string,
  previousHits?: number
): Promise<VerifyResult> {
  const res = await fetchPage(url);
  if (!res.ok || !res.text) {
    return {
      platformId: "",
      reachable: false,
      status: res.status,
      error: res.error,
      keywordHits: 0,
      previousHits,
      signal: "unreachable",
      snippet: null,
    };
  }
  const text = extractText(res.text);
  const { hits, snippet } = countKeywordHits(text);
  let signal: VerifyResult["signal"];
  if (hits === 0) {
    signal = "no_free_keywords";
  } else if (previousHits === undefined) {
    signal = "stable";
  } else if (previousHits === 0 && hits > 0) {
    signal = "changed";
  } else if (Math.abs(hits - previousHits) / Math.max(previousHits, 1) > 0.5) {
    signal = "changed";
  } else {
    signal = "stable";
  }
  return {
    platformId: "",
    reachable: true,
    status: res.status,
    keywordHits: hits,
    previousHits,
    signal,
    snippet,
  };
}