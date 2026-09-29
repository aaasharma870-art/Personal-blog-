> **RESUME POINT (2026-09-29, 05:30 ET, handoff from Aryan's laptop).** The local session is STOPPED, so no other executor is active and you may start immediately.
> - **Branch head:** `ad7f742` + docs.
> - **Done:** M0, M1, M1.5, and most of M2-COMBINED (all media, the integrator, all 6 section builders, assembly).
> - **Your next step:** `docs/build/AUTOPILOT.md` → **M2-COMBINED → "REMAINING" step 1**: eslint + build → blind + captioned captures → 3 blind judges + critic → fix → `M2-REPORT.md`. Then **M5 final QA** → `FINAL-REPORT.md`.
> - Everything you need is in this repo. Paths in `docs/build/*` that start with `C:/Users/aaash/Desktop/Transcript/research/build/` map to `docs/build/`.

# CONTINUE: autonomous build handoff (for any Claude Code session, local or cloud)

**If you are Claude and the user said "continue", "go" or anything similar in this repo: this file is your task.** Aryan Sharma authorized a fully autonomous build of his personal site. Finish it without asking him anything, then report.

## 0. Golden rules (non-negotiable)
- **Git:**
  - Work ONLY on branch `design/three-films`. **Never touch, merge into or push `main`. Never force-push.**
  - Before starting any step, run `git fetch origin && git pull --rebase origin design/three-films`.
  - After every finished step, commit and then `git push origin design/three-films`.
  - Commit messages end with a blank line and then `Co-Authored-By: Claude <noreply@anthropic.com>`.
- **One executor at a time.** Read `docs/build/EXECUTOR.md`.
  - If another executor's heartbeat is less than 30 minutes old, stop, and tell the user another session is active.
  - Otherwise write your own heartbeat (executor name, UTC time, current step), commit it, push it, and refresh it after each step.
- **Hard limits.** Aryan's personal blog uses real film/game iconography, **recreated by us**. Specifically:
  - No actor faces or likenesses.
  - No ripped stills, footage or official logo files.
  - The "Fan tribute — not affiliated with Warner Bros., Disney, Vinod Chopra Films or Rockstar Games" credit stays.
  - Research honesty is untouched: the Sharpe-2.0 rule, synthetic labels, caveats next to claims, and writing drafts stay non-link drafts.
  - The exclusions in `docs/build/CONTENT-RULES.md` are absolute. The root `CLAUDE.md` is private and gitignored, so it may be absent; that file is its tracked summary.
  - The one-liners stay `draft: true` for Aryan to rewrite.
- **Accessibility and performance:**
  - Reduced motion and the Pause toggle stop all motion.
  - The intro overlay never gates content.
  - No hydration errors.
  - AA contrast.
  - One `h1`, which is his name.
  - One video decoder at a time.
  - Mobile gets stills.
- **Every step must stay green:** `npm run check`, `npx eslint .` and `npm run build`.

## 1. What this project is
- **The site:** a single-page Next.js 16 / React 19 / Tailwind v4 / motion 12 portfolio called "One Line, Four Lights".
- **Structure:** four acts, each lit by one world:
  - Pirates of the Caribbean: the crossing
  - 3 Idiots: the workshop
  - Red Dead Redemption 2: the frontier
  - Harry Potter: the light, plus the opening Play intro with the broom flight
- **Driven by data:** a typed manifest drives it (`lib/page.ts` → `lib/sections.ts` / `lib/derive.ts` → `components/sections/registry.ts`).
- **Media:** `lib/media.ts` with default and alt variants.
- **Film copy:** `lib/film.ts`.

## 2. Read, in this order
0. `docs/build/CONTENT-RULES.md`: content truth, exclusions and the honesty guardrail.
1. `docs/build/AUTOPILOT.md`: **the queue, status and binding rules.** This includes Aryan's answers and the **RECOGNIZABILITY RULE**: every film scene must be blatantly obvious (blind stranger test), with a prominent film + moment caption where imagery alone can't pass, iconic accurate moments, and smooth transitions.
2. `docs/build/SPEC.md` (v2), `docs/build/DESIGN.md`, `docs/build/ICONS.md`, `docs/build/rdr2/STUDY.md`, `docs/build/MEDIA-PLAN.md` and `docs/build/bars/*.BAR.md`.
3. Reports: `docs/build/M1-REPORT.md`, `M15-REPORT.md`, `ONE-LINERS.md`, `RECOGNIZABILITY.md` and `media/M2-MEDIA-REPORT.md` (whichever exist).
4. `docs/build/workflows/*.js`: the workflow scripts used locally.
   - They hard-code Windows paths.
   - **Map `C:/Users/aaash/Desktop/Transcript/research/build/X` → `docs/build/X`, and `C:/Users/aaash/Desktop/Transcript/personal-website` → the repo root.**
   - Reuse their structure (integrator → parallel builders with disjoint file ownership → assembler → critic → fix), adapted to this environment.

## 3. Environment setup (cloud or fresh machine)
**Cloud sessions:** `.claude/hooks/session-start.sh` (SessionStart hook, `.claude/settings.json`) already runs `npm ci` when `node_modules` is stale and exports `NODE_PATH` to the global Playwright, so `npm run check`, `npx eslint .`, `npm run build` and `node tools/capture/scenes.js` work at once. The manual steps below are for a local or fresh machine.
**Next.js 16 has breaking changes:** check `node_modules/next/dist/docs` before writing Next-specific code.
```bash
npm ci
(cd tools/capture && npm init -y >/dev/null && npm i --no-save playwright@1.58)   # capture harness deps
npx playwright install --with-deps chromium   # for frame captures
```
- **Capture harness:** `tools/capture/browser.js` + `tools/capture/capture.js`. On Linux, the Windows priority and affinity calls are harmless no-ops. Use one browser at a time.
- **Staged media** is in `docs/build/media-staged/`: accepted Higgsfield outputs not yet copied to `public/media/films` and registered in `lib/media.ts`. Register them as the queue says. `npm run check` errors on any unregistered file under `public/`.
- **Higgsfield:**
  - If Higgsfield MCP tools are available in your session, you may generate the plates that `docs/build/AUTOPILOT.md` and `RECOGNIZABILITY.md` call for: default + alt each, ≥ 150-credit reserve, logged in `docs/build/media/LOG.md`.
  - If they aren't available, use existing assets plus code motifs and **prominent captions** to meet the recognizability rule, and list the missing plates in the final report.

## 4. The loop
1. Pull, then check the heartbeat (§0).
2. Open `docs/build/AUTOPILOT.md`, find the **first unchecked queue item** and read its notes. If it says running or partially done, inspect `git log` and the files on disk, and **do not redo finished work**.
3. Do the step, with parallel subagents or Workflows if available, otherwise sequentially.
   - Quality loop: build → capture frames (1440, 390, reduced motion) → a critic pass that includes the **blind stranger test** on film scenes → fix.
4. Run check, eslint and build until green.
5. Commit, tick the item in `docs/build/AUTOPILOT.md` with a one-line outcome, refresh the heartbeat, and push.
6. Repeat until the queue is empty.
7. Then write `docs/build/FINAL-REPORT.md`, covering:
   - how to run the site
   - what changed
   - credits spent
   - DRAFT items for Aryan
   - known issues
   - what needs his sign-off before `main`

   Commit and push it, then stop.

## 5. Done means
- Every queue item is ticked.
- check, eslint and build are green.
- Every film scene passes the blind stranger test, or carries an unmistakable caption.
- `FINAL-REPORT.md` is pushed.
- `main` is untouched.
