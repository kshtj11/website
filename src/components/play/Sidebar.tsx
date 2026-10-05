"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import type { PlayGroup } from "@/content/play";

const LEAF_TEXT = "t-label text-left transition-colors"; // Body/Label

/** Height animates via grid-rows 0fr → 1fr (smooth, no max-height guessing). */
function Expandable({ expanded, children }: { expanded: boolean; children: ReactNode }) {
  return (
    <div
      aria-hidden={!expanded}
      className={clsx(
        "grid w-full min-w-0 transition-[grid-template-rows,opacity] duration-200 ease-out",
        expanded ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

/**
 * Left rail, 202px, sticky at top-8.
 *   group header   16px/500 zinc-400 → zinc-500 while its section is on screen
 *   child          indented 12px; active = brand accent, count in zinc-300
 *   rhythm         8px between rows
 */
export default function Sidebar({
  groups,
  activeId,
  onSelect,
}: {
  groups: PlayGroup[];
  activeId: string;
  onSelect: (sectionId: string) => void;
}) {
  return (
    <nav aria-label="Play sections" className="flex flex-col items-start gap-2">
      {groups.map((group) => {
        const groupActive = group.sections.some((s) => s.id === activeId);
        const flat = group.sections.length === 1 && group.sections[0].label === group.label;

        if (flat) {
          const s = group.sections[0];
          return (
            <button key={group.id} type="button" onClick={() => onSelect(s.id)} className="px-0.5">
              <span className={clsx(LEAF_TEXT, groupActive ? "text-[var(--brand-accent)]" : "text-zinc-400 hover:text-zinc-500")}>
                {group.label}
              </span>
            </button>
          );
        }

        return (
          <div key={group.id} className="flex w-full min-w-0 flex-col items-start">
            <button type="button" onClick={() => onSelect(group.sections[0].id)} className="px-0.5">
              <span className={clsx(LEAF_TEXT, groupActive ? "text-zinc-500" : "text-zinc-400 hover:text-zinc-500")}>
                {group.label}
              </span>
            </button>
            <Expandable expanded={groupActive}>
              <div className="flex flex-col items-start gap-2 pt-2">
                {group.sections.map((s) => (
                  <button key={s.id} type="button" tabIndex={groupActive ? 0 : -1} onClick={() => onSelect(s.id)} className="pl-3">
                    <span
                      className={clsx(
                        LEAF_TEXT,
                        activeId === s.id ? "text-[var(--brand-accent)]" : "text-zinc-400 hover:text-zinc-500",
                      )}
                    >
                      {s.label}
                      {s.pieces.length > 0 && <span className="ml-1 text-zinc-300">{s.pieces.length}</span>}
                    </span>
                  </button>
                ))}
              </div>
            </Expandable>
          </div>
        );
      })}
    </nav>
  );
}
