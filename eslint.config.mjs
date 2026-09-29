import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Motion's useReducedMotion reads the OS preference on the client's first
      // render, so any tree that branches on it fails hydration (React #418)
      // under prefers-reduced-motion. lib/flags.ts has the hydration-safe one.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "motion/react",
              importNames: ["useReducedMotion"],
              message:
                "Import useReducedMotion from \"@/lib/flags\" (hydration-safe) instead.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local agent tooling (skills, stale worktrees): never part of the app,
    // excluded from git via .git/info/exclude.
    ".claude/**",
    // Capture harness (CommonJS Node scripts for frame captures), not app code.
    "tools/**",
  ]),
]);

export default eslintConfig;
