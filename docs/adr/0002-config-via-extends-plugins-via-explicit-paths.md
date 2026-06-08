# 2. Config via `extends`, plugins via explicit paths

Date: 2026-06-08

## Status

Accepted. The "Bundled mega-`.grit`" alternative rejected below is revisited by [ADR-0003](0003-generated-plugin-bundle.md): a *generated* bundle now ships **alongside** the granular files (it does not replace them), having been shown to preserve per-rule severity, testing, and cherry-picking.

## Context

The package must be installable and referenced from a consumer's `biome.json` with minimal friction. Biome offers two distribution channels, and they behave differently:

- **`extends`** resolves configuration from an npm package via a `package.json` `exports` subpath (e.g. `extends: ["biome-style/google-typescript"]`). This works well for `formatter` and `linter` settings.
- **`plugins`** is an array of `.grit` paths. Biome's maintainers have **deliberately chosen not to resolve plugin paths from npm packages** (to avoid ESLint-style plugin sprawl, preferring rules be upstreamed into Biome core). The [recent extends/plugin fix](https://github.com/biomejs/biome/pull/8365) only covers the in-repo monorepo `extends: "//"` case; open issues confirm that `.grit` paths declared in a package config consumed via `extends` do **not** reliably resolve for the consumer.

So the config layer can travel via `extends`, but the plugin layer cannot. A shared config that lists `plugins` with package-relative paths will not work once extended from `node_modules`.

The enforcement model ([ADR-0001](0001-layered-enforcement-diagnostic-only-plugins.md)) puts directives in both layers, so both must reach the consumer somehow.

## Decision

Split distribution by layer, and keep both layers in **one** package (`biome-style`), one subpath export per guide:

- **Config layer (formatter + built-in rules)** ships as a **shared config** at a subpath (`biome-style/google-typescript`) and is consumed with a single `extends` entry. This shared config carries **no `plugins` key**.
- **Plugin layer** ships as **granular, per-rule `.grit` files**. Consumers reference them with **explicit `./node_modules/biome-style/google-typescript/plugins/*.grit` paths** in their own `plugins` array. The README documents the full copy-paste list.

The repository keeps a **separate dev/test config** that wires the plugins by local relative path, used for the fixture test suite and to dogfood the guide on this repo itself.

## Consequences

- A consumer's setup is two steps, not one: `extends` for the config, plus an explicit `plugins` list. This is more verbose than `extends` alone, but it is the only arrangement that actually works today, and it is fully transparent — the consumer sees exactly which `.grit` files run.
- Per-rule files (rather than a bundled mega-`.grit`) keep each rule independently testable, independently severity-tunable, and cherry-pickable by consumers who want only some rules. The cost is a longer `plugins` list.
- The published shared config and the in-repo dev config must be kept distinct; only the dev config references plugins.
- If Biome later resolves package plugin paths through `extends`, this can be revisited to collapse the two steps into one. Until then, the explicit-path list is the contract.

## Alternatives considered

- **Bundled mega-`.grit`** — concatenate all rules into one file so consumers add a single plugin path. Rejected: loses per-rule severity (which must mirror the guide's language), per-rule testing, and cherry-picking; harder to maintain.
- **Postinstall / CLI codegen** — a bin script injects the plugin paths into the consumer's `biome.json`. Rejected: rewrites user-owned config, fragile across upgrades, surprising behavior.
- **Monorepo, scoped package per guide** (`@biome-style/google-typescript`, …) — independent versioning per guide. Rejected for now: more publish/release overhead than a single package with subpath exports warrants at this scale; can be revisited if guides need to version independently.
