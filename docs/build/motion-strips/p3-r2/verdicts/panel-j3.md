# Panel J3, round 2: busy recruiter or engineer, first visit

**Inputs:** the reader screencast at 1440 (13 sheets, 126 clips) and 1024 (12 sheets, 119 clips), plus `clips-panel.json` for each width. I also used `scenes/1024` as static context, only to read small UI text. Full data is in `panel-j3.json`.

**Scores (out of 10):** keep scrolling **5**, tempo **5**, discovery **4**.
**Yes rate:** 1440 **57.1 %** (28/49); 1024 **51.9 %** (28/54). Both counts cover the numbered screens only. I would skip the opening at both widths.

## Verdict in one paragraph

The site is gorgeous and the name lands well. The middle section (Act II: work, projects, experiment, skills, kill-list) is the strongest recruiting material I've seen on a student site, and it moves briskly. The page loses me at the bookends and at the joints between acts:
- **Before the name:** about 9 s of opening.
- **At every act change:** a 6-8 s title card, usually followed by a near-black frame.
- **At the "Three films and a game" interlude:** an almost empty screen, then four film plates in the same template.

The interlude is a cliff. Its yes rate is 14 %, and it arrives about 2:10 in, which is the point where I'd close the tab. The irony is that this is also the only place that tells me there is a game: "12 easter eggs" appears there, in fine print.

## Yes rate and tempo per act

| Act (as I perceived it) | Screens 1440 / 1024 | Yes 1440 | Yes 1024 | Yes overall | Tempo | Feel |
|---|---|---|---|---|---|---|
| Opening (play screen, broom flight, name) | 0 / 0 | 0/1 | 0/1 | 0 % | **slow** | Well shot, but it costs about 9 s before the name. I'd hit Skip intro. |
| Hero | 1 / 1 | 1/1 | 1/1 | 100 % | **medium** | Big name, clear pitch, a living wave. It reads in 3 s. |
| Act I: The Crossing (Pirates card, contents, About, Journey) | 2-8 / 2-8 | 5/7 | 4/7 | 64 % | **medium** | The title card drags. The journey steps are the first moment that feels made for scrolling, and the act ends in a dark gap. |
| Act II: The Workshop (3 Idiots card, Work, projects, Experiment, Systems, Kill-list) | 9-23 / 9-26 | 12/15 | 13/18 | 76 % | **brisk** | After the card and a fade to black, the best stretch on the page: a new idea every screen, chalk and blueprint motion, real numbers, and the kill-list. |
| Interlude: Three films and a game | 24-30 / 27-33 | 1/7 | 1/7 | 14 % | **slow** | An empty opener, then the same plate, quote and paragraph template four times. Only the Black Pearl plate lands. |
| Act III: The Frontier (RDR2 card, Beyond, satchel and wanted poster, journal, voices) | 31-42 / 34-46 | 5/12 | 6/13 | 44 % | **medium** | Varied textures and two real hooks (the satchel and wanted poster, the testimonials). But it's long, the journal is all drafts, and it ends in a glitchy burn. |
| Act IV: The Light (Great Hall card, principles map, contact) | 43-47 / 47-51 | 3/5 | 2/5 | 50 % | **slow** | The fourth card and a black frame come first. Then the map holds still for about 6 s and crawls at a low frame rate. Contact is crisp. |
| Credits | 48-49 / 52-54 | 1/2 | 1/3 | 40 % | **slow** | Tiny credits, then a good "Mischief managed." ending. |

**Tempo words:** opening slow, hero medium, Act I medium, Act II brisk, interlude slow, Act III medium, Act IV slow, credits slow.

## Where I'd stop

- **Most likely exit:** 1440 screen 24 / 1024 screen 27 ("Three films and a game", around 2:10).
- **Earlier risk:** the string of the Kraken's-storm gap, the 3 Idiots card, "The Workshop" and a black frame (1440 screens 8-10 / 1024 screens 8-11, 0:50-1:04). That is about 12 s without content right before the work, and it is the second act card inside 40 s.

## Invitations to play or explore

| Thing | First screen | Would I try it? |
|---|---|---|
| "Skip to the research" pill (nav) | 1 | **Yes.** It's the recruiter shortcut. |
| "Director's cut (sound on)" (hero) | 1 | No, not with sound at a desk. |
| "Egg hunt 0/12" (nav) | 1 | Maybe. I could only read it in the static scenes. |
| Journey path diagram that advances per step | 6 | Maybe (hover). |
| Seven-part gauntlet list (looks like tabs) | 12 | **Yes.** |
| Experiment toggle: naive vs realistic costs | 18 (1440) / 20 (1024) | **Yes.** The best interaction for an engineer. |
| "Take off" pill on the drone photo | 19 / 21 | Yes, if I notice it. It's tiny. |
| Kill-list "Dead Eye" pill and the tracking lens | 22 / 24 | Maybe. |
| "12 easter eggs…" fine print in the interlude | 24 / 27 | Maybe, but it's too late and too small. |
| Dead Eye plate | 28 / 31 | No. No targets are visible while scrolling. |
| Gold orb drifting across the dark | 30 / 33 | **Yes.** I'd click a floating gold dot. |
| Satchel inventory icons | 36 / 39 | **Yes.** They look like buttons. |
| WANTED poster | 36 / 40 | Maybe (read it, maybe reply). |
| Marauder's-map footprints | 44 / 48 | Maybe (hover). |
| "Lumos" link under contact | 47 / 51 | **Yes.** |

The play layer exists and it is witty. But nearly every affordance is a 9-11 px pill, and the one explicit invitation comes after the visitor's likely exit. A first-time skimmer finds the satchel and the gold orb by luck and never learns that there's a hunt.

## Things that look broken

1. **High: the interlude screen is almost empty, and the game invite is buried in it.** 1440 s24, #66-#68 (2:10). 1024 s27, #64-#66.
2. **Medium: near-black or nearly empty hand-off frames.**
   - 1440: #28 (0:54), #33 (1:04), #84 (2:46), #110 (3:38).
   - 1024: #26, #30-#31, #100, #104.
3. **Medium: four act title cards of 6-8 s each, with seen-it fatigue by the third.**
   - 1440: #12-#14, #29-#33, #80-#84, #107-#110.
4. **Medium: four film plates in an identical template.** 1440 s25-30 / 1024 s28-33.
5. **Medium: the principles map stutters.** clips-panel shows 4-6 fps during the scroll.
   - 1440: #115-#118.
   - 1024: #109-#112.
   - On arrival the map also holds still for about 6 s.
6. **Medium: About is crowded at 1024.** The compass emblem drifts through the gutter of three narrow columns (#18-#19).
7. **Medium: the Dead Eye plate shows no targets during the scroll** (1440 #75, 1024 #71).
8. **Medium: the opening takes 8-9 s to reach the name.**
9. **Low: the campfire burn-hole transition reads as a render glitch.** "HARRY POTTER" appears over the RDR2 caption (1440 #106; 1024 #100-#101).
10. **Low: the "A WANTED POSTER" caption is clipped under the nav** during the heading stop (1024 #90).
11. **Low: the same astronaut-pen photo heads both Work and the kill-list.**
12. **Low: the skills-grid tail is a wall of tiny text.**
13. **Low: the journal is all drafts, with nothing to open.**
14. **Low: the credits are unreadably small.**
15. **Low: the interactive pills can't be read at screencast resolution.**
16. **Low: journey step 4 and the Kraken wave compete on one screen** (1024 #26).

## Top fixes this persona would want

1. **Interlude:** put the "there's a game: 12 eggs" hook above the fold of the hero or the nav, readable. Fill the interlude screen, or cut it.
2. **Act cards:** keep the first one at full length. Shorten cards 2-4 to about 2 s, or fold them into the section's first content screen, and remove the black frames after them.
3. **Film plates:** collapse the four plates into one tighter, varied sequence, or make each one carry a different interaction.
4. **Principles map:** fix its frame rate, and don't hold it static on arrival.
5. **Dead Eye:** show the targets while the visitor scrolls past.
