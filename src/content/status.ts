/**
 * Drafts: anything marked status: "draft" shows while you work locally (npm run dev)
 * but is left out of the production build, so it never appears on kshtj.in.
 */
export type Status = "draft" | "published";

export const SHOW_DRAFTS = process.env.NODE_ENV !== "production";

export function isVisible(item: { status?: Status; hidden?: boolean }) {
  if (item.hidden) return false;
  return item.status !== "draft" || SHOW_DRAFTS;
}
