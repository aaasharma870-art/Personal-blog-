# Security review (security-review skill) — design/three-films vs origin/main, 2026-09-29

**Result: no high-confidence vulnerabilities** (12 commits, 106 files; the identification pass produced no candidates, so nothing reached false-positive filtering).

Checked:
- **No new DOM/HTML sinks** (dangerouslySetInnerHTML, innerHTML/outerHTML/insertAdjacentHTML, eval/new Function, document.write, srcdoc, postMessage).
- **Existing sinks unchanged and safe:** intro-overlay.tsx `#intro-data` JSON is serialized with `JSON.stringify(...).replace(/</g, "\\u003c")` (no `</script>` breakout); the only new field `cut` is a hard-coded constant. hero-stage.tsx `heroBootHtml`: hero-boot.ts unchanged; new props are server-side constants; the caption is an escaped React node.
- **Intro controller** (controller.js / public/intro/intro.js): canvas drawing, WAAPI timing and one html class toggle; no URL/hash/storage input reaches the DOM.
- **Query params** (?intro / ?skip / ?variant): parsers unchanged; parseSkipFlags only feeds a boolean.
- **CSS / url() injection:** every new background/mask image, SVG data: URI and filter url(#id) is built from constants or useId(); CSS files are static.
- **Secrets:** media provenance and LOG/LEDGER hold only Higgsfield job UUIDs and credit counts — no signed CDN URLs, API keys or tokens; docs/ is not served.
- **PII:** new copy is film captions and variant notes; no grades, address, phone, family details or email in added lines.
- **Tooling:** tools/capture/* runs locally with trusted args, no shell exec, no network fetch; the .claude hook/settings are unchanged vs main.
- **Binaries:** new .webp plates and re-subset .woff2 fonts are static assets.
