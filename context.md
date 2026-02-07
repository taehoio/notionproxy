# Technical Context

## Notion API Format Change (2025-02)

The `queryCollection` endpoint changed response format without notice.

- **Old**: Record entries as `{ value, role }`
- **New**: Wrapped as `{ spaceId, value: { value, role } }`

Fix: `normalizeRecordMap()` in `lib/notion-client/notion-api.ts` detects and unwraps the new format. Applied to all record map types: block, collection, collection_view, notion_user.

Detection logic: if an entry has `spaceId` at root and `value.value` exists, it's the new format.

## Cloudflare Pages Build Pipeline

Build issues resolved (2025-02):

1. **pprof native module failure** - Removed unused `@google-cloud/profiler`, `@google-cloud/trace-agent`, `agentkeepalive`
2. **async_hooks resolution** - Upgraded from `@cloudflare/next-on-pages@pre-v1` (0.10.2, deprecated) to v1 (1.13.16)
3. **Yarn 4 lockfile mismatch** - Added `"packageManager": "yarn@1.22.22"` to package.json
4. **nodejs_compat runtime error** - Added `compatibility_flags = ["nodejs_compat"]` to wrangler.toml

## Pending Cleanup

- `server-preload.js` still references removed Google Cloud packages (only affects dev/start scripts, not edge runtime)
