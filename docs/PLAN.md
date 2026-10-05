# Portfolio plan — what to design next

Live: https://kshtj.in · Figma: https://www.figma.com/design/npYpF5sdmcdMv1Ht3xl8zU (same plan on the **🗺 Plan** page)

**How a task gets done:** you design in Figma (or drop files in `media-src/`) → send me the frame link / say what's in the folder → I code it, check it locally, and push when you say so.
Legend: **You** = needs your design, files or words · **Me** = I build it.

---

## Status today (Oct 2026)

| Page | State |
|---|---|
| Work grid | Live. 5 projects; covers for Old Man only (Ek-Time cover in progress) |
| Ek-Time | Live: 46-slide Behance stack. Placeholder description, facts, Behance link |
| The Old Man and the Sea | Live: 23 images + 6 GIFs, cover, "Click to play" chip. Placeholder facts + Behance link |
| Mecha, P1 AI Literature Review | Template only (placeholder blocks) |
| Lenskart | Placeholder (no exports yet) |
| Play | Tiles Mosaic Tool live (10 pieces + full case study); Fractal Visualizer, Photography, Fun are placeholders |
| About | Template only |

---

## Phase 0 — Make it yours (decide before visual design)

Maps of how the site works: FigJam **kshtj.in — Maps** (information map, visitor flows, content → live site, component tree, data model): https://www.figma.com/board/Nthc5bZxXjRFQHj1mpBgm3

What's still borrowed from the reference: the Work / Art / About pill tabs with the gliding glass indicator, the 2-column card grid with the title pill on the image, popup → expand, the 4-column footer with live clock + scrambling changelog, the Art-style sidebar + masonry, Figtree + the zinc palette, squircle radii, and the fade-up timings. The skeleton is fine to keep; these are the *signatures* to replace.

- [ ] **0.1 Pick one concept that only you could have** — You
  - [ ] Candidate: **glazed tiles / mosaic** as the site's DNA (your own tool makes the assets): covers and the logo built from your tiles, a tile-grid layout, tiles assembling on load instead of fade-up
  - [ ] Candidate: **bilingual** Devanagari + English voice (you already open with नमस्कार): labels, greetings, dates
  - [ ] Write it as one sentence ("a portfolio that ___") and test every page against it
- [ ] **0.2 Change the structure, not just the skin** — You (design) + Me (build)
  - [ ] Navigation: replace the 3 glass pills (e.g. wordmark + text links, a tile nav, or one scrolling index)
  - [ ] Work home: replace the uniform 2-up grid (e.g. editorial list with hover previews, or a mosaic with big/small tiles)
  - [ ] Play: keep the sidebar idea or swap it (filter chips by medium, or a single canvas)
  - [ ] Case studies: invent 1–2 block types of your own (before/after slider, process strip, live tool embed)
  - [ ] About: a semester/project timeline instead of a résumé list
- [ ] **0.3 Swap her signature details** — You + Me
  - [ ] Footer: drop the live clock + changelog scramble; add something yours (rotating greeting, "currently in…", a tile counter)
  - [ ] Type: Hanken Grotesk + Hind everywhere (drop Figtree)
  - [ ] Colour: use the rose→violet gradient boldly; consider a warm ceramic off-white instead of pure white
  - [ ] Motion: one signature move of your own (tile flip / assemble) instead of fade-up
- [ ] **0.4 Voice** — You
  - [ ] Write like your IG posts (casual, honest, ":>"), not portfolio-speak

## Phase 1 — Identity (do first: it touches every page)

- [ ] **1. Logo / mark** — You
  - [ ] Explore 3–5 directions (monogram, नमस्कार, a tile motif…)
  - [ ] Final mark inside the 🧩 Logo component at 44 × 44; check it still reads at 28 px
  - [ ] Favicon versions at 32 and 16 px
  - [ ] Export SVG → send · Me: swap into `Logo.tsx` + favicon
- [ ] **2. Type pairing** — You + Me
  - [ ] Decide: keep Figtree for body, or move body/UI to Hanken Grotesk to match the intro
  - [ ] If changing, update the 🎨 Foundations text styles · Me: swap fonts sitewide
- [ ] **3. Hero lines** — You
  - [ ] One line each for Work, Play, About (≤ 2 lines at 375 px)
- [ ] **4. Share image** — You
  - [ ] 1200 × 630 image for link previews (WhatsApp, LinkedIn, X) · Me: wire into metadata

## Phase 2 — Work (what recruiters see first)

- [ ] **5. Covers for every project** — You (1920 × 1041, drop as `cover.png` in `media-src/projects/<slug>/`)
  - [ ] Mecha · [ ] P1 AI Literature Review · [ ] Ek-Time (in progress) · [ ] Lenskart · [x] Old Man
- [ ] **6. Mecha case study** — You (content) + Me (build)
  - [ ] Check what's shareable (NDA) with Mecha
  - [ ] Facts: timeline, role, team, tools
  - [ ] Write: overview → problem → research → process → solution → outcome → learnings
  - [ ] Collect screens/flows; lay the page out with blocks on the Case study screen in Figma
- [ ] **7. P1 — AI Literature Review Tool** — same subtasks as Mecha
- [ ] **8. Ek-Time** — You
  - [ ] One-line description, facts (timeline, role, team, tools), Behance URL, cover
- [ ] **9. Lenskart** — You
  - [ ] Export Behance slices → `media-src/projects/lenskart/` (01.png, 02.png…), cover, facts, Behance URL
- [ ] **10. The Old Man and the Sea** — You
  - [ ] Description, facts, Behance URL; decide if "The End" slide comes back
- [ ] **11. Order & featured** — You
  - [ ] Pick the first 4 (they get the title pill) and the order

## Phase 3 — Play

- [ ] **12. Tiles Mosaic Tool** — You + Me
  - [ ] Compress the pigeon video under ~20 MB (or let me do it) · Me: add with its caption
  - [ ] Check my image captions; correct any
- [ ] **13. Fractal Visualizer** — You
  - [ ] Screenshots/GIFs → `media-src/experiments/fractal visualizer/`
  - [ ] Short write-up + live link (Me: optional live embed in the case study)
- [ ] **14. Photography** — You
  - [ ] Choose series + names; 6–12 photos each, ~1600 px on the long edge
- [ ] **15. Fun** — You
  - [ ] Doodles / odds and ends — or drop the section

## Phase 4 — About & contact

- [ ] **16. About page** — You
  - [ ] Photo (4 : 5, 800 × 1000), greeting, facts line, 3 bio paragraphs
  - [ ] Experience list (role, org, years, one line each)
  - [ ] Optional sections: education, awards, skills, "now"
- [ ] **17. Contact** — You
  - [ ] Real email (or set up hello@kshtj.in), Behance + LinkedIn URLs
  - [ ] Résumé PDF? (Me: add a link in the footer/About)

## Phase 5 — Polish & launch

- [ ] **18. Mobile pass** — You: check every 📱 screen once real content is in · Me: fix wrapping/crops
- [ ] **19. 404 page** — You: design a fun one (optional)
- [ ] **20. Alt text & captions** — You: confirm image descriptions · Me: apply
- [ ] **21. Performance check** — Me: audit heavy files after content lands (images > 1 MB, GIFs, video)
- [ ] **22. Page titles & descriptions** — Me: per-page SEO text from your copy

---

## Dropping files (the pipeline)

| Put files in | Becomes |
|---|---|
| `media-src/projects/<project>/01.png, 02.png…` | Behance-style stack in the popup + case study |
| `media-src/projects/<project>/cover.png` | Card cover |
| `media-src/experiments/<experiment>/…` | Play pieces / case-study images |

- PNG/JPG → full-resolution, high-quality WebP. GIFs < 8 MB copied untouched; GIFs > 8 MB → animated WebP. Every GIF also gets a light card copy for the Play grid.
- Run `npm run images` (or restart the dev server). Originals never go to GitHub.
- Limit: 100 MB per file on GitHub — compress video first.
