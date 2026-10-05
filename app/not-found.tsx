import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="t-title text-[var(--ink)]">404</p>
      <p className="text-lg text-[var(--ink-subtle)]">This page wandered off.</p>
      <Link href="/" className="button secondary md mt-2">
        Back home
      </Link>
    </main>
  );
}
