# CONTINUE: Phase 3 (keep them scrolling), then Phase 2 (the info details)

> **NEXT UP: PHASE 3, "Keep them scrolling"** (set up 2026-09-30). When Aryan says "continue", "go" or "start Phase 3", do the **Phase 3 brief** below. Phase 2 (the info details, further down) waits until he asks for it.

## Phase 3 brief (read this first)

**Why:** Aryan reviewed the finished site and finds it choppy and not entertaining enough. The goal is to keep viewers scrolling: the site should feel like an interactive game and a movie.

**Authority, in this order:**
1. **`docs/build/IDEAS.md`**. Section **O (TRIAGE)** is the working decision: keep, ration, cut, and the **one-star-per-screen** rule. Section **0** holds Aryan's binding decisions. Sections A–N are the full idea lists, and O overrides them.
2. The Rules section below (branches, content and honesty, film layer).
3. `docs/build/SPEC.md`, `DESIGN.md`, `ICONS.md`, `MOTION-REPORT.md`. Where they say "native scroll only / no WebGL / no audio", IDEAS section 0 overrides them.

**Skills:** `.claude/skills/` (tracked). Use `gsap-scrolltrigger`, `gsap-react`, `gsap-performance`, `cinematic-gsap-lenis-motion-system`, `motion`, `animate`, `emil-design-eng`, `review-animations`, `design-motion-principles`, `fixing-motion-performance`, `vercel-react-view-transitions`, `frontend-design`, `impeccable` (hooks off), `better-typography`, `core-web-vitals`, `vercel-react-best-practices`, `web-design-guidelines`.

**Higgsfield:** balance 506.5 credits (2026-09-29). About 350 are approved for living loops, and sound can use the audio tools.
- Keep a reserve of at least 100.
- Video is silent; audio is separate.
- Runner-up = alt where affordable.
- Log every run in `docs/build/media/LOG.md` and a ledger.
- Generation works in cloud sessions (Aryan confirmed). If the tools are missing, build with existing media and list what is missing.

**Constraints that still hold:**
- **Reduced motion and Pause** stop ALL motion and sound.
- **The intro and the entertainment never block content.** The "Skip to the research" fast lane is always visible.
- **Page basics:** one h1, AA contrast, no hydration errors.
- **Video:** one video decoder at a time.
- **Loading:** lazy-load below the fold. WebGL is lazy, with a plain-image fallback.
- **Sound** is muted by default.
- **Mobile** gets a lighter but still moving cut.
- **Film layer:** no actor likenesses, ripped stills, official logos or ripped audio. Fonts must have web-embedding licences (log them in `docs/build/FONTS.md`).
- **Git:** work on `design/three-films`. Merge to `main` only when Aryan asks and `RELEASE=1 npm run check`, `npx eslint .` and `npm run build` pass.

### Phase 3 queue (tick each with a one-line outcome; commit and push after every step)
- [ ] **P3-0. Settle the open points with Aryan (ask once, briefly), then measure.**
  - Ask: (a) where he saw the choppiness (laptop, phone, browser); (b) whether the hero name stays in Geist or takes the Pirates face; (c) whether he wants any cut toy back as an egg (cannon, scratch-off map, visitor WANTED poster).
  - Then record a baseline with `tools/capture/motion.js`, and ask him for a real-device Chrome performance recording if he can make one.
  - If he says "just go", use these defaults: Geist name; no extra eggs; treat both laptop and phone as choppy.
- [ ] **P3-1. Spec and plan.** Turn IDEAS section O into `docs/build/PHASE3-SPEC.md`.
  - Include a beat map of the whole page: one star per screen, no dead screen over 100vh.
  - Include the list of 12 eggs (3 per world), one toy per act, and the loop list (about 25 plates).
  - Include the performance budget, the font choices with licences, and the sound list.
  - Then write `docs/build/PHASE3-PLAN.md`: tasks with file ownership, so builders can run in parallel.
- [ ] **P3-2. Foundation.**
  - Lenis + GSAP ScrollTrigger: smooth scroll, off for reduced motion and Pause, phones native unless testing says otherwise.
  - The persistent stage: sticky media behind the content, and split-screen reading sections.
  - Extend the manifest and validator with beats (warn on gaps over 100vh).
- [ ] **P3-3. Intro to hero hand-off fix** (IDEAS section J), plus the opening title sequence. Measure before and after.
- [ ] **P3-4. Typography per world** (IDEAS section I): iconic header + legible body per world. Research data stays in Geist.
- [ ] **P3-5. Every plate moves.** Depth parallax + virtual camera (code). Living loops (Higgsfield, in parallel). 3 to 4 scroll-scrubbed push-in sequences.
- [ ] **P3-6. World transitions.** The contained WebGL layer, match cuts between worlds, letterbox breathing, and the day-to-night arc.
- [ ] **P3-7. Words.** Titles arriving in character, the one-liners as subtitles, and the rationed kinetic words (caps in IDEAS O.2).
- [ ] **P3-8. Game layer.** One toy per act (drone flight and the Dead Eye target game are the two real games). The 12-egg hunt with a header counter and a 12/12 reward. Post-credits scene.
- [ ] **P3-9. Sound.** An ambient bed per world plus egg and transition effects. Muted by default, with a toggle, and tied to Pause.
- [ ] **P3-10. Director's cut autoplay, DVD chapter select, the "Skip to the research" fast lane, and the mobile cut.**
- [ ] **P3-11. Critic loop** (up to 3 rounds).
  - Capture frames and motion runs.
  - Judges: one-star-per-screen; a "would you keep scrolling?" panel; the blind stranger test; smoothness (`motion.js` before and after, plus a real device if available).
  - Fix what they find.
- [ ] **P3-12. Final QA + `docs/build/PHASE3-REPORT.md`.** Check, eslint and build pass, all widths, reduced motion, no-JS, LCP. List what Aryan should review. Do NOT merge to `main` unless he asks.

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

## Phase 2 queue — the info details (AFTER Phase 3, or whenever Aryan asks) (Aryan leads; Claude drafts options, then edits)
Tick each item here with a one-line outcome when done.
- [ ] **1. The four "why this film matters to me" lines** — `lib/film.ts` → `reasons` (`pirates`, `idiots`, `rdr2`, `hp`). Each has the current text + 2 alternates + a prompt. Aryan rewrites in his own words (1–2 sentences each).
- [ ] **2. The four act loglines** — `lib/film.ts` → `"act-1"…"act-4"` (under `aryanDraft(...)`).
- [ ] **3. The WANTED poster's reward line** — `lib/film.ts` → `copy["beyond.handbill.reward"]` (or empty to drop the row).
- [ ] **4. Review the page microcopy + captions** — every `status: "proposed"` string in `lib/film.ts` (captions `cap.*`, act titles, loaders, tips, eggs, credits) — about 110 strings. List them: `grep -n 'status: "proposed"' lib/film.ts`. Keep captions naming MOMENT • FILM.
  - *Admissions-review wording (docs/build/MOTION-REPORT.md §6):* replace "I solemnly swear that I am up to no good" (`lib/quotes.ts`, the intro's first readable line) as the first sentence a reader sees; "Killed and never retuned" (`components/sections/ledger/ledger-section.tsx`, also `lib/film.ts` gauntlet[6] / `lib/content.ts`) reads as a typo of "returned" — consider "re-tuned"; the "SCENE · FILM" captions under nearly every image read fan-wiki (captions must stay, but Aryan may want fewer / quieter ones).
- [ ] **5. Verify the 5 community-sourced quotes** in the works — `lib/quotes.ts`: Q-PC-1, Q-PC-3, Q-3I-3, Q-RD-1, Q-RD-2 (fix wording or swap; then `status: "confirmed"`).
- [ ] **6. The facts** — `lib/content.ts`: about/bio, journey steps, projects/chapters (numbers must stay honest and caveated), systems/capabilities, principles, testimonials, contact. Writing entries stay DRAFT non-links until the essays exist.
  - *Admissions-review wording (Aryan supplies the facts):* give each project a plain-English one-liner (the question and what he found) above the jargon (alpha, GEX router, VIX-basis); rewrite each project as four lines — question → method → result (incl. null results) → next step; state plainly what is his code vs library (Optuna, QuantConnect/LEAN) and what is synthetic; add a clear research-vs-real-money statement (esp. near "Trading alongside my father") if Aryan confirms which is true; clarify the kill-list header ("3 survived the full process") vs the flagships listed under it.
- [ ] **7. Résumé** — the contact section shows "Résumé • coming soon" (`components/site/contact-finale.tsx`); add the real link/PDF when Aryan has one.
  - *Admissions review:* "Résumé · coming soon" reads unfinished — hide the row until the real link exists.
- [ ] **8. Small warnings** — nav label "Trading_Algos" is 13 chars (> 12) in `lib/page.ts`; the unused `iconic-corridor` plate pair (use it or delete its entries + files).
- [ ] **9. Optional polish follow-ups** — listed in `docs/build/FINAL-REPORT.md` → "Post-M5 skills pass" (header active-section store, hall-ceiling SSR dedupe, letterbox tokens …).
- [ ] **10. Hosting** — when Aryan asks (see above).
- [ ] **11. Admissions-review LAYOUT/UX items (not done yet; each is Aryan's call)** — from `docs/build/MOTION-REPORT.md` §6: (1) land on the hero, make the HP opening opt-in ("▷ Watch the opening"); (2) shrink the Act I/II title cards + first Work image to slim bands, move the "Three films and a game" intermission before Credits or collapse it (first project at ~5–6 screens); (3) an "At a glance" strip under the hero (school/class, flagship, 2–3 activities, email — facts now only on the WANTED poster); (4) hide chart-slot placeholders, "Résumé · coming soon" and the drafts-only Writing section until real; (5) move the AI drone image off "What I can actually do" or label it an illustration; (6) WORK / hero button land on the gauntlet + first project, plus a mini table of contents inside Work; (7) kill-list as a compact table (strategy · hypothesis · killing step · date · post-mortem), survivors separate; (8) per-flagship "Results" block (hidden until real numbers), demo chart defaults to the realistic curve; (9) move "How this page is built" to Credits; (10) close the empty scroll gaps (desktop y≈6.6k–6.9k, 8k, 13.9k, 25.9k, 28k; mobile y≈33.9k); (11) mobile scroll trap on the backtest chart (`touch-none` → `touch-pan-y`); (12) check the Contact heading clipping. Remaining motion items: MOTION-REPORT §5.

## How to change things safely
1. Edit (`lib/content.ts` facts · `lib/film.ts` film copy/captions · `lib/quotes.ts` · `lib/page.ts` section order/nav · `lib/media.ts` media).
2. `npm run check` then `RELEASE=1 npm run check` (must stay green: new copy you write with Aryan is `confirmed`; anything else he hasn't approved yet may be `proposed`, which fails RELEASE until signed).
3. `npx eslint .` and `npm run build`.
4. Visual changes: `npx next start -p 3161` then `node tools/capture/scenes.js http://localhost:3161 <outDir> --only=desktop,mobile,rm` and look at the frames. If imagery changes, re-run the blind test (`tools/capture/anon.mjs` + 3 judges + `tools/capture/score.mjs`).
5. Commit, push `design/three-films`; merge to `main` when Aryan asks.

## Environment (cloud sessions)
`.claude/hooks/session-start.sh` runs `npm ci` when needed and exposes the global Playwright, so check/eslint/build and the capture tools work at once. If a Higgsfield CDN download is blocked, the host `d8j0ntlcm91z4.cloudfront.net` must be allowed in the environment's network settings.
