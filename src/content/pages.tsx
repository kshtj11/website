import type { ReactNode } from "react";

/**
 * Per-page copy: each tab's header (title + the line under it), plus the About page.
 * All text here is PLACEHOLDER.
 */

/** Header title per tab. null = the नमस्कार, I'm Kshitij Ghag intro (Work). */
export const heroTitle: Record<"work" | "play" | "about", string | null> = {
  work: null,
  play: "Play",
  about: "About me",
};

/** Line under the title. null = no line (its space is kept so headers line up across tabs). */
export const heroCopy: Record<"work" | "play" | "about", ReactNode> = {
  work: (
    <>
      Interaction designer at IDC, IIT Bombay.
      <br aria-hidden="true" />
      Currently: placeholder line about what you&apos;re doing now.
    </>
  ),
  play: <>Experiments, sketchbook pages and photographs — the things I make between projects.</>,
  about: null,
};

export const about = {
  greeting: "Hi, I'm Kshitij!", // PLACEHOLDER
  /** 4:5 portrait in /public, e.g. "/about/me.jpg". Omit for a placeholder. */
  photo: undefined as string | undefined,
  photoCaption: "Placeholder caption for your photo.",
  facts: ["Mumbai", "M.Des, IDC School of Design, IIT Bombay"], // PLACEHOLDER
  bio: [
    "Placeholder paragraph: what you care about as a designer.",
    "Placeholder paragraph: how you work, what you're drawn to.",
    "Placeholder paragraph: something personal.",
  ],
  experience: [
    { role: "Design Intern", org: "Mecha", years: "2025", note: "Placeholder" },
    { role: "Placeholder role", org: "Placeholder org", years: "2024", note: "Placeholder" },
  ],
};
