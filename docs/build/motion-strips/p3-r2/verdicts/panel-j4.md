# Panel J4, round 2: the film-lover who hates gimmicks

I judged only the reader screencast sheets (`sheets-panel/` at 1440 and 1024), `clips-panel.json` for each width, and the static sheets in `scenes/1440/`. The visitor scrolls steadily at about 250 px/s and stops for 2 s at each heading.

## Scores (0 to 10)

| | score |
|---|---|
| Keep scrolling | **7.5** |
| Tempo | **7** |
| Game discovery | **5.5** |
| Yes rate at 1440 | **83.7 %** (41 of 49 screens) |
| Yes rate at 1024 | **81.5 %** (44 of 54 screens) |

The page opens like a film. It has two great acts (the Frontier and the Light) and one transition I'd steal: the grey-to-gold grade on the Red Dead Redemption 2 plate. The middle is too long, and it sags. The "game" is real, but I'm told about it only after I've scrolled past two of its eggs.

## 1. Would I keep scrolling? Yes rate per act

| Act (as I perceive it) | 1440 screens | 1024 screens | Yes at 1440 | Yes at 1024 | Yes rate | Tempo |
|---|---|---|---|---|---|---|
| Opening: play screen, broom flight, name | 1 | 1 | 1/1 | 1/1 | **100 %** | medium |
| Act I, The Crossing (porthole, contents, about, journey, Kraken gap) | 2-8 | 2-8 | 6/7 | 5/7 | **79 %** | brisk |
| Act II, The Workshop (gauntlet, two cards, experiment, drone, skills, kill-list) | 9-23 | 9-26 | 11/15 | 13/18 | **73 %** | slow |
| Intermission, "Three films and a game" | 24-30 | 27-33 | 7/7 | 7/7 | **100 %** | brisk |
| Act III, The Frontier (sun grade, discipline, satchel, wanted, journal, voices) | 31-41 | 34-45 | 10/11 | 11/12 | **91 %** | medium |
| Act IV, The Light (burn-through, Great Hall, map principles, candles) | 42-47 | 46-51 | 5/6 | 5/6 | **83 %** | medium |
| Credits and "Mischief managed." | 48-49 | 52-54 | 1/2 | 2/3 | **60 %** | slow |

**Where I said no, and why**

- **1440:** 8 (Kraken gap, ~4 s of near-black), 17 (same blueprint and stat block as the first card), 20 and 21 (skills table of tiny text), 23 (kill-list rows; the lens reads as decoration), 35 (mono text blocks next to a static horse), 46 (the fifth identical map panel, at about 4 fps), 48 (tiny credits on black).
- **1024:** 5 (about: three cramped columns with the compass wedged in), 8 (Kraken gap), 18 and 19 (the repeated blueprint and stats), 23 (skills table), 25 and 26 (kill-list rows), 38 (mono text on brown), 50 (map panels at about 5 fps), 52 (tiny credits).

Per-screen reasons are in `panel-j4.json`.

## 2. Tempo

- **Opening: medium.** The play screen holds, the broom swoops over Hogwarts into a bioluminescent sea, and the name lands at about 8 s. That's earned, not indulgent.
- **Act I: brisk.** An iris, a title card, a contents page, then a sticky-plate journey. It stalls once, in the Kraken black gap.
- **Act II: slow.** It runs about 70 s, roughly a third of the page, in one dark-green palette. The chalk moments carry it: the torn reveal, the handwritten "What is a machine?", the circles on the stats. After them come a second card that repeats the first, a skills table, and kill-list rows.
- **Intermission: brisk.** Four worlds in about 25 s, each one slitting open into a plate. It's snappy, but it's the same template four times.
- **Act III: medium.** The best-paced act. The sun dot falls, the plate grades from grey to gold, "The Frontier" card cuts to black, and then there is real variety: a trail map, the satchel, a WANTED poster, a page-curl into the journal, and a treeline rising into the campfire.
- **Act IV: medium.** The burn-through into the Great Hall is cinema. The map rising out of black and unfolding is charming, but five identical panels at about 4-5 fps make the ending feel sticky.
- **Credits: slow.** Six seconds of tiny type on black, rescued by "Mischief managed." bookending "I solemnly swear…".

## 3. Game discovery

| Thing | First screen (1440 / 1024) | Would I try it? |
|---|---|---|
| "Play" button on the opening | 1 / 1 | **yes**: the clearest invitation on the page |
| "EGG HUNT 0/12" counter in the top bar | 1 / 1 | **yes**, but only after the films intro explains it; until then it's tiny grey text |
| Director's Cut toggle in the hero link row | 1 / 1 | maybe: dim grey and easy to miss |
| Jack's compass (hero emblem, then a turning needle in About) | 1 / 1 | maybe |
| Journey route chart with waypoints | 5 / 6 | maybe |
| Chalk sketches and handwriting | 9 / 9 | no: lovely to watch, but it doesn't invite a click |
| Experiment toggle (naive in-sample vs realistic out-of-sample) | 18 / 20 | **yes**, but the control is tiny |
| Drone "Take off" pill | 19 / 22 | **yes** |
| "Dead Eye" chip on the kill-list | 22 / 24 | **yes**, once I know there's a game |
| Kill-list lens box | 23 / 25 | no: it reads as decoration |
| Satchel inventory with ticks | 36 / 39 | **yes**: it looks like a game inventory |
| WANTED poster with a reply link | 36 / 40 | **yes** |
| Horse running along the journal margin | 38 / 42 | **yes**: it feels like an egg |
| Winged thing crossing the Great Hall | 43 / 47 | **yes** |
| Marauder's map footprints | 44 / 48 | maybe |
| Candles with "A S" in the contact section | 47 / 51 | maybe |
| "Back to the opening" and "To be continued" in the credits | 48 / 52 | **yes** |

**The discovery problem.** The rules ("the homemade drone flies in Systems, and Dead Eye marks the kill-list") are on the films intro, at 1440 screen 24 and 1024 screen 27. That comes after the drone (screens 19 and 22) and the kill-list (screens 22 and 24) have already gone by. On top of that, every affordance is a small low-contrast mono pill. A first-time visitor scrolling at reading speed meets the eggs before they know there's a hunt.

## 4. Things that look broken or weak

| Sev. | Where | What |
|---|---|---|
| high | 1440 s24 clip 67 / 1024 s27 clip 64 | The egg-hunt rules arrive after the drone and Dead Eye eggs have already passed. |
| medium | 1440 s1, 18, 19, 22 | Every play affordance (counter, Director's Cut, toggle, Take off, Dead Eye) is a tiny grey pill that doesn't read as "press me". |
| medium | 1440 s8 clips 27-29 / 1024 s8 clips 25-27 | Kraken gap: about 4 s of near-black with a thin sea strip. At 1024, clip 26 also has two stars live for 1.2 s. |
| medium | 1440 s13-21 / 1024 s13-23 | Act II sameness: the second card mirrors the first, then the skills table. About 40 s of tempo sag. |
| medium | 1440 clips 115-118 / 1024 clips 109-111 | The map principles capture at 4-6 fps (maxDt up to 500 ms), against 10-20 fps elsewhere. Looks sticky. |
| medium | 1024 s5 clip 19 | About: three cramped serif columns, with the compass wedged into the gutter against the text. |
| low | 1440 s20-21 / 1024 s23 | The skills table is 3-4 columns of tiny text held for 8-10 s. |
| low | 1440 s22-23 / 1024 s25-26 | The kill-list rows are tiny, and the lens doesn't read as interactive. |
| low | 1440 clips 106-107 / 1024 clip 101 | The burn-through leaves the "THE CAMPFIRE · RDR2" caption over the incoming HP title and plate. In a still frame the burn reads as a black blob. |
| low | 1440 s24-30 / 1024 s27-33 | The films intermission is one template four times, and RDR2 and HP come back seconds later in Acts III and IV. That risks "seen it". |
| low | 1440 clips 33, 84, 110 / 1024 clips 31, 79, 104 | Every breath is the same move: fade to black, then the next thing rises from the bottom. By the third, it's a pattern, not a cut. |
| low | 1024 s1 clip 10 | The hero exit ghosts a caption mid-frame, then the Pirates title lands in an empty black viewport. |
| low | 1440 s35-36 / 1024 s38-39 | "Three arenas" and satchel: low-contrast mono text and thin-line icons on brown, plus an empty near-black block where the horse panel faded. |
| low | 1440 s48 / 1024 s52 | Credits: tiny grey type on near-black for about 6 s. |

## What to protect

Keep these as they are: the play screen and broom flight; the porthole iris; the torn chalk reveal; the handwritten chalk; the sun dot and grey-to-gold grade; "The Frontier" cut to black; the page-curl into the journal; the treeline rising into the campfire; the burn-through into the Great Hall; the map rising out of black; and "Mischief managed." None of them reads as a gimmick, because each one carries you from one world to the next.

## What would move my numbers

1. Announce the hunt before Act II, for example with a one-line card at the end of the contents page. Make the counter, Take off and Dead Eye look like buttons.
2. Cut or merge the second project card's blueprint and stat block, and turn the skills table into something that moves or folds.
3. Fill the Kraken gap with the storm itself instead of a strip.
4. Fix the frame rate on the map, and vary or shorten the five panels.
