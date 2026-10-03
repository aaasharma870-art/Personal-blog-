# J1 STAR: one star per screen (p3-r1)

**Score: 2 / 5. The axis fails on all four runs.**

I judged by eye from the contact sheets only, zooming into crops where a sheet was unclear. Motion that only scrolls with the page is not a star. A hand-off where one animation finishes before the next starts counts as one star. A clip counts as a breath when clips.json gives it a breath row. I did not judge the reader intro (clips 1–13).

| run | judged | one star | none | none in breath | 2+ | one-star % |
|---|---|---|---|---|---|---|
| reader-1440 | 239 | 128 | 109 | 20 | 2 (#34, #96) | 53.6 |
| reader-1024 | 224 | 122 | 102 | 17 | 0 | 54.5 |
| skimmer-1440 | 102 | 76 | 24 | 6 | 2 (#34, #76) | 74.5 |
| skimmer-1024 | 79 | 65 | 13 | 2 | 1 (#57) | 82.3 |

The pass bars:

- **At least 90 % one star:** fail on every run.
- **Star-less clips only in breaths:** fail on every run. There are 89, 85, 18 and 11 star-less clips outside breaths.
- **No 2+ clips:** passes only on reader-1024.

## What the eye sees

1. **The page has too few stars.** Every star is an entrance of about one second. At reading speed, the text stretches scroll or sit with nothing moving for up to 14 s in a row (r1440 #69–81 and #237–250; r1024 #62–74 and #223–235). Every pinned hold where scrollY stays fixed shows identical frames: 32 such clips at 1440 and 27 at 1024.
2. **There are few collisions, and they are real:**
   - r1440 #34: the compass needle swings while the body-text stagger is still revealing.
   - r1440 #96 and s1440 #34: the blueprint is still drawing while the sticky backdrop crossfades from classroom to corridor. The machine says NO STAR for both.
   - s1440 #76: the target sketch draws while a horse silhouette runs across the page.
   - s1024 #57: the typewriter heading types while the journal sketch draws.
3. **The breaths are in the wrong places.** B07, B31 and B52 hold some of the best motion on the page: the typewriter and compass, the Pirates band with the compass on the ship, and the map unfolding with the quill writing. The passages that really are still are not declared as breaths.
4. **The single-star moments work.** The porthole, the torn-paper wipe, the four film bands, the snitch flying into the sepia frame, the Frontier and The Light letterforms, and the Great Hall burn are all clean single stars. Their hand-offs read as sequential.

## Where the machine is wrong

I disagree with the machine on 239 clips:

- **116 clips: the machine grants a star, but nothing moves.** A scroll star keeps the spotlight until the next star takes it. Examples: B19 in r1440 #76–81, B47 in #201–203, B50 in #213–215. B17 never visibly performed in any run.
- **110 clips: the machine says NO STAR, but something visibly moves.** Most are unregistered stars that do perform:
  - B02, the hero wave;
  - B10 and B11, the Crossing film crossfades;
  - B54, the principles ink trails;
  - the journal sketches, the blueprint draws, the kill-list mini-card and the credits comet, none of which are declared.
- **10 clips: the machine says 2+, but I see one star or none.** The causes are B21 and B21-circle being one visual registered twice, and clean hand-offs at skimmer speed.
- **3 clips: I see 2+, but the machine does not.** These are the collisions above that involve unregistered elements.
- **Grants out of step with the animation.** Some grants land a second away from what they describe. In r1024 the typewriter plays in #104, but B26 is granted in #106–107 on a still screen.

## What to fix

1. **Give every reading hold and text stretch a star.** Use a small ongoing star such as an ink line, a drift or a light change, or declare the stretch a breath.
2. **Move the breath map onto the stretches that are actually still.**
3. **Register B02, B10, B11, B54, the journal sketches, the backdrop swap and the horse with the spotlight.** That way it can sequence them.
4. **Release scroll stars when their animation ends.** The log then counts only what can be seen.
