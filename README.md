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
    "./node_modules/biome-style/guides/google-typescript/plugins/no-private-identifier.grit",
    "./node_modules/biome-style/guides/google-typescript/plugins/no-triple-slash-reference.grit"
  ]
}
```

The full copy-paste plugin list is maintained alongside the [coverage matrix](guides/google-typescript/COVERAGE.md). Plugins are granular (one rule per file) so you can drop the ones you don't want and tune severity per rule.

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

The repo's own `biome.json` is a dev config that extends the shared config and wires the plugins by local path, both to test them and to dogfood the guide on this codebase.

## Status

Work in progress. Configs are scaffolded and the coverage matrix is complete and verified against the real Biome CLI; the GritQL plugins are being authored one at a time.

## License

MIT
