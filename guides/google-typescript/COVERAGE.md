# Coverage — Google TypeScript Style Guide

This matrix classifies **every directive** in the [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) into the mechanism that enforces it under Biome, and is the source from which the implementation issues are generated. See the repo `CONTEXT.md` for terminology and `docs/adr/` for the architectural decisions behind it.

- **Guide snapshot:** fetched 2026-06-08.
- **Target:** Biome ≥ 2.x with GritQL plugins enabled (the `.grit` plugin feature is still maturing — pin a known-good Biome version when publishing).

## Legend

**Mechanism** — how the directive is enforced:

| Tag | Meaning |
| --- | --- |
| `formatter` | Biome **formatter** option in the shared config. Auto-fixed on format; not a diagnostic. |
| `builtin` | Biome **built-in lint rule** enabled in the shared config. |
| `plugin` | Custom **GritQL plugin** (`.grit`) — no built-in fits and it is syntactically expressible. |
| `unenforceable` | Needs type information, cross-file/whole-program analysis, or is subjective / process-only. Documented, not enforced. |

**Severity** mirrors the guide's force of language (per `CONTEXT.md` → severity mapping): must/never/always/disallowed → `error`; should/prefer/avoid → `warn`; consider/may → `info`; not enforced → `—`.

**Status**: `done` = implemented, wired into the dev config, and covered by a passing harness test; `planned` = mechanism chosen, not yet wired; `n/a` = unenforceable.

> Where a built-in rule is **stricter or looser** than the guide, it's flagged in Notes. A stricter built-in (enforces a superset) is acceptable; a looser one means partial coverage.

---

## 3. Source file basics

| Directive | Force | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| File encoding: UTF-8 | must | unenforceable | — | — | n/a | Toolchain/editor concern; Biome assumes UTF-8. |
| Whitespace: only ASCII space + line terminators (no tabs outside strings) | must | formatter + builtin | `indentStyle: "space"` + `noIrregularWhitespace` | error | planned | Formatter normalizes indentation; `noIrregularWhitespace` catches exotic whitespace. |
| Special escape sequences: prefer `\'`,`\n`,… over `\x0a`/`
` | should | plugin | `plugins/no-hex-escape-for-known.grit` | warn | planned | Low priority; flag `\x`/`\u` escapes that have a named equivalent. |
| Non-ASCII: use literal Unicode (+ comment), not hex escapes | should | unenforceable | — | — | n/a | Subjective (readability of the actual character). |

## 4. Source file structure

| Directive | Force | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| File section order (copyright → @fileoverview → imports → impl), one blank line between | must | unenforceable | (`useImportsFirst` for imports-first only) | — | n/a | Only "imports come first" is mechanizable (`useImportsFirst`, nursery). Full section ordering is structural/subjective. |
| Copyright in a JSDoc at top | may | unenforceable | — | — | n/a | Presence is project-specific. |
| `@fileoverview` JSDoc, wrapped lines not indented | may | unenforceable | — | — | n/a | |

### 4.3 Imports

| Directive | Force | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Import paths must be paths (relative or root-based) | must | unenforceable | — | — | n/a | Resolution policy; no syntactic signal. |
| Prefer relative imports within a project | should | plugin | `plugins/prefer-relative-import.grit` | warn | planned | Heuristic; flag bare/absolute project imports. May be noisy — validate. |
| Limit `../../../` parent steps | consider | unenforceable | — | — | n/a | |
| Namespace vs named imports (both allowed; preferences) | prefer | unenforceable | — | — | n/a | Preference, context-dependent. |
| Renaming imports allowed; fix collisions via namespace/rename | may | builtin | `noUselessRename` | warn | planned | Only the *useless* rename (`{a as a}`) is mechanizable. |

### 4.4 Exports

| Directive | Force | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Use named exports | must | builtin | `noDefaultExport` (+ `noRedundantDefaultExport`) | error | planned | |
| Do not use default exports | must | builtin | `noDefaultExport` | error | planned | |
| Export visibility: only export used symbols | should | unenforceable | — | — | n/a | Needs whole-program usage analysis. |
| Mutable exports: `export let` not allowed | must | unenforceable | — | — | n/a | Not expressible in Biome 2.4.16 GritQL (verified against the real CLI). The `export` keyword is invisible to the engine — no `JS_EXPORT` node kind is exposed (`export()` collides with a GritQL keyword; `js_export()` fails to compile) and no snippet metavar binds it (`` `export $stmt` ``, `` `export $d` `` match nothing). Worse, `let $metavar` in binding-name position never matches (`` `let $n = $i` `` → 0 matches, while `` `var $n = $i` `` and `` `const $n = $i` `` work, and the literal `` `let a = $i` `` works) — so an exported `let` can't be matched even ignoring the export prefix. `export var` alone IS matchable, but the rule requires both and must stay silent on non-exported `let`/`var`, which is not achievable. |
| No container classes (static-only namespacing classes) | must | builtin | `noStaticOnlyClass` | error | planned | |

### 4.5 Import and export type

| Directive | Force | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Use `import type` when symbol used only as a type | may | builtin | `useImportType` | warn | planned | Biome can enforce consistent type-only imports. |
| Use `export type` when re-exporting a type | use | builtin | `useExportType` | warn | planned | |
| Use modules, not `namespace` | must | builtin | `noNamespace` | error | planned | |
| No `import x = require(...)` | must | plugin | `plugins/no-import-equals-require.grit` | error | done | **Verified:** `noCommonJs` does *not* flag import-equals require. `noCommonJs` is still enabled (covers `require()`/`module.exports`); this plugin covers the TS import-equals form. |
| No `/// <reference path=...>` | must | unenforceable | — | — | n/a | **Verified:** triple-slash directives are comment trivia; GritQL ignores comments (Biome exposes no `comment()` node — fails to compile) and there is no built-in. Not expressible in 2.4.16. |

## 5. Language features

### 5.1 Local variable declarations

| Directive | Force | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Never use `var`; use `const`/`let` | must | builtin | `noVar` | error | planned | |
| Use `const` by default | must | builtin | `useConst` | error | planned | |
| No use before declaration | must | builtin | `noInvalidUseBeforeDeclaration` | error | planned | |
| One variable per declaration | must | builtin | `useSingleVarDeclarator` | error | planned | |

### 5.2 Array literals

| Directive | Force | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Do not use the `Array()` constructor | must | builtin | `useArrayLiterals` | error | planned | |
| Do not define non-numeric properties on arrays | must | unenforceable | — | — | n/a | Needs type/flow analysis. |
| Spread: only spread iterables; not primitives | must | unenforceable | — | — | n/a | Type-dependent. |
| Array destructuring: no space in rest, omit unused, default `[]` for optional param, defaults on LHS | should | plugin | `plugins/array-destructuring-default.grit` (defaults-on-LHS) | warn | planned | Rest spacing is formatter; `[a,b]=[4,2]` param default is plugin-able. Partial. |

### 5.3 Object literals

| Directive | Force | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Do not use the `Object()` constructor | must | plugin | `plugins/no-object-constructor.grit` | error | done | **Verified:** `useConsistentBuiltinInstantiation` pushes `Object()` → `new Object()` (opposite of guide); plugin required for the `{}`-only rule. |
| No unfiltered `for...in` (guard with `hasOwnProperty` or use `Object.keys`) | must | builtin | `useGuardForIn` | error | planned | |
| Object spread: only spread objects | must | unenforceable | — | — | n/a | Type-dependent. |
| Computed property keys are dict-style (don't mix with non-quoted) unless symbol | must | unenforceable | — | — | n/a | |
| Object destructuring params: single level, no nesting/computed, defaults on LHS, optional defaults to `{}` | should | plugin | `plugins/simple-param-destructuring.grit` | warn | planned | Flag nested/computed destructuring in params. |

### 5.4 Classes

| Directive | Force | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Class declarations not terminated with `;`; class *expressions* are | must | formatter | (semicolon handling) | error | planned | Biome formatter manages this. Verify it doesn't strip the expression-statement `;`. |
| Class methods not separated by `;` | must | formatter | (semicolon handling) | error | planned | |
| Single blank line between methods | should | unenforceable | — | — | n/a | Biome doesn't enforce blank lines between members. |
| `toString` must succeed / no side effects | must | unenforceable | — | — | n/a | Semantic. |
| Prefer module-local functions over private static methods | prefer | unenforceable | — | — | n/a | |
| No dynamic dispatch of static methods | should | unenforceable | — | — | n/a | Type-dependent. |
| No `this` in a static context | must | builtin | `noThisInStatic` | error | planned | Confirm rule semantics match (static method `this`). |
| Constructor calls must use parentheses (`new Foo()`) | must | plugin | `plugins/new-parens.grit` | error | done | Flag `new Foo` without `()`. No built-in. |
| No unnecessary/empty constructor (except param props / visibility / decorators) | must | builtin | `noUselessConstructor` | error | planned | **Verified:** exempts parameter-property constructors; flags only truly-empty ctors. |
| Constructor separated by blank line above & below | should | unenforceable | — | — | n/a | |
| No `#private` fields — use `private` | must | plugin | `plugins/no-private-identifier.grit` | error | done | Flag `#ident` members. No built-in. |
| Mark never-reassigned properties `readonly` | should | builtin | `useReadonlyClassProperties` | warn | planned | |
| Prefer parameter properties | prefer | unenforceable | — | — | n/a | Do **not** enable `noParameterProperties` (it bans them — opposite of the guide). |
| Initialize fields where declared | should | unenforceable | — | — | n/a | |
| Properties used outside class scope must not be `private`; no `obj['foo']` to bypass visibility | must | unenforceable | — | — | n/a | Type/usage-dependent. |
| Getters pure; ≥1 non-trivial accessor; no `Object.defineProperty` for accessors | must | plugin | `plugins/no-defineproperty-accessor.grit` (the `defineProperty` part) | warn | planned | Purity/triviality is unenforceable; only the `Object.defineProperty` ban is mechanizable. |
| Class computed properties only for symbols | must | plugin | `plugins/class-computed-symbol-only.grit` | warn | planned | |
| Never use `public` modifier (except non-readonly public param properties) | must | builtin | `useConsistentMemberAccessibility` (option `noPublic`) | error | planned | **Verified:** `accessibility: "noPublic"` exists; enabled in shared config. |
| No direct prototype manipulation / mixins / modifying builtin prototypes | must | unenforceable | (`noPrototypeBuiltins` is unrelated) | — | n/a | Mostly out of GritQL reach; partial plugin possible for `X.prototype.y =`. |

### 5.5 Functions

| Directive | Force | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Prefer function declarations for named functions | prefer | plugin | `plugins/prefer-function-declaration.grit` | warn | planned | Flag `const f = () => …` / `const f = function …` at module scope. Heuristic — `useArrowFunction` is the opposite, do not enable. |
| Nested functions may use declarations or arrows | may | unenforceable | — | — | n/a | |
| Do not use function expressions (use arrows) | must | plugin | `plugins/no-function-expression.grit` | error | done | Exempt generators and explicit `this`-rebinding. |
| Concise arrow body only if return value used | — | unenforceable | — | — | n/a | Type/flow-dependent. |
| Function decls/exprs must not use `this` (unless rebinding) | must | unenforceable | — | — | n/a | Hard to scope syntactically without false positives. |
| Prefer arrow callbacks over named callbacks (e.g. `.map(parseInt)`) | avoid | unenforceable | — | — | n/a | Type/signature-dependent. |
| Classes usually shouldn't have arrow-function properties | should | plugin | `plugins/no-arrow-property.grit` | warn | planned | Judgement rule — `info`/`warn`, expect opt-outs. |
| Event handlers (arrow vs property) | may | unenforceable | — | — | n/a | |
| Parameter initializers: no side effects, keep simple | must | unenforceable | — | — | n/a | |
| Use rest params, never name a var/param `arguments` | must | builtin | `noArguments` | error | planned | |
| Use spread over `Function.prototype.apply` | should | unenforceable | — | — | n/a | No matching built-in confirmed. |
| No blank lines at start/end of function body | must | unenforceable | — | — | n/a | Biome formatter does not strip these. |
| Generators: attach `*` to `function`/`yield` | must | formatter | (generator formatting) | error | planned | Biome formatter normalizes `function*`. |
| Single-arg arrow parens optional | recommended | formatter | `arrowParentheses: "always"` | — | planned | Guide says optional; we pick `always` for consistency (note in README). |
| No space after `...` in rest/spread | must | formatter | (spread formatting) | error | planned | |

### 5.6 `this`

| Directive | Force | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Only use `this` in class ctor/methods, `this`-typed fns, or arrows in valid scope; never for global/eval/event target | — | unenforceable | — | — | n/a | Scope-sensitive; high false-positive risk. |

### 5.8 Primitive literals

| Directive | Force | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Strings use single quotes | — | formatter | `quoteStyle: "single"` | error | planned | |
| No line continuations in strings | must | plugin | `plugins/no-multiline-string.grit` | error | done | **Verified:** `noMultilineString` does not exist in Biome 2.4.16. Plugin flags backslash line-continuations in string literals. |
| Prefer template literals over complex concatenation | use | builtin | `useTemplate` | warn | planned | |
| Number literals: lowercase `0x`/`0o`/`0b`, no leading zero | must | formatter | (numeric literal formatting) | error | planned | **Verified:** formatter normalizes casing (`0xFF`→`0xff`, `1E10`→`1e10`); leading-zero octal is a parser *error* — no plugin needed. |
| Coerce with `String()`/`Boolean()`/`!!` (no `new`) | may | builtin | `useConsistentBuiltinInstantiation` | error | planned | The `no new` part — see Wrapper objects (5.9.1). |
| Enums must not be coerced to boolean | must | unenforceable | — | — | n/a | Type-dependent. |
| Use `Number()` to parse + check `NaN` | must | unenforceable | — | — | n/a | Semantic. |
| No unary `+` to coerce to number | must | plugin | `plugins/no-unary-plus.grit` | error | done | No `noImplicitCoercion` equivalent in Biome. |
| No `parseInt`/`parseFloat` except non-base-10 | must | plugin | `plugins/no-parseint-base10.grit` | error | done | Flag `parseFloat` and `parseInt(_, 10)`/no-radix. |
| No redundant `!!` in `if`/`for`/`while` conditions | — | builtin | `noExtraBooleanCast` | warn | planned | |

### 5.9 Control structures

| Directive | Force | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Control flow always uses braced blocks (1-line `if` may elide) | always | builtin | `useBlockStatements` | error | planned | **Verified stricter than guide & accepted:** Biome flags the allowed single-line `if (x) x.foo();`. The elision is a *may*, so enforcing always-braces violates no directive. Kept at `error`. |
| Avoid assignment inside control statements | prefer | builtin | `noAssignInExpressions` | warn | planned | Biome lacks the "extra parens = intentional" exception. |
| Prefer `for...of` for arrays | prefer | builtin | `useForOf` | warn | planned | |
| `for...in` only on dict objects, with `hasOwnProperty` guard | must | builtin | `useGuardForIn` | error | planned | Array `for...in` ban is type-dependent (partial). |
| Omit unnecessary grouping parens; none after `delete`/`typeof`/`void`/`return`/`throw`/`case`/`in`/`of`/`yield` | — | unenforceable | — | — | n/a | No `noUselessParentheses` in Biome. |
| Instantiate errors with `new Error()` | always | builtin | `useThrowNewError` | error | planned | |
| Only throw `Error` subtypes | — | builtin | `useThrowOnlyError` | error | planned | Partly type-dependent; built-in covers common cases. |
| Catch handlers assume `Error`; don't over-defend | should | unenforceable | — | — | n/a | |
| Empty catch blocks need an explanatory comment | rarely-ok | builtin | `noEmptyBlockStatements` | warn | planned | Biome treats comment-only blocks as non-empty — matches guide. |
| Switch must have a `default`, placed last | must | builtin | `useDefaultSwitchClause` + `useDefaultSwitchClauseLast` | error | planned | |
| No fall-through between non-empty case groups | must | builtin | `noFallthroughSwitchClause` | error | planned | |
| Use `===`/`!==`; `== null` allowed | always | builtin | `noDoubleEquals` | error | planned | Biome's default allows `== null` — exact match. |
| Avoid `x as T` / `y!` without reason | should | builtin (partial) | `noNonNullAssertion` (for `!`) | warn | planned | The `as` half is unenforceable (no syntactic signal of "without reason"). |
| Type assertions use `as`, not `<T>x` | must | plugin | `plugins/no-angle-bracket-assertion.grit` | error | done | No built-in. |
| Double assertions go through `unknown` (not `any`/`{}`) | — | unenforceable | — | — | n/a | Type-dependent. |
| Use type annotation, not assertion, for object literals (`{…} as Foo`) | use | plugin | `plugins/no-object-literal-assertion.grit` | warn | planned | Flag object-literal `as` casts. |
| Keep `try` blocks focused | should | unenforceable | — | — | n/a | |

### 5.10 Decorators

| Directive | Force | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Do not define new decorators | must | unenforceable | — | — | n/a | Framework-knowledge dependent. |
| Decorator immediately precedes symbol, no blank line after | must | plugin | `plugins/no-blank-line-after-decorator.grit` | warn | planned | Whitespace-sensitive; verify GritQL can see the gap. |
| JSDoc before decorators (not between) | — | plugin | `plugins/jsdoc-before-decorator.grit` | warn | planned | See also §8.13. |

### 5.11 Disallowed features

| Directive | Force | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| No wrapper objects `new String/Boolean/Number` | must | builtin | `useConsistentBuiltinInstantiation` | error | planned | **Verified:** flags `new String()` → `String()` etc. |
| Don't rely on ASI — always use semicolons | must | formatter | `semicolons: "always"` | error | planned | |
| No `const enum` | must | builtin | `noConstEnum` | error | planned | |
| No `debugger` | must | builtin | `noDebugger` | error | planned | |
| No `with` | must | builtin | `noWith` | error | planned | |
| No `eval` / `Function(string)` | must | builtin | `noGlobalEval` + `noImpliedEval` | error | planned | |
| No non-standard ECMAScript/Web features | must | unenforceable | — | — | n/a | Open-ended. |
| Never modify builtin objects / prototypes; don't pollute global | must | builtin (partial) | `noGlobalAssign` | error | planned | Global reassignment only; prototype mutation is partial/plugin. |

## 6. Naming

| Directive | Force | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Identifiers: ASCII letters/digits/`_`/`$` only | must | builtin | `useNamingConvention` (`requireAscii`) | error | planned | |
| No info-decorated names, no `I`-prefixed interfaces, no `opt_` prefix | should | unenforceable | — | — | n/a | Mostly subjective; interface-prefix could be a partial plugin. |
| No leading/trailing `_`; `_` not an identifier by itself | must | builtin | `useNamingConvention` | error | planned | |
| Descriptive names; no ambiguous abbreviations | must | unenforceable | — | — | n/a | Subjective. |
| Camel case treats acronyms as words (`loadHttpUrl`) | — | builtin (partial) | `useNamingConvention` (`strictCase`) | warn | planned | `strictCase` approximates; not identical to Google's rule. |
| `$` only when required by frameworks | should | unenforceable | — | — | n/a | |
| Casing by type: `UpperCamelCase` (class/interface/type/enum/decorator/type-param), `lowerCamelCase` (var/param/fn/method/property), `CONSTANT_CASE` (global constants/enum values) | must | builtin | `useNamingConvention` | error | planned | The central naming rule. Module-level-only `CONSTANT_CASE` nuance may not be fully expressible. |
| Type parameters: single uppercase or `UpperCamelCase` | may | builtin | `useNamingConvention` | warn | planned | |
| Test names may use `_` separators | may | builtin | `useNamingConvention` (allow in tests) | — | planned | Configure overrides for test files. |
| Filenames `snake_case` | — | builtin | `useFilenamingConvention` | warn | planned | |
| Namespace import alias `lowerCamelCase` | — | builtin | `useNamingConvention` | warn | planned | |
| Local aliases match the source identifier's format | must | unenforceable | — | — | n/a | Cross-symbol. |

## 7. Type system

| Directive | Force | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Leave out trivially inferred type annotations | should | builtin | `noInferrableTypes` | warn | planned | |
| Return-type annotations are author's choice | — | unenforceable | — | — | n/a | Do **not** enable `useExplicitType`/`useExplicitReturnType`. |
| No `undefined` vs `null` preference | — | unenforceable | — | — | n/a | |
| Type aliases must not include `\|null`/`\|undefined` | must | plugin | `plugins/no-nullable-type-alias.grit` | error | done | Flag `type X = … \| null \| undefined`. |
| Prefer optional `?` over `\|undefined` | use | unenforceable | — | — | n/a | Partly type-dependent. |
| Include the type at structural-implementation declarations | should | unenforceable | — | — | n/a | Type-dependent (inference vs annotation). |
| Prefer `interface` over type-literal alias | use | builtin | `useConsistentTypeDefinitions` (option `interface`) | warn | planned | |
| `T[]` for simple types, `Array<T>` for complex | — | builtin (partial) | `useConsistentArrayType` (`shorthand`) | warn | planned | **Looser:** Biome can't express the "complex → `Array<T>`" half; shorthand-everywhere diverges. Note in README. |
| Index signatures: meaningful key label; prefer `Map`/`Set` | — | unenforceable | — | — | n/a | |
| Mapped/conditional types: simplest construct | may | unenforceable | — | — | n/a | |
| Avoid `any`; prefer `unknown` | consider | builtin | `noExplicitAny` | warn | planned | Guide says "consider not to use" → `warn`/`info`. |
| Avoid `{}` type | should | builtin | `noBannedTypes` | warn | planned | |
| Prefer tuple types over a `Pair` interface | — | unenforceable | — | — | n/a | |
| Never use `String`/`Boolean`/`Number`/`Object` wrapper *types* | must | builtin | `noBannedTypes` | error | planned | |
| Avoid return-type-only generics | avoid | unenforceable | — | — | n/a | Type-dependent. |

## 8. Toolchain requirements

| Directive | Force | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Files must pass `tsc` type checking | must | unenforceable | — | — | n/a | Out of scope (the compiler's job). |
| No `@ts-ignore` | do not | builtin | `noTsIgnore` | error | planned | |
| No `@ts-expect-error` / `@ts-nocheck` | do not | unenforceable | — | — | n/a | **Verified (reclassified plugin → unenforceable):** these are directive *comments*, and GritQL is comment-blind in Biome 2.4.16 — the same wall as `no-triple-slash-reference`. `comment()`/`ts_directive()` node kinds fail to compile; snippet `` `@ts-expect-error` `` and regex `r"@ts-(expect-error\|nocheck)"` compile but match nothing (a control snippet on a real AST node in the same file fires, proving the engine runs). `noTsIgnore` still covers `@ts-ignore`; the `@ts-expect-error`/`@ts-nocheck` variants are not mechanizable. |
| Abide by conformance frameworks (tsetse/tsec) | must | unenforceable | — | — | n/a | Google-internal tooling. |

## 9. Comments and documentation

| Directive | Force | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| JSDoc `/** */` for docs, `//` for implementation comments | — | unenforceable | — | — | n/a | Intent-dependent. |
| Multi-line comments use `//`, not `/* */` | must | unenforceable | — | — | n/a | **Verified (reclassified plugin → unenforceable):** block comments are comment trivia, invisible to GritQL in Biome 2.4.16 (same wall as `no-triple-slash-reference`). `comment()`/`multiline_comment()`/`block_comment()` node kinds fail to compile; snippet `` `/* $msg */` `` compiles but matches nothing, so JSDoc `/** */` can't even be distinguished. No built-in exists. |
| JSDoc general form / single-line overflow rules | must | unenforceable | — | — | n/a | Formatting nuance Biome doesn't own. |
| JSDoc written in Markdown | — | unenforceable | — | — | n/a | |
| JSDoc tags occupy their own line | — | unenforceable | — | — | n/a | |
| Block-tag line wrapping indented 4 spaces | — | unenforceable | — | — | n/a | |
| Document all top-level exports | should | unenforceable | — | — | n/a | Subjective ("as judged by reviewer"). |
| Class / method / parameter comment conventions | — | unenforceable | — | — | n/a | |
| No redundant JSDoc type annotations (`@param {type}`, `@implements`, `@enum`, `@private`, `@override`) in TS | do not | plugin | `plugins/no-jsdoc-types.grit` | warn | planned | Flag type-bearing JSDoc tags in `.ts`. |
| Comments must add information | — | unenforceable | — | — | n/a | |
| Parameter-name comment style (`/* name= */`) | should | unenforceable | — | — | n/a | |
| Documentation goes before decorators | — | plugin | `plugins/jsdoc-before-decorator.grit` | warn | planned | Same plugin as §5.10. |

## 10. Policies

| Directive | Force | Mechanism | Notes |
| --- | --- | --- | --- |
| Consistency, reformatting existing code, deprecation (`@deprecated`), generated-code exemptions, style-guide goals | — | unenforceable | Process/governance — out of scope for mechanical enforcement. |

---

## Summary

Rough tally of the ~95 classified directives:

- **formatter** — string quotes, semicolons, indentation, spread/generator/number formatting, arrow parens. Ship in the shared config's `formatter` block.
- **builtin** — ~35 directives map to existing Biome rules (the largest bucket). Ship in the shared config's `linter.rules` block. Several need verification of exact semantics (flagged "confirm" above).
- **plugin** — ~21 custom `.grit` files for syntactic rules with no built-in (e.g. `no-object-constructor`, `no-private-identifier`, `new-parens`, `no-function-expression`, `no-angle-bracket-assertion`, `no-unary-plus`, `no-parseint-base10`, `no-mutable-export`, `no-block-comment`, `no-jsdoc-types`, `no-nullable-type-alias`, `no-import-equals-require`, `no-multiline-string`).
- **unenforceable** — the rest: anything needing type information, cross-file analysis, or human judgement. Documented here so users know the gaps; never faked.

### Verification results (resolved 2026-06-08 against Biome 2.4.16)

All eight open items were checked by running the real CLI on fixtures. Outcomes:

1. **`noCommonJs` does NOT flag TS `import x = require()`** — exits clean on `import x = require('foo')`. It covers `require(...)`, `module.exports`, `exports.x` only. → "No `import x = require()`" moves **builtin → plugin** (`plugins/no-import-equals-require.grit`). `noCommonJs` is still shipped as a bonus built-in (the guide forbids CommonJS generally).
2. **`useConsistentBuiltinInstantiation` covers the wrapper case, not the `Object()` case.** It flags `new String()` → `String()` (matches the guide's "coerce without `new`" / "no wrapper objects"). But for `Object` it pushes `Object()` → **`new Object()`** — the opposite of the guide (`{}`). So it does not enforce "no `Object()` constructor". → keep `plugins/no-object-constructor.grit`; enable the built-in for wrappers (no false positives on `{}`).
3. **`noTsIgnore` only flags `@ts-ignore`** — it treats `@ts-expect-error` as the *preferred* alternative and ignores `@ts-nocheck`. → keep `plugins/no-ts-suppression-comments.grit` for `@ts-expect-error` + `@ts-nocheck`.
4. **`useConsistentMemberAccessibility` has `accessibility: "noPublic"`** ✓ — enabled at `error`.
5. **`noUselessConstructor` exempts parameter-property constructors** ✓ — `constructor(private x: number) {}` is not flagged; only truly-empty ctors are. Safe at `error`.
6. **`useBlockStatements` flags the single-line `if`** (stricter than the guide's optional elision). **Decision: keep `useBlockStatements: error`** — it enforces the guide's core "always braced blocks"; the single-line elision is a *may* (a permission, not a must), so enforcing the stricter form violates no directive. Documented as stricter-than-guide.
7. **`noMultilineString` does not exist in Biome 2.4.16** (`Unrecognized option`). → "No line continuations in strings" moves **builtin → plugin** (`plugins/no-multiline-string.grit`).
8. **Number-literal leading-zero is a parser error**, not a lint rule — `const c = 0123` fails parsing (`"0"-prefixed octal literals are deprecated`). Casing (`0xFF`→`0xff`, `1E10`→`1e10`, `1.50`→`1.5`) is **formatter**. → no plugin needed.

Net effect on the matrix: **+2 plugins** (`no-import-equals-require`, `no-multiline-string`), one phantom built-in dropped (`noMultilineString`). Plugin total ≈ 22.

### Implementation findings (2026-06-08, building the harness + first plugin)

Discovered while building issue #1 (fixture harness) against Biome 2.4.16:

9. **`no-triple-slash-reference` is NOT expressible as a plugin.** GritQL ignores comment trivia and Biome exposes no comment node kind (`comment()` fails to compile); triple-slash directives are comments, and there is no built-in. → reclassified **plugin → unenforceable** (row above). Plugin total ≈ 21.
10. **`no-object-constructor` confirmed working** as the harness's tracer plugin: `` or { `new Object($...)`, `Object($...)` } `` flags both constructor forms and stays silent on `{}`, `Object.keys`/`assign`/`freeze`. Uses `$...` (anonymous spread); the named `$...args` spread matched nothing.
11. **`files.includes` negation only excludes ROOT-level directories in 2.4.16.** `!**/tests/**` excludes a root `tests/` dir but not a nested `guides/<guide>/tests/`, despite docs. → tests live in a **top-level `tests/`** tree (also keeps them out of the published `guides/` package). See [`docs/agents/gritql-plugins.md`](../../docs/agents/gritql-plugins.md) for the full set of authoring gotchas.

### Implementation findings (2026-06-08, Tier A plugin fan-out)

Building the remaining Tier A plugins (issues #3–#10, #12–#15) against Biome 2.4.16. **9 shipped `done`**, **3 reclassified `unenforceable`**:

12. **Shipped (9):** `new-parens` (bare `` `new $callee` `` is parens-precise — does not match `new Foo()`), `no-unary-plus` (`` `+$operand` `` is operator-precise vs binary/`++`/`+=`), `no-import-equals-require` (`` `import $x = require($_)` ``), `no-nullable-type-alias` (`` `type $name = $body` `` + `$body <: contains or { `null`, `undefined` }`), `no-parseint-base10` (`or` of `parseFloat($...)` / `parseInt($x)` guarded `not `parseInt($a, $b)`` / `parseInt($x, $radix)` where `$radix <: `10``), `no-private-identifier` (snippet metavars on `#name` don't bind — used node-text regex `r"#[A-Za-z0-9_]+"`), `no-angle-bracket-assertion` (snippets match nothing — required node kind `TsTypeAssertionExpression(expression=$expr)`; bare kind matches 0, must reference a field), `no-multiline-string` (`string()` kind + `r".*\\\n.*"` on raw literal text), `no-function-expression` (no expr-vs-decl kind exists — discriminated by syntactic slot via three context snippets; `some` over args not transitive `within`/`contains` to avoid flagging declarations nested in arg bodies; `function*` generators are auto-exempt as a distinct node).
13. **`no-mutable-export` reclassified plugin → unenforceable.** Two independent confirmed blockers: (a) a `let`-metavar-in-name-slot bug — `` `let $n = $i` `` matches nothing while `` `var $n = $i` ``, `` `const $n = $i` ``, and literal-name `` `let a = $i` `` all match; (b) export-vs-non-export is indistinguishable (no export node/snippet binds). `export var` alone is matchable, but the rule needs both forms and must stay silent on non-exported `let`/`var`. Independently re-verified against the real CLI.
14. **`no-ts-suppression-comments` and `no-block-comment` reclassified plugin → unenforceable** — comment-blindness, identical to `no-triple-slash-reference` (#9 above). Documented `describe.skip` test suites left in `tests/` as reproducible evidence; no no-op `.grit` shipped.

Net: **plugin total ≈ 21 − 3 = 18** enforceable plugins planned; 10 now `done` (incl. `no-object-constructor`). The 3 newly-unenforceable rules are documented, never faked.
