# mailcow-client — build spec (modeled on siblings)

Model sibling: [waha-client](/home/david/adaptive/waha-client) (fullest template).
Cross-checked against [lexware-client](/home/david/adaptive/lexware-client),
[outscraper-client](/home/david/adaptive/outscraper-client),
[google-search-console-client](/home/david/adaptive/google-search-console-client).
Do NOT modify siblings. Stack per skills: bun, typescript, biome, valibot,
`@adaptive-ds/result`, `@stricli/core`.

Conventions (from `~/.agents/skills/code-style/SKILL.md` + `~/.agents/skills/default-tech-stack/SKILL.md`):
one export per file (file named after export), subject-first function names
(`sessionList`, not `listSessions`; generic utils included), bounded-context
top-level folders, fallible fns return `Result<T>`/`PromiseResult<T>` (never throw),
`const op = "fnName"` first, early returns, valibot `* as a` alias (waha + lexware
use `a`; gsc + outscraper use `v` — follow waha: `a`).

## 1. Root file-by-file scaffold checklist

| File | Source | Changes for mailcow-client |
|---|---|---|
| `package.json` | copy from [waha `package.json`](/home/david/adaptive/waha-client/package.json), adapt | `name`: `@adaptive-ds/mailcow-client`; `version`: `0.1.0`; `description`: mailcow API wording; `keywords`: `mailcow`, `mail`, `api-client`, `typescript`, `cli`, `valibot`, `result`; `homepage`/`repository.url`/`bugs.url`: `github.com/david1gp/mailcow-client`; `bin`: `{ "mailcow-client": "./dist/cli.js" }`; `exports`: see strategy below; peer `result`: `^0.6.0` (see §7) |
| `tsconfig.json` | copy verbatim from [waha](/home/david/adaptive/waha-client/tsconfig.json) | none (strict, `nodenext`, `erasableSyntaxOnly`, `include: src,test`) |
| `tsconfig.lib.json` | copy verbatim from [waha](/home/david/adaptive/waha-client/tsconfig.lib.json) | none (`rootDir src`, `outDir dist`, declarations + sourcemaps) |
| `biome.json` | copy verbatim from [waha](/home/david/adaptive/waha-client/biome.json) | none (line width 120, `asNeeded` semicolons, recommended preset + listed style rules) |
| `cliff.toml` | copy verbatim from [waha](/home/david/adaptive/waha-client/cliff.toml) | none (conventional-commits groups, `tag_pattern v[0-9].*`) |
| `.gitignore` | copy verbatim from [waha](/home/david/adaptive/waha-client/.gitignore) | none (ignores `node_modules`, `dist`, `/build`, `.env*`, lockfiles incl. `bun.lock`, `.code-workspace`) |
| `.gitattributes` | copy verbatim from [waha](/home/david/adaptive/waha-client/.gitattributes) | none (`text eol=lf`, `* text=auto encoding=UTF-8`) |
| `.github/workflows/publish.yml` | copy from [waha](/home/david/adaptive/waha-client/.github/workflows/publish.yml) | none (tag `v*` → bun install/build/test, then `npm publish --access public --provenance` via setup-node; keep waha's comments) |
| `ops/release.sh` | copy verbatim from [waha](/home/david/adaptive/waha-client/ops/release.sh) | none (executable; git-cliff → `changelogs/`, semver bump, commit `chore(release)`, tag `vX`, `gh release create`, `git branch -f released`) |
| `LICENSE` | copy from [waha](/home/david/adaptive/waha-client/LICENSE) | keep `MIT Copyright (c) 2025 David Siewert` text; bump year only if repo convention moves on |
| `mailcow-client.code-workspace` | copy from [waha-client.code-workspace](/home/david/adaptive/waha-client/waha-client.code-workspace) (`{"folders":[{"path":"."}],"settings":{}}`) | rename file only |
| `README.md` | adapt structure from [waha README](/home/david/adaptive/waha-client/README.md) | outline in §8 |
| `changelogs/` | create empty dir; file naming `YYYY-MM-DD_vX.Y.Z.md`, body `## [X.Y.Z] - DATE` + grouped bullets (see [example](/home/david/adaptive/waha-client/changelogs/2026-09-22_v0.6.1.md)) | first entry written by `ops/release.sh` |
| `docs/` | create dir; date-prefixed decision notes like waha's `docs/` (`20260922_*.md`) | this spec lives at `docs/sibling-pattern.md` |
| `src/` + `test/` + `e2e/` | new, per §§2–5 | — |

### Exports-map strategy
Waha lists one explicit subpath export per bounded context
(`./apiKeys/*.js`, `./apps/*.js`, … — see [waha `package.json`](https://github.com/david1gp/waha-client/blob/main/package.json)).
Lexware/outscraper use a single generic subpath (`"./*": dist/*.js|.d.ts` —
[lexware](https://github.com/david1gp/lexware-client/blob/main/package.json));
GSC uses generic `./*` plus a few named roots.
**Recommendation: lexware-style generic map** (`.` + `./*` + `files: [dist]`)
for mailcow-client. It covers any future bounded context with zero maintenance;
waha's explicit list is a per-domain upkeep burden with no runtime benefit.
Only switch to explicit per-context entries if a consumer needs to block
deep imports per domain (none of the 3 newer siblings do).

## 2. Request core to replicate (from waha `src/client/`)

Copy these files, renaming the `waha` prefix to `mailcow`
(`mailcowRequest.ts`, `mailcowClientConfigSchema.ts`, …).
Keep function names subject-first; keep the `op` convention.

- [wahaRequest.ts](/home/david/adaptive/waha-client/src/client/wahaRequest.ts) → `mailcowRequest`:
  overloaded on `responseType` (`json` default | `bytes` | `text` | `void`),
  `AbortController` timeout (`config.timeoutMs ?? 30_000`), retry on fetch
  failure + HTTP 5xx (`config.retries ?? 0`, `maxAttempts = retries + 1`),
  `X-Api-Key` header from `config.apiKey`, `Accept: application/json`
  default, `Content-Type: application/json` when body present,
  non-2xx → `resultTryParsingFetchErr(op, text, status, statusText)`,
  empty-body JSON → `createResult(undefined)`, invalid JSON →
  `createResultError(op, "Invalid JSON response", …)`.
  `204`/void → `createResult(undefined)`; bytes → `new Uint8Array(buf)`.
- [wahaClientConfigSchema.ts](/home/david/adaptive/waha-client/src/client/wahaClientConfigSchema.ts):
  `baseUrl` (non-empty `a.url()`, trailing slashes trimmed via `a.transform`),
  optional `apiKey`, `timeoutMs` (positive int), `retries` (int ≥ 0);
  derive `*Input` (`a.InferInput`) + config (`a.InferOutput`) types.
  **Drop `session`** — mailcow has no session default; also drop
  `injectSession`, `wahaRequestBodyWithSession.ts`, path/session helpers and
  `wahaResolveSession.ts`/`sessionResolveName.ts` (no equivalent concept).
- [wahaClientConfig.ts](/home/david/adaptive/waha-client/src/client/wahaClientConfig.ts):
  `a.safeParse` → `createResultError(op, a.summarize(parsed.issues))`, else
  `createResult(parsed.output)`.
- [wahaClientFromEnv.ts](/home/david/adaptive/waha-client/src/client/wahaClientFromEnv.ts)
  → `mailcowClientFromEnv(env = process.env)`: required `MAILCOW_BASE_URL`,
  optional `MAILCOW_API_KEY`, `MAILCOW_TIMEOUT_MS`, `MAILCOW_RETRIES`
  (numeric strings → `Number`, `NaN` → `undefined`).
  Env-prefix convention (checked across siblings): waha uses
  `WAHA_BASE_URL`/`WAHA_API_KEY`/`WAHA_TIMEOUT_MS`/`WAHA_RETRIES` (+`WAHA_SESSION`);
  outscraper uses `OUTSCRAPER_API_KEY`/`OUTSCRAPER_BASE_URL`;
  lexware token-first `LEXWARE_TOKEN`/`LEXWARE_API_KEY`/`LEXWARE_ACCESS_TOKEN`
  (see `cliAccessTokenResolve.ts`); GSC is OAuth-based (no plain prefix).
  For mailcow (API-key service like waha/outscraper): `MAILCOW_` prefix as above.
  Header name (`X-API-Key` like waha/outscraper) must be confirmed against the
  mailcow API docs during implementation.
- [wahaRequestOptions.ts](/home/david/adaptive/waha-client/src/client/wahaRequestOptions.ts),
  [wahaRequestUrl.ts](/home/david/adaptive/waha-client/src/client/wahaRequestUrl.ts),
  [wahaRequestQueryString.ts](/home/david/adaptive/waha-client/src/client/wahaRequestQueryString.ts)
  (skip null/undefined, repeat array items), [wahaPathApi.ts](/home/david/adaptive/waha-client/src/client/wahaPathApi.ts)
  → keep one path-prefix helper only if mailcow has a common prefix
  (e.g. `/api/v1`); otherwise inline paths. Keep [configSchema.ts](/home/david/adaptive/waha-client/src/client/configSchema.ts)
  trivial-validator pattern if a generic config slot is needed.
- [PACKAGE_VERSION.ts](/home/david/adaptive/waha-client/src/client/PACKAGE_VERSION.ts) +
  [packageVersion.ts](/home/david/adaptive/waha-client/src/client/packageVersion.ts)
  (both `import pkg from "../../package.json" with { type: "json" }`;
  keep both names — `src/index.ts` and `versionCommand.ts` each import one),
  re-exported from [src/index.ts](/home/david/adaptive/waha-client/src/index.ts).

Result library API actually used (installed `@adaptive-ds/result@0.6.0` in every
sibling `node_modules`; signatures from `dist/*.d.ts`):
`createResult<T>(data: T)`, `createResultError(op, errorMessage, errorData?)`
→ `ResultErr`, `resultTryParsingFetchErr(op, text, statusCode, responseStatusText)`,
types `Result`/`PromiseResult`. Imported via the `#result` bare specifier
(mapped in `package.json` `"imports": {"#result": "@adaptive-ds/result"}`).
Valibot usage: `import * as a from "valibot"`, `a.safeParse(schema, input)`,
`a.summarize(parsed.issues)` for the error message.

## 3. Per-endpoint file pattern (worked waha example: sessions)

One bounded-context folder per API area (`src/sessions/`); one export per file.
Concrete chain for `sessionList` / `sessionCreate` / `sessionGet`:

1. Options schema — [sessionListOptionsSchema.ts](/home/david/adaptive/waha-client/src/sessions/sessionListOptionsSchema.ts):
   `a.object({ config: wahaClientConfigSchema, …endpoint params… })`,
   type `SessionListOptions = a.InferInput<…>`.
   Create/update variants take a dedicated `*Request` plain type
   ([sessionCreateRequest.ts](/home/david/adaptive/waha-client/src/sessions/sessionCreateRequest.ts))
   + response DTO plain type ([sessionDTO.ts](/home/david/adaptive/waha-client/src/sessions/sessionDTO.ts),
   [sessionInfo.ts](/home/david/adaptive/waha-client/src/sessions/sessionInfo.ts)).
2. Operation fn — [sessionList.ts](/home/david/adaptive/waha-client/src/sessions/sessionList.ts):
   `const op = "sessionList"` → `a.safeParse(optionsSchema)` →
   destructure `parsed.output` → `wahaRequest<T>(…)` with explicit `method`,
   `path` (`wahaPathApi("/sessions")`, `encodeURIComponent` for path params),
   `query` (undefined values skipped), `body` (spread only defined fields),
   `responseType` for binary (`bytes`) endpoints.
   Session-scoped variant ([sessionGet.ts](/home/david/adaptive/waha-client/src/sessions/sessionGet.ts))
   resolves `session ?? config.session` or returns
   `createResultError(op, "session is required…")` — omit for mailcow.
3. CLI command module — [sessionCommands.ts](/home/david/adaptive/waha-client/src/sessions/cli/sessionCommands.ts)
   via `buildRouteMap({ routes: { list, get, create, … } })`;
   each command: `buildCommand({ func(this: CommandContext, flags) ,
   parameters: { flags: { … } }, docs: { brief } })` calling `cliRunApi(this, flags, (config) => opFn(…))`.
   Shared CLI helpers live in [src/cli/](/home/david/adaptive/waha-client/src/cli):
   [cliConfigFlagParams.ts](/home/david/adaptive/waha-client/src/cli/cliConfigFlagParams.ts)
   (`--baseUrl/--apiKey/--session` overrides; mailcow: `--baseUrl/--apiKey` only),
   [cliConfigLoad.ts](/home/david/adaptive/waha-client/src/cli/cliConfigLoad.ts) (flags override env),
   [cliRunApi.ts](/home/david/adaptive/waha-client/src/cli/cliRunApi.ts)
   (load config → run → `cliWriteJson` pretty JSON to stdout, `cliFail` Result JSON to stderr + exit 1),
   [cliJsonParse.ts](/home/david/adaptive/waha-client/src/cli/cliJsonParse.ts) + [cliJsonFlagParam.ts](/home/david/adaptive/waha-client/src/cli/cliJsonFlagParam.ts)
   (`--*Json` flags; schema validation stays in the library op),
   [cliScalarFlagParams.ts](/home/david/adaptive/waha-client/src/cli/cliScalarFlagParams.ts),
   [cliBinaryOutput.ts](/home/david/adaptive/waha-client/src/cli/cliBinaryOutput.ts)
   (`--output PATH` writes bytes, else `{encoding:"base64",data}`),
   [cliResultOrFail.ts](/home/david/adaptive/waha-client/src/cli/cliResultOrFail.ts),
   [versionCommand.ts](/home/david/adaptive/waha-client/src/cli/versionCommand.ts)
   (`version` + `--verbose` metadata; note `author: unavailable` when package.json has no author).
   Wire domains in [cliApp.ts](/home/david/adaptive/waha-client/src/cli/cliApp.ts)
   (`buildApplication(routes, { name: "mailcow-client", versionInfo })`)
   and entry [src/cli.ts](/home/david/adaptive/waha-client/src/cli.ts)
   (`#!/usr/bin/env bun` + `run(app, process.argv.slice(2), { process })`;
   `build` script ends with `chmod +x ./dist/cli.js` to preserve it —
   see changelog `2026-09-22_v0.6.1.md`).
4. Barrel [src/index.ts](/home/david/adaptive/waha-client/src/index.ts): export every op fn,
   every `*Options` type, every schema/DTO type (waha: 538 lines, per-domain grouped).

Outscraper delta (codegen, likely NOT needed for mailcow): `scripts/openapi-*.ts`
+ `openapi/*.json` snapshot/normalize/generate pipeline producing
`outscraperGenerated*` files. Only adopt if mailcow ships a usable OpenAPI spec;
default to hand-written waha-style endpoints.

## 4. Test strategy to replicate

- Unit with mocked fetch — [test/sessionApi.test.ts](/home/david/adaptive/waha-client/test/sessionApi.test.ts):
  `bun:test` (`describe/test/expect`, `mock` from `bun:test`), save/restore
  `globalThis.fetch` in `afterEach`, return canned `Response` objects, assert
  exact URL (`…/api/sessions?all=true&expand=apps`), `method`, `X-Api-Key`
  header, `encodeURIComponent` path params, `config.session` fallback, missing
  session → `success: false`, circular/invalid options → `ResultErr` with `op`.
  Plus [smoke.test.ts](/home/david/adaptive/waha-client/test/smoke.test.ts)
  (`PACKAGE_VERSION === pkg.version`, config accepts/rejects) and
  `wahaRequest.test.ts` (timeout/retry/response-type matrix).
- CLI coverage test — [test/cliOperationCoverage.test.ts](/home/david/adaptive/waha-client/test/cliOperationCoverage.test.ts):
  parse `src/index.ts` for `export { Op } from "…"` (excluding `./client/` and
  the resolve-helper set `authResolveSession/sessionResolveName/wahaResolveSession`),
  regex-scan `src/**/cli/*Commands.ts` for `Op(`, walk `*App.root`
  `getAllEntries()/loader()` for reachable routes; assert zero missing ops.
  Replicate with mailcow's barrel + `mailcow*` excluded helpers.
- CLI round-trip tests — [test/cli.test.ts](/home/david/adaptive/waha-client/test/cli.test.ts):
  `Bun.spawn(["bun","run",cliPath,…])` against a `Bun.serve` mock server that
  captures `{method,path,body}`; assert exit codes, stdout pretty-JSON,
  stderr Result-JSON, `version`/`--version`/`--help` listings, `--*Json` flags,
  file-upload (`--file` local/remote) and `--output` bytes behavior.
  Heavier per-domain files (`messagesChatsCli`, `groupsContactsCli`, …) follow
  the same harness — add one per bounded context.
- Live e2e gated by env (lexware pattern, `e2e/` + `.env` pattern):
  scripts `test:e2e: bun run build && bun --env-file=.env test ./e2e/*.e2e.ts`
  plus per-domain variants (see [lexware `package.json`](https://github.com/david1gp/lexware-client/blob/main/package.json));
  `lexwareE2eSetup.ts` throws when the key var is absent, uses a traced `fetch`
  with IDs redacted to `/:id` in logs, `lexwareE2eCleanup.ts` + `lexwareE2eResultAssert.ts`
  helpers, one `*.e2e.ts` per domain + `live.e2e.ts`.
  For mailcow: gate on `MAILCOW_API_KEY` (+`MAILCOW_BASE_URL`), import from `dist/`.
  Never commit `.env` (already gitignored); never print keys — names only.
- Scripts: `test: bun test` (unit vs `src/`, waha-style),
  `test:e2e` as above (lexware-style), `build` before e2e only.

## 5. Release / publish flow

- `ops/release.sh` (see [waha's](https://github.com/david1gp/waha-client/blob/main/ops/release.sh)):
  preflight `gh` CLI + `gh auth status`; `git cliff --unreleased --strip` draft;
  abort when empty; version arg or auto (minor on `feat`, else patch);
  write `changelogs/YYYY-MM-DD_vX.Y.Z.md`; `bun run build`;
  `jq` version bump; commit `chore(release): vX`, tag `vX`, push `main` + tags;
  `gh release create --notes-file`; `git branch -f released`.
  (GSC's copy omits the build step — keep waha's with-build variant.)
- `cliff.toml` unchanged: conventional-commits groups feed the changelog body.
- [publish.yml](/home/david/adaptive/waha-client/.github/workflows/publish.yml):
  **yes, publishes to npm** — on `v*` tags: bun install → build → test, then
  `npm publish --access public --provenance` via `setup-node` (bun still lacks
  OIDC publish support). `id-token: write` = npm trusted publishing, no token.

## 6. Version pins

Identical in all four siblings — pin exactly:
`@stricli/core ^1.2.5` (dependency), `@biomejs/biome ^2.5.2`,
`@types/bun ^1.3.13`, `typescript ^6.0.3` (dev), plus the
`"imports": {"#result": "@adaptive-ds/result"}` map and the `prettier`
`{semi:false, printWidth:120, trailingComma:all}` key (kept even though biome
is the formatter).
Peer-divergence decision: waha pins `@adaptive-ds/result >=0.4.0` (+`valibot ^1.2.0`);
lexware, outscraper, GSC pin `^0.6.0`.
**Recommend `^0.6.0`** — the installed version in every sibling tree is 0.6.0,
so `>=0.4.0` admits untested older releases for no benefit, and 3-of-4 siblings
already converged on `^0.6.0`. Also list `@adaptive-ds/result` + `valibot` under
`devDependencies` (outscraper/GSC do; waha relies on hoisting) so unit tests
resolve them deterministically.

## 7. README outline (matches [waha README](/home/david/adaptive/waha-client/README.md))

1. `# @adaptive-ds/mailcow-client` + one-liner (TS client + CLI for the mailcow API;
   keep `package.json` description identical — `cli.test.ts`-style version tests quote it).
2. `Features` bullets (endpoint coverage areas; `Result`-typed with link to
   `github.com/david1gp/result`; Valibot-validated; binary as `Uint8Array` if applicable).
3. `Install`: `bun add @adaptive-ds/mailcow-client`.
4. `Library`: TS snippet — `mailcowClientFromEnv()` (+ explicit-config alternative),
   one list + one write call, `if (!r.success) throw new Error(r.errorMessage)` pattern.
5. `Environment`: `MAILCOW_BASE_URL` (required), `MAILCOW_API_KEY` (optional),
   `MAILCOW_TIMEOUT_MS` / `MAILCOW_RETRIES` (optional); note Bun auto-loads `.env`.
6. `CLI`: `export` examples, `mailcow-client --help`, `mailcow-client version`,
   per-domain `<domain> <command>` list with one example per domain,
   `--baseUrl`/`--apiKey` per-call overrides, pretty-JSON stdout vs Result-JSON
   stderr + exit 1, `--*Json` flags passed without reshaping, `--output` for bytes.
7. Server section (mailcow instance + docs link).
8. `License`: `MIT © David Siewert`.

## 8. Git hosting
All four siblings use `origin git@github.com:david1gp/<repo>.git`
(verified `git remote -v` in each). No `git.contentoren.de` hosting for
open-source clients. Create `github.com/david1gp/mailcow-client`
(ssh remote `git@github.com:david1gp/mailcow-client.git`).
