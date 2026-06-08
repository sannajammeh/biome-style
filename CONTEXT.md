# Context: biome-style

A glossary of the core domain language for this project. Implementation details live in code and ADRs, not here.

## Glossary

### Style guide port
A faithful translation of an external, published coding style guide into mechanisms Biome can enforce natively. The first port is the **Google TypeScript Style Guide**. The repo is designed to host **multiple** ports over time (e.g. other vendors' guides), not just one.

### Guide
A single external source document being ported (e.g. the Google TypeScript Style Guide). Each guide is a self-contained unit within the repo with its own rules, config, and extends-target.

### Rule
A single enforceable directive from a guide. A rule is realized through exactly one **enforcement mechanism** (see below). Not every directive in a guide is a rule here — only those that can be mechanically enforced.

### Enforcement mechanism
How a given rule is actually enforced in Biome. One of: the Biome **formatter** (config), a Biome **built-in lint rule** (config), or a custom **GritQL plugin** (`.grit` file). Directives that need type information or that Biome cannot express are not rules — they are **unenforceable** and documented as such.

### GritQL plugin
A `.grit` pattern file that matches a code pattern and registers a diagnostic. In Biome these are **diagnostic-only**: no autofix, no type information, single-file, syntax-only. Severity is one of `hint` / `info` / `warn` / `error`.

### Coverage matrix
The per-guide `COVERAGE.md`: a shipped table classifying every directive in the source guide into its enforcement mechanism (formatter / built-in / plugin / unenforceable), its status, the guide's source wording, and notes. It is both the user-facing statement of what's enforced and the internal source from which the work (issues) is generated. A guide's rules are not built before they are classified here.

### Shared config (extends target)
The published, consumer-facing Biome config for a guide, exposed as a package subpath (e.g. `biome-style/google-typescript`) and consumed via `extends`. It carries **only** formatter options and built-in lint-rule settings — never `plugins`, because Biome does not resolve `.grit` plugin paths through `extends` from a package. Plugins are referenced separately by the consumer via explicit `node_modules` paths.

### Severity mapping
The rule that a directive's diagnostic severity mirrors the source guide's force of language: "must"/"never" → `error`, "should"/"prefer" → `warn`, "consider" → `info`. The source wording is recorded per rule in the [[coverage-matrix]] so the mapping stays auditable.
