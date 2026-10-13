# J9 HONEST · round 2 · honesty + accessibility

Build `dedd0f1` (`.next` BUILD_ID `8TgM2gqGAwJt5j9Q22vFG`) · 2026-10-04 · judged from R/ captures and reports, plus one read of the served HTML (see the end).

**Score: 4 / 5.** No rule is red: all 14 are green with evidence. **RELEASE fails only on the owner's items** (40 Check L2 countersignatures, 5 TTS approvals, 1 unsigned-copy error listing 104 strings). The two medium findings are a reload reflow for reduced-motion and paused users (a regression from round 1) and a kill-list headline that overclaims.

## RELEASE

`R/honest/release.txt` exits 1 with 46 errors:
- 40 × "Check L2 awaits Aryan's countersignature" (L01–L23 and their posters, SEQ-HALL, SEQ-HALL-end).
- 5 × TTS rows in SOUNDS.md, "to confirm" / "to approve" (lumos, mischief, nox, parley, solemn).
- 1 × "[P3 #10] unsigned copy". It lists 104 strings (counted: 104), all wired into the page, each to be signed by Aryan in `lib/film.ts`.

There is no other error. `npm run check` exits 0 with 66 warnings. Not in my inputs: `npx eslint .` and `npm run build`, which the merge gate also needs.

## Rules

| rule | status | evidence (short) |
|---|---|---|
| Never invent facts; new copy proposed + unsigned | green | Both round-2 strings (`copy.films.play`, `copy.egg.hunt.chip.word`) are in the unsigned list. Every claim in films.play matches the page: 12 eggs, chip at top right, drone in Systems (stop 34), Dead Eye in the kill-list (stop 35), and both links work. No banned words. Provenance of a few other lines is to confirm (F8). |
| Sharpe / PSR / PF never animated | green | The figures are static in RM frames, default frames and reader frames f01410–f01423. The B29 lens changes row emphasis, not digits. No probe measures this; judged from frames. |
| Research data in Geist | green | research-font: 246 / 246 / 244 checked, 0 offenders (1440, 1024, RM). |
| Caveats adjacent; synthetic labelled | green | Volatility Breakout caveat and EXCEPTION tag; standing rule beside the figures; Experiment "SYNTHETIC · ILLUSTRATIVE"; "Run 12 illustrative hypotheses"; Option Alpha summary "not a proven edge". Watch items: F2, F6. |
| Drafts: visible DRAFT, not links | green | "ENTRY I–IV · … · DRAFT"; the Tab walk has no link in #writing (only the bone egg). |
| Reduced motion stops all motion + sound | green | qa: 0 animations and 0 videos in 11 sections; decoder maxPlaying 0; sound disabled, 0 made; GL off; spotlight not loaded; motion rm 59.7 / 59.8 fps, CLS 0, 0 pops. Gap: qa samples 11 of 20 sections. |
| Pause stops all motion + sound | green | qa Pause 0/0; Lenis gone in 3 / 5 ms; sound off in 4 ms and the toggle disabled; pauseMid shift 0; words, drone, hunt, toys and dc pause checks all pass. |
| One h1 | green | qa, scenes (default / alt / rm) and font-network all report 1. |
| AA contrast | green | aa-scrim: 0 failures. Worst live sample 3.78 is large display text (5.11 under RM). Static tightest cell 4.65. Frames are readable. Notes: F7. |
| No hydration errors | green | qa and scenes: hydration [] and 0 console errors outside the media-blocked context. The only probe console line is the expected 404 from off.404. |
| Intro never gates; "Skip to the research" always visible | green | The pill appears in every frame (intro, hero, sections, RM, no-JS). fastlane: overlaySeen, not covered, lands on #work. reach stop 3; jump focuses h2#work-title; works during the cut. Nit: F9. |
| No-JS shows every section | green | In the served HTML, 19 sections are streamed in `div[hidden][id^="S:"]` and un-hidden by a `<noscript><style>` rule. The Gauntlet has its own noscript list. qa no-JS: h1 1, no hidden text. The qa evidence itself is weak (F4). |
| Sound muted by default | green | pressed false, 0 sounds made, 0 audio requests; files load only after unmute; RM disabled. |
| Keyboard operable | green | 73 stops (70 under RM), none off-view or covered. Every operation passes and all 12 eggs count by keyboard. Focus returns to a link after palette → Map → Esc. op.compass is probe drift; Enter on the real toy is not re-proven (F5). |

## Findings (most severe first)

1. **F1 · medium · fixer. A paused or RM reload reflows after hydration (regression).** The server streams the motion layout, 39,852 px. A paused reload settles at 39,759 px and an RM reload at 37,754 px; Journey goes from 3,209 to 1,204 px. Round 1 had identical heights (39,779 both). CLS reads 0 only because the reflow happens below the fold. On a deep link the reflow can move an RM user about 2,000 px. **Fix:** give the RM/paused Journey its final height before paint (CSS media query, or a pre-paint attribute set from sessionStorage), and add a `--rm` hash-load check.
2. **F2 · medium · Aryan. "3 SURVIVED THE FULL PROCESS" overclaims.** The same section tags Volatility Breakout as EXCEPTION: "not on clearing every gate". **Fix:** Aryan rewords it (for example "3 survived · 1 by exception"), proposed as unsigned copy.
3. **F3 · low-medium · fixer + Aryan. Community-sourced quotes are ungated.** Q-PC-1, Q-PC-3, Q-3I-3, Q-RD-1 and Q-RD-2 are warnings only, while the page attributes quotes in large type ("Be loyal to what matters." — Arthur Morgan). **Fix:** make a rendered COMMUNITY-sourced quote a RELEASE error, or verify each one.
4. **F4 · low · fixer (tool). qa's no-JS evidence is weak.** `noJs.sections` lists only `[top, credits]`. The no-JS shots are off-viewport clips: a dark unpainted band, the header mid-frame, and the wrong section in frame. The rule holds on a direct read of the HTML, but a regression of the noscript un-hide would slip past qa. Without JS, the streamed sections also sit outside `<main>`, and the JS-only controls are inert.
5. **F5 · low · assembler / probes. The manifest overstates two probe results.** The hunt `complete` result has `seeker:false`, not a SEEKER aside. The compass reached 45.3° by a click (`afterClick`), not a press. Fix the probe drift (chip text, compass scoped to #about) so round 3 re-proves both by keyboard.
6. **F6 · low · Aryan (Phase 2). Survivor rows 04 and 05 show results without a limitation of their own** (PSR 0.92; OOS Sharpe 1.13 · 9 of 9 years · 100 % positive CV paths). The only qualifier is "CANDIDATE → PAPER". Ask Aryan for one true limitation line each.
7. **F7 · low · fixer (tool). aa-scrim ignores a 1.67:1 non-live sample** on About's "Process over outcome" paragraph (1024, RM). The frames look readable; report it as a warning with coordinates. Also sample the kill-list lens-dimmed rows.
8. **F8 · low · assembler. Some visible lines are not in the 104-string list.** "Skip intro", "↑ Back to the opening", "To be continued.", "Catch the snitch" / "Snitch caught", "Next step", the RM Lumos toast, and the films bill head. Confirm each is signed or pre-Phase-3.
9. **F9 · low · fixer.** During the intro at 1024, the fast lane is Tab stop 7 (stop 2 at 1440).
10. **F10 · info.** Tab-walk names run text together ("Director's cutMotion is paused", "The CrossingAct I • …"). Check the accessibility tree once.
11. **F11 · info · Aryan.** "the homemade drone flies in Systems" can read as Aryan's own drone; the Systems caption shows it is the 3 Idiots drone. His call when he signs.

## Spot check (outside the capture set)

To settle the no-JS question, I served the existing `.next` build (same BUILD_ID as the capture) on port 3199, fetched `/` once, parsed the HTML, and stopped the server. I changed no files, read no source code, and did not commit.
