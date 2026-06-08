# Authoring GritQL plugins

How to write and test the `.grit` plugins in `guides/<guide>/plugins/`. Read this
before adding a plugin — it captures the official docs **and** the Biome-specific
gotchas we verified against the real CLI (which often contradict intuition).

## Where to read the language

GritQL is Grit's query language; Biome embeds it as its plugin engine.

- **GritQL language**
  - Overview — https://docs.grit.io/language/overview
  - Syntax reference — https://docs.grit.io/language/syntax
  - Patterns (snippets, metavariables, `or`/`and`/`not`, `contains`/`within`) — https://docs.grit.io/language/patterns
  - Conditions & where-clauses — https://docs.grit.io/language/conditions
  - Modifiers (`as`, `limit`, sequential) — https://docs.grit.io/language/modifiers
- **Biome's plugin system** (the dialect we actually run) — https://biomejs.dev/linter/plugins/
- **Biome glob/config syntax** (for `files.includes`) — https://biomejs.dev/reference/configuration/#glob-syntax-reference

> ⚠️ The grit.io docs describe Grit's **tree-sitter** grammars. Biome reimplements
> GritQL over its **own CST**, so node-kind names differ and not every grit feature
> exists. Treat grit.io as conceptual; treat the Biome CLI as ground truth.

## The one rule: verify against the real CLI

The plugin engine is still maturing and pinned to **Biome 2.4.16**. **Never** reason
about whether a pattern matches — run it. The fixture harness exists exactly for
this. The authoring loop is TDD:

1. Write `tests/<guide>/fixtures/<rule>/invalid.ts` (code the rule must flag) and
   `valid.ts` (lookalikes it must stay silent on).
2. Write `tests/<guide>/<rule>.test.ts` calling `runPlugin(rule, 'valid'|'invalid')`
   from `./harness.ts`. Run `bun test` → RED.
3. Write `guides/<guide>/plugins/<rule>.grit` until GREEN.
4. Wire it into the dev `biome.json` `plugins` array and the README plugin list;
   keep `biome check .` green (dogfood).

The harness runs `biome lint --reporter=json` over a fixture with an **isolated
config** (recommended built-ins off, only this rule's `.grit` loaded), so the only
diagnostics returned come from the plugin under test. See
[`tests/google-typescript/harness.ts`](../../tests/google-typescript/harness.ts).

## Plugin skeleton

```grit
language js

`SOME_SNIPPET` as $node where {
  register_diagnostic(
    span = $node,
    message = "Human-readable guidance.",
    severity = "error"  // "error" | "warn" | "info" | "hint"
  )
}
```

- `language js` is required (TS is handled by the JS language).
- `register_diagnostic(span, message, severity)` is the diagnostic API.
- Severity mirrors the guide's force of language: must/never → `error`,
  should/prefer → `warn`, consider → `info`.
- Plugins are **diagnostic-only**: no autofix, no type info, single-file, syntax-only.

Match several shapes with `or`:

```grit
language js
or {
  `new Object($...)`,
  `Object($...)`
} as $call where {
  register_diagnostic(span=$call, message="…", severity="error")
}
```

## Verified gotchas (Biome 2.4.16)

These cost real time to discover. Trust them.

- **Comments are invisible to the engine.** GritQL ignores comment trivia, and
  Biome exposes no `comment()` node kind (it fails to compile). Anything that
  lives in a comment — e.g. `/// <reference />` triple-slash directives — is
  **not expressible as a plugin**. Classify such rules `unenforceable` in
  `COVERAGE.md`, don't fake them.
- **Whitespace/blank lines are invisible too — the comment-blindness sibling.**
  Blank lines (and whitespace generally) are trivia, like comments. Nodes that a
  blank line sits *between* are still matchable (e.g. decorators: `JsDecorator()`
  matches, and `JsClassDeclaration() <: contains JsDecorator()` matches a
  decorated class), but the engine cannot tell an adjacent decorator from one
  separated by a blank line — the node pattern fires **identically** on both, and
  there is no line-number / span-arithmetic / trivia predicate to compare
  positions. Rules about blank lines between constructs (e.g.
  `no-blank-line-after-decorator`) are therefore `unenforceable`. Classify them,
  don't fake them.
- **`not within JsFunctionBody()` expresses "module / top-level scope".** A
  declaration at module scope has no function-body ancestor; a nested one does.
  So to scope a rule to top-level only (e.g. `prefer-function-declaration` flags
  `const f = () => {}` at module scope but not nested helpers), guard the matched
  node with `$node <: not within JsFunctionBody()`. (Unlike the self-inclusive
  `within <SameKind>` gotcha below, this works because the arrow/function is a
  *different* kind than its function-body ancestor.)
- **Prefer backtick snippets over node-kind patterns.** grit.io node kinds like
  `call_expression()` / `new_expression()` are tree-sitter names; Biome's CST
  uses different names, so they tend to fail to compile. Code snippets
  (`` `new Object($...)` ``) are portable and reliable.
- **Use `$...` for "any arguments", not `$...args`.** The anonymous spread `$...`
  matches zero-or-more args (including empty `()` and multiple); the *named*
  spread `$...args` silently matched nothing in args position. A single named
  metavariable `$args` also works, but `$...` is clearest.
- **Snippets are callee-precise.** `` `Object($...)` `` matches a bare `Object(...)`
  call but NOT `Object.keys(...)` (member-expression callee) — so you usually
  don't need an explicit `not member_expression()` guard. Still: add `valid.ts`
  lookalikes and confirm.
- **`files.includes` negation only excludes ROOT-level directories.** In 2.4.16,
  `!**/tests/**` excludes a `tests/` dir at the repo root but does NOT exclude a
  nested `guides/<guide>/tests/` — despite the docs saying `**` matches at any
  depth. This is why tests live in a **top-level `tests/`** tree. If you add a
  directory of intentional violations, it must hang off the repo root to be
  ignorable by the dogfood config.
- **Watch block-comment globs.** A `/* … */` doc comment containing `**/` (e.g.
  the literal pattern `!**/tests/**`) closes the comment early — `*/` is inside
  the glob. Reword prose to avoid `**/`, or use line comments.
- **The plugin formatter rewrites `.grit`.** `biome check --write` reformats
  `.grit` files (e.g. collapsing `register_diagnostic(...)` onto one line). That's
  expected; re-run the harness after a format to confirm the plugin still fires.
- **`within <SameKind>` is self-inclusive.** A node matches `within` a container
  pattern of its *own* kind — a `JsObjectBindingPattern` reports as "within" a
  `JsObjectBindingPattern` (itself). So `pattern within pattern` to detect
  *nesting* wrongly matches every single-level pattern. Detect nesting via a
  **distinct container kind** instead: a binding pattern whose container is a
  `JsObjectBindingPatternProperty` / `JsArrayBindingPatternElement` is genuinely
  nested; a top-level param binding (container = `JsFormalParameter`) is not.
- **Regex alternation groups `(a|b)` fail to compile.** A raw-string regex like
  `r"(\\n|\\t)"` errors with `Failed to compile the Grit plugin`. Split the
  alternatives into separate `<:` regexes under an `or { }` block:
  `or { $s <: r".*\\n.*", $s <: r".*\\t.*" }`. Character classes (`[089a]`) are
  fine; it's the `(…|…)` group that breaks.
- **List/spread dots are position-restricted.** Snippets like
  `` `[$...] = [$...defaults]` `` error with `Dots should only be directly within
  a list pattern`. To match a destructuring/array shape with a trailing/whole
  default, use a **node-kind pattern with field bindings** instead — e.g.
  `JsFormalParameter(binding=JsArrayBindingPattern(), initializer=$init)` — and
  discriminate empty-vs-non-empty defaults with a guard like
  `` $init <: not contains `[]` ``.
