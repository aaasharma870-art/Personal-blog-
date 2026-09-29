# AUTOPILOT: overnight autonomous build (set up 2026-09-28, about 19:40 ET)

Aryan authorized a fully autonomous build overnight: "finish this build fully autonomously … use Higgsfield credits as needed … do what you need to get this done."

**Read first:** `HANDOFF.md` (the state and the rules), then `build/SPEC.md` v2, `build/DESIGN.md`, `build/ICONS.md`, `build/rdr2/STUDY.md`, `build/MEDIA-PLAN.md` and `build/bars/*`.

## Tick protocol (runs each time the hourly cron fires, or when a workflow finishes)
1. **If a step is RUNNING**, refresh the off-machine backup of uncommitted work first. Use a temp index, which leaves the real index untouched:
   `GIT_INDEX_FILE=/tmp/idx.$$ ; cp .git/index $GIT_INDEX_FILE; git add -A; T=$(git write-tree); C=$(git commit-tree $T -p HEAD -m "WIP snapshot"); git push -f origin $C:refs/heads/wip/m1-snapshot`
   Then do nothing else and reply with one line: `autopilot: waiting on <run>`. A step counts as running if either is true:
   - the `running:` line below names a run whose `journal.jsonl` was modified in the last 25 minutes
   - a task notification is pending
2. **If the running step FINISHED:**
   - Read its result, or its journal if the result is unclear.
   - Commit the research docs.
   - Commit any uncommitted repo work produced by that step, after `npm run check`, `npx eslint .` and `npm run build` pass. Fix small breakages first.
   - Move the step to DONE below, with a one-line outcome.
   - Run `bash research/sync-to-repo.sh`, commit `docs/build` + `tools/capture`, then `git push origin design/three-films`.
   - Launch the NEXT step in the queue as a background Workflow and record its run id under `running:`.
   - Steps marked ∥ may launch together.
3. **If a step DIED** (usage-limit or API errors, or a journal stale for more than 25 minutes with no result):
   - Check `git status` and the files on disk.
   - Relaunch the step as a fresh, resume-safe workflow. Its prompts must say: "first inspect existing outputs/uncommitted changes; do not redo finished work; do not regenerate media that exists".
   - See memory `workflow_resume_gotchas`: don't reorder or delete agents in a script before resuming it.
4. **When the queue is empty and final QA passes:**
   - Write `build/FINAL-REPORT.md`.
   - Update `HANDOFF.md`.
   - **RESTORE Aryan's machine settings:**
     - Create `research/.stop-keep-awake` to stop the guard process.
     - `powercfg /change standby-timeout-ac 20`
     - Set Windows Update active hours back to Start 6, End 0: `Set-ItemProperty 'HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings' -Name ActiveHoursStart -Value 6`, then the same for `ActiveHoursEnd -Value 0`.
   - `CronDelete` the autopilot job.
   - Stop.

## Hard rules (every step)
- **Git:**
  - Work only on branch `design/three-films` in `Desktop/Transcript/personal-website`.
  - **Never push, never merge to `main`, never force anything.**
  - Never commit `.claude/`, `skills-lock.json`, research docs or ripped film/game assets.
  - Commit messages end with a blank line and then `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Parallel builders:** at most 3 at once, with disjoint file ownership. Builders don't commit; an assembler or integrator commits. Only one `next build` at a time.
- **Browser and CPU limits:**
  - One browser at a time, via `research/browser.js` only.
  - `ffmpeg -threads 2`.
  - Keep the CPU watchdog running during capture-heavy steps.
- **Higgsfield:**
  - Approved as needed. Keep a reserve of ≥ 150 credits.
  - Small batches; draft before final; silent video.
  - Log every run in `build/media/LOG.md` and `LEDGER.md`.
- **Legal and honesty:** these are Claude's hard limits, from SPEC v2 §15.
  - No actor likenesses.
  - No ripped stills, footage or official logo files in the repo; recreate them instead.
  - Include the "Fan tribute — not affiliated with Warner Bros., Disney, Vinod Chopra Films or Rockstar Games" credit.
  - Research honesty is untouched: Sharpe-2.0 rule, synthetic labels, caveats kept next to claims, drafts are not links, and the CLAUDE.md §2 exclusions.
  - Any "why this matters to me" line stays DRAFT unless Aryan supplied it (see "Aryan's answers" below).
- **Accessibility and performance:**
  - Reduced motion and the Pause toggle stop all motion.
  - The intro overlay never gates content.
  - No hydration errors.
  - AA contrast.
  - LCP ≤ 2.5 s (mobile lab).
  - One video decoder at a time; mobile gets stills.
- **Every signature section also ships a DEFAULT and an ALT animation variant** (M1.5 system).
- **Quality loop for every section batch:** build, then capture 1440/390/reduced-motion frames, then 1 critic pass against the bars, then 1 fix round. The final pass allows 2 rounds.

## Queue
- [x] **P0:** manifest foundation (`bcff748`)
- [x] **P1-early:** tokens and primitives (`d64bf51`)
- [x] **Media 1:** hero sea, play screen, broom flight, hero loop. Spent 204.5 credits; balance 995.5.
- [x] **M1:** DONE 2026-09-29, head `37161bb`, pushed. Check, eslint and build all pass. Report: `build/M1-REPORT.md`; frames: `build/m1-frames/after/index.html`.
  - Was: integrator → 3 builders (intro overlay, hero + act cards + 4 world loaders, four-world skins across sections, header compass, credits) → assembler → critic → fix → `build/M1-REPORT.md`
  - (finished) `wf_d23a37dd-da1`, script `build/m1-build.js`, scratchpad copy `…/scratchpad/m1-build.js`
- [x] **M1.5: variants system.** DONE at 03:25, head `492f120`, check/eslint/build all pass. Its critic and fix stages were skipped for speed and fold into M2-COMBINED's review. (finished) `wf_006858e5-221`, script `build/m15-variants.js`. Runs right after M1, before M2-A and M2-B.
  - Add media `variants` and the per-section `variant` field.
  - Add `?variant=alt` and `/lab/variants`.
  - Add alternates to everything M1 built: the intro flight video alt, an intro landing alt, the hero loop alt, an act-card choreography alt per world, and a loader alt per world.
  - Write the one-liners (see "Aryan's answers").
  - Then commit and push.
- [x] **M2-media ∥:** DONE at about 00:55. All assets have a default and an alt, STAGED in `build/media/accepted` (report: `build/media/M2-MEDIA-REPORT.md`, ledgers `LEDGER-laneA.md` and `LEDGER-laneB.md`). Spent 321 credits; balance 674.5. Flags for Aryan are in the report. The M1.5 alts for MV-02 and MV-03 were rejected, and passing replacements `*-alt2.*` are staged; M3 decides whether to swap them. (finished) `wf_31e15ab2-fef`, script `build/m2-media.js`. Output is STAGED in `build/media/accepted` ONLY, because `npm run check` errors on unregistered public files. **M3 must copy the staged files into `public/media/films` and register them in `lib/media.ts`.** (every asset keeps a default AND an alt, runner-up first) every remaining MEDIA-PLAN asset in plan order, including the RDR2 world plates, act-card and scene media, the films/game chapter reels, and the writing covers. Accepted files go to `public/media/films/`, registered in `lib/media.ts` with provenance. Cap it so the reserve stays ≥ 150.
- [ ] **M2-COMBINED** (for speed; replaces M2-R + M2-A + M2-B + M3 + M4). **running: `wf_b15d4c6e-f32`**, launched 03:30.
  - **Launch:** `Workflow({scriptPath: "C:\Users\aaash\Desktop\Transcript\research\build\m2-combined.js"})`. In the cloud, use the copy in `docs/build/workflows/m2-combined.js` with the paths mapped.
  - **Stages:**
    1. Blind audit, while the iconic media lane runs (PEARL, HALL, EXPRESS, ICE, DRONE, CAMP, WANTED, DEADEYE; default + alt; cap 330).
    2. Plan, then `RECOGNIZABILITY.md`.
    3. The integrator registers ALL staged media, enables the chapter, experiment, ledger and films sections, and adds the captions.
    4. **6 parallel builders**: act cards + transitions · Act I Pirates (SM-4 voyage) · Act II 3 Idiots (SM-6/7/8/17) · Act III RDR2 (SM-11/15/16 + WANTED) · Act IV HP + films chapter (SM-9/12) · loaders + eggs + chrome.
    5. Assembler.
    6. Blind re-test ×3 + critic.
    7. Fix, then `build/M2-REPORT.md`.
- [ ] **M5: final QA.**
  - A final blind stranger test on every scene; check, eslint and build pass.
  - Anchors and links work; no overflow at 320/390/1024/1440; reduced motion, no-JS and media-blocked modes all work; LCP lab; legal and honesty audit; zero hydration errors.
  - Final contact sheet `build/final-frames/index.html`, plus `build/FINAL-REPORT.md`.
  - Then restore the machine settings, CronDelete, and stop.
- (superseded for speed: M2-R, M2-A, M2-B, M3 and M4 are all folded into M2-COMBINED.)

## Aryan's answers (given 2026-09-28, about 19:45, before bed) — BINDING
- **PUSH AS BACKUP: YES.**
  - After every finished and committed step, run `git push origin design/three-films`.
  - The first push is already done at `d64bf51`.
  - Never push `main`. Never force-push.
- **TWO VERSIONS OF EVERY ANIMATION AND VIDEO: a DEFAULT and an ALTERNATE.** Build this as data:
  - `lib/media.ts` gets `variants: { default: MediaId, alt?: MediaId }`, or an `alt` field per asset.
  - Every signature or code animation component takes `variant: 'default' | 'alt'`, set per section in `lib/page.ts`, with a global default in `lib/film.ts`.
  - `?variant=alt` previews every alternate at once.
  - Add a `/lab/variants` page that shows each default and alternate side by side.
  - **Videos:**
    - Use the runner-up from each generation batch as the alternate, which costs no extra credits.
    - Flight: default `c3f279c6`, alt `9503416d` (in `masters/IN-02/web-alt/`).
    - Hero loop: runner-up from `masters/MV-03`.
    - Stills: the second candidate of each `count 2` batch.
    - Only generate an extra run where no runner-up exists and the reserve stays ≥ 150.
  - **Code animations** (intro flight/landing, act cards, loaders, hero aperture, signature moments): the alt must be a meaningfully different choreography, not a tweak. Example: the intro's alternate landing is the dome exit or a Marauder's-Map ink-wipe, where the default is the mask sweep.
- **ONE-LINERS: write them.** Aryan wants emotionally impactful "why this film/game matters to me" lines for Harry Potter, Pirates, 3 Idiots and RDR2 that **he will personally rewrite**.
  - Write short, genuinely moving lines tied to his REAL story from `content.ts`: killing his own ideas, curiosity, the voyage from Pine Script to a pipeline, honesty with data, and life beyond the screen.
  - Do NOT invent specific life events: no "my grandfather read it to me", no "I watched it at age 7".
  - Render them on the site normally, with no visible DRAFT badge.
  - Keep `draft: true` on them in `content.ts`, and list them in `FINAL-REPORT.md` as "Aryan to personalize before merging to main".
- Class year / "high-school junior": keep the existing site wording.
- **RECOGNIZABILITY RULE** (Aryan, 2026-09-29 about 03:10). This is binding and outranks subtlety and taste restraint.
  - Aryan's words: "the scenes for each movie need to be blatantly obvious for anyone to figure out, and if not, something in the text or something else clarifying the meaning or what it is; smooth transitions between all of them; scenes should be accurate, iconic and easy to pick up on if not explained."
  - **(a) STRANGER TEST.** Every film-world scene (act card, world section plate, films-chapter screen, loader) must be identifiable as its film within about 3 s by someone who knows the film. Critics check this blind, from uncaptioned frames.
  - **(b) Clarifying text where imagery alone can't pass.** Name the film AND the moment in visible HTML text, for example "THE GREAT HALL • HARRY POTTER" or "ALL IZZ WELL • 3 IDIOTS". Set it in that world's display font (the fan font) and make it prominent, not a whisper. Every act card must show the film title prominently.
  - **(c) Accurate, iconic moments** (per `build/ICONS.md`):
    - **HP:** Hogwarts, Great Hall floating candles, Marauder's Map footprints, Hogwarts Express, the letter with wax seal, golden snitch, lightning bolt, Platform 9¾, Lumos.
    - **Pirates:** the Black Pearl close with tattered black sails, Jack's compass, Jolly Roger, treasure chest / Aztec gold, the kraken, "Savvy?"
    - **3 Idiots:** the ICE college corridors and chalkboard, "All Izz Well" (hand on heart), Rancho's homemade drone, the scooter, the machine definition, the Virus's stopwatch/chair.
    - **RDR2:** WANTED poster, camp with campfire + horses + tents, Dead Eye red with X marks, Arthur's journal with sketches, cowboy hat, satchel, the Heartlands at golden hour, the train.
    - Still no actor faces or likenesses, and no ripped stills. Everything is recreated or generated.
  - **(d) SMOOTH TRANSITIONS between every world pair.** No hard cuts. Act cards cross-dissolve or morph from the outgoing world into the incoming one.

## Log
- 19:40: autopilot armed. M1 running. Cron job 8f398485 (hourly :07, session-only, 7-day expiry). Keep-awake task btu6t3dvm (SetThreadExecutionState; stop it at the end). CPU watchdog bw2fdp95w.
- 22:32: keep-awake and CPU-watchdog tasks had died, most likely when usage ran out. Relaunched as a DETACHED guard process: `research/keep-awake.ps1`, pid 40192, logging to `keep-awake.log`, 36 h max, stopped by the `.stop-keep-awake` file. AC sleep set to never (was 20 min; Battery Guard only enforces DC values). Windows Update active hours moved to 20:00–14:00 (was 6:00–0:00), so updates can't auto-restart overnight. All three are RESTORED at the end (Tick protocol step 4).
- 22:38: one-shot 3 AM reset kickoff cron ec6eb4ca (03:02, 2026-09-29) added alongside the hourly tick 8f398485. The full in-progress M1 snapshot (83 files, tracked and untracked) is pushed to origin `wip/m1-snapshot`; every waiting tick refreshes it.
- ~00:00: M1 finished and was verified (check, eslint and build pass) and pushed. Launched M1.5 (variants, the one-liners, copy visible on the branch) and M2-media (lanes A and B, default + alt, staged only). M2-A launches after M1.5, because both touch `lib/page.ts` and the section files.
- ~00:55: M2-media finished. M2-A and M3 wait for M1.5, because they share `lib/page.ts`, `lib/media.ts` and the section files.
- 03:01 (after the usage reset): M1.5's integrator and both builders are DONE. The assembler committed 478411e ('every ALT + /lab/variants') and was re-spawned by the workflow after the limit; it is running again. The guard is alive. Pushed the branch and the WIP backup.
- ~03:15: Aryan added the RECOGNIZABILITY RULE: blatantly obvious scenes, clarifying text, iconic, smooth transitions. Added step M2-R (script `build/m2r-recognizability.js`): blind stranger-test audit → iconic plates → captions and transitions → blind re-test. M2-A, M2-B and M4 must also meet the rule.
- 03:20: SPEED + CLOUD HANDOFF. The queue is collapsed into M2-COMBINED (6 parallel builders), then M5. `CONTINUE.md`, a `CLAUDE.md` banner, `docs/build/` (synced by `research/sync-to-repo.sh`) and `tools/capture/` now live in the repo, so a claude.ai/code session on branch `design/three-films` continues with just 'continue'. Heartbeat: `docs/build/EXECUTOR.md`. Local ticks run `git fetch` first, and yield if another executor's heartbeat is less than 30 minutes old.
- 03:30: M1.5 DONE (`492f120`, green). Cloud handoff committed and pushed (`6c893c1`): CONTINUE.md, `.claude/CLAUDE.md` (tracked, auto-loaded; the root CLAUDE.md is gitignored), `docs/build/CONTENT-RULES.md`, the docs, workflows, 51 staged media assets and `tools/capture`. M2-COMBINED is running as `wf_b15d4c6e-f32`.
