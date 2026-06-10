# 4. Config-keyed ports (the Airbnb JavaScript guide)

Date: 2026-06-08

## Status

Accepted

## Context

The first port — the Google TypeScript Style Guide — is **prose-keyed**: its source is a human-readable document with no canonical lint config behind it. The `COVERAGE.md` matrix enumerates over prose directives, severity is derived from the guide's force of language ("must"/"should"/"consider"), and the spine is the guide's prose section numbers. `CONTEXT.md`'s original definitions of *coverage matrix* and *severity mapping* assumed every guide worked this way.

The Airbnb JavaScript Style Guide breaks that assumption. It **is** the documentation for `eslint-config-airbnb-base`: every prose directive is annotated with the exact ESLint rule(s) (`// eslint: rule-name`) that enforce it. The prose is a human-readable skin over a machine-readable rule set. Porting "the prose" and porting "the config" are genuinely different projects — they diverge on what counts as a unit (a paragraph vs a rule), where severity comes from (force-of-language vs the config's `error`/`warn` level), and how completeness is judged (did we read every section vs did we map every enabled rule).

There is also an identity tension worth recording: the repo's banner is *"No ESLint, no Prettier."* Deriving a port from an ESLint config reads, at first glance, as a contradiction.

## Decision

The Airbnb JavaScript port is **config-keyed**. A port's [[source-basis]] (prose vs config) is now a first-class property in `CONTEXT.md`, and the Airbnb port resolves it as follows:

- **Source of truth = `eslint-config-airbnb-base@15.0.0`**, not the prose. This version is both the latest and the last meaningful release (it targets ESLint 7/8's pre-flat-config core rules), so the source is effectively frozen — the config-keyed analogue of Google's "guide snapshot" date, recorded in the `COVERAGE.md` header. The prose is demoted to a note/hint column.
- **Unit of enumeration = an enabled core ESLint rule.** Each rule the config sets to a non-`off` level is one matrix row, keyed by rule name. Rules set to `off` are not units.
- **Scope = core ESLint rules only.** The `eslint-plugin-import` rules that `airbnb-base` also enables are **out of scope** (Biome handles module concerns structurally — `organizeImports` etc. — and import-resolution rules carry per-project policy a single-file engine can't replicate). React/JSX/a11y (the full `eslint-config-airbnb`) is out of scope entirely.
- **Severity = config-level, downgradable.** A rule's severity is anchored to the config's level (`2` → `error`, `1` → `warn`), but a purely-stylistic rule may be downgraded to a softer tier at the porter's judgment, recorded in Notes. There is no force-of-language input.
- **Spine = `airbnb-base`'s own rule groups.** Section headers mirror the config's source files (`best-practices`, `errors`, `es6`, `style`, `variables`, `strict`, `node`), so the matrix audits 1:1 against the source.
- **Distribution is unchanged.** The port ships as a new guide directory `guides/airbnb-javascript/` with subpath `@sannajammehtry/biome-style/airbnb-javascript`, following ADR-0001/0002/0003 exactly (shared config via `extends`, plugins by explicit path, generated `all.grit` bundle). Config-keyed changes *how the matrix is built*, not *how the guide ships*.

**"No ESLint" reconciliation:** the slogan describes the *consumer's* toolchain and the *output*, not the porting method. A consumer of `biome-style/airbnb-javascript` installs no ESLint, no plugins, no `.eslintrc` — they get pure Biome formatter options, built-in rules, and `.grit` plugins. That `eslint-config-airbnb-base` was the *reference we read* to build that output no more makes this an ESLint dependency than reading the Google prose makes the Google port a Google dependency.

## Consequences

- The repo now hosts two porting methodologies. `CONTEXT.md` carries a *source basis* term and the *coverage matrix* / *severity mapping* terms are generalized to cover both. Future guides declare their source basis up front.
- The Airbnb matrix skews by mechanism in a predictable way: the `style` group is largely ESLint's now-deprecated *formatting* rules, which collapse into Biome **formatter** options (non-diagnostic); `errors`/`best-practices`/`es6` yield built-ins plus a few `.grit` plugins; and there is a meaningful "no Biome equivalent → unenforceable" tail (rules needing type info, cross-file analysis, or with no Biome expression).
- The matrix is overwhelmingly `error`/`warn` with `info` reserved for deliberate downgrades — it will not show the smooth must/should/consider gradient the Google matrix does, because the source has no "consider" tier.
- Fidelity caveat: `airbnb-base` configures many rules with specific *options* (e.g. `quotes` single, `no-unused-vars` with `args`/`ignoreRestSiblings`). Where Biome's equivalent can't replicate the options, the row is flagged stricter/looser in Notes per the existing COVERAGE convention — the same discipline used in the Google matrix.
- Because the source config is frozen at `15.0.0`, the Airbnb matrix needs no re-fetch/re-audit cadence; it only changes if Biome gains new rules that move a row out of the unenforceable tail.

## Alternatives considered

- **Prose-keyed, like Google (eslint annotations as hints only)** — rejected: it would under-cover, because `eslint-config-airbnb-base` enables rules that have no dedicated prose section, and it would discard the one unambiguous severity signal the source actually provides (the config level) in favor of re-judging force-of-language from prose that exists only to *explain* the config.
- **Config-keyed over the full `eslint-config-airbnb`** (incl. React/JSX/a11y) — rejected for this port: most React-specific rules have no Biome equivalent and would bloat the unenforceable tail; the user asked for the JavaScript guide. Left open as a possible future `airbnb-react` guide.
- **Include the `eslint-plugin-import` rules** — rejected: module-resolution rules need resolver/`tsconfig`-`paths` knowledge unavailable to single-file, syntax-only plugins (the same reasoning that reclassified Google's "prefer relative imports" to unenforceable), and Biome covers the mechanizable part structurally.
- **Severity verbatim from config level (no downgrade)** — rejected: it erases the `info` tier entirely and would emit aesthetic rules at the same weight as correctness rules; the downgrade valve keeps the tiering useful while staying config-anchored.
