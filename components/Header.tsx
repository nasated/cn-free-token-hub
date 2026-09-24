import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-ink-50/90 backdrop-blur dark:border-ink-700 dark:bg-ink-900/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🪙</span>
          <div>
            <h1 className="text-base font-bold leading-tight">CN Free Token Hub</h1>
            <p className="text-[11px] text-ink-500 dark:text-ink-400">
              国内模型免费额度 · 每日核验
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="#feed" className="text-ink-700 hover:text-accent-600 dark:text-ink-200">
            免费额度
          </Link>
          <Link href="#changelog" className="text-ink-700 hover:text-accent-600 dark:text-ink-200">
            变更日志
          </Link>
          <Link
            href="https://github.com/nasated/cn-free-token-hub"
            target="_blank"
            rel="noopener"
            className="hidden text-ink-700 hover:text-accent-600 sm:inline dark:text-ink-200"
          >
            GitHub
          </Link>
        </nav>
      </div>
    </header>
  );
}