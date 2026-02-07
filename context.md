# Technical Context

## Notion API Format Change (2026-02)

The `queryCollection` endpoint changed response format without notice.

- **Old**: Record entries as `{ value, role }`
- **New**: Wrapped as `{ spaceId, value: { value, role } }`

Fix: `normalizeRecordMap()` in `lib/notion-client/notion-api.ts` detects and unwraps the new format. Applied to all record map types: block, collection, collection_view, notion_user.

Detection logic: if an entry has `spaceId` at root and `value.value` exists, it's the new format.

## Cloudflare Pages Build Pipeline

Build issues resolved (2026-02):

1. **pprof native module failure** - Removed unused `@google-cloud/profiler`, `@google-cloud/trace-agent`, `agentkeepalive`
2. **async_hooks resolution** - Upgraded from `@cloudflare/next-on-pages@pre-v1` (0.10.2, deprecated) to v1
3. **Yarn 4 lockfile mismatch** - Added `"packageManager": "yarn@1.22.22"` to package.json
4. **nodejs_compat runtime error** - Added `compatibility_flags = ["nodejs_compat"]` to wrangler.toml

## Next.js 15 Upgrade (2026-02)

Upgraded from Next.js 12 to 15.1. Key migration notes:

- **ky → native fetch**: `ky@0.31` sets read-only `Request.duplex` in Next.js 15 edge runtime. Replaced with `fetch()`.
- **publicRuntimeConfig removed**: `getConfig()` returns undefined in edge runtime. Replaced with build-time `env` in next.config.js.
- **Edge runtime syntax unchanged**: Pages Router still uses `export const config = { runtime: 'experimental-edge' }`, not `export const runtime = 'edge'` (that's App Router only).
- **notion-client removed**: Was a dependency but never imported; custom `NotionAPI` class is used instead.
