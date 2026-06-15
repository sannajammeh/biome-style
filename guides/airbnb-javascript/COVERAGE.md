# Coverage — Airbnb JavaScript Style Guide

This matrix classifies **every rule enabled by the source config** into the mechanism that enforces it under Biome, and is the source from which the implementation issues are generated. This is a **config-keyed** port (see repo `CONTEXT.md` → _source basis_ and [ADR-0004](../../docs/adr/0004-config-keyed-ports.md)): the unit of enumeration is an enabled ESLint rule, not a prose directive.

- **Source of truth:** [`eslint-config-airbnb-base@15.0.0`](https://www.npmjs.com/package/eslint-config-airbnb-base/v/15.0.0) — the JavaScript core of the Airbnb guide. This version is the last meaningful release (targets ESLint 7/8), so the source is effectively frozen.
- **Scope:** the **core ESLint rules** the config enables, grouped by its own rule files (`best-practices`, `errors`, `es6`, `node`, `strict`, `style`, `variables`). The `eslint-plugin-import` rules (`imports.js`) and all React/JSX/a11y are **out of scope**. Rules the config sets to `off` are not units.
- **Enabled-rule count:** 218 (best-practices 66, errors 42, es6 29, node 4, strict 1, style 67, variables 9).
- **Target:** Biome **2.4.16** (pinned). Built-in availability was confirmed by **config validation** against the pinned binary (Biome rejects an unknown rule key) — more reliable than `biome explain`, which proved flaky under `npx`. Rules absent in 2.4.16 are reclassified out of `builtin`: `noObjectConstructor` & `noNewSymbol` (best-practices/es6), and `noConfusingArrow`, `noUselessComputedKey`, `noMultipleSpacesInRegex` (es6/errors). `noShadow` is `nursery` (since 2.0.0) and flagged in Notes.

## Legend

**Mechanism** — how the rule is enforced:

| Tag | Meaning |
| --- | --- |
| `formatter` | Biome **formatter** option in the shared config. Auto-fixed on format; not a diagnostic. |
| `builtin` | Biome **built-in lint rule** enabled in the shared config. |
| `plugin` | Custom **GritQL plugin** (`.grit`) — no built-in fits and it is syntactically expressible. |
| `unenforceable` | Needs type information, cross-file/whole-program/flow analysis, or is project-policy/runtime. Documented, not enforced. |

**Severity** is config-anchored (see `CONTEXT.md` → severity mapping, config-keyed): `error` for the config's level `2`, `warn` for level `1`. A purely-stylistic rule may be **downgraded** at the porter's judgment (flagged in Notes). Formatter rows carry no severity (`—`) — they are auto-fixed, not diagnostics. Unenforceable rows are `—`.

**Status**: `done` = implemented, wired into the dev config, covered by a passing harness test; `planned` = mechanism chosen, not yet wired; `n/a` = unenforceable.

> `[opts]` in Notes means the config passes options ESLint-side; where Biome's equivalent can't replicate them, the row is flagged stricter/looser per the existing COVERAGE convention. Plugin rows are `done` (implemented + harness-tested); builtin rows are `planned` pending wiring + a harness test, and built-in option-fidelity is confirmed at that point.

---

## best-practices

| Rule | Lvl | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| array-callback-return | error | unenforceable | — | — | n/a | Needs flow analysis (missing return on some path). |
| block-scoped-var | error | unenforceable | — | — | n/a | Subsumed by `no-var` → `noVar`; scope-aware otherwise. |
| class-methods-use-this | error | plugin | `plugins/class-methods-use-this.grit` | error | done | Flags a non-static method whose body has no `this` (`not contains` `this`); constructor/getter/setter are distinct CST kinds so excluded for free, static via a modifier guard. `[opts]` exceptMethods not ported. |
| consistent-return | error | unenforceable | — | — | n/a | Flow analysis across all return paths. |
| curly | error | builtin | `useBlockStatements` | error | planned | `[opts]` `multi-line`; Biome enforces blocks always (stricter). |
| default-case | error | builtin | `useDefaultSwitchClause` | error | planned | `[opts]` comment escape hatch not replicable. |
| default-case-last | error | builtin | `useDefaultSwitchClauseLast` | error | planned | |
| default-param-last | error | builtin | `useDefaultParameterLast` | error | planned | |
| dot-location | error | formatter | (member-expression line break) | — | planned | `[opts]` property; handled by formatter layout. |
| dot-notation | error | builtin | `useLiteralKeys` | error | planned | `[opts]` allowKeywords. |
| eqeqeq | error | builtin | `noDoubleEquals` | error | planned | `[opts]` allow `== null`; Biome allows null compare by default. |
| grouped-accessor-pairs | error | unenforceable | — | — | n/a | Single-file syntax-only GritQL (2.4.16) can match a same-key get/set pair (repeated `name=$key` metavariable across two `contains` clauses — verified), but cannot reason about member **adjacency**: the sequential operator `+>` and every list/dots pattern over the member sequence fail to compile, so a grouped pair and a separated pair are indistinguishable. Needs an ordering-aware engine. |
| guard-for-in | error | builtin | `useGuardForIn` | error | planned | |
| max-classes-per-file | error | unenforceable | — | — | n/a | `[opts]` count; per-file counting not expressible in single-file GritQL. |
| no-alert | warn | plugin | `plugins/no-alert.grit` | warn | done | Detect `alert`/`confirm`/`prompt` calls. No global-scope check (syntactic). |
| no-caller | error | plugin | `plugins/no-caller.grit` | error | done | `arguments.caller`/`arguments.callee`. Partly subsumed by `prefer-rest-params`→`noArguments`. |
| no-case-declarations | error | builtin | `noSwitchDeclarations` | error | planned | |
| no-constructor-return | error | builtin | `noConstructorReturn` | error | planned | |
| no-else-return | error | builtin | `noUselessElse` | error | planned | `[opts]` allowElseIf. |
| no-empty-function | error | builtin | `noEmptyBlockStatements` | error | planned | `[opts]` allow; Biome rule covers all empty blocks (looser/broader). |
| no-empty-pattern | error | builtin | `noEmptyPattern` | error | planned | |
| no-eval | error | builtin | `noGlobalEval` | error | planned | |
| no-extend-native | error | plugin | `plugins/no-extend-native.grit` | error | done | Assignment to `X.prototype`; needs known-native list (option/caveat). |
| no-extra-bind | error | unenforceable | — | — | n/a | Needs to prove `this` unused in bound fn. |
| no-extra-label | error | builtin | `noUselessLabel` | error | planned | |
| no-fallthrough | error | builtin | `noFallthroughSwitchClause` | error | planned | |
| no-floating-decimal | error | plugin | `plugins/no-floating-decimal.grit` | error | done | Leading/trailing dot in numeric literal — syntactic. Biome formatter does not add the zero. |
| no-global-assign | error | builtin | `noGlobalAssign` | error | planned | `[opts]` exceptions. |
| no-implied-eval | error | plugin | `plugins/no-implied-eval.grit` | error | done | `setTimeout`/`setInterval` with string arg — syntactic subset only. |
| no-iterator | error | plugin | `plugins/no-iterator.grit` | error | done | `__iterator__` property access. |
| no-labels | error | builtin | `noConfusingLabels` | error | planned | `[opts]` allowLoop/allowSwitch; Biome rule narrower (confusing labels). Flag looser. |
| no-lone-blocks | error | builtin | `noUselessLoneBlockStatements` | error | planned | |
| no-loop-func | error | unenforceable | — | — | n/a | Needs closure/scope capture analysis. |
| no-multi-spaces | error | formatter | (whitespace normalization) | — | planned | `[opts]` ignoreEOLComments. |
| no-multi-str | error | plugin | `plugins/no-multi-str.grit` | error | done | Multiline string via `\` line continuation. Mirrors Google's `no-multiline-string` (duplicated per ADR-0002). |
| no-new | error | plugin | `plugins/no-new.grit` | error | done | `new` as an expression statement (result discarded). |
| no-new-func | error | plugin | `plugins/no-new-func.grit` | error | done | `new Function(...)` / `Function(...)`. |
| no-new-wrappers | error | builtin | `useConsistentBuiltinInstantiation` | error | planned | `new Number/String/Boolean`. |
| no-nonoctal-decimal-escape | error | builtin | `noNonoctalDecimalEscape` | error | planned | |
| no-octal | error | unenforceable | — | — | n/a | Legacy `0123` literals are a syntax error in module/strict mode (airbnb is module). |
| no-octal-escape | error | builtin | `noOctalEscape` | error | planned | |
| no-param-reassign | error | builtin | `noParameterAssign` | error | planned | `[opts]` props; Biome rule does not do the prop-mutation variant. Flag looser. |
| no-proto | error | plugin | `plugins/no-proto.grit` | error | done | `__proto__` property access. |
| no-redeclare | error | builtin | `noRedeclare` | error | planned | |
| no-restricted-properties | error | unenforceable | — | — | n/a | `[opts]` project-specific object/property blacklist. |
| no-return-assign | error | builtin | `noAssignInExpressions` | error | planned | `[opts]` always; Biome rule is broader (any assignment in expression). Flag stricter. |
| no-return-await | error | plugin | `plugins/no-return-await.grit` | error | done | `return await` — syntactic. (Rule deprecated upstream; ported as-is.) |
| no-script-url | error | plugin | `plugins/no-script-url.grit` | error | done | `javascript:` URL string literals — regex on string text. |
| no-self-assign | error | builtin | `noSelfAssign` | error | planned | `[opts]` props. |
| no-self-compare | error | builtin | `noSelfCompare` | error | planned | |
| no-sequences | error | builtin | `noCommaOperator` | error | planned | `[opts]` allowInParentheses; Biome stricter. |
| no-throw-literal | error | builtin | `useThrowOnlyError` | error | planned | Without types Biome can't fully prove "is an Error"; syntactic subset. Flag looser. |
| no-unused-expressions | error | builtin | `noUnusedExpressions` | error | planned | `[opts]` allowShortCircuit/allowTernary. |
| no-unused-labels | error | builtin | `noUnusedLabels` | error | planned | |
| no-useless-catch | error | builtin | `noUselessCatch` | error | planned | |
| no-useless-concat | error | builtin | `noUselessStringConcat` | error | planned | |
| no-useless-escape | error | builtin | `noUselessEscapeInRegex` | error | planned | Biome rule covers regex only; ESLint also covers strings. Flag looser. |
| no-useless-return | error | unenforceable | — | — | n/a | Flow analysis (return is last reachable statement). |
| no-void | error | builtin | `noVoid` | error | planned | |
| no-with | error | builtin | `noWith` | error | planned | |
| prefer-promise-reject-errors | error | unenforceable | — | — | n/a | Needs to prove the reject value is an Error (semantic). |
| prefer-regex-literals | error | builtin | `useRegexLiterals` | error | planned | |
| radix | error | plugin | `plugins/radix.grit` | error | done | Airbnb `radix` is mode `always` → flag `parseInt(x)` with no radix. **Opposite of** Google's `no-parseint-base10` (which bans `parseInt(x, 10)`); authored fresh, not reused. |
| vars-on-top | error | unenforceable | — | — | n/a | Hoisting/ordering across a scope. Largely moot under `no-var`. |
| wrap-iife | error | plugin | `plugins/wrap-iife.grit` | error | done | `[opts]` outside; parens placement around IIFE. |
| yoda | error | builtin | `noYodaExpression` | error | planned | `[opts]` exceptRange. |

## errors

| Rule | Lvl | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| for-direction | error | builtin | `useValidForDirection` | error | planned | |
| getter-return | error | builtin | `useGetterReturn` | error | planned | `[opts]` allowImplicit. |
| no-async-promise-executor | error | builtin | `noAsyncPromiseExecutor` | error | planned | |
| no-await-in-loop | error | plugin | `plugins/no-await-in-loop.grit` | error | done | `await` lexically inside a loop body — syntactic. |
| no-compare-neg-zero | error | builtin | `noCompareNegZero` | error | planned | |
| no-cond-assign | error | builtin | `noAssignInExpressions` | error | planned | `[opts]` always; Biome rule is broader. |
| no-console | warn | builtin | `noConsole` | warn | planned | |
| no-constant-condition | warn | builtin | `noConstantCondition` | warn | planned | `[opts]` checkLoops. |
| no-control-regex | error | builtin | `noControlCharactersInRegex` | error | planned | |
| no-debugger | error | builtin | `noDebugger` | error | planned | |
| no-dupe-args | error | builtin | `noDuplicateParameters` | error | planned | |
| no-dupe-else-if | error | builtin | `noDuplicateElseIf` | error | planned | |
| no-dupe-keys | error | builtin | `noDuplicateObjectKeys` | error | planned | |
| no-duplicate-case | error | builtin | `noDuplicateCase` | error | planned | |
| no-empty | error | builtin | `noEmptyBlockStatements` | error | planned | `[opts]` allowEmptyCatch. |
| no-empty-character-class | error | builtin | `noEmptyCharacterClassInRegex` | error | planned | |
| no-ex-assign | error | builtin | `noCatchAssign` | error | planned | |
| no-extra-boolean-cast | error | builtin | `noExtraBooleanCast` | error | planned | |
| no-extra-semi | error | formatter | `semicolons` | — | planned | Formatter removes extra semicolons. |
| no-func-assign | error | builtin | `noFunctionAssign` | error | planned | |
| no-import-assign | error | builtin | `noImportAssign` | error | planned | |
| no-inner-declarations | error | builtin | `noInnerDeclarations` | error | planned | |
| no-invalid-regexp | error | unenforceable | — | — | n/a | Regex validity is a parser/runtime concern; no Biome lint equivalent in 2.4.16. |
| no-irregular-whitespace | error | builtin | `noIrregularWhitespace` | error | planned | `[opts]` skip* contexts. |
| no-loss-of-precision | error | builtin | `noPrecisionLoss` | error | planned | |
| no-misleading-character-class | error | builtin | `noMisleadingCharacterClass` | error | planned | Verify availability in 2.4.16. |
| no-obj-calls | error | builtin | `noGlobalObjectCalls` | error | planned | |
| no-promise-executor-return | error | unenforceable | — | — | n/a | Return inside a promise executor — flow/semantic. |
| no-prototype-builtins | error | builtin | `noPrototypeBuiltins` | error | planned | |
| no-regex-spaces | error | unenforceable | — | — | n/a | `noMultipleSpacesInRegex` absent in 2.4.16 (confirmed by config validation); regex-content analysis, low value in syntax-only GritQL. |
| no-setter-return | error | builtin | `noSetterReturn` | error | planned | |
| no-sparse-arrays | error | builtin | `noSparseArray` | error | planned | |
| no-template-curly-in-string | error | builtin | `noTemplateCurlyInString` | error | planned | |
| no-unexpected-multiline | error | unenforceable | — | — | n/a | ASI hazard; mitigated by `semicolons` formatter, not a discrete diagnostic. |
| no-unreachable | error | builtin | `noUnreachable` | error | planned | |
| no-unreachable-loop | error | unenforceable | — | — | n/a | Flow analysis. |
| no-unsafe-finally | error | builtin | `noUnsafeFinally` | error | planned | |
| no-unsafe-negation | error | builtin | `noUnsafeNegation` | error | planned | |
| no-unsafe-optional-chaining | error | builtin | `noUnsafeOptionalChaining` | error | planned | `[opts]` disallowArithmeticOperators. |
| no-useless-backreference | error | unenforceable | — | — | n/a | Regex backreference reachability analysis. |
| use-isnan | error | builtin | `useIsNan` | error | planned | |
| valid-typeof | error | builtin | `useValidTypeof` | error | planned | `[opts]` requireStringLiterals. |

## es6

| Rule | Lvl | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| arrow-body-style | error | plugin | `plugins/arrow-body-style.grit` | warn | done | `[opts]` as-needed: flags an arrow whose block body is a single `return`; multi-statement blocks correctly stay silent. Stylistic → downgraded to warn. |
| arrow-parens | error | formatter | `arrowParentheses` | — | planned | `[opts]` as-needed → `arrowParentheses: "asNeeded"`. |
| arrow-spacing | error | formatter | (whitespace) | — | planned | |
| constructor-super | error | builtin | `noInvalidConstructorSuper` | error | planned | |
| generator-star-spacing | error | formatter | (whitespace) | — | planned | |
| no-class-assign | error | builtin | `noClassAssign` | error | planned | |
| no-confusing-arrow | error | plugin | `plugins/no-confusing-arrow.grit` | warn | done | `noConfusingArrow` absent in 2.4.16 (confirmed). Flags an arrow whose body is an unparenthesized conditional (`a => b ? c : d`). `[opts]` allowParens **honored** — a parenthesized body is a distinct CST node (`JsParenthesizedExpression`), so `a => (b ? c : d)` stays silent. Stylistic → warn. |
| no-const-assign | error | builtin | `noConstAssign` | error | planned | |
| no-dupe-class-members | error | builtin | `noDuplicateClassMembers` | error | planned | |
| no-new-symbol | error | builtin | `noInvalidBuiltinInstantiation` | error | planned | `noNewSymbol` absent in 2.4.16; `new Symbol()` is covered by `noInvalidBuiltinInstantiation`. Verify coverage. |
| no-restricted-exports | error | unenforceable | — | — | n/a | `[opts]` project-specific export-name blacklist. |
| no-this-before-super | error | builtin | `noUnreachableSuper` | error | planned | |
| no-useless-computed-key | error | plugin | `plugins/no-useless-computed-key.grit` | error | done | `noUselessComputedKey` absent in 2.4.16 (confirmed). Flags a computed key that is a string/number literal (`{['a']: 1}`) via `JsComputedMemberName`; dynamic keys stay silent. `[opts]` enforceForClassMembers **covered** (the node fires on object + all class-member positions). |
| no-useless-constructor | error | builtin | `noUselessConstructor` | error | planned | |
| no-useless-rename | error | builtin | `noUselessRename` | error | planned | |
| no-var | error | builtin | `noVar` | error | planned | |
| object-shorthand | error | plugin | `plugins/object-shorthand.grit` | warn | done | `[opts]` always + avoidQuotes: flags longhand `{ x: x }` (repeated-metavariable equality + identifier guard) and `{ m: function () {} }`. Named function-expression values not covered (distinct CST shape). Stylistic → warn. |
| prefer-arrow-callback | error | builtin | `useArrowFunction` | warn | planned | `[opts]` allowNamedFunctions. **Airbnb enables `useArrowFunction`** — opposite of the Google port. Stylistic → warn. |
| prefer-const | error | builtin | `useConst` | error | planned | `[opts]` destructuring all. |
| prefer-destructuring | error | plugin | `plugins/prefer-destructuring.grit` | warn | done | `[opts]`: flags name-matched object access `const x = obj.x` (repeated-metavariable equality) and literal-zero array access `const first = arr[0]`. Stylistic → warn. |
| prefer-numeric-literals | error | builtin | `useNumericLiterals` | error | planned | |
| prefer-rest-params | error | builtin | `noArguments` | error | planned | Biome bans `arguments` outright (broader). |
| prefer-spread | error | plugin | `plugins/prefer-spread.grit` | warn | done | `.apply()` → spread. Syntactic subset only. Stylistic → warn. |
| prefer-template | error | builtin | `useTemplate` | error | planned | |
| require-yield | error | builtin | `useYield` | error | planned | |
| rest-spread-spacing | error | formatter | (whitespace) | — | planned | |
| symbol-description | error | plugin | `plugins/symbol-description.grit` | error | done | `Symbol()` called with no description argument. |
| template-curly-spacing | error | formatter | (whitespace) | — | planned | |
| yield-star-spacing | error | formatter | (whitespace) | — | planned | |

## node

| Rule | Lvl | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| global-require | error | unenforceable | — | — | n/a | Requires scope/placement analysis; CommonJS-specific. |
| no-buffer-constructor | error | plugin | `plugins/no-buffer-constructor.grit` | error | done | `new Buffer(...)` / `Buffer(...)`. |
| no-new-require | error | plugin | `plugins/no-new-require.grit` | error | done | `new require(...)`. |
| no-path-concat | error | unenforceable | — | — | n/a | Semantic (`__dirname`/`__filename` string concat with separators). |

## strict

| Rule | Lvl | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| strict | error | builtin | `noRedundantUseStrict` | error | planned | Config value is `'never'` (modules are implicitly strict); `noRedundantUseStrict` flags redundant `'use strict'` directives. |

## style

| Rule | Lvl | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| array-bracket-spacing | error | formatter | (bracket spacing) | — | planned | |
| block-spacing | error | formatter | (block spacing) | — | planned | |
| brace-style | error | formatter | (brace style) | — | planned | `[opts]` 1tbs. |
| camelcase | error | builtin | `useNamingConvention` | error | planned | `[opts]` properties/ignoreDestructuring. Biome rule is broader/configurable; flag for option fidelity. |
| comma-dangle | error | formatter | `trailingCommas` | — | planned | `[opts]` always-multiline → `trailingCommas: "all"`. |
| comma-spacing | error | formatter | (whitespace) | — | planned | |
| comma-style | error | formatter | (comma placement) | — | planned | |
| computed-property-spacing | error | formatter | (whitespace) | — | planned | |
| eol-last | error | formatter | (final newline) | — | planned | |
| func-call-spacing | error | formatter | (whitespace) | — | planned | |
| func-names | warn | plugin | `plugins/func-names.grit` | warn | done | Require named function expressions. Syntactic. |
| function-call-argument-newline | error | formatter | (layout) | — | planned | Biome's layout differs; partial. |
| function-paren-newline | error | formatter | (layout) | — | planned | |
| implicit-arrow-linebreak | error | formatter | (layout) | — | planned | |
| indent | error | formatter | `indentStyle` / `indentWidth` | — | planned | `[opts]` 2 spaces → `indentStyle: "space"`, `indentWidth: 2`. |
| key-spacing | error | formatter | (whitespace) | — | planned | |
| keyword-spacing | error | formatter | (whitespace) | — | planned | |
| linebreak-style | error | formatter | `lineEnding` | — | planned | `[opts]` unix → `lineEnding: "lf"`. |
| lines-around-directive | error | unenforceable | — | — | n/a | Blank line around directive prologues; not a formatter option. |
| lines-between-class-members | error | unenforceable | — | — | n/a | `[opts]`; blank-line-between-members not a Biome formatter option/rule in 2.4.16. |
| max-len | error | formatter | `lineWidth` | — | planned | `[opts]` 100 → `lineWidth: 100`. Formatter wraps but won't hard-error unbreakable long lines (URLs/strings); partial. |
| new-cap | error | plugin | `plugins/new-cap.grit` | error | done | `[opts]` newIsCap/capIsNew. Constructor-name casing — syntactic subset. |
| new-parens | error | plugin | `plugins/new-parens.grit` | error | done | Mirrors Google's `new-parens` (duplicated per ADR-0002). |
| newline-per-chained-call | error | formatter | (chain layout) | — | planned | `[opts]`; Biome's chain breaking is lineWidth-driven, differs. |
| no-array-constructor | error | builtin | `useArrayLiterals` | error | planned | |
| no-bitwise | error | plugin | `plugins/no-bitwise.grit` | warn | done | Bitwise operators. Stylistic → warn. |
| no-continue | error | plugin | `plugins/no-continue.grit` | warn | done | `continue` statements. Stylistic → warn. |
| no-lonely-if | error | builtin | `useCollapsedElseIf` | error | planned | |
| no-mixed-operators | error | unenforceable | — | — | n/a | `[opts]`; precedence-grouping analysis, fiddly/low-value in syntax-only GritQL. |
| no-mixed-spaces-and-tabs | error | formatter | `indentStyle` | — | planned | |
| no-multi-assign | error | plugin | `plugins/no-multi-assign.grit` | error | done | Chained assignment `a = b = c`. |
| no-multiple-empty-lines | error | formatter | (blank-line collapsing) | — | planned | `[opts]` max:1; formatter collapses blank lines. |
| no-nested-ternary | error | builtin | `noNestedTernary` | error | planned | |
| no-new-object | error | plugin | `plugins/no-new-object.grit` | error | done | `noObjectConstructor` absent in 2.4.16. ESLint `no-new-object` flags only `new Object()` (≈ Google's `no-object-constructor`, trimmed: Airbnb does not flag a bare `Object()` call). |
| no-plusplus | error | plugin | `plugins/no-plusplus.grit` | warn | done | `++`/`--`. Stylistic → warn. |
| no-restricted-syntax | error | unenforceable | — | — | n/a | `[opts]` generic AST-selector blacklist (bans `for-in`/`for-of`/labels/`with`); the concrete targets are covered by other rows. |
| no-spaced-func | error | formatter | (whitespace) | — | planned | Deprecated alias of `func-call-spacing`. |
| no-tabs | error | formatter | `indentStyle` | — | planned | |
| no-trailing-spaces | error | formatter | (whitespace) | — | planned | `[opts]`. |
| no-underscore-dangle | error | plugin | `plugins/no-underscore-dangle.grit` | warn | done | `[opts]` many exceptions. Identifier naming — syntactic. Stylistic → warn. |
| no-unneeded-ternary | error | builtin | `noUselessTernary` | error | planned | `[opts]` defaultAssignment. |
| no-whitespace-before-property | error | formatter | (whitespace) | — | planned | |
| nonblock-statement-body-position | error | formatter | (layout) | — | planned | Subsumed in practice by `curly` → `useBlockStatements` (blocks always). |
| object-curly-newline | error | formatter | (layout) | — | planned | `[opts]`. |
| object-curly-spacing | error | formatter | `bracketSpacing` | — | planned | `[opts]` always → `bracketSpacing: true`. |
| object-property-newline | error | formatter | (layout) | — | planned | `[opts]`. |
| one-var | error | builtin | `useSingleVarDeclarator` | error | planned | `[opts]` never. |
| one-var-declaration-per-line | error | formatter | (layout) | — | planned | `[opts]`. Subsumed by `one-var` + formatter. |
| operator-assignment | error | builtin | `useShorthandAssign` | error | planned | |
| operator-linebreak | error | formatter | (layout) | — | planned | `[opts]`. |
| padded-blocks | error | formatter | (blank-line trimming) | — | planned | `[opts]`. |
| prefer-exponentiation-operator | error | builtin | `useExponentiationOperator` | error | planned | |
| prefer-object-spread | error | plugin | `plugins/prefer-object-spread.grit` | warn | done | `Object.assign({}, …)` → spread. Stylistic → warn. |
| quote-props | error | formatter | `quoteProperties` | — | planned | `[opts]` as-needed → `quoteProperties: "asNeeded"`. |
| quotes | error | formatter | `quoteStyle` | — | planned | `[opts]` single → `quoteStyle: "single"`, avoidEscape default. |
| semi | error | formatter | `semicolons` | — | planned | `[opts]` always → `semicolons: "always"`. |
| semi-spacing | error | formatter | (whitespace) | — | planned | |
| semi-style | error | formatter | (layout) | — | planned | |
| space-before-blocks | error | formatter | (whitespace) | — | planned | |
| space-before-function-paren | error | formatter | (whitespace) | — | planned | `[opts]`. |
| space-in-parens | error | formatter | (whitespace) | — | planned | |
| space-infix-ops | error | formatter | (whitespace) | — | planned | |
| space-unary-ops | error | formatter | (whitespace) | — | planned | `[opts]`. |
| spaced-comment | error | unenforceable | — | — | n/a | `[opts]`; space-after-`//` not a Biome formatter option; comment-text matching unreliable in GritQL. |
| switch-colon-spacing | error | formatter | (whitespace) | — | planned | `[opts]`. |
| template-tag-spacing | error | formatter | (whitespace) | — | planned | |
| unicode-bom | error | unenforceable | — | — | n/a | `[opts]` never; encoding/toolchain concern (cf. Google UTF-8 row). |

## variables

| Rule | Lvl | Mechanism | Biome rule / option / plugin | Sev | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| no-delete-var | error | plugin | `plugins/no-delete-var.grit` | error | done | `delete` of a bare identifier — syntactic. (Syntax error in strict mode anyway; ported for completeness.) |
| no-label-var | error | builtin | `noLabelVar` | error | planned | |
| no-restricted-globals | error | builtin | `noRestrictedGlobals` | error | planned | `[opts]` airbnb's specific global list (`isFinite`, `isNaN`, browser globals via `confusing-browser-globals`). Carry the list in shared config. |
| no-shadow | error | builtin | `noShadow` | error | planned | Verify stability/availability in 2.4.16 (may be `nursery`). |
| no-shadow-restricted-names | error | builtin | `noShadowRestrictedNames` | error | planned | |
| no-undef | error | builtin | `noUndeclaredVariables` | error | planned | Without type/global info Biome is looser; relies on configured globals. Flag looser. |
| no-undef-init | error | builtin | `noUselessUndefinedInitialization` | error | planned | |
| no-unused-vars | error | builtin | `noUnusedVariables` | error | planned | `[opts]` args/ignoreRestSiblings/argsIgnorePattern; confirm option fidelity. |
| no-use-before-define | error | builtin | `noInvalidUseBeforeDeclaration` | error | planned | `[opts]` functions:false/classes/variables. |

---

## Mechanism tally (first pass)

| Mechanism | Count |
| --- | --- |
| `builtin` | 103 |
| `formatter` | 52 |
| `plugin` | 36 |
| `unenforceable` | 27 |
| **Total** | **218** |

> Biome's built-in coverage of ESLint core correctness rules is strong, so the port skews heavily to `builtin` (≈47%, 101 distinct Biome rules) — a different shape from the Google port. Of the 36 plugin rules, 12 are downgraded to `warn` as purely stylistic; the rest stay at the config's `error`. One feasibility-spike candidate, `grouped-accessor-pairs`, reclassified to `unenforceable` (member adjacency is not expressible in single-file syntax-only GritQL); the other 8 spikes (incl. `object-shorthand` and `prefer-destructuring`, which rely on repeated-metavariable equality, and `no-confusing-arrow`, which honors `allowParens` because parentheses are a distinct CST node) proved feasible and shipped.

> All 36 plugin rows are now `done` — implemented, harness-tested, and included in the generated `all.grit` bundle (covered by the bundle-liveness test). Builtin rows remain `planned` until enabled in the shared config and covered by a harness test. Plugins reusing Google logic (duplicated per ADR-0002): `new-parens` (exact) and `no-multi-str` (≈ Google's `no-multiline-string`); `no-new-object` is a trimmed `no-object-constructor`. `radix` is authored fresh — Airbnb's `radix: always` is the **opposite** of Google's `no-parseint-base10`.
