# biome-style

Full ports of the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html) into [Biome](https://biomejs.dev/) via [GritQL](https://biomejs.dev/linter/plugins/).

## What this is

The Google style guide is a widely referenced set of JavaScript conventions, but historically it has only been enforceable through ESLint configs and the Closure tooling. This project re-implements those rules as native Biome lint rules written in **GritQL**, Biome's structural pattern-matching language for plugins.

The goal is parity: every enforceable rule from the Google guide expressed as a GritQL pattern that Biome can run directly — no ESLint, no extra runtime.

## Why

- **Speed** — Biome's Rust-based engine lints and formats orders of magnitude faster than the ESLint + Prettier stack.
- **One tool** — formatting, linting, and the Google conventions in a single binary.
- **No plugin sprawl** — the rules ship as plain `.grit` files instead of a dependency tree.

## Usage

Reference the GritQL plugins from your `biome.json`:

```json
{
  "plugins": ["./plugins/google/<rule>.grit"]
}
```

Then run Biome as usual:

```sh
biome check .
```

## Status

Work in progress. Rules are being ported guide section by section.

## License

MIT
