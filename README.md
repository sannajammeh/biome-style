# biome-style

Published coding style guides, ported into [Biome](https://biomejs.dev/) and enforced natively — no ESLint, no Prettier, no Closure tooling. Every enforceable directive is realized as a Biome **formatter** option, a Biome **built-in lint rule**, or a custom [**GritQL**](https://biomejs.dev/linter/plugins/) plugin (`.grit`).

The first guide is the [**Google TypeScript Style Guide**](https://google.github.io/styleguide/tsguide.html). The repo is built to host more guides over time — one subpath export per guide.

## What it covers

Each guide ships a [coverage matrix](guides/google-typescript/COVERAGE.md) that classifies **every directive** in the source guide into the mechanism that enforces it (formatter / built-in / plugin) or marks it **unenforceable** (needs type information, whole-program analysis, or human judgement) and says why. Nothing is faked — the gaps are documented.

Diagnostic severity mirrors the guide's force of language: *must*/*never* → `error`, *should*/*prefer* → `warn`, *consider* → `info`.

## Install

```sh
bun add -d biome-style @biomejs/biome
# or: npm i -D biome-style @biomejs/biome
```

GritQL plugins are still maturing in Biome — pin a known-good Biome version. This guide is verified against **Biome 2.4.16**.

## Usage

Setup is two steps, because Biome distributes config and plugins through different channels (see [ADR-0002](docs/adr/0002-config-via-extends-plugins-via-explicit-paths.md)).

**1. Extend the shared config** (formatter + built-in rules) in your `biome.json`:

```json
{
  "extends": ["biome-style/google-typescript"]
}
```

**2. Reference the GritQL plugins by explicit path.** Biome does not resolve `.grit` plugin paths through `extends` from a package, so each plugin is listed directly:

```json
{
  "extends": ["biome-style/google-typescript"],
  "plugins": [
    "./node_modules/biome-style/guides/google-typescript/plugins/no-object-constructor.grit",
    "./node_modules/biome-style/guides/google-typescript/plugins/no-private-identifier.grit",
    "./node_modules/biome-style/guides/google-typescript/plugins/new-parens.grit",
    "./node_modules/biome-style/guides/google-typescript/plugins/no-angle-bracket-assertion.grit",
    "./node_modules/biome-style/guides/google-typescript/plugins/no-import-equals-require.grit",
    "./node_modules/biome-style/guides/google-typescript/plugins/no-multiline-string.grit",
    "./node_modules/biome-style/guides/google-typescript/plugins/no-unary-plus.grit",
    "./node_modules/biome-style/guides/google-typescript/plugins/no-parseint-base10.grit",
    "./node_modules/biome-style/guides/google-typescript/plugins/no-nullable-type-alias.grit",
    "./node_modules/biome-style/guides/google-typescript/plugins/no-function-expression.grit",
    "./node_modules/biome-style/guides/google-typescript/plugins/no-object-literal-assertion.grit",
    "./node_modules/biome-style/guides/google-typescript/plugins/class-computed-symbol-only.grit",
    "./node_modules/biome-style/guides/google-typescript/plugins/no-defineproperty-accessor.grit",
    "./node_modules/biome-style/guides/google-typescript/plugins/simple-param-destructuring.grit",
    "./node_modules/biome-style/guides/google-typescript/plugins/array-destructuring-default.grit",
    "./node_modules/biome-style/guides/google-typescript/plugins/no-hex-escape-for-known.grit"
  ]
}
```

Plugins are granular (one rule per file) so you can drop the ones you don't want and tune severity per rule. Each plugin maps to a directive in the [coverage matrix](guides/google-typescript/COVERAGE.md); the matrix is the source of truth for which directives ship as plugins (and which are `unenforceable`).

| Plugin | Directive | Severity |
| --- | --- | --- |
| `no-object-constructor` | Do not use the `Object()` constructor | error |
| `no-private-identifier` | Use the `private` modifier, not `#private` fields | error |
| `new-parens` | Constructor calls must use parentheses (`new Foo()`) | error |
| `no-angle-bracket-assertion` | Type assertions use `as`, not `<T>x` | error |
| `no-import-equals-require` | No `import x = require(...)` | error |
| `no-multiline-string` | No line continuations in strings | error |
| `no-unary-plus` | No unary `+` to coerce to number | error |
| `no-parseint-base10` | No `parseInt`/`parseFloat` for base-10 parsing | error |
| `no-nullable-type-alias` | Type aliases must not include `\| null` / `\| undefined` | error |
| `no-function-expression` | Use arrow functions, not function expressions | error |

Then run Biome as usual:

```sh
biome check .
```

## How it's built

- [`CONTEXT.md`](CONTEXT.md) — domain glossary (port, guide, rule, mechanism, coverage matrix, severity mapping).
- [`docs/adr/`](docs/adr/) — the architectural decisions (layered enforcement; config-via-`extends` / plugins-via-explicit-paths).
- [`guides/<guide>/COVERAGE.md`](guides/google-typescript/COVERAGE.md) — the spine: the full directive-by-directive classification.
- [`guides/<guide>/biome.json`](guides/google-typescript/biome.json) — the published shared config (no `plugins` key).
- `guides/<guide>/plugins/*.grit` — the GritQL plugins.
- `tests/<guide>/` — fixture-based tests that run the real Biome CLI per plugin (kept out of `guides/` so they aren't published). The per-rule fixture convention (`fixtures/<rule>/{valid,invalid}.ts` + `<rule>.test.ts`) is documented in [`tests/google-typescript/harness.ts`](tests/google-typescript/harness.ts); every plugin slice follows it verbatim.

The repo's own `biome.json` is a dev config that extends the shared config and wires the plugins by local path, both to test them and to dogfood the guide on this codebase.

## Status

Work in progress. Configs are scaffolded and the coverage matrix is complete and verified against the real Biome CLI; the GritQL plugins are being authored one at a time.

## License

MIT
