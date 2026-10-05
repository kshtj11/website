/**
 * Site-wide identity. Everything marked PLACEHOLDER needs your real info.
 */
export const site = {
  /** Shown big in the header and footer (lowercase is part of the look). */
  name: "kshitij", // footer wordmark (lowercase is part of the look)
  /** Top bar: name + role */
  fullName: "Kshitij Ghag",
  role: "Interaction Designer",
  /** Résumé link in the top bar — PLACEHOLDER until the Google Drive link exists */
  resumeUrl: "https://drive.google.com/",
  /** Header intro: greeting renders in the brand gradient, then the name line. */
  intro: { greeting: "नमस्कार,", name: "I’m Kshitij Ghag" },
  /** Single letter used by the placeholder logo until you drop in your own SVG. */
  monogram: "k",
  url: "https://kshtj.in",
  title: "Kshitij Ghag", // browser tab + link previews
  description: "Interaction designer. Portfolio of work, play, and experiments.", // PLACEHOLDER

  email: "hello@kshtj.in", // PLACEHOLDER — use an address that actually receives mail
  city: "Mumbai, IN", // footer clock label
  timezone: "Asia/Kolkata", // footer clock timezone (IANA name)

  socials: [
    { label: "Behance", href: "https://www.behance.net/" }, // PLACEHOLDER
    { label: "LinkedIn", href: "https://www.linkedin.com/" }, // PLACEHOLDER
    { label: "GitHub", href: "https://github.com/kshtj11" },
  ],

  /** Source link behind the footer changelog stamp. */
  repoUrl: "https://github.com/kshtj11/website",
};

/** The three top-level tabs. Order here = order in the nav and footer. */
export const navTabs = [
  { id: "work", label: "Work", href: "/" },
  { id: "play", label: "Play", href: "/play/" },
  { id: "about", label: "About", href: "/about/" },
] as const;

export type NavTabId = (typeof navTabs)[number]["id"];
