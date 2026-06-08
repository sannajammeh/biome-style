# biome-style

Full ports of the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html) into [Biome](https://biomejs.dev/) via [GritQL](https://biomejs.dev/linter/plugins/) plugins. Each enforceable rule from the guide is expressed as a `.grit` pattern Biome can run directly — no ESLint, no Closure tooling.

## Agent skills

### Issue tracker

Issues and PRDs live as GitHub issues in `sannajammeh/biome-style`, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
