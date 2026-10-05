# Structure, sizing & motion

Reference for designing in Figma and editing code. Values are the ones the code uses.

## Page hierarchy

```
/                         Work tab
/play/                    Play tab
/about/                   About tab
/work/<slug>/             Work case study (full page)
/play/<slug>/             Play case study (full page)
```

Every tab page uses the same shell (`src/components/layout/TabPage.tsx`):

```
PageHeader        gradient + grain, logo, name, hero line
NavigationTabs    Work · Play · About pills + hairline
<content>         project grid, or About sections
Footer            brand + live clock · nav · contact + socials · changelog stamp
```

Case-study pages (`src/components/case-study/CaseStudyPage.tsx`):

```
CaseStudyHeader   sticky: logo + "Work / Project" breadcrumb pill
<main> 800px column
  CaseStudyHero   logo? → title → description → facts row → links → hairline → cover
  Blocks          sectionTitle · text · image · gallery · twoColumn · quote · video · embed · learnings · divider
  MoreProjects    2 other projects from the same section
Footer
```

On desktop, clicking a card opens a **preview popup** and updates the URL. *Expand* or *Read case study* loads the full page. On mobile, a click goes straight to the full page.

## Grid & spacing

| Thing | Desktop (≥768px) | Mobile |
| --- | --- | --- |
| Page gutter | 64px (`px-16`) | 24px (`px-6`) |
| Project grid | 2 columns, 24px gap | 1 column, 32px gap |
| Case-study column | 800px max, 32px inner padding | full width, 32px padding |
| About sections | 80px apart (`gap-20`) | same |
| Breakpoints | `md` 768 · `lg` 1024 · `xl` 1280 | |

Figma frame suggestion: **1440 wide** desktop (gutter 64, content 1312) and **375 wide** mobile (gutter 24).

## Type scale (Figtree)

| Role | Size / weight | Color |
| --- | --- | --- |
| Name in header | 36px / 500, tracking 1.25% | zinc-700 `#3f3f46` |
| Hero line | 18px / 400 (16px mobile), tracking wide | zinc-400 `#a1a1aa` |
| Tabs | 18px / 500 | active zinc-600, idle zinc-400 |
| Card title / meta | 16px / 400–500 | zinc-900 / zinc-400 |
| Case-study title | 36px / 400 | zinc-900 |
| Block heading | 24px / 400, relaxed | zinc-900 |
| Body | 16px / 400, line-height 1.625 | zinc-600 `#52525b` |
| Labels (facts row) | 16px / 500 | zinc-400 |
| Footer name | 30px / 500 | zinc-700 |

## Media sizes

| Slot | Aspect | Export at |
| --- | --- | --- |
| Card cover | 678 : 367.6 (≈ 1.844, a bit wider than 16:9) | 1920 × 1041 |
| Popup cover | 1097 : 616 | 1920 × 1078 |
| Case-study hero | 16 : 9 | 1920 × 1080 |
| Image block | 16 : 10 default (override with `aspect`) | 1600 wide |
| Gallery | 1 : 1 default | 1000 × 1000 |
| Two-column image | 4 : 5 | 1000 × 1250 |
| About photo | 4 : 5 | 800 × 1000 |
| Project logo | 1 : 1 | 160 × 160 |

Corner radius: **26px** for cards and media, 16px for popup media, 24px for quote/learning cards, full pills for buttons and tabs.
In Chrome, corners render as **squircles** (`corner-shape: squircle`) with radii bumped about 1.7× so they look the same size. Other browsers show normal rounded corners.

## Color tokens

Defined at the top of `app/globals.css`:

- Header gradient: `#D5E0FF → #E2EAFF → #F5E2FF → #FDE9FA → #FFF5FC → #FFFEFF → white`, at 190°. It drifts slowly (8s loop).
- Accent: blue-500 `#3b82f6` (links on hover, primary button, text selection).
- Neutrals: Tailwind zinc. Hairlines are zinc-100 `#f4f4f5`, placeholders zinc-200 `#e4e4e7`.

## Motion

Everything is CSS transitions/keyframes plus a few small observers. **No animation library is used.**

| Effect | Where | Timing |
| --- | --- | --- |
| Header gradient drift | `.header-gradient` | 8s ease, infinite |
| Hero line entrance | `.hero-copy` | rise 12px + fade, 360ms |
| Card entrance | `.project-card` | rise 12px + fade, 450ms, +60ms per row (max 300ms) |
| Card hover | media `scale(0.99)`, caption rises 8px + fades in | 300ms ease-out |
| Tab indicator | glass pill glides to the new tab, **then** the page changes | 300ms ease-out |
| Scroll reveal | `<ScrollReveal>`: slide 20px/500ms · fade 12px/300ms | fires once at viewport edge |
| Media load | shimmer sweep until the image decodes, then a 500ms crossfade | |
| Popup | overlay fade; panel rises 32px → 0; exit drops to 16px | 300ms |
| Sticky case-study header | logo 44 → 28px, padding 32 → 16px after 24px scroll | 300ms |
| Footer | clock colon blinks (1.2s); changelog text scrambles on view/hover | |

All of it respects `prefers-reduced-motion`.

## Limitations of this setup

- **Static hosting only.** GitHub Pages can't run server code, so there are no API routes, password-protected projects, contact forms that send mail, or CMS fetches at request time. Content is compiled at build time. Editing `projects.ts` and pushing redeploys in about 1–2 minutes.
- **Popup URLs are "soft".** Opening the popup changes the URL without loading the page. Refreshing or sharing that URL opens the full case-study page instead, which is intended.
- **No image optimization.** Pages has no image resizing service, so export images at the sizes above and compress them (WebP/AVIF, under ~400 KB each). Videos should be short muted MP4s under ~5 MB, or YouTube embeds.
- **100 MB per file and ~1 GB per site** are GitHub's limits. Keep large videos on YouTube/Vimeo.
- **Placeholder logo.** The monogram in `src/components/shared/Logo.tsx` is a stand-in for your mark.
