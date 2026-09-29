# Project instructions (tracked copy for cloud / fresh sessions)

**PHASE 2 — THE INFO DETAILS.** The site is built, signed off as-is and merged to `main` (2026-09-29).
- If the user says "continue", "go" or similar, read **`CONTINUE.md`** in the repo root and follow it.
- Content and honesty rules: `docs/build/CONTENT-RULES.md` (absolute). Never invent facts; Aryan supplies them.
- Work on `design/three-films`; merge to `main` only when Aryan asks and `RELEASE=1 npm run check`, `npx eslint .` and `npm run build` pass. Never force-push.
- Ask Aryan when a detail is his to decide (his words, his facts, what goes public).

**Next.js 16 note:** this project runs Next 16, which has breaking changes from older versions. Before writing Next-specific code, check the docs bundled in `node_modules/next/dist/docs` rather than relying on memory.
