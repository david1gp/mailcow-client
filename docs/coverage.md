# API coverage

Source contract: [`docs/api-inventory.md`](./api-inventory.md), verified against
`~/opensource/mailcow` tag `2026-10`, commit `55982ac7`. Independent recount
2026-10-24 (review; throwaway scripts kept under `/tmp`, outside the repo): **214 routed leaf
URL patterns** — one per innermost `case` in `json_api.php` (`add` 31,
`delete` 32, `edit` 56, `get` 93, `search` 2), including one
routed-but-unlisted pattern pinned below. Convention notes: a `default:`
branch serving `$object`/`$extra` counts once (the bare URL aliases to it);
the duplicate `case "cors"` in the edit switch counts once; the logs
unknown-service `default` answers 404 (not a pattern); `status/host/ip` is an
`$extra` variant of the `host` case (covered by `statusHostIpGet`); no `GET
/get/mta-sts/…` route exists. The inventory headline still says 217
(`get` 96) — that overcounts `get` by 3 under this convention.
Op counts below are derived from `src/index.ts` (value exports per context,
schemas excluded) and were re-verified in the same review: **201 ops**.

## Context → ops → routed patterns

| Context | Ops | Routed patterns covered |
|---|---|---|
| Domains | 13 | 13 (CRUD + templates + tags + footer + search) |
| Mailboxes | 30 | 24 + convenience reads (reduced list, spam-score, sieve, last-login) |
| Aliases | 9 | 9 (alias + time-limited alias CRUD) |
| Alias domains | 5 | 5 |
| Resources | 5 | 5 |
| Domain admins | 8 | 8 (CRUD + da-acl + sso + self) |
| Admins | 5 | 4 + list/get variants |
| Sieve filters | 8 | 9 (global-filter add covers prefilter+postfilter) |
| Sync jobs | 5 | 5 |
| App passwords | 5 | 5 |
| OAuth2 clients | 5 | 4 + list/get variants |
| Spam policy / Rspamd | 15 | 8 + wl/bl × domain/mailbox + rsetting variants |
| TLS / MTA-STS | 7 | 7 |
| Routing | 25 | 16 + per-object get/list variants |
| Mail queue | 4 | 4 (`mailqList` covers the raw passthrough; `postcatGet` reads bytes) |
| Quarantine | 5 | 5 |
| DKIM | 5 | 5 |
| Ratelimits | 7 | 7 (rl-domain + rl-mbox list/get/edit + rlhash delete) |
| Fail2ban | 3 | 3 (get + edit + banlist refresh; `logs/netfilter` lives under logs) |
| Logs | 2 | 14 base patterns, 27 URL shapes (`logList` spans service × optional count; `rspamdStatsGet` covers rspamd-stats) |
| Status | 7 | 6 leaf cases + `host/ip` `$extra` variant (containers, container, vmail, host, host/ip, version, identity-provider get) |
| Settings | 17 | 16 inventoried + 1 unlisted (see deviations) |
| FIDO2 | 6 | 6 |
| **Total** | **201** | **213 inventoried + 1 unlisted (`delete/identity-provider`) = 214, all covered** |

Every op exported from `src/index.ts` is called from a `src/**/cli/*Commands.ts`
file and reachable from the CLI root — enforced by
`test/cliOperationCoverage.test.ts`, which fails on any gap (including gaps in
earlier batches; none remain).

## Session-only ops (API key unusable)

Live-corrected 2026-10-24 (`e2e/sessionPins.e2e.ts`): the ceremony **args
GETs are issued to API-key callers** (HTTP 200 with `publicKey`) — the router
only needs `mailcow_cc_role`, which API-key sessions have. Only the
ceremony-completing writes and the self-edits stay session-scoped. The client
config has no cookie support; these go through `mailcowRequest` like
everything else and the server-side scoping below is faithful behavior, not a
client gap.

- `fido2RegistrationArgsGet`, `fido2GetArgsGet`,
  `webauthnTfaRegistrationArgsGet` — issued to API-key callers (200 +
  `publicKey`); completing the ceremony still needs the session challenge.
- `webauthnTfaGetArgsGet` — issued (200) but answers the `{type: 'error'}`
  no-credentials quirk for API-key callers; passed through as-is.
- `fido2RegistrationAdd`, `webauthnTfaRegistrationAdd` (bare `{success, msg?}`
  responses; `success: false` maps to `ResultErr`) — rejected without a
  session.
- `fido2FnEdit` — answers success to API-key callers but is a no-op (acts on
  the pseudo-user `API`, matches zero rows; `functions.inc.php:1554-1578`).
- `userSelfEdit` (`POST /edit/self` user branch; distinct from
  `domainAdminSelfEdit`, which takes the domainadmin branch of the same path)
  — rejected without a session.
- `domainAdminSelfEdit` (prior batch, listed here for completeness) —
  rejected without a session.

## Live-behavior corrections 2026-10-24 (production e2e)

- `mailcowEnvelope` treats only `danger`/`error` entries as failure.
  Upstream pushes non-fatal `warning` entries and keeps going — e.g. deletes
  answer `[warning garbage-collector, success removed]` with the rows actually
  deleted (`functions.mailbox.inc.php:5757-5762,6018-6023`). The previous
  any-non-success-fails mapping is removed.
- `appPasswordEdit` requires `username` (target mailbox) in attr. Upstream
  falls back to the session user (`functions.app_passwd.inc.php:8-22`), which
  is the pseudo-user `API` for API-key callers — under it the edit cannot
  apply. `appPasswordDetails.password` is the BLF-CRYPT hash: typed faithfully,
  redact before logging.
- `DomainDetails.domain` is renamed `domain_name` (live key for get, list,
  and search rows); `FwdhostDetails.hostname` is renamed `host` (live read
  rows are `{host, source, keep_spam}`; `hostname` stays write-side only).
- `mailboxRename` attr requires `old_local_part` (upstream builds the old
  address as `old_local_part@domain`; items are ignored by the handler).
- `resourceAdd` drops attr `name` (never read upstream) and requires
  `description` — the server derives the address as
  `sanitized(description)@domain`.

## Known-broken-upstream pins (source-verified, not worked around)

- `GET /get/app-passwd/{id}` does `$object['id']` on a string (`json_api.php:556`)
  — effectively broken; use `appPasswordList`.
- `GET /get/bcc/{id}`, `/get/recipient_map/{id}`, `/get/tls-policy-map/{id}`
  default branches append undefined `$details` (`json_api.php:1178-1234`).
- Duplicate `case "cors"` in the edit switch; the second is unreachable
  (`json_api.php:2052-2063`). Both call the same handler — no behavior impact.
- No `GET /get/mta-sts/...` route exists (add/edit/delete only); read MTA-STS
  back via mailbox details.
- `POST /delete/rlhash` echoes the handler's boolean return raw (`"1"`/`""`),
  never an envelope — `ratelimitHashDelete` returns it as text, unmapped.
- `GET /get/webauthn-tfa-get-args` answers `{type: 'error', ...}` instead of
  args when no credentials match; passed through as-is.
- `DELETE /delete/identity-provider` is routed (`identity_provider('delete')`,
  `json_api.php:1825-1826`) but absent from inventory §22 — implemented as
  `identityProviderDelete` (extra op beyond the inventory).
- Inventory §18 checklist says "Ratelimits | 6"; the router has 7 patterns
  (rl-domain all/get, rl-mbox all/get, 2 edits, rlhash delete) — all 7 covered.
