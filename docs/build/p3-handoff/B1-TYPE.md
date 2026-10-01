# B1-TYPE return (status: done)

Files: lib/fonts.ts, lib/world-fonts.ts, components/providers/world-fonts.tsx, scripts/fetch-display-fonts.mjs, scripts/checks/{lettering,fonts}.mjs, app/globals.css, app/p3/type.css, app/layout.tsx, components/sections/hero/hero-section.tsx, components/site/metric-tile.tsx, components/sections/experiment/experiment-section.tsx, components/sections/ledger/ledger-section.tsx, tools/capture/probes/{research-font,font-network}.mjs, docs/build/FONTS.md, public/fonts/film/pirata-one/{pirata-one-ascii.woff2,OFL.txt,glyphs.txt} (new), assets/fonts/film/{cormorant-garamond-500,kalam-700,patrick-hand,rye-ascii,courier-prime,nothing-you-could-do,im-fell-english-sc,crimson-pro}/{<face>.woff2,OFL.txt,glyphs.txt} (new), assets/fonts/film/{pirata-one,kalam,rye,im-fell-english}/glyphs.txt (new).

APIs: markWorldFontsReady(world, timeoutMs=300); worldFontsMarked(); WorldFonts () => null; lib/fonts.ts new face objects + NAME_FONT_HREF, NOSCRIPT_WORLD_FONTS_CSS, typeCredits; CSS: utility type-name; role classes font-world-head|body|lead|hand; hooks [data-research] (data → Geist) and [data-house-type] (chrome → house type); html[data-fonts~=world] tokens (≥ 64rem only).

HANDOFFS:
1. components/site/footer.tsx (B1-STAGE file): the TYPE credits row renders `typeCredits` from lib/fonts.ts instead of shippedFaces().
2. Docs (assembler): record the §P override + world roles at SPEC.md l.41, l.650, l.833, §9.7; DESIGN.md l.35, l.207, §2.1.1; ICONS.md §9 → point each at FONTS.md §P3.
3. lib/smooth-scroll.ts scrollToTarget / fast lane / chapter-select: await markWorldFontsReady(<target world>) (≤ 300 ms) before the cut (B1-SCROLL already does it for the fast lane → verify for scrollToTarget long jumps generally).
4. components/sections/chapter/chapter-section.tsx (B1-STAGE): data-research on reported figures (:223), caveats/limitations (:185-188), research grids.
5. components/site/gauntlet-tabs.tsx: data-research on the root (belt and braces).
6. components/site/hero.tsx: DELETE (dead file with as="h1"; validator warns).
7. Wave 3 hosts + chrome: `font-world-hand` for rdr2 journal heads/dates (≤ 4 words), `font-world-lead` for idiots board notes; `data-house-type` on new chrome (fast lane, hunt chip, sound toggle, director's cut).

ACCEPTANCE (assembler runs): p3-probes --only=font-network,research-font at --vw=1440x900 and 1024x768 (h1 family 'Film Name Pirates', no uppercase, one h1, preload media; desktop LCP ≤ 400 ms; CLS before scroll ≤ .001; 390 fetches no world/name face, ≤ 54,336 B film fonts; add --mobile-lcp-base=<P3-0 ms>); research-font 0 non-Geist in [data-research]; npm run check (budgets + glyph coverage).

NOTES: tsc clean, eslint clean, npm run check OK (22 warnings; its only one = hero.tsx dead h1). h1 at 1440: Pirata 172.8px, lh .96, tracking .01em, box 477×332; at 390 Geist 72px (unchanged). Prologue exception: on a first visit IM Fell English SC (44 KB) loads with the page for the hp captions (roman 29.9 KB did before) — Aryan may confirm. Pirates head = the name's file (preloaded), so Pirates h2s/captions are Pirata from first paint on desktop. Desktop font total 183,964 B (rdr2 55,180 B), within budget. --container-body = 35rem at ≥ 64rem. Fallback face if the 1024 blind test fails: New Rocker. Pirata One + Rye ship Google-served unmodified ASCII+ files (RFN).
