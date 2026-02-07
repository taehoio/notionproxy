# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Notion-based personal website (taeho.io) running on Cloudflare Pages with Next.js 15. Content is fetched from Notion's unofficial API v3 at request time (SSR) and rendered with react-notion-x.

## Commands

```bash
yarn dev              # Local dev server (port 3000)
yarn build            # Next.js build
yarn build:cloudflare # Cloudflare Pages build (npx @cloudflare/next-on-pages@1)
yarn lint             # ESLint
yarn format           # ESLint --fix

# Unit tests (ava) - hit live Notion API, can be slow/flaky
npx ava lib/notion-client/notion-api-universal.test.ts

# E2E tests (Playwright) - requires dev server running on port 3000
npx playwright test
npx playwright test tests/taehoio.spec.ts  # single test file
```

## Architecture

**Data flow**: Notion API v3 (unofficial) -> `getServerSideProps` (edge SSR) -> `react-notion-x` renderer

- Every page uses `experimental-edge` runtime and SSR via `getServerSideProps` (not static generation).
- `lib/notion-client/notion-api.ts` — Custom `NotionAPI` class that calls Notion's internal API (`/api/v3/loadPageChunk`, `queryCollection`, etc.) using native `fetch()`. This is the core of the app.
- `lib/notion-client/notion-api-universal.ts` — Re-exports `NotionAPI` from `notion-api.ts`. The `index.ts` exports from this file; `browser.ts` exports directly from `notion-api.ts`. Both are valid entry points.
- `lib/notionproxy.ts` — Site config: root Notion page ID, GA tracking, page metadata extraction (`getPageInfo`).
- `pages/index.tsx` — Homepage. Fetches the root Notion page.
- `pages/pages/[pageId].tsx` — Dynamic route for all sub-pages. Includes code syntax highlighting (Prism) and Utterances comments.
- `components/UtterancesComments.tsx` — Blog comment widget (GitHub-backed).

**Thumbnails**: `next.config.js` scans `public/images/thumbnails/pages/` at build time and injects matching page IDs as `PAGE_IDS_THAT_HAVE_THUMBNAIL` env var for OG image support.

## Key Constraints

- **Pages Router only** — uses `export const config = { runtime: 'experimental-edge' }`, not App Router's `export const runtime = 'edge'`.
- **No `publicRuntimeConfig`** — doesn't work in Next.js 15 edge runtime. Use `env` in `next.config.js` instead.
- **Yarn 1.22.22** — pinned via `packageManager` in package.json. Cloudflare auto-detects Yarn 4 without this.
- **`nodejs_compat` flag** — required in `wrangler.toml` for Cloudflare Pages.
- **`normalizeRecordMap()`** — Notion's `queryCollection` endpoint wraps responses in `{ spaceId, value: { value, role } }` instead of `{ value, role }`. This function unwraps it. If Notion changes the format again, this is where to look.

## Additional Context

See `context.md` for detailed technical context on the Notion API format change, Cloudflare build pipeline fixes, and Next.js 15 migration notes.
