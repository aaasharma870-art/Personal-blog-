# J9 HONEST · round p3-r1 · honesty + accessibility

**Score: 3 / 5.** Honesty is 5/5 and accessibility 3/5. The honesty layer is clean. The reduced-motion path has one high-severity rendering fault and two places where motion leaks through.

**RELEASE fails only on the owner's sign-off items: yes.** `RELEASE=1 npm run check` stops with exactly 46 errors:
- 40 are Check L2 countersignatures (L01–L23 plus their posters, SEQ-HALL and SEQ-HALL-end).
- 5 are TTS approvals (lumos, mischief, nox, parley, solemn).
- 1 is the unsigned-copy error, covering 102 strings.

There are no beats, gap, overlap or pacing errors, and tsc passes. The plain check exits 0 with 66 warnings; 46 of those are the same release-gate items. The eslint and build results were not in my inputs, so I have not judged them.

Inputs: MANIFEST (J9 and Keyboard), `honest/check.txt` and `honest/release.txt`, the four probe runs, qa 1440 and 1024, the scenes sheets and RM sheets at both widths, and the motion.js rm rows. To confirm the two research-text observations, I zoomed in on the raw full-size frames behind the listed sheets. I opened no source code.

## Rules

| rule | status | evidence (short) |
|---|---|---|
| Never invent facts | green | The captures contradict no stated fact. RELEASE holds 102 unsigned strings, 40 media items and 5 TTS lines for Aryan. |
| Hard exclusions (grades, finances, address and similar) | green | None appear in about 146 frames per width. Contact is the site email; the WANTED poster gives a city only. |
| Sharpe / PSR / PF never animated | green | Every D, A and RM still shows final values (+1.19 / +1.42, PF 2.0–2.5 · PSR 0.92, OOS Sharpe 1.13). No probe times these numbers directly. |
| Research data in Geist | green | research-font: 236, 237 and 234 numbers checked, 0 offenders (1440, 1024, RM). |
| Caveats adjacent, "Synthetic • illustrative" on simulations | green | The experiment carries the tag and "Synthetic illustration, not my results". The gauntlet reads "12 illustrative hypotheses · not yet run". The deflated-Sharpe caveat sits under the Volatility Breakout figure. Every row has a status. |
| Option Alpha framing | green | "…a paper portfolio on a no-code platform; not a proven edge". |
| Killed ideas keep their dignity | green | "Killed and never retuned — each ships a written post-mortem". Dead Eye shows the reasons and post-mortem links. |
| Writing is DRAFT, not links | green | DRAFT labels are visible, and #writing has no link in the Tab walk. |
| Non-affiliation credit | green | Present in the credits frames, and cinema.credits.tribute is true. |
| **Reduced motion stops ALL motion and sound** | **red** | Sound and video stop. Motion does not: 6 CSS transitions run in #work at 1440 (qa), the page shifts by itself (CLS 0.061 / 0.1164), and the kill-list keeps repainting with the Motion frame loop active. |
| Pause stops ALL motion and sound | green | 0 animations and 0 videos in 11 sections, Lenis gone in 3–6 ms, sound disabled, no toast. |
| Sound muted by default | green | pressed=false, 0 cues, 0 audio requests before unmute. |
| One h1 | green | 1 in default, alt, rm, no-JS and media-blocked, at both widths. |
| AA contrast | green | aa-scrim: 507 live boxes, 0 failures (and RM 0). Tightest manifest cell 4.65. The tightest live text is 3.78 at large size. |
| No hydration errors | green | qa and scenes: [] at both widths. |
| Intro never gates content | green | The fast lane works during the intro and lands on #work. No-JS shows no intro. A no-JS question is open (M4). |
| "Skip to the research" always visible | green | Visible in every frame, including intro, RM and both widths. Tab stop 3 in every walk, covered 0. |
| Keyboard operable, focus returned | green | 71 / 71 / 68 stops, 12 eggs by keyboard. One focus loss (M3). |
| **Text and research data readable** | **red** | 1024 RM kill-list: rows 01–02 overprint rows 05–06 (H1). |
| RELEASE fails only on owner items | green | See above. |

## Findings

**High**
- **H1 · kill-list, 1024, RM** (`scenes/1024/rm-02.jpg › rm-14-kill-list-685`).
  - A ghost copy of rows 01–02 is painted over rows 05–06. "OOS Sharpe 1.13 · profitable 9 of 9 years · 100% positive CV paths" and the CANDIDATE → PAPER label cannot be read.
  - motion.js agrees: the RM kill-list shows 32.7 paints/s, with `ol.relative` repainted ×9 and Motion frame-loop callbacks.
  - 1440 RM looks clean in the frame but shows the same repaint signature (21.8 paints/s, ×4).

**Medium**
- **M1 · #work, 1440, RM.** qa counts 6 running CSS transitions (`mt-tier-group` / `mt-tier-pair` headings); 1024 counts 0. MANIFEST §3 says 0 at both widths, which is wrong for 1440.
- **M2 · about → journey, RM, at t ≈ 5 s.** The world-font swap moves content by itself: CLS 0.061 at 1440 and 0.1164 at 1024. The `mt-tier-block` source matches M1.
- **M3 · palette → Map → Esc.** Focus falls to `<body>` at all widths and in RM (WCAG 2.4.3).
- **M4 · no-JS.** `qa noJs.sections` lists only `top` and `credits`, against 19 sections with media blocked, and 12 sections are streamed in hidden at DOMContentLoaded. If that list is the visible set, the research cannot be reached without JS. I could not confirm this; check what qa.js counts.
- **M5 · 5 COMMUNITY-sourced quotes.** RELEASE only warns about them, so they could ship unverified. They should be release errors on Aryan's list.

**Low**
- **L1 · aa-scrim tightest text.** "PIRATES OF THE CARIBBEAN" measures 3.78:1 at 1440 and 4.20:1 at 1024. It passes only as large text.
- **L2 · About scrub.** Dim words sit at opacity 0.28 while the sentence is mid-scrub. This is transient and by design; RM shows them fully lit.
- **L3 · Keyboard-walk text.** The walk reads the fast lane as "WorkSkip to the research" and the hero button as "▶ Director's cut(sound on)Motion is paused" even while motion runs. Check the accessibility tree for a doubled label and a false "paused" note.
- **L4 · Dead Eye under RM.** It records "Best 5/5 · 0.0 s", a time that was never measured.
- **L5 · games INP at 1440.** A 688 ms keydown with 0 ms delay, probably SwiftShader; 1024 measures 56 ms. Recheck on a GPU.
- **L6 · Draft alternates.** Five confirmed strings still carry draft alternates.

## What is strong

- **Honesty in the copy.** Every research figure has its status and caveat beside it. Simulations are labelled twice, on the visual and in a caption.
- **Sound.** It stays silent until the visitor asks for it.
- **Pause.** Within milliseconds it stops all motion, video, Lenis and sound.
- **Keyboard.** The whole site can be operated by keyboard, including all 12 eggs, the drone and Dead Eye, with focus returned almost everywhere.
- **Fast lane.** It is visible on every frame and works during the intro.
