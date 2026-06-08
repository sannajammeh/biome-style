# 3. Generated all-in-one plugin bundle

Date: 2026-06-08

## Status

Accepted

Revisits the "Bundled mega-`.grit`" alternative rejected in [ADR-0002](0002-config-via-extends-plugins-via-explicit-paths.md).

## Context

[ADR-0002](0002-config-via-extends-plugins-via-explicit-paths.md) ships the plugin layer as granular, per-rule `.grit` files that the consumer references by explicit `./node_modules/...` paths. That gives per-rule testing, per-rule severity, and cherry-picking — but the consumer's `plugins` array is long (one entry per rule), and it grows with every new rule. ADR-0002 explicitly **rejected** a bundled mega-`.grit`, on the grounds that it would lose per-rule severity, per-rule testing, and cherry-picking.

Two of those three grounds do not survive contact with the Biome 2.4.16 CLI:

- **Per-rule severity is preserved in a bundle.** Severity is an argument to `register_diagnostic`, carried *per diagnostic*, not per file. A single `.grit` containing many patterns — each with its own `register_diagnostic(..., severity=...)` — emits each rule at its own severity. Verified: a two-rule bundle produced one `error` and one `warn`.
- **Per-rule testing and cherry-picking are preserved** because the granular files remain the authored source of truth. The bundle is *generated from* them, not authored in place of them. Consumers who want a subset keep using the granular paths.

The remaining real constraint is mechanical: Biome 2.4.16 does **not** accept multiple top-level patterns in one `.grit` (naive concatenation → `Failed to compile the Grit plugin`), and the `sequential { }` modifier panics (`index out of bounds`). The one shape that compiles and fires every rule is a **single top-level `or { }`** whose branches are each rule's pattern body (with its own `where { register_diagnostic(...) }`). Verified against all 18 current rules: the bundle compiles and every rule's `invalid.ts` fixture fires.

So the granular-vs-bundle choice is no longer a trade-off that forces giving something up — a generated bundle can coexist with the granular files and keep everything ADR-0002 wanted.

## Decision

Ship **both** plugin-layer entry points per guide:

- **Granular per-rule files** (unchanged from ADR-0002) — the authored source of truth, the per-rule test target, and the **toggle-individually** path.
- **A generated `all.grit` bundle** at `guides/<guide>/plugins/all.grit` — the **opt-in-everything** path: one plugin path enables the guide's full plugin layer.

Generation:

- A guide-agnostic build (`scripts/build-bundle.ts`) iterates every `guides/*/`, globs `plugins/*.grit` (excluding `all.grit`), strips each file's leading comments and its `language js` line, and wraps every rule body as one branch of a single top-level `or { }` under one `language js`. A `// <rule>.grit` marker precedes each branch for debuggability (comments are trivia and do not affect matching).
- The generator exposes a pure `generateBundle(pluginsDir): string` so the test suite can produce a bundle without writing to disk.
- The bundle is **gitignored** (`guides/*/plugins/all.grit`) and regenerated at publish time via a `prepublishOnly` script; `package.json` `files: ["guides"]` then ships it in the tarball. It is therefore not a committed artifact and needs no freshness test.

Testing — **invalid-side equivalence**: for each rule, lint its `invalid.ts` through a freshly generated bundle and assert ≥1 plugin diagnostic carrying that rule's own message (extracted from the rule's `message="…"` literal). The valid-side is intentionally not asserted clean through the bundle, because a per-rule `valid.ts` is only clean with respect to *its own* rule in isolation — under the full bundle it legitimately trips other rules (e.g. an arrow-at-module-scope fixture valid for `no-function-expression` correctly trips `prefer-function-declaration`).

## Consequences

- Consumers choose one of two modes: a single `all.grit` path (everything) **or** the granular list (cherry-pick). They should use one or the other — referencing both double-reports, since a plugin's severity is fixed and cannot be merged away.
- The repo gains a build step. CLAUDE.md's "No build step" stance is amended: `.grit`/`.json` rules still ship as authored, but the aggregate bundle is generated at publish.
- The bundle is only as correct as the union of its rules. The invalid-side equivalence test guards that every rule still fires once wrapped in the `or { }` (catching metavariable collisions, comment breakage, or compile failures introduced by a new rule).
- A top-level `or { }` **short-circuits on first match**: at a source node matched by more than one rule, only the alphabetically-first branch's diagnostic is emitted. So the bundle is not diagnostic-for-diagnostic identical to loading every granular plugin separately (separate plugins each fire, yielding several diagnostics at a co-matched node) — it can emit fewer at overlap sites. The contract the bundle guarantees, and the equivalence test enforces, is therefore per-rule *liveness* (each rule still fires its own diagnostic somewhere on its `invalid.ts`), not per-node reproduction. Verified: `prefer-function-declaration`'s `const g = function () {}` site is reported by `no-function-expression` through the bundle, while the rule still fires on its arrow site.
- Because the bundle is generated and gitignored, it is never reviewed in diffs; the equivalence test is the safety net in its place.

## Alternatives considered

- **Granular only (status quo, ADR-0002)** — rejected: leaves the verbose `plugins` array as the only option when a one-line opt-in is now demonstrably feasible without losing anything.
- **Bundle only (drop granular)** — rejected: kills cherry-picking and per-rule testing, contradicting the "toggle individually" requirement.
- **Commit the bundle + freshness test** — viable (reviewable in diffs, dogfoodable locally); not chosen, to keep generated output out of git and avoid a stale-artifact failure mode. Revisit if local dogfooding of the bundle becomes valuable.
- **`sequential { }` of patterns** — rejected: panics in Biome 2.4.16. The single `or { }` is the only verified multi-rule shape.
