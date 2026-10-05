import clsx from "clsx";
import { site } from "@/content/site";

/**
 * PLACEHOLDER mark: a monogram on the brand gradient.
 * Swap the inner markup for your own <svg> (or an <img src="/logo.svg">) once it's designed.
 */
export default function Logo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "inline-flex aspect-square items-center justify-center rounded-full border border-white/70 shadow-glass",
        className,
      )}
      style={{
        background:
          "linear-gradient(200deg, var(--brand-grad-1) 0%, var(--brand-grad-3) 55%, var(--brand-grad-4) 100%)",
      }}
    >
      <span className="text-[0.6em] font-semibold leading-none text-[var(--ink)]">{site.monogram}</span>
    </span>
  );
}
