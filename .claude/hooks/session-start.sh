#!/bin/bash
# SessionStart hook (Claude Code on the web): make a fresh container ready to
# resume the autonomous build (CONTINUE.md) — deps installed so
# `npm run check`, `npx eslint .` and `npm run build` work at once, and the
# capture harness (tools/capture/*.js) can require the preinstalled Playwright.
set -euo pipefail

# Web sessions only; local machines manage their own node_modules.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Idempotent and lockfile-exact: reuse the cached node_modules when it already
# satisfies package-lock.json; otherwise `npm ci` (never `npm install`, which
# rewrites the Windows-generated lockfile's optional-dep flags).
if [ -d node_modules ] && npm ls --depth=0 >/dev/null 2>&1; then
  echo "session-start: node_modules up to date"
else
  npm ci --no-audit --no-fund --loglevel=error
fi

# Session env: the global Playwright (Chromium lives in /opt/pw-browsers — never
# run `playwright install`) resolves for the CommonJS capture scripts, and Next
# telemetry stays off.
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  {
    echo "export NODE_PATH=\"$(npm root -g)\""
    echo "export NEXT_TELEMETRY_DISABLED=1"
  } >> "$CLAUDE_ENV_FILE"
fi
