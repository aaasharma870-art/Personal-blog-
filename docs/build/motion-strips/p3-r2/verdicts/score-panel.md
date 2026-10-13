# P3-11 round 2 · panel score (J2–J4; assembler)

Computed from `panel-j{2,3,4}.json` and `R/screencast/reader-{1440,1024}/clips-panel.json` against PHASE3-SPEC §13 (P3-11 rubric) and §2.2 (tempo). Judges scored 0–10; the 1–5 axis value is half of it. Acts use the screen ranges the judges themselves drew (J2 and J3 agree; J4 draws Act III/IV one screen apart at the joint). Cards, the hand-off and the first Work screen come from `section` in clips-panel.json. J3 also judged the opening as its own screen 0 (a "no"); it counts for the hand-off.

Card screens: 1440 {"act-1":[1,2,3],"act-2":[8,9,10],"act-3":[31,32],"act-4":[42,43]}, first Work s11; 1024 {"act-1":[2,3],"act-2":[9,10],"act-3":[33,34],"act-4":[46,47,48]}, first Work s11.

## Keep scrolling (bar: ≥ 80 % yes per act · no two consecutive no · hand-off, the four cards and the first Work screen all yes)

| judge · width | overall | per act (yes %; ✗ < 80) | two consecutive no | must-yes missed | bar |
|---|---|---|---|---|---|
| J2 · 1440 | 40/49 = 81.6 % | Opening (hand-off) 100 · Act I 86 · Act II 60✗ · Films 100 · Act III 83 · Act IV 100 · Credits 100 | 16–17, 20–21 | act-2 s8, act-3 s32 | FAIL |
| J2 · 1024 | 44/54 = 81.5 % | Opening (hand-off) 100 · Act I 71✗ · Act II 61✗ · Films 100 · Act III 92 · Act IV 100 · Credits 100 | 17–18, 18–19, 25–26 | none | FAIL |
| J3 · 1440 | 28/49 = 57.1 % | Opening (hand-off) 100 · Act I 71✗ · Act II 80 · Films 14✗ · Act III 42✗ · Act IV 60✗ · Credits 50✗ | 8–9, 9–10, 26–27, 27–28, 28–29, 29–30, 30–31, 31–32, 37–38, 38–39, 42–43 | handoff s0, act-1 s2, act-2 s8, act-2 s9, act-2 s10, act-3 s31, act-3 s32, act-4 s42, act-4 s43 | FAIL |
| J3 · 1024 | 28/54 = 51.9 % | Opening (hand-off) 100 · Act I 57✗ · Act II 72✗ · Films 14✗ · Act III 46✗ · Act IV 40✗ · Credits 33✗ | 8–9, 9–10, 10–11, 26–27, 29–30, 30–31, 31–32, 32–33, 33–34, 37–38, 41–42, 42–43, 46–47, 49–50, 52–53 | handoff s0, act-1 s2, act-2 s9, act-2 s10, act-3 s33, act-3 s34, act-4 s46, act-4 s47, work s11 | FAIL |
| J4 · 1440 | 41/49 = 83.7 % | Opening (hand-off) 100 · Act I 86 · Act II 73✗ · Films 100 · Act III 92 · Act IV 80 · Credits 50✗ | 20–21 | act-2 s8 | FAIL |
| J4 · 1024 | 44/54 = 81.5 % | Opening (hand-off) 100 · Act I 71✗ · Act II 72✗ · Films 100 · Act III 92 · Act IV 80 · Credits 67✗ | 18–19, 25–26 | none | FAIL |

## Tempo (bar: each act's §2.2 tempo named by ≥ 2 of 3 judges)

| act | §2.2 | J2 · J3 · J4 said | right | bar |
|---|---|---|---|---|
| Opening | slow | brisk · slow · medium | 1/3 | FAIL |
| Hero | slow | medium | 0/1 | FAIL |
| Act I | medium | medium · medium · brisk | 2/3 | PASS |
| Act II | brisk | slow · brisk · slow | 1/3 | FAIL |
| Films | slow | brisk · slow · brisk | 1/3 | FAIL |
| Act III | medium | medium · medium · medium | 3/3 | PASS |
| Act IV | medium | medium · slow · medium | 2/3 | PASS |
| Credits | slow | slow · slow · slow | 3/3 | PASS |

Acts judged by all three: 4/7 named right. (Hero is J3's alone: it named it medium; §2.2 says slow.)

## Game discovery (bar: each judge notices the hunt chip and at least one toy invite within 3 screens of its first appearance)

Invite screens (clips-panel rows): 1440 {"B08":5,"B18":12,"B26":20,"B28":23}; 1024 {"B08":4,"B18":13,"B26":22,"B28":24}. The chip is in the header from screen 1.

| judge | chip | toy invites noticed (screen) | bar |
|---|---|---|---|
| J2 | s1: maybe: I only made it out on a still; while scrolling the top-bar type is too small and dim to read, so I would likely never notice it. | Small pill button on the homemade-drone photo (r (19) | FAIL |
| J3 | s1: maybe, but only once I knew what it was | 'Take off' pill on the homemade-drone photo (19); Kill-list 'Dead Eye' pill and the lens that trac (22) | FAIL |
| J4 | s1: yes (It's there from the first screen but tiny and grey. I only understood it at the films intro (1440 s24 / 1024 s27), after) | Jack's compass (hero emblem, then the about meda (1 / 1); Homemade drone 'Take off' pill (19 / 22); 'Dead Eye' chip on the kill-list header (22 / 24) | PASS |

Chip read as "noticed" only where the judge could read it at scroll speed: J2 and J3 made it out on stills only ("too small and dim to read while scrolling"; "readable only in the static scenes"). J4 saw it from screen 1 but understood it only at the films intro (1440 s24). Every judge noticed the drone's Take off within one screen of B26; J3 and J4 also the Dead Eye pill (B28), J4 the About compass (B08).

## Scores (1–5 = the judges' 0–10 / 2)

| judge | keep scrolling | tempo | discovery |
|---|---|---|---|
| J2 | 3.75 | 3.25 | 2.5 |
| J3 | 2.5 | 2.5 | 2 |
| J4 | 3.75 | 3.5 | 2.75 |
