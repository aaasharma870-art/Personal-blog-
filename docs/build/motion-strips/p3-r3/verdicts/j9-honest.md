# J9 HONEST, round 3: honesty and accessibility

Build `ece90dc`, judged from the round-3 captures and reports only. No source, no earlier round, no other judge's verdict was read.

**Score: 4 / 5.**

Every hard rule holds on the evidence except one, and that one is the owner's to clear: five community-sourced film quotes render unverified (the `[J9 F3]` release error). The rest of the score is held down by one open reduced-motion deep-link reading, one place where the page's own copy contradicts itself, and some thin evidence (no-JS visuals, no probe for "never animated").

**Does RELEASE fail only on the owner's items? Yes.** `RELEASE=1 npm run check` exits 1 with 47 errors: 40 Check L2 countersignatures + 5 TTS approvals + 1 unsigned-copy line (107 strings, all wired in and listed with file) + 1 `[J9 F3]` quote line (5 quotes). All are DP-9 items for Aryan. Three classes are the agreed sign-offs; the fourth, the quote check, is also Aryan's call by its own wording but is not one of the three classes named in the brief, so report it separately. `npm run check` exits 0 with 67 warnings.

## Rules

| Rule | Status | Evidence |
|---|---|---|
| Never invent facts | green | Figures I could read (Volatility Breakout blind-test Sharpe +1.19 / in-sample +1.42; VIX-Backwardation PF 2.0-2.5 OOS, PSR 0.92; Regime-Gated OOS Sharpe 1.13, 9 of 9 years) agree between 1440 default, rm, 390 and the Dead Eye rows. No grades, attendance, finances, address or phone in any frame viewed. I cannot check against `lib/content.ts` (off limits). |
| Attributed film quotes verified before they render | **red (owner)** | Q-PC-1, Q-PC-3, Q-3I-3, Q-RD-1, Q-RD-2 are COMMUNITY-sourced and render unverified. Q-3I-3 (Optuna chalkboard) and Q-RD-1 (RDR2 film card) are on the page for everyone; the other three are egg-only. |
| Sharpe / PSR / PF never animated | green | Six consecutive reader-screencast frames through the kill-list show the same final figures every frame; only the row highlight moves. The words probe's effect kinds (title, scrub, physical, fly) include no number effect. The one moving readout, BacktestDemo's `INDEX 78.4 / 330.0`, sits in a "SYNTHETIC . ILLUSTRATIVE" card. No probe asserts this (F8). |
| Research data in Geist | green | research-font passes at 1440, 1024 and rm: 276 / 275 / 275 elements, 16 islands, 0 offenders (Geist Mono 215, Geist 61). |
| Caveats adjacent, synthetic labels, Option Alpha framing, equal dignity for killed ideas | green | STANDING RULE ("above roughly Sharpe 2.0 is treated as curve-fit or data-leak until proven otherwise") above the figures; "Synthetic illustration, not my results" under the chart; Volatility Breakout row carries its own limitation and an EXCEPTION tag; Optuna summary says "a paper portfolio on a no-code platform; not a proven edge"; 390 frame shows "anything > 2.0 is a red flag" and "HONEST LIMITATIONS". Tighten: F2, F9. |
| Drafts are a visible DRAFT label and never links | green | "ENTRY I-IV . ... . DRAFT" in rm-21/22 and A36/A37 at both widths; no writing link anywhere in the 78-stop Tab walk. |
| New copy proposed and unsigned | green | 107 strings listed with file; every new visible line I could read is in the list and plausible (details below). A few chrome strings I could not match (F11). |
| Reduced motion and Pause stop all motion and sound | green | qa: 0 running animations, 0 playing videos in 11 sections for rm and Pause at both widths. Pause 4-5 ms (budget 100), scroll kept, shift 0. GL draws 0 while paused; plates 0 playing at 100 and 300 ms; sound toggle goes off and disabled; hunt, toys, words, games, cut all stop. RM: 0 video, 0 canvas, no stage, sound suspended in 36 ms, cut disabled, drone shows its flight plan. Open: F3, F8. |
| One h1 | green | 1 in qa (both widths), no-JS, media-blocked, all six scenes runs, and font-network. |
| AA contrast | green | aa-scrim 510 / 527 live boxes, 0 failures at 1440, 1024 and rm; dim kill-list rows 4.81-4.92; static grid tightest 4.65. My measurements: intro Skip links 6.9-16.1:1. Closest live reading 3.78:1 on a large caption (about, 1440). |
| No hydration errors | green | 0 in qa and scenes at both widths; the only console lines are the deliberate 404 probe and the deliberate media-blocked context. Hunt chip SSRs `-/12`, hydrates `0/12`. |
| Intro never gates content; "Skip to the research" always visible | green | Visible with Skip intro on the play screen and every flight frame (8.6:1); in every post-intro thumbnail viewed; Tab stop 3 at 1440, 1024 and rm; `lenis.fastlane` pass (overlay seen, pill not covered); header z 40 above cut 35, HUD 25, toast 32; covered 0. No-JS `introVisible` false. |
| No-JS shows every section | green (DOM only) | 19 of 19 streamed blocks shown, no hidden text, no collapsed block, h1 1. Visual proof is thin: mid-scroll shots, two flat frames at 1440 (F4). |
| Sound muted by default | green | 0 AudioContexts, 0 audio requests, 0 TTS fetches before unmute (the five TTS webm, 46,946 B, load after); new visit pressed false. |
| Keyboard | green | 78 / 78 / 77 stops, 0 covered, 0 out of view; all controls, games and all 12 eggs operable by keyboard at all three runs. No focus-ring capture (F8). |

## New visible copy, checked

All in the release list as unsigned and consistent with the rules and probe facts:

- Films intermission: "Still hunting? Your egg count is at the top right." (true; the chip is there).
- Act I programme: "Something to play, too: 12 easter eggs hide on this page ... two buttons start games" (hunt probe: 12 eggs; games probe: two pills).
- Intro titles: "A RESEARCH JOURNAL IN FOUR ACTS", "AFTER {WORKS}", "ACT I . THE CROSSING".
- "SKIP TO THE RESEARCH", "Director's cut (sound on)", "Motion is paused".
- Act loglines for acts 2 and 4, "A JOURNAL LIKE ARTHUR MORGAN'S", "The philosophy note", "More credits: media, fonts and quotes".
- Systems capability lines (Lenis desktop only, native scroll on phones and with reduced motion, CSS + SVG first, WebGL only for scene changes): all match the probes.
- Optuna appendix summary frames the Option Alpha bots as a paper portfolio on a no-code platform and not a proven edge, as the rules require.

Not found in the list, so confirm they are older signed copy (F11): "SKIP INTRO", "Play", "LOADING THE FLIGHT", "THE RECKONING . 3 SURVIVED THE FULL PROCESS", and the act-card taglines "Treat every backtest as guilty until proven innocent." and "The result stands; no re-optimization after the fact."

## Findings

| # | Sev | Owner | Finding |
|---|---|---|---|
| F1 | medium | Aryan | Five community-sourced quotes render unverified (`[J9 F3]`). Verify each in the work or stop rendering it. Q-RD-1 and Q-RD-2 are the ones I could not vouch for from memory. |
| F2 | medium | Aryan | The kill-list kicker says "3 SURVIVED THE FULL PROCESS"; the Volatility Breakout row (tagged EXCEPTION) says it does not clear every gate. The page contradicts itself on its own rule. Suggest "3 SURVIVED THE BLIND TEST, 1 AS AN EXCEPTION". |
| F3 | medium | Claude / probe | In the `--rm` run `/#work` stays at y 0 (early and late). The default run's own rm hash check passes at both widths. The `--rm` context sets the preference from the first request, which is closer to a real OS-level user, so treat it as real until a two-minute manual repro (OS reduced motion on, open `/#work` and `/#kill-list`) clears it. The in-page fast lane works under rm, so this is deep links only. |
| F4 | medium | capture | No-JS visual proof is missing: `allInView` false, mid-scroll shots, flat single-colour frames for act-4 and credits at 1440. Also the no-JS header shows four controls that cannot work without JS. Re-shoot with instant scroll; hide or disable the dead controls. |
| F5 | low | Aryan | "Sound follows motion: resume motion to hear it" is what an OS-reduced-motion visitor reads, where resuming is not offered and the toggle stays disabled. Use two strings (Pause vs OS setting). |
| F6 | low | Claude | The intro play screen loops a video with no Pause control; Skip intro is the only stop (WCAG 2.2.2, arguable). |
| F7 | low | Claude | Disabled sound icon under rm is 2.9:1 (exempt) and its reason is only in the accessible description. |
| F8 | low | capture | Thin evidence: no probe for "never animated"; RM idle state untraced (getAnimations cannot see rAF loops); `--rm` ran at 1440 only; no focus-ring capture; `lenis.pauseBefore` false in qa (round 2 true), read as a late attach. |
| F9 | low | Aryan | VIX-Backwardation and Regime-Gated rows state PF 2.0-2.5 / OOS Sharpe 1.13 / 9 of 9 years with only the CANDIDATE chip as caveat; Volatility Breakout does it right. |
| F10 | low | Aryan | WANTED poster lists "Wrestling (Varsity B, 113/126 lb)". Not a hard exclusion, but "when in doubt, leave it out". |
| F11 | low | Aryan | Visible strings missing from the unsigned list (above). |
| F12 | low | Claude | Fonts settling moves Work 31 px and everything below 32 px (both widths and rm); CLS 0.0454 at 1440 desktop and 0.025 in rm (`#films`); all under 0.1. |
| F13 | low | Claude / J8 | `games.inp` 544 ms keydown at 1440 (192 ms at 1024); SwiftShader raster waits per the manifest; recheck on a GPU. |

## What I looked at

Probe JSON at 1440, 1024 and 1440 `--rm` (research-font, aa-scrim, layout-gates, sound, lenis, decoder, keyboard, hunt, games, words, toys, cards, cinema, gl, spotlight, plates-live, split, loaf, console), the RM keyboard run, both qa files, `check.txt`, `release.txt`, the motion `rm` rows, 1440 and 1024 scene sheets and rm frames (plus full-size raw frames for the reading and pixel measurements), the 390 regression frames, the no-JS shots and six reader-screencast frames. Static sheets 1440 05 and 08 and 1024 01, 02 and 05-08 were not opened; their sections are covered by the others.
