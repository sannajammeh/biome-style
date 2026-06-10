# Context: biome-style

A glossary of the core domain language for this project. Implementation details live in code and ADRs, not here.

## Glossary

### Style guide port
A faithful translation of an external, published coding style guide into mechanisms Biome can enforce natively. The first port is the **Google TypeScript Style Guide**; the second is the **Airbnb JavaScript Style Guide**. The repo is designed to host **multiple** ports over time (e.g. other vendors' guides), not just one. A port has a [[source-basis]] (prose or config) that determines how its [[coverage-matrix]] is enumerated.

### Source basis
What a port is enumerated *against* — the unit that becomes one row of its [[coverage-matrix]]. Two kinds:
- **Prose-keyed** — the source is a human-readable document with no canonical lint config behind it; each prose directive is a unit. The Google TypeScript port is prose-keyed.
- **Config-keyed** — the source guide *is* (or is published as) a lint config, and the prose merely documents it; each **enabled rule** of that config is a unit, keyed by rule name. The Airbnb JavaScript port is config-keyed against the core ESLint rules enabled by `eslint-config-airbnb-base` (its `eslint-plugin-import` rules and all React/JSX/a11y are out of scope). Rules the config sets to `off` are not units.

### Guide
A single external source document being ported (e.g. the Google TypeScript Style Guide). Each guide is a self-contained unit within the repo with its own rules, config, and extends-target.

### Rule
A single enforceable directive from a guide. A rule is realized through exactly one **enforcement mechanism** (see below). Not every directive in a guide is a rule here — only those that can be mechanically enforced.

### Enforcement mechanism
How a given rule is actually enforced in Biome. One of: the Biome **formatter** (config), a Biome **built-in lint rule** (config), or a custom **GritQL plugin** (`.grit` file). Directives that need type information or that Biome cannot express are not rules — they are **unenforceable** and documented as such.

### GritQL plugin
A `.grit` pattern file that matches a code pattern and registers a diagnostic. In Biome these are **diagnostic-only**: no autofix, no type information, single-file, syntax-only. Severity is one of `hint` / `info` / `warn` / `error`.

### Coverage matrix
The per-guide `COVERAGE.md`: a shipped table classifying every unit of the source guide — a prose directive for prose-keyed guides, an enabled lint rule for config-keyed guides (see [[source-basis]]) — into its enforcement mechanism (formatter / built-in / plugin / unenforceable), its status, the guide's source wording, and notes. It is both the user-facing statement of what's enforced and the internal source from which the work (issues) is generated. A guide's rules are not built before they are classified here.

### Shared config (extends target)
The published, consumer-facing Biome config for a guide, exposed as a package subpath (e.g. `biome-style/google-typescript`) and consumed via `extends`. It carries **only** formatter options and built-in lint-rule settings — never `plugins`, because Biome does not resolve `.grit` plugin paths through `extends` from a package. Plugins are referenced separately by the consumer via explicit `node_modules` paths.

### Severity mapping
How a rule's diagnostic severity is derived, by [[source-basis]]:
- **Prose-keyed** — severity mirrors the source guide's force of language: "must"/"never" → `error`, "should"/"prefer" → `warn`, "consider" → `info`.
- **Config-keyed** — severity is anchored to the source config's level (`error` for level `2`, `warn` for level `1`), but a purely-stylistic rule may be **downgraded** to a softer tier at the porter's judgment.

Either way the source signal (prose wording or config level) and any downgrade is recorded per rule in the [[coverage-matrix]] so the mapping stays auditable.

### Plugin bundle
A single generated `.grit` file per guide (`all.grit`) that aggregates every per-rule [[gritql-plugin]] into one plugin, so a consumer can enable the guide's full plugin layer with one plugin path instead of listing each rule. It is the **opt-in-everything** counterpart to referencing the granular per-rule files (the **toggle-individually** path); the per-rule files remain the source of truth, and the bundle is derived from them. Each rule keeps its own severity inside the bundle, because severity is carried per-diagnostic, not per-file. A Biome GritQL plugin's severity is fixed in the plugin and cannot be retuned from the consumer's config, so "toggling" a rule means including or excluding its plugin path — never adjusting its level.
