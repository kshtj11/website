# Structure, sizing & motion

Reference for designing in Figma and editing code. Values are the ones the code uses.

## Page hierarchy

```
/                         Work tab
/play/                    Play tab (sidebar + sectioned masonry, see below)
/about/                   About tab
/work/<slug>/             Work case study (full page)
/play/<slug>/             Play case study (full page)
```

Every tab page uses the same shell (`src/components/layout/TabPage.tsx`):

```
PageHeader        Work: नमस्कार intro · Play/About: page title (heroTitle) · line under it (empty keeps its space)
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

## Type scale (Hanken Grotesk + Hind)

Hanken Grotesk sets all Latin text; Hind sets Devanagari (the browser switches per character).
Each Figma text style has a matching class in `app/globals.css` — use the class, not loose size/weight utilities.

| Figma style | Class | Font / weight | Size / line-height |
| --- | --- | --- | --- |
| Display/Intro | `t-intro` | Hanken ExtraBold | 48 / 1.2 (36 mobile) |
| Display/Intro Devanagari | `t-intro-deva` | Hind Bold, brand gradient | 48 / 1.2 (36 mobile) |
| Display/Title | `t-title` | Hanken SemiBold | 36 / 1.2 |
| Heading/Section | `t-section` | Hanken SemiBold | 30 / 1.25 |
| Heading/Block | `t-block` | Hanken SemiBold | 24 / 1.35 |
| Body/Hero | `t-hero` | Hanken Regular | 18 / 1.5 (16 mobile) |
| Body/Tab | `t-tab` | Hanken Medium | 18 / 1.4 |
| Body/Default | `t-body` | Hanken Regular | 16 / 1.6 |
| Body/Card | `t-card` | Hanken Regular | 16 / 1.4 |
| Body/Label | `t-label` | Hanken Medium | 16 / 1.4 |
| Body/Strong | `t-strong` | Hanken SemiBold | 16 / 1.4 |
| Caption | `t-caption` | Hanken Regular | 14 / 1.4 |
| Micro | `t-micro` | Hanken Medium, +4% tracking | 12 / 1.4 |

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

- Brand: rose `#DA356C` → magenta `#CF3283` → violet `#9C1EAA` (the intro gradient). Header is plain white.
- Accent: magenta `#CF3283`, hover rose `#DA356C` (links, primary button, active sidebar item, text selection). Titles `#252525`.
- Neutrals: Tailwind zinc. Hairlines are zinc-100 `#f4f4f5`, placeholders zinc-200 `#e4e4e7`.

## Motion

Everything is CSS transitions/keyframes plus a few small observers. **No animation library is used.**

| Effect | Where | Timing |
| --- | --- | --- |
| Hero line entrance | `.hero-copy` | rise 12px + fade, 360ms |
| Card entrance | `.project-card` | rise 12px + fade, 450ms, +60ms per row (max 300ms) |
| Card hover | media `scale(0.99)`, caption rises 8px + fades in | 300ms ease-out |
| Tab indicator | glass pill glides to the new tab, **then** the page changes | 300ms ease-out |
| Scroll reveal | `<ScrollReveal>`: slide 20px/500ms · fade 12px/300ms | fires once at viewport edge |
| Media load | colour quadtree (QuadtreeLoader): big squares → small, 160ms eased crossfade per level, then 500ms fade to the image; cached images skip it; shimmer only when an image has no quadtree | |
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

## Play page (same hierarchy as the reference's Art page)

```
Group     sidebar heading            "Experiments"   (expands while one of its sections is on screen)
  Section   sidebar child + gallery  "Tiles Tool 9"  (count = number of pieces; active = blue)
    Piece   image + caption          opens a lightbox on click (‹ › / ← → / swipe step through the section; 80dvh tall, scales with the screen)
```

- Defined in `src/content/play.ts`. A group with one same-named section shows as a single sidebar item ("Sketchbook").
- Layout: 202px sticky sidebar + 16px gap + content column; sections 48px apart; header → gallery 12px.
- Gallery: 3-column CSS masonry at ≥1024px (16px gutters), 2-column grid below. The sidebar is hidden under 1024px.
- Section headers: `plain` (inset label) or `ruled` (label + hairline), with an optional right-aligned action link (e.g. "Case study ↗" → `/play/<slug>/`).
- Scroll-spy: a section becomes active when its top passes 250px from the top of the window.

## Figma

Design file: https://www.figma.com/design/npYpF5sdmcdMv1Ht3xl8zU — pages: Read me · Foundations (live variables/styles) · Components · Desktop 1440 · Mobile 375. Every component has a note naming the code file it maps to.
