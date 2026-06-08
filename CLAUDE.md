# biome-style

Published coding style guides ported into [Biome](https://biomejs.dev/) and enforced natively — via formatter options, built-in lint rules, and custom [GritQL](https://biomejs.dev/linter/plugins/) plugins (`.grit`). No ESLint, no Prettier, no Closure tooling. The first guide is the [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html); the repo is multi-guide-ready (one subpath export per guide).

## Architecture (read the docs, don't re-litigate)

- `CONTEXT.md` — domain glossary. `docs/adr/` — the locked decisions.
- **Layered enforcement** (ADR-0001): each directive uses the best mechanism — formatter / built-in / GritQL plugin / unenforceable. GritQL plugins are diagnostic-only (no autofix, no type info, single-file, syntax-only).
- **Distribution** (ADR-0002): the shared config (`guides/<guide>/biome.json`, **no `plugins` key**) ships via `extends` from the package subpath (`biome-style/google-typescript`). Plugins do **not** ride `extends` — consumers reference each `.grit` by explicit `./node_modules/biome-style/guides/<guide>/plugins/*.grit` path. Per-rule granular files.
- **`guides/<guide>/COVERAGE.md` is the spine** — every directive classified into mechanism + severity. Drives all implementation work; verification results are folded in.
- Severity mirrors the guide's language: must/never → `error`, should/prefer → `warn`, consider → `info`.
- The repo-root `biome.json` is a **dev config**: extends the shared config + wires plugins by local path + dogfoods the guide on this repo. The published config is `guides/<guide>/biome.json`.

## Stack

Bun (runtime + package manager), `bun test`, TypeScript, `@types/bun`. Pinned to **Biome 2.4.16** (GritQL is still maturing — test plugins by running the real CLI, never by reasoning about patterns). No build step: `.grit`/`.json` ship as authored.

Do **not** enable `noParameterProperties`, `useArrowFunction`, or `useExplicitReturnType` — they are the opposite of what the guide wants.

## Agent skills

### Issue tracker

Issues and PRDs live as GitHub issues in `sannajammeh/biome-style`, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### GritQL plugins

Authoring + testing `.grit` plugins (official docs links + the Biome 2.4.16 gotchas verified against the real CLI). **Read before adding a plugin.** See `docs/agents/gritql-plugins.md`.
