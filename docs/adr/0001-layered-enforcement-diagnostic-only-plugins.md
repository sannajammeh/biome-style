# 1. Layered enforcement, diagnostic-only plugins

Date: 2026-06-08

## Status

Accepted

## Context

The goal is to port an entire published style guide (first: the Google TypeScript Style Guide) so that Biome alone enforces it, with no ESLint. The natural assumption is "write every rule as a GritQL `.grit` plugin." That assumption does not survive contact with Biome's actual capabilities.

Biome's GritQL plugins are, as of mid-2026:

- **Diagnostic-only** — they match a pattern and register a diagnostic. They cannot autofix or transform code.
- **Syntax-only** — they match the syntax tree. They have **no type information**.
- **Single-file** — no cross-file or whole-program analysis.

A published style guide does not map cleanly onto that one mechanism:

- A large share of directives are **formatting** (indentation, quotes, semicolons, line width, trailing commas). Biome's formatter already owns these.
- Many directives already exist as **built-in Biome lint rules** (e.g. naming conventions, no `namespace`, no `var`, no default exports). Re-implementing them as plugins would be redundant and lower-quality.
- Some directives **require type information or cross-file analysis** (e.g. no floating promises, return-type-based rules). GritQL plugins fundamentally cannot express these.
- What remains — syntactic directives with no built-in equivalent — is the genuine job for `.grit` plugins.

## Decision

Enforce each directive with the **best available mechanism**, not a single uniform one. Every directive in a guide is classified into exactly one of four buckets:

1. **Formatter** — set via the shared Biome config's `formatter` options.
2. **Built-in lint rule** — enabled/configured via the shared Biome config's `linter` rules.
3. **Custom GritQL plugin** — a per-rule `.grit` file, only where no built-in fits and the rule is syntactically expressible.
4. **Unenforceable** — needs type info or cross-file analysis, or Biome cannot express it. Documented as unenforceable; never faked with an unreliable pattern.

The classification for every directive is recorded in a shipped `COVERAGE.md` per guide, which doubles as the source of the implementation work.

## Consequences

- "Porting the guide" means *the guide is enforced by whatever mechanism each rule allows* — not "the guide is a pile of `.grit` files." Users get accurate enforcement and an explicit, honest statement of the gaps.
- Custom `.grit` work is limited to the real gap, keeping the plugin set small and high-signal (fewer false positives).
- The four-bucket split must be maintained as Biome evolves: a directive can migrate buckets (e.g. an unenforceable rule becomes a built-in once Biome ships type-aware rules). `COVERAGE.md` is the ledger for those migrations.
- Distribution is complicated by the split, because the config buckets and the plugin bucket travel to consumers by different means. See [ADR-0002](0002-config-via-extends-plugins-via-explicit-paths.md).

## Alternatives considered

- **Plugins-only** — author everything as `.grit`. Rejected: leaves all formatting and type-dependent rules unenforced, and duplicates (worse) what Biome's built-ins already do.
- **Config-first** — lean entirely on the formatter + built-ins, write almost no plugins. Rejected: silently drops the guide's genuinely-unique syntactic rules, which are the main reason to do this at all.
