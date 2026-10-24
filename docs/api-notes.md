# mailcow API Notes (source-derived)

Sources: `data/web/json_api.php`, `data/web/inc/sessions.inc.php`,
`data/web/inc/functions.{inc,mailbox,quarantine,mailq,...}.inc.php` at tag `2026-10` (commit `55982ac7`).

## 1. Auth mechanics

- Header: `X-API-Key: <key>` (`inc/sessions.inc.php:50-55`). Key is sanitized to `[a-zA-Z0-9-]`
  and looked up in the `api` table (`api_key`, `active=1`).
- On match the session becomes `mailcow_cc_username='API'`, **`mailcow_cc_role='admin'`**,
  `mailcow_cc_api=true` (`inc/sessions.inc.php:61-63`). So an API key is always admin-scoped;
  per-role scoping only applies to cookie sessions (see below).
- `access` column → `mailcow_cc_api_access` = `rw` or `ro` (`inc/sessions.inc.php:64-69`).
  `ro` keys may call `get`/`search` but `add`/`edit`/`delete` return
  `403 {"type":"error","msg":"API read/write access denied"}` (`json_api.php:110-117,1685-1692,1839-1846`).
- IP pinning: `allow_from` (comma/space/semicolon/newline separated) is checked with `ip_acl()`
  unless `skip_ip_check=1`; failure → `401 {"type":"error","msg":"api access denied for ip ..."}`.
  Unknown key → `401 {"type":"error","msg":"authentication failed"}` (`inc/sessions.inc.php:57-93`).
- Key management (`admin_api()`: columns `api_key,skip_ip_check,active,allow_from,access`,
  `functions.inc.php:2057-2130`) is UI-only (`edit.php`) — **no REST endpoint mints or revokes keys**.
- Alternatives to API keys:
  - Cookie session from a UI login (`/`, `/domainadmin`, `/admin`). Role is then really
    `user`/`domainadmin`/`admin` and handlers enforce `hasMailboxObjectAccess()` /
    `hasDomainAccess()` / `hasDomainAdminAccess()` (e.g. `functions.mailbox.inc.php:12`,
    `functions.inc.php:329`, `functions.dkim.inc.php:234`). Pending-TFA logins
    (`pending_mailcow_cc_username`) are blocked from `add`/`edit`/`delete` like ro keys.
  - `POST /add/sso/domain-admin` issues a single-use 30 s `da_sso` token for one domain-admin
    login (`functions.domain_admin.inc.php:451-498`) — SSO ticket issuance, not API auth.
  - OAuth2 client CRUD (`/add|edit|delete|get/oauth2-client`) configures mailcow's OAuth2 server
    (used by SOGo SSO), it does not mint bearer tokens for this REST API.
  - No `Authorization: Bearer` scheme exists for `/api/*`; only `X-API-Key` and the session cookie.

## 2. Response envelope quirks

- Success/failure of writes is an HTTP-200 JSON **array** of result objects, echoed from
  `$_SESSION['return']` (`process_add_return`/`process_delete_return`/`process_edit_return`,
  `json_api.php:118-133,1693-1708,1847-1862`):
  `[{"type":"success","msg":["alias_added","alias@domain.tld"]}]`
  (`api/openapi.yaml:52-95`, real example). Validators push `type: danger|warning|error` entries
  the same way, e.g. `{"type":"danger","msg":["object_exists","x"]}`
  (`functions.domain_admin.inc.php:60-66`) or `{"type":"danger","msg":"access_denied"}`
  (`functions.policy.inc.php:9-14`). **A failed write still returns HTTP 200** unless the router
  itself rejects the call — always inspect `type`, never the status code alone.
- Router-level rejections use a bare object + non-200 status: `400 {"type":"error","msg":"Request body
  doesn't contain valid json!"}` (`json_api.php:70-77`), `403` ro-denied, `404 {"type":"error","msg":
  "route not found"}` (`json_api.php:338-344`), `405` wrong-method, `401` auth failures.
- Reads return the data **without** an envelope: `process_get_return` echoes the payload or `{}`
  (single) / `[]` (list) when empty (`json_api.php:348-356`). Empty-list shape is inconsistent:
  most branches echo `'{}'` for empty, some (`quarantine`, `syncjobs`, `filters`) echo via
  `process_get_return($data, false)` → `'[]'`, and `mailq/all` echoes the raw docker JSON string.
- Non-envelope exceptions: `POST /add/sso/domain-admin` echoes the token payload directly
  (`json_api.php:304-314`); FIDO2/WebAuthn endpoints echo `{success, msg?}` (`json_api.php:156-232`);
  `GET /get/postcat/{qid}` returns **raw RFC822 bytes, not JSON**
  (`mailq('cat')` passthrough, `functions.mailq.inc.php:11-24`); `POST /search/*` returns a
  DataTables SSP envelope `{draw,recordsTotal,recordsFiltered,data}` (`inc/lib/ssp.class.php`);
  `DELETE /delete/rlhash` echoes `ratelimit('delete')` output raw.
- `msg` is polymorphic: string (`"msg":"Task completed"`) or array (`"msg":["domain_added",...]`,
  `"msg":["ip_invalid","1.2.3.4"]`). Clients must accept `string | unknown[]`.
- Known router bugs (do not work around silently, pin behavior in tests):
  - `GET /get/app-passwd/{id}` does `$object['id']` on a string (`json_api.php:556`) — use `/all`.
  - `GET /get/bcc/{id}`, `/get/recipient_map/{id}`, `/get/tls-policy-map/{id}` default branches
    append undefined `$details` (`json_api.php:1178-1183,1203-1209,1228-1234`).
  - Duplicate `case "cors"` in edit routing; the second is unreachable (`json_api.php:2052-2063`).
  - There is **no** `GET /get/mta-sts/...` route (add/edit/delete only); read MTA-STS back
    via `mailbox_details`.
- Live correction 2026-10-24 (production e2e, `e2e/sessionPins.e2e.ts`): the
  FIDO2/WebAuthn ceremony args GETs (`fido2-registration`, `fido2-get-args`,
  `webauthn-tfa-registration`) ARE issued to API-key callers (HTTP 200 with
  `publicKey`) — the router only gates on `isset($_SESSION["mailcow_cc_role"])`,
  which API-key sessions satisfy. Earlier notes calling these endpoints
  session-unusable were wrong about issuance; only completing the ceremony
  (registration adds, verification) and the self-edits stay session-scoped.
  `POST /edit/fido2-fn` answers success to API-key callers but matches zero
  rows (acts on the pseudo-user `API`) — a success no-op.
- Live correction 2026-10-24: `warning` envelope entries are non-fatal —
  handlers push them and continue (e.g. the maildir garbage-collector warning
  on deletes, `functions.mailbox.inc.php:5757-5762,6018-6023`), so deletes
  can answer `[warning, success]` with the rows actually deleted. Only
  `danger`/`error` entries signal failure.

## 3. What is NOT in the REST API (protocol boundary)

The user asked about "get emails, send emails". The REST API covers **provisioning and policy**,
not message I/O. Exact boundary per capability:

| Capability | In REST API? | Real protocol/surface |
|---|---|---|
| List/read/search mailbox folders & messages | NO | IMAP (Dovecot 143/993) or SOGo webmail/ActiveSync |
| Send a message | NO | SMTP submission (Postfix 587/465), authenticated |
| Read a queued message | YES, narrowly | `GET /get/postcat/{qid}` returns raw queued bytes (queue inspection, not mailbox access) |
| Quarantine triage | YES (metadata + actions) | `GET /get/quarantine/...`, `POST /edit/qitem` (release/learnham/learnspam), `POST /delete/qitem`; message store itself is rspamd-side |
| Per-user Sieve scripts | YES (manage, not execute) | `POST /add|edit/filter`, `GET /get/filters`, global `prefilter/postfilter`; executed by Dovecot |
| Calendar/contacts/tasks | NO | SOGo CalDAV/CardDAV/ActiveSync; REST has only `DELETE /delete/{eas_cache,sogo_profile}` cache wipes |
| Password login / token mint for mail | NO | IMAP/SMTP auth (incl. app passwords created via `/add/app-passwd` with `protocols[]`), SOGo login, OAuth2 SSO flow |
| Spam learning beyond ham/spam goto | Partial | `goto_spam/goto_ham` on aliases, `qitem` learn actions; no generic "train message" endpoint |
| Server logs / queue / cert status | YES (observability) | `GET /get/logs/*`, `/get/mailq/*`, `/get/status/*`, ACME logs |

README wording: "manages domains, mailboxes, aliases, policies, DKIM, TLS, queue and quarantine;
it cannot fetch or send mail — use IMAP/SMTP (or SOGo) for message content."

## 4. OpenAPI yaml accuracy (`data/web/api/openapi.yaml`, 96 paths)

- Every documented path exists in the router (verified programmatically); methods match
  (all writes POST, all reads GET). No stale phantom routes.
- Coverage is ~44% (96/217): missing are **almost all GET detail/list endpoints**
  (`domain/all|template`, `mailbox/all|reduced|template`, `alias/all`, `alias-domain/*`, `admin/*`,
  `filters/*`, `global_filters/*`, `syncjobs/{mailbox}`, `resource/{name}`, `transport/*`,
  `recipient_map/*`, `bcc/*`, `tls-policy-map/*`, `policy_*` (2 of 4 present), `time_limited_aliases`,
  `fail2ban` get is present but `logs/*` only 10/14, `status/container|host`, `spam-score` get IS
  present, `presets/*`, `active-user-sieve`, `postcat`, `last-login`, `bcc-destination-options`,
  `passwordpolicy`, `identity-provider` get, `rspamd/actions`), **both** `POST /search/*`,
  nearly all `edit/*` beyond the ~14 documented, nearly all `delete/*` beyond the ~16 documented,
  all 6 FIDO2/WebAuthn routes, `edit/self`, `edit/fail2ban/banlist`, `edit/mta-sts`,
  `edit/quarantine`, `delete/{rlhash,eas_cache,sogo_profile,time_limited_alias,...}`.
- Field fidelity on documented routes is good (spot-checked `add/alias`, `add/domain`,
  `add/mailbox`, `add/syncjob`, `add/tls-policy-map` against handler `$_data` reads — match).
  Caveats: `add/mailbox` omits many real fields (`authsource`, `*_access` flags, `tags`,
  `quarantine_*`, `rl_*`, `protocol_access`); `edit/*` schemas model only generic
  `attr`/`items` objects, so per-endpoint attribute keys must come from this inventory, not the yaml.

## 5. Recommended TypeScript bounded-context cut (subject-first, one export per file)

Downstream style: subject-first names, one export per file, `Result` over throw (per project
code-style). Mirror the router's bounded contexts so handler-to-client traceability stays 1:1:

```
src/
  envelope.ts        # ApiEnvelope = {type, msg: string|unknown[]}[]; guards isSuccess/isFailure
  auth.ts            # X-API-Key header, ro-vs-rw write guard, 401/403 error mapping
  domains.ts         # domain CRUD + templates + tags + footer + search/domain
  mailboxes.ts       # mailbox CRUD + templates + tags + rename + custom-attribute + spam-score
                     #   + delimiter/tls/quarantine_* + pushover + acl (user-acl) + last-login
                     #   + active-user-sieve + bcc-destination-options + search/mailbox
  aliases.ts         # alias CRUD + time_limited_alias CRUD + alias/all scoping
  aliasDomains.ts    # alias-domain CRUD
  resources.ts       # resource CRUD
  domainAdmins.ts    # domain-admin CRUD + da-acl + sso/domain-admin + self(domainadmin)
  admins.ts          # admin CRUD (no self route; no key-mgmt endpoint — document as UI-only)
  sieveFilters.ts    # filter CRUD + global-filter add + global_filters/presets/active-user-sieve reads
  syncJobs.ts        # syncjob CRUD + syncjobs reads (with_password opt-in type)
  appPasswords.ts    # app-passwd CRUD (protocols[] union type)
  oauth2Clients.ts   # oauth2-client CRUD (response = oauth_clients row)
  spamPolicy.ts      # domain/mailbox-policy add/delete + policy_wl/bl reads + rspamd/actions|rspamd-map + rsetting CRUD
  tls.ts             # tls-policy-map CRUD + mta-sts add/edit (no get route — type it) + per-mailbox tls_policy edit
  routing.ts         # relayhost + transport + recipient_map + bcc + fwdhost CRUD
  queue.ts           # mailq/all (raw passthrough string) + postcat (Uint8Array/string, NOT JSON) + mailq edit/delete actions
  quarantine.ts      # quarantine/all|details + qitem edit (release|learnham|learnspam) + delete + global quarantine edit
  dkim.ts            # dkim add/duplicate/import/delete + details {pubkey,length,dkim_txt}
  ratelimits.ts      # rl-domain/rl-mbox reads + edits + rlhash delete
  fail2ban.ts        # fail2ban get ({active_bans,perm_bans,...}) + edit + banlist refresh
  logs.ts            # logs/{13 services}[/{count}] + rspamd-stats
  status.ts          # status/* (admin-only) + identity-provider get
  settings.ts        # app_links, ui_texts, ip_check, custom_login, ui_theme, passwordpolicy,
                     #   quota_notification(+bcc), cors, identity-provider(+test),
                     #   reset-password-notification, self(user), fido2-fn — session-only ones marked
  fido2.ts           # six ceremony routes, session-only, {success} envelope — isolate from key auth
```

Rules for the client: one file per context above (split only if a file exceeds ~300 lines —
first split candidates: `mailboxes.ts` → `mailboxAcl.ts`/`mailboxTags.ts`, `settings.ts` →
`branding.ts`/`identityProvider.ts`); every function returns `Result<Payload, ApiError>`;
write-functions take `{items?, attr}` exactly like the router; never throw on HTTP-200
`danger` envelopes; type `postcat` as bytes. Do NOT generate from `openapi.yaml` alone —
it covers 44%; this inventory is the contract source.

