# website

Personal portfolio, served at **https://kshtj.in**. Built with Next.js (static export), React, TypeScript and Tailwind CSS v4, and hosted on GitHub Pages.

The layout, spacing, and motion system are adapted from [michelletliu/michelle-liu](https://github.com/michelletliu/michelle-liu) (MIT-licensed code). None of that site's content, images, or branding marks are used here.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3001
npm run build      # writes the static site to out/
```

## Editing content

You never need to touch components to change content. Everything lives in `src/content/`:

| File | What it controls |
| --- | --- |
| `src/content/site.ts` | Name, email, city/timezone (footer clock), social links, tab order |
| `src/content/pages.tsx` | Hero line under your name on each tab, About page bio + experience |
| `src/content/projects.ts` | Every project: grid order, card text, case-study blocks |
| `app/globals.css` (top) | Brand tokens: gradient stops, accent color, neutral ramp |

Images go in `public/projects/<slug>/` and are referenced as `"/projects/<slug>/cover.jpg"`.
Anything without an image renders as a labelled shimmer placeholder at the correct size.

See [docs/STRUCTURE.md](docs/STRUCTURE.md) for the layout hierarchy, sizing rules and animation reference.

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages. The live site updates about 1–2 minutes later.
