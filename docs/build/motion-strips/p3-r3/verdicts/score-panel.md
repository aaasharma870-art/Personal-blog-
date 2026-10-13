# P3-11 round 3 · panel score (J2–J4; assembler)

Computed by `tools/capture/score-panel.mjs` from `panel-j{2,3,4}.json` and `screencast/reader-{1440,1024}/clips-panel.json` against PHASE3-SPEC §13 (P3-11 rubric) and §2.2 (tempo). Judges scored 0–10; the 1–5 axis value is half of it. Each judge's own parts are mapped to seven canonical acts (header of the script). Must-yes screens: the hand-off (s1), every screen holding a clip of an act card (any clip), and the first Work screen after the act-2 card screens.

Card screens: 1440 {"act-1":[2,3],"act-2":[8,9,10],"act-3":[30,31,32],"act-4":[41,42,43]}, first Work s11; 1024 {"act-1":[2,3,4],"act-2":[10,11],"act-3":[34,35],"act-4":[45,46,47]}, first Work s12.

## Keep scrolling (bar: ≥ 80 % yes per act · no two consecutive no · hand-off, the four cards and the first Work screen all yes)

| judge · width | overall | per act (yes %; ✗ < 80) | two consecutive no | must-yes missed | bar |
|---|---|---|---|---|---|
| J2 · 1440 | 38/49 = 77.6 % | Opening + hero 100 · Act I 86 · Act II 44✗ · Films 100 · Act III 92 · Act IV 100 · Contact + credits 100 | 20–21, 21–22, 22–23, 23–24 | work s11 | FAIL |
| J2 · 1024 | 42/54 = 77.8 % | Opening + hero 100 · Act I 75✗ · Act II 56✗ · Films 100 · Act III 92 · Act IV 80 · Contact + credits 100 | 4–5, 23–24, 24–25, 25–26, 26–27 | act-1 s4, work s12 | FAIL |
| J3 · 1440 | 34/49 = 69.4 % | Opening + hero 100 · Act I 100 · Act II 69✗ · Films 83 · Act III 55✗ · Act IV 75✗ · Contact + credits 25✗ | 23–24, 37–38, 47–48, 48–49 | act-2 s10, act-3 s32, act-4 s41 | FAIL |
| J3 · 1024 | 34/54 = 63 % | Opening + hero 100 · Act I 75✗ · Act II 67✗ · Films 80 · Act III 46✗ · Act IV 60✗ · Contact + credits 50✗ | 26–27, 37–38, 41–42, 49–50, 53–54 | act-2 s11, act-3 s35, act-4 s45 | FAIL |
| J4 · 1440 | 36/49 = 73.5 % | Opening + hero 100 · Act I 86 · Act II 61✗ · Films 100 · Act III 80 · Act IV 75✗ · Contact + credits 75✗ | 16–17, 20–21, 23–24 | work s11 | FAIL |
| J4 · 1024 | 37/54 = 68.5 % | Opening + hero 100 · Act I 75✗ · Act II 54✗ · Films 100 · Act III 100 · Act IV 60✗ · Contact + credits 75✗ | 4–5, 18–19, 19–20, 25–26, 26–27, 49–50 | act-1 s4, work s12 | FAIL |

## Tempo (bar: each act's §2.2 tempo named by ≥ 2 of 3 judges)

| act | §2.2 | J2 · J3 · J4 said (screen-weighted over both widths) | right | bar |
|---|---|---|---|---|
| Opening + hero | slow | medium · slow · brisk | 1/3 | FAIL |
| Act I · The Crossing (card, about, journey) | medium | medium · medium · medium | 3/3 | PASS |
| Act II · The Workshop (card to kill-list) | brisk | slow · slow · slow | 0/3 | FAIL |
| Films (three films and a game) | slow | brisk · brisk · brisk | 0/3 | FAIL |
| Act III · The Frontier (beyond, writing, voices) | medium | medium · medium · slow | 2/3 | PASS |
| Act IV · The Light (principles) | medium | medium · slow · medium | 2/3 | PASS |
| Contact + credits | slow | medium · slow · medium | 1/3 | FAIL |

Acts named right by ≥ 2 judges: 3/7.

## Game discovery (bar: each judge notices the hunt chip and at least one toy invite within 3 screens of its first appearance)

Invite screens (first screen whose clip row is the beat): 1440 {"B08":4,"B18":13,"B26":20,"B28":23}; 1024 {"B08":5,"B18":13,"B26":23,"B28":25}. The chip is in the header from screen 1.

| judge | chip | toy invites noticed (within 3 screens of the first one) | bar |
|---|---|---|---|
| J2 | named at s1: yes: a counter that starts at 0 of 12 is a promise; I would hover the page to find one. It is tiny, though, an | B08 1440: s1 (first s4); B26 1440: s20 (first s20); B28 1440: s22 (first s23) | PASS |
| J3 | named at s1: maybe, only if bored | B08 1440: s1 (first s4); B26 1440: s20 (first s20); B28 1440: s22 (first s23) | PASS |
| J4 | named at s1: maybe | B08 1440: s1 (first s4); B26 1440: s19 (first s20); B28 1440: s22 (first s23) | PASS |

## Scores (1–5 = the judges' 0–10 / 2)

| judge | keep scrolling | tempo | discovery |
|---|---|---|---|
| J2 | 3.5 | 3.15 | 3 |
| J3 | 3 | 3 | 2.75 |
| J4 | 3.5 | 3.25 | 3 |
| mean | 3.33 | 3.13 | 2.92 |
