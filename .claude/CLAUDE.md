# Project instructions (tracked copy for cloud / fresh sessions)

**NEXT UP: PHASE 3, "Keep them scrolling".** The site is built and on `main` (2026-09-29). Aryan wants it smoother, more cinematic and more interactive.
- If the user says "continue", "go", "start Phase 3" or similar, read **`CONTINUE.md`** in the repo root and follow its **Phase 3 brief and queue**. The decisions are in **`docs/build/IDEAS.md`**: section O (triage) and section 0 (binding).
- Skills are in `.claude/skills/`. Use them.
- Content and honesty rules: `docs/build/CONTENT-RULES.md` (absolute). Never invent facts; Aryan supplies them.
- Work on `design/three-films`. Merge to `main` only when Aryan asks and `RELEASE=1 npm run check`, `npx eslint .` and `npm run build` pass. Never force-push.
- Ask Aryan only what `CONTINUE.md` says to ask (P3-0), or when a detail is his to decide: his words, his facts, what goes public.

**Next.js 16 note:** this project runs Next 16, which has breaking changes from older versions. Before writing Next-specific code, check the docs bundled in `node_modules/next/dist/docs` rather than relying on memory.
