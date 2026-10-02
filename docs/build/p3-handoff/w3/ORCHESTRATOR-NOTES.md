# Orchestrator notes for the W3 gate (2026-10-02)

1. W3-RDR2: HORSE_FRAMES (components/words/sprites/horse-frames.ts) puts ~24 KB of path data (~9.7 KB gz) into the server HTML and the RSC payload on EVERY device (phones too). Phase 3 rule: phones unchanged + first-load budget. Fix in the W3 gate: load the frames lazily on DESKTOP_FINE only (the fly binder fetches/imports them when the B45 fly-through arms), so no path data ships in SSR HTML.
2. W3-IDIOTS handoffs: register "work.invite" and "experiment.curve" in lib/variants.ts (DEFAULT + ALT, see W3-IDIOTS.json); re-measure estVh (optuna appendix collapsed, chart slot gone, experiment head tightened) and fix the B24→B25 gap.
3. Every W3 return is in this folder (W3-*.json).
