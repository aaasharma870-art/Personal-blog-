# Content and honesty rules (tracked summary of the private CLAUDE.md, which is gitignored)

**Source of truth for copy:** `lib/content.ts`, which holds the facts, and `lib/film.ts`, which holds the film copy. Don't invent facts, metrics, awards or dates that aren't already in them.

## Hard exclusions (absolute)
Keep anything overly personal or grade-related off the site:
- No grades, GPA, trimester marks, exam scores or class rank.
- No attendance data.
- No family financial details.
- No sensitive personal hardship narratives: discrimination, religion-based struggles, detailed family difficulties, or moving-schools loneliness. Resilience may be expressed only in general terms.
- No home address, phone number, or identifying details of family members.
- No unverifiable claims, fabricated awards or inflated performance numbers.

When in doubt, leave it out. The site is professional-personal, not a diary.

## Research honesty guardrail (site-wide)
- **Sharpe 2.0.** Aryan's ethos is that any trading result above roughly Sharpe 2.0 is treated as curve-fit or data leakage until proven otherwise.
  - Sharpe, PSR and PF figures are never animated or count-up.
- **The Option Alpha bots** are always framed as *early, experimental paper-trading on a no-code platform*: small sample, short-volatility 0DTE profile. They are the spark that motivated the rigorous methodology, never a headline edge.
- **Labels and caveats:**
  - "Synthetic • illustrative" labels sit next to simulated visuals (for example BacktestDemo).
  - Limitations sit next to their claims.
  - Killed ideas keep their ember semantics and equal dignity.
- **Writing entries** are drafts. They show a visible DRAFT label and are never links.
- **No fabricated data:** no fake equity curves, fake charts or fake results.

## Voice
Precise, reflective, understated, confident without arrogance. Banned words: "passionate", "cutting-edge", "leveraging AI", "seamless" and similar buzzwords.

## Film/game layer (Aryan's binding decisions)
- **The four worlds** (Harry Potter, Pirates of the Caribbean, 3 Idiots, Red Dead Redemption 2) are emphasized strongly. It's a personal blog.
- **Real iconography is allowed**, recreated by us. The limits:
  - no actor faces or likenesses
  - no ripped stills, footage or official logo files
  - the fan-tribute non-affiliation credit stays
- **Recognizability rule:** see `docs/build/AUTOPILOT.md`.
- **The one-liners** ("why this film matters to me") are Aryan's to rewrite. Keep `draft: true`; they render normally on this branch (`film.branchPreview`).
