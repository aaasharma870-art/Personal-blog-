// scripts/checks/tailwind-classes.mjs: a class name Tailwind can read.
// Loaded by scripts/check-manifest.mjs: `export default function run(ctx)`.
//
// Tailwind builds its CSS by scanning the SOURCE TEXT for class names. A class
// whose closing `]` runs straight into a template-literal interpolation
// (`grid-cols-[var(--hall-w)_minmax(0,1fr)]${x ? " a" : ""}`) is read as one
// broken word, so the class is never generated and the layout silently
// collapses (this emptied the Marauder's Map hallway on Oct 16-19: no error,
// no warning, only a missing stylesheet rule). Put a space (or a cn() call)
// between the class and the interpolation.
import fs from "node:fs";
import path from "node:path";

export default function run(ctx) {
  const { ROOT, err, uiFiles } = ctx;
  for (const f of uiFiles) {
    if (!/\.tsx$/.test(f)) continue;
    const rel = path.relative(ROOT, f);
    fs.readFileSync(f, "utf8").split("\n").forEach((line, i) => {
      // an arbitrary-value class (name-[...]) glued to `${`
      if (/-\[[^\]\s]*\]\$\{/.test(line)) {
        err(`[tailwind] ${rel}:${i + 1}: a class ending in ] touches a \${...} interpolation; Tailwind will not generate it (add a space, or use cn())`);
      }
    });
  }
}
