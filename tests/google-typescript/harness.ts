/**
 * Fixture-based plugin test harness.
 *
 * Ground truth is the real Biome CLI, never in-process reasoning about GritQL
 * (the plugin engine is still maturing). For a given rule, this shells out to
 * the pinned `@biomejs/biome` binary with `--reporter=json`, running it in
 * isolation — recommended built-in rules off, only the rule's own `.grit`
 * loaded — so the only diagnostics that can appear come from the plugin under
 * test. All plugin diagnostics share the `plugin` category, which is precisely
 * why one-plugin-per-run isolation is required to attribute them.
 *
 * Fixture convention (every plugin slice follows this verbatim):
 *
 *   guides/<guide>/plugins/<rule>.grit               // the shipped plugin
 *   tests/<guide>/fixtures/<rule>/valid.ts            // must produce 0 diagnostics
 *   tests/<guide>/fixtures/<rule>/invalid.ts          // must produce >= 1 diagnostic
 *   tests/<guide>/<rule>.test.ts                      // calls runPlugin(...)
 *
 * Tests live in a top-level `tests/` tree, NOT under `guides/`, for two
 * reasons: `guides/` is the published npm package (package.json `files`), so
 * tests must stay out of it; and Biome 2.4.16's `files.includes` negation only
 * excludes directories at the repository ROOT. Keeping `tests/` at the root is
 * therefore what lets the dogfood config ignore these intentionally
 * guide-violating fixtures (a nested tests dir cannot be negated in 2.4.16).
 */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';

const TESTS_DIR = import.meta.dir;
const GUIDE = basename(TESTS_DIR);
const REPO_ROOT = dirname(dirname(TESTS_DIR));
const GUIDE_DIR = join(REPO_ROOT, 'guides', GUIDE);
const BIOME_BIN = join(REPO_ROOT, 'node_modules', '.bin', 'biome');

/** A single position in a source file, 1-based. */
interface Position {
  line: number;
  column: number;
}

/** A plugin diagnostic, normalised from Biome's JSON reporter. */
interface PluginDiagnostic {
  message: string;
  start: Position;
  end: Position;
}

/** Which fixture of a rule to lint. */
type Fixture = 'valid' | 'invalid';

function pluginPath(rule: string): string {
  return join(GUIDE_DIR, 'plugins', `${rule}.grit`);
}

function fixturePath(rule: string, fixture: Fixture): string {
  return join(TESTS_DIR, 'fixtures', rule, `${fixture}.ts`);
}

/**
 * Lint one fixture of one rule in isolation and return the plugin diagnostics.
 *
 * Writes a throwaway config that disables every recommended built-in and loads
 * only this rule's plugin, then runs `biome lint --reporter=json` over the
 * fixture so the returned diagnostics are attributable to the plugin alone.
 */
export async function runPlugin(
  rule: string,
  fixture: Fixture,
): Promise<PluginDiagnostic[]> {
  const configDir = mkdtempSync(join(tmpdir(), `biome-style-${rule}-`));
  try {
    const config = {
      linter: { rules: { recommended: false } },
      plugins: [pluginPath(rule)],
    };
    writeFileSync(join(configDir, 'biome.json'), JSON.stringify(config));

    const proc = Bun.spawnSync([
      BIOME_BIN,
      'lint',
      `--config-path=${configDir}`,
      '--reporter=json',
      fixturePath(rule, fixture),
    ]);

    const stdout = proc.stdout.toString();
    if (stdout.trim() === '') {
      throw new Error(
        `Biome produced no JSON output for ${rule}/${fixture}.\n${proc.stderr.toString()}`,
      );
    }

    const report = JSON.parse(stdout) as {
      diagnostics?: Array<{
        category?: string;
        message?: unknown;
        location?: { start?: Position; end?: Position };
      }>;
    };

    return (report.diagnostics ?? [])
      .filter((diagnostic) => diagnostic.category === 'plugin')
      .map((diagnostic) => ({
        message: String(diagnostic.message ?? ''),
        start: diagnostic.location?.start ?? { line: 0, column: 0 },
        end: diagnostic.location?.end ?? { line: 0, column: 0 },
      }));
  } finally {
    rmSync(configDir, { recursive: true, force: true });
  }
}
