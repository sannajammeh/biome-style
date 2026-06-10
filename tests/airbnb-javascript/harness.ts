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
 *   tests/<guide>/fixtures/<rule>/valid.js            // must produce 0 diagnostics
 *   tests/<guide>/fixtures/<rule>/invalid.js          // must produce >= 1 diagnostic
 *   tests/<guide>/<rule>.test.ts                      // calls runPlugin(...)
 *
 * Tests live in a top-level `tests/` tree, NOT under `guides/`, for two
 * reasons: `guides/` is the published npm package (package.json `files`), so
 * tests must stay out of it; and Biome 2.4.16's `files.includes` negation only
 * excludes directories at the repository ROOT. Keeping `tests/` at the root is
 * therefore what lets the dogfood config ignore these intentionally
 * guide-violating fixtures (a nested tests dir cannot be negated in 2.4.16).
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';

const TESTS_DIR = import.meta.dir;
const GUIDE = basename(TESTS_DIR);
const REPO_ROOT = dirname(dirname(TESTS_DIR));
const GUIDE_DIR = join(REPO_ROOT, 'guides', GUIDE);
const BIOME_BIN = join(REPO_ROOT, 'node_modules', '.bin', 'biome');
const SHARED_CONFIG = join(GUIDE_DIR, 'biome.json');

/** The guide's granular `.grit` plugins directory (also where `all.grit` lives). */
export const PLUGINS_DIR = join(GUIDE_DIR, 'plugins');

/** A single position in a source file, 1-based. */
interface Position {
  line: number;
  column: number;
}

/** A plugin diagnostic, normalised from Biome's JSON reporter. */
export interface PluginDiagnostic {
  message: string;
  start: Position;
  end: Position;
}

/** Which fixture of a rule to lint. */
type Fixture = 'valid' | 'invalid';

function pluginPath(rule: string): string {
  return join(PLUGINS_DIR, `${rule}.grit`);
}

function fixturePath(rule: string, fixture: Fixture): string {
  return join(TESTS_DIR, 'fixtures', rule, `${fixture}.js`);
}

/** Absolute path to a rule's fixture — public wrapper around `fixturePath`. */
export function fixtureFor(rule: string, fixture: Fixture): string {
  return fixturePath(rule, fixture);
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

/**
 * Lint a fixture through a generated plugin bundle and return its plugin
 * diagnostics.
 *
 * Same isolation discipline as `runPlugin` — a throwaway config with every
 * recommended built-in off and only the bundle loaded — but loads the single
 * aggregate `all.grit` at `bundlePath` instead of one rule's file. Because the
 * bundle carries every rule, the returned diagnostics span all of them; the
 * caller attributes them by message.
 */
export function runBundle(
  bundlePath: string,
  fixtureAbsPath: string,
): PluginDiagnostic[] {
  const configDir = mkdtempSync(join(tmpdir(), 'biome-style-bundle-'));
  try {
    const config = {
      linter: { rules: { recommended: false } },
      plugins: [bundlePath],
    };
    writeFileSync(join(configDir, 'biome.json'), JSON.stringify(config));

    const proc = Bun.spawnSync([
      BIOME_BIN,
      'lint',
      `--config-path=${configDir}`,
      '--reporter=json',
      fixtureAbsPath,
    ]);

    const stdout = proc.stdout.toString();
    if (stdout.trim() === '') {
      throw new Error(
        `Biome produced no JSON output for bundle on ${fixtureAbsPath}.\n${proc.stderr.toString()}`,
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

/* -------------------------------------------------------------------------- *
 * Shared-config coverage (issue #2)
 *
 * Unlike `runPlugin`, these runners exercise the PUBLISHED SHARED CONFIG
 * (`guides/<guide>/biome.json`) end-to-end — the formatter options and built-in
 * lint rules a consumer actually inherits via `extends`. They guard against
 * silent drift when a Biome upgrade renames or moves a built-in rule.
 *
 * The shared config has `"root": false`, so it is designed to be extended, not
 * used as the top-level config. Each runner writes a throwaway `biome.json`
 * that `extends` the absolute path to the shared config and nothing else; the
 * shared config carries no `plugins` key, so no `.grit` plugins load and every
 * diagnostic is attributable to a built-in rule.
 * -------------------------------------------------------------------------- */

/** Biome's JSON-reporter severity strings. */
type Severity = 'error' | 'warning' | 'information' | string;

/** A built-in diagnostic, normalised from Biome's JSON reporter. */
export interface SharedDiagnostic {
  /** The rule id, e.g. `lint/style/noVar`. */
  category: string;
  severity: Severity;
  start: Position;
  end: Position;
  message: string;
}

/**
 * Write a throwaway config that extends the shared config (and nothing else),
 * returning its directory. Caller is responsible for cleanup.
 */
function makeSharedConfigDir(prefix: string): string {
  const configDir = mkdtempSync(join(tmpdir(), `biome-style-${prefix}-`));
  const config = { extends: [SHARED_CONFIG] };
  writeFileSync(join(configDir, 'biome.json'), JSON.stringify(config));
  return configDir;
}

/**
 * Lint a fixture using the published shared config and return its built-in
 * diagnostics, normalised to rule identity + severity.
 */
export function runSharedConfig(fixtureAbsPath: string): SharedDiagnostic[] {
  const configDir = makeSharedConfigDir('shared');
  try {
    const proc = Bun.spawnSync([
      BIOME_BIN,
      'lint',
      `--config-path=${configDir}`,
      '--reporter=json',
      fixtureAbsPath,
    ]);

    const stdout = proc.stdout.toString();
    if (stdout.trim() === '') {
      throw new Error(
        `Biome produced no JSON output for ${fixtureAbsPath}.\n${proc.stderr.toString()}`,
      );
    }

    const report = JSON.parse(stdout) as {
      diagnostics?: Array<{
        category?: string;
        severity?: string;
        message?: unknown;
        location?: { start?: Position; end?: Position };
      }>;
    };

    return (report.diagnostics ?? []).map((diagnostic) => ({
      category: String(diagnostic.category ?? ''),
      severity: String(diagnostic.severity ?? ''),
      message: String(diagnostic.message ?? ''),
      start: diagnostic.location?.start ?? { line: 0, column: 0 },
      end: diagnostic.location?.end ?? { line: 0, column: 0 },
    }));
  } finally {
    rmSync(configDir, { recursive: true, force: true });
  }
}

/** Return every shared-config diagnostic for a given rule id. */
export function diagnosticsFor(
  diagnostics: SharedDiagnostic[],
  category: string,
): SharedDiagnostic[] {
  return diagnostics.filter((diagnostic) => diagnostic.category === category);
}

/**
 * Format a fixture using the published shared config (NO `--write`) and return
 * the formatted source text. Used to assert the formatter rewrites
 * non-conforming source into the conforming form.
 *
 * `biome format <file>` (no `--write`) prints only a *diff* to the terminal,
 * not the formatted source — so to capture the conforming text we feed the
 * fixture through stdin with `--stdin-file-path`, which makes Biome emit the
 * formatted result on stdout. The fixture's own extension is preserved so the
 * formatter applies the JavaScript rules from the shared config.
 */
export function formatShared(fixtureAbsPath: string): string {
  const configDir = makeSharedConfigDir('format');
  try {
    const source = readFileSync(fixtureAbsPath);
    const proc = Bun.spawnSync(
      [
        BIOME_BIN,
        'format',
        `--config-path=${configDir}`,
        `--stdin-file-path=${basename(fixtureAbsPath)}`,
      ],
      { stdin: source },
    );

    const stdout = proc.stdout.toString();
    if (stdout.trim() === '') {
      throw new Error(
        `Biome produced no formatted output for ${fixtureAbsPath}.\n${proc.stderr.toString()}`,
      );
    }
    return stdout;
  } finally {
    rmSync(configDir, { recursive: true, force: true });
  }
}
