/**
 * Generate the all-in-one GritQL plugin bundle (`all.grit`) for a guide.
 *
 * Biome 2.4.16 accepts only ONE top-level pattern per `.grit` file: naive
 * concatenation of rules fails to compile and `sequential { }` panics. The one
 * shape that compiles and fires every rule is a single top-level `or { }` whose
 * branches are each rule's pattern body, each carrying its own
 * `where { register_diagnostic(...) }` so per-rule severity is preserved
 * (severity is an argument to `register_diagnostic`, carried per diagnostic).
 *
 * The granular per-rule files remain the authored source of truth; this bundle
 * is generated from them. Discovery is glob-based (no manifest): every `*.grit`
 * in the plugins dir except `all.grit` itself joins the bundle, sorted
 * alphabetically for deterministic output.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const BUNDLE_NAME = 'all.grit';
const LANGUAGE_LINE = 'language js';

/**
 * Strip a rule file's leading comments and its `language js` line, returning
 * just the pattern body. Splits into lines, finds the first line whose trimmed
 * value is exactly `language js`, and keeps everything after it.
 */
function stripPreamble(source: string): string {
  const lines = source.split('\n');
  const languageIndex = lines.findIndex(
    (line) => line.trim() === LANGUAGE_LINE,
  );
  return lines
    .slice(languageIndex + 1)
    .join('\n')
    .trim();
}

/** Indent every line of a block by two spaces. */
function indent(block: string): string {
  return block
    .split('\n')
    .map((line) => (line === '' ? line : `  ${line}`))
    .join('\n');
}

/**
 * Build the bundle text for a guide's plugins directory.
 *
 * Pure: reads the granular `.grit` files but writes nothing. Exposed so the
 * test suite can exercise the exact published bytes without touching disk.
 */
export function generateBundle(pluginsDir: string): string {
  const files = readdirSync(pluginsDir)
    .filter((name) => name.endsWith('.grit') && name !== BUNDLE_NAME)
    .sort();

  const branches = files.map((file) => {
    const body = stripPreamble(readFileSync(join(pluginsDir, file), 'utf8'));
    return `${indent(`// ${file}`)}\n${indent(body)}`;
  });

  return `${LANGUAGE_LINE}\n\nor {\n${branches.join(',\n')}\n}\n`;
}

/**
 * Write `plugins/all.grit` for every guide under `guides/`.
 *
 * Guide-agnostic: a new guide is bundled the moment it has a `plugins/`
 * directory — no per-guide registration. Returns the paths written.
 */
function buildAllGuides(repoRoot: string): string[] {
  const guidesDir = join(repoRoot, 'guides');
  const written: string[] = [];
  for (const guide of readdirSync(guidesDir).sort()) {
    const pluginsDir = join(guidesDir, guide, 'plugins');
    if (!isDirectory(pluginsDir)) {
      continue;
    }
    const bundlePath = join(pluginsDir, BUNDLE_NAME);
    writeFileSync(bundlePath, generateBundle(pluginsDir));
    written.push(bundlePath);
  }
  return written;
}

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

// CLI entrypoint: regenerate every guide's bundle. Wired into `prepublishOnly`
// so the published tarball carries fresh bundles; the artifact itself is
// gitignored.
if (import.meta.main) {
  const repoRoot = dirname(import.meta.dir);
  const written = buildAllGuides(repoRoot);
  for (const path of written) {
    console.log(`wrote ${path}`);
  }
}
