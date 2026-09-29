# CONTINUE: phase 2 — the info details

**If you are Claude and Aryan says "continue", "go" or similar in this repo, this file is your brief.** Read it fully before touching anything.

## Where things stand (2026-09-29)
- **The site is built and on `main`.** "One Line, Four Lights": a single-page Next.js 16 / React 19 / Tailwind v4 / motion 12 portfolio in four film-lit acts (Pirates of the Caribbean · 3 Idiots · Red Dead Redemption 2 · Harry Potter) plus the Harry Potter intro. The autonomous build (P0 → M5) is finished; its record is `docs/build/FINAL-REPORT.md` (read §6–§8) and the old brief is `docs/build/CONTINUE-BUILD.md`.
- **Everything was signed off AS-IS by Aryan on 2026-09-29** so the live site renders exactly like the branch: `film.copySignedOff: true`, `film.branchPreview: false`, the 9 drafted personal lines set to `confirmed` (their prompts + alternates kept for the rewrite), and every media plate's Check L2 countersigned (`aryan:2026-09-29`). `RELEASE=1 npm run check` passes.
- **Not hosted yet** (Aryan: "not now"). When he wants it live: connect the GitHub repo to Vercel (import → framework Next.js → deploy `main`); no config file is needed.
- Visual review of every frame: the contact sheet artifact (link in `docs/build/FINAL-REPORT.md`, "Post-M5 skills pass") and `docs/build/final-frames/index.html`.

## Rules (binding)
- **Branches:** work on `design/three-films` (or a new branch off it). `main` is the release branch: merge into it only when Aryan asks AND `RELEASE=1 npm run check`, `npx eslint .` and `npm run build` are all green. Never force-push. Commit and push after every finished step.
- **Content & honesty:** `docs/build/CONTENT-RULES.md` is absolute (no grades/GPA, attendance, family finances, hardship narratives, address/phone/family details, unverifiable claims; the Sharpe-2.0 rule; synthetic labels; caveats next to claims; writing drafts stay non-link DRAFT). **Never invent facts** — Aryan supplies them; Claude may only offer wording options built from facts already in `lib/content.ts`.
- **Film layer:** keep every scene recognizable (captions stay: MOMENT • FILM); no actor likenesses, ripped stills or official logos; the fan-tribute credit stays.
- **A11y/perf:** reduced motion + Pause stop everything; one h1; AA contrast; no hydration errors; mobile stills.
- Next 16: check `node_modules/next/dist/docs` before Next-specific code.

## Phase 2 queue — the info details (Aryan leads; Claude drafts options, then edits)
Tick each item here with a one-line outcome when done.
- [ ] **1. The four "why this film matters to me" lines** — `lib/film.ts` → `reasons` (`pirates`, `idiots`, `rdr2`, `hp`). Each has the current text + 2 alternates + a prompt. Aryan rewrites in his own words (1–2 sentences each).
- [ ] **2. The four act loglines** — `lib/film.ts` → `"act-1"…"act-4"` (under `aryanDraft(...)`).
- [ ] **3. The WANTED poster's reward line** — `lib/film.ts` → `copy["beyond.handbill.reward"]` (or empty to drop the row).
- [ ] **4. Review the page microcopy + captions** — every `status: "proposed"` string in `lib/film.ts` (captions `cap.*`, act titles, loaders, tips, eggs, credits) — about 110 strings. List them: `grep -n 'status: "proposed"' lib/film.ts`. Keep captions naming MOMENT • FILM.
- [ ] **5. Verify the 5 community-sourced quotes** in the works — `lib/quotes.ts`: Q-PC-1, Q-PC-3, Q-3I-3, Q-RD-1, Q-RD-2 (fix wording or swap; then `status: "confirmed"`).
- [ ] **6. The facts** — `lib/content.ts`: about/bio, journey steps, projects/chapters (numbers must stay honest and caveated), systems/capabilities, principles, testimonials, contact. Writing entries stay DRAFT non-links until the essays exist.
- [ ] **7. Résumé** — the contact section shows "Résumé • coming soon" (`components/site/contact-finale.tsx`); add the real link/PDF when Aryan has one.
- [ ] **8. Small warnings** — nav label "Trading_Algos" is 13 chars (> 12) in `lib/page.ts`; the unused `iconic-corridor` plate pair (use it or delete its entries + files).
- [ ] **9. Optional polish follow-ups** — listed in `docs/build/FINAL-REPORT.md` → "Post-M5 skills pass" (header active-section store, hall-ceiling SSR dedupe, letterbox tokens …).
- [ ] **10. Hosting** — when Aryan asks (see above).

## How to change things safely
1. Edit (`lib/content.ts` facts · `lib/film.ts` film copy/captions · `lib/quotes.ts` · `lib/page.ts` section order/nav · `lib/media.ts` media).
2. `npm run check` then `RELEASE=1 npm run check` (must stay green: new copy you write with Aryan is `confirmed`; anything else he hasn't approved yet may be `proposed`, which fails RELEASE until signed).
3. `npx eslint .` and `npm run build`.
4. Visual changes: `npx next start -p 3161` then `node tools/capture/scenes.js http://localhost:3161 <outDir> --only=desktop,mobile,rm` and look at the frames. If imagery changes, re-run the blind test (`tools/capture/anon.mjs` + 3 judges + `tools/capture/score.mjs`).
5. Commit, push `design/three-films`; merge to `main` when Aryan asks.

## Environment (cloud sessions)
`.claude/hooks/session-start.sh` runs `npm ci` when needed and exposes the global Playwright, so check/eslint/build and the capture tools work at once. If a Higgsfield CDN download is blocked, the host `d8j0ntlcm91z4.cloudfront.net` must be allowed in the environment's network settings.
