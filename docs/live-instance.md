# mailcow live instance — read-only characterization

Characterization of the production mailcow instance for designing the
`mailcow-client` live test plan. All probes below were **HTTP GET only**.
No POST/PUT/DELETE was issued, no state was changed. Secrets are never
printed here; the API key lives in the env var `MAILCOW_API_KEY`
(`~/cs/mailcow/mailcow.env`) and the hostname in `MAILCOW_HOSTNAME`.

## 1. Instance facts

- Public URL: `https://email.contentoren.de`, admin UI at `/admin/`.
- Host: `l1`, checkout `/opt/mailcow-dockerized`. Only Docker-based service in the repo.
- Live version (probed `GET /api/v1/get/status/version`, HTTP 200):
  `{"version":"2026-07b"}`.
- API base URLs (both verified working with `X-API-Key: $MAILCOW_API_KEY`):
  - Public: `https://email.contentoren.de/api/v1` (HTTP 200 on
    `get/status/version`, `get/domain/all`). Caddy proxies to mailcow.
  - On l1 loopback (what all ops scripts use via `remote ... ssh`):
    `http://127.0.0.1:9080/api/v1` (Caddy owns :443; mailcow nginx is
    loopback HTTP only).
- Auth: request header `X-API-Key`. Failure mode is HTTP 403; curl wrappers in
  scripts use `curl -fsS(k)` so auth/network failures are hard errors.
- Response envelope for mutations (not exercised): JSON list of
  `{"type": "success"|"danger"|..., "msg": ...}` objects; scripts assert with
  `any(x.get("type")=="success" for x in d)` (`api_ok()` in
  `scripts/linevast/import-linevast.sh:318`, `scripts/mailboxes/import-gmail.sh:218`,
  `scripts/mailboxes/ensure-direct-mailcow.sh:137`).

## 2. API endpoints already exercised by ops scripts

All paths relative to `/api/v1`. `scripts/` = `~/cs/mailcow/scripts/`.

### GET (read) endpoints in use

| Endpoint | Used in |
|---|---|
| `GET /get/domain/$domain` (single domain; `{}` when missing) | `linevast/import-linevast.sh:323`, `mailboxes/import-gmail.sh:222` (`:240` area), `mailboxes/ensure-direct-mailcow.sh:141`, `mailboxes/ensure-master-alias.sh:46` |
| `GET /get/mailbox/all` (list) | `relay/ensure-linevast-relay.sh:76,113`, `mailboxes/ensure-allgroups-mail.sh:86,95`, `mailboxes/ensure-master-alias.sh:39,73`, `mailboxes/ensure-eventoren-aliases.sh:38,81`, `mailboxes/delete-authorized-mailboxes.sh:93,116` |
| `GET /get/mailbox/$address` (single) | `linevast/import-linevast.sh:344`, `mailboxes/import-gmail.sh:243` (`:253` area), `mailboxes/ensure-direct-mailcow.sh:193` |
| `GET /get/alias/all` (list) | `mailboxes/ensure-master-alias.sh:51`, `mailboxes/ensure-eventoren-aliases.sh:45` |
| `GET /get/syncjobs/all` and `/get/syncjobs/all/no_log` (list; `no_log` variant omits logs) | `relay/ensure-linevast-relay.sh:65`, `linevast/import-linevast.sh:373,393`, `mailboxes/import-gmail.sh:271` (`:307` area) |
| `GET /get/relayhost/all` (list; items contain a `password` field — parse with key allow-lists, never dump) | `relay/ensure-linevast-relay.sh:86,99`, `mailboxes/ensure-allgroups-mail.sh:86`, `mailboxes/import-gmail.sh:337` |
| `GET /get/dkim/$domain` (returns `dkim_selector`, `dkim_txt`, …) | `dns/dns.sh:124`, `dns/dns-eventoren.sh:81`, `dns/dns-abikur.sh:261` — parsed with `python3 -c` / `json` extracting only `dkim_txt` |
| `GET /get/fail2ban` (whitelist + ban config) | `instance/ensure-f2b-whitelist.sh:35` |

### Mutating endpoints in use (for test-plan coverage, NOT probed)

| Endpoint | Used in |
|---|---|
| `POST /add/domain` | `linevast/import-linevast.sh:341`, `mailboxes/import-gmail.sh:240`, `mailboxes/ensure-direct-mailcow.sh:167` |
| `POST /edit/domain` | `mailboxes/ensure-direct-mailcow.sh:189`, `mailboxes/import-gmail.sh` (domain re-assert path) |
| `POST /add/mailbox` | `linevast/import-linevast.sh:369`, `mailboxes/import-gmail.sh:268`, `mailboxes/ensure-direct-mailcow.sh:216` |
| `POST /edit/mailbox` (password re-assert, relayhost bind `{"items":[addr],"attr":{"relayhost":id}}`) | `linevast/import-linevast.sh:354`, `relay/ensure-linevast-relay.sh:111`, `mailboxes/import-gmail.sh:253,380`, `mailboxes/ensure-direct-mailcow.sh:237` |
| `POST /delete/mailbox` (items array; verified before/after in script) | `mailboxes/delete-authorized-mailboxes.sh:98` |
| `POST /add/alias` | `mailboxes/ensure-master-alias.sh:63`, `mailboxes/ensure-eventoren-aliases.sh:68` |
| `POST /add/syncjob`, `POST /edit/syncjob` (incl. disable via `{"active":"0"}`) | `linevast/import-linevast.sh:387,429,455`, `mailboxes/import-gmail.sh:307,333`, `mailboxes/ensure-direct-mailcow.sh:263` |
| `POST /add/relayhost`, `POST /edit/relayhost` | `relay/ensure-linevast-relay.sh:97`, `mailboxes/import-gmail.sh:353,372` |
| `POST /edit/fail2ban` (`{"items":[...],"attr":{"action":"whitelist"\|"unban"}}`) | `instance/ensure-f2b-whitelist.sh:52,58` |

Supporting patterns worth reusing in the client: credentials for l1-side calls
are passed as a base64 blob in `remote "bash -s $blob"` argv or via SSH stdin,
never in the remote command line (`import-linevast.sh:283`, `ensure-linevast-relay.sh:42`,
`delete-authorized-mailboxes.sh:26`, `ensure-master-alias.sh:13`).

### Additionally probed GET endpoints (existence/shape only)

| Endpoint | Result |
|---|---|
| `GET /get/status/containers` | HTTP 200, `null` body at probe time |
| `GET /get/mailq/all` | HTTP 200, empty list — **queue is empty** |
| `GET /get/logs/postfix/10` | HTTP 200, list of 10 (bodies not inspected — may carry personal data) |
| `GET /get/bcc/all` | HTTP 200, empty object |
| `GET /get/qhandler` | HTTP 404 (`{"type":"error","msg":"..."}` shape) — does not exist |

### Out of scope but adjacent

- `scripts/verification/verify-mail-delivery.py:152` and
  `verify-eventoren-external.py:28` talk to the **external** `https://api.mail.tm`
  (disposable inboxes for E2E), not to mailcow.
- `scripts/verification/e2e-mail-test.sh` and `scripts/mailboxes/import-gmail.sh`
  probe `imap.gmail.com:993` / `smtp.gmail.com:587` (IMAP/SMTP, protocol-level).
- `scripts/linevast/onboard-linevast.ts` delegates mailcow mutations to the
  same `import-linevast.sh` API paths above.

## 3. Live state (GET snapshots, redacted to counts + names)

- **Domains: 13, all `active: 1`.**
  `abikur.de`, `allgroups.chat`, `betaconsulting.de`, `contentoren.com`,
  `contentoren.de`, `covux-design.de`, `e.contentoren.de`, `eventoren.de`,
  `goldenelephants.de`, `jwc-kosmetik.de`, `m.contentoren.de`,
  `nikolacalio.com`, `verenacalio.com`.
- **Mailboxes: 26 total, all active.** Per domain:
  `contentoren.de`: 12, `eventoren.de`: 4, and 1 each in `abikur.de`,
  `allgroups.chat`, `betaconsulting.de`, `covux-design.de`, `e.contentoren.de`,
  `goldenelephants.de`, `jwc-kosmetik.de`, `m.contentoren.de`,
  `nikolacalio.com`, `verenacalio.com`; **0** in `contentoren.com` and
  `semesterkur.de`.
- **Aliases: 5** (keys: `active`, `address`, `created`, `domain`, `goto`,
  `id`, `in_primary_domain`, `internal`, `is_catch_all`, …).
- **Sync jobs: 17** (`/no_log` variant; keys include `active`, `enc1`,
  `host1`, `id`, `is_running`, `last_run`, `port1`, `user1`, `user2`, …).
- **Relayhosts: 27** (keys: `active`, `hostname`, `id`, `password`,
  `used_by_domains`, `used_by_mailboxes`, `username`).
- **Domain object keys** (from `get/domain/all[0]`): `active`, `aliases_in_domain`,
  `aliases_left`, `backupmx`, `bytes_total`, `def_new_mailbox_quota`,
  `def_quota_for_mbox`, `description`, `domain_admins`, `domain_name`, `gal`,
  `max_new_mailbox_quota`, `max_num_aliases_for_domain`,
  `max_num_mboxes_for_domain`, `max_quota_for_domain`, `max_quota_for_mbox`,
  `mboxes_in_domain`, `mboxes_left`, `modified`, `msgs_total`,
  `quota_used_in_domain`, `relay_all_recipients`, `relay_unknown_only`,
  `relayhost`, `rl`, plus `*_int` variants.
- **Mailbox object keys** (from `get/mailbox/all[0]`): `active`, `attributes`
  (nested; holds `relayhost` binding), `authsource`, `created`, `domain`,
  `is_relayed`, `last_imap_login`, `last_smtp_login`, `local_part`, `messages`,
  `name`, `quota`, `quota_used`, `sender_acl`, `spam_aliases`, `username`, …

### Inventory-file vs live discrepancies (observations, not actions)

- `contentoren.com` exists live (active, 0 mailboxes) but has **no**
  `accounts/contentoren.com.yml`. The YML inventory (11 files) covers 10
  mailcow mirrors + Linevast-only `semesterkur.de` (correctly: no live mirror).
- `e.contentoren.de` and `m.contentoren.de` exist live (1 mailbox each) with no
  dedicated YML files — consistent with `lib/accounts.sh` longest-parent
  resolution (they fall under `contentoren.de.yml`).
- `contentoren.de.yml` declares 13 mailcow accounts vs 12 live mailboxes.
  Reconciliation of that delta is ops work, not client-test work; the live
  test plan must not "fix" it.

## 4. Domain topology (from `docs/mailcow.md`, `docs/linevast.md`, `docs/gmail.md`)

- `contentoren.com` is the fully mailcow-managed domain (MX → mailcow; the
  `contentoren-master@contentoren.com` notification alias lives here,
  `ensure-master-alias.sh` guards it with refuse-to-overwrite checks).
- `contentoren.de` inbound is **Linevast**; mailcow holds per-mailbox read
  mirrors + submission. Exception accounts with `inbound: mailcow` in YML
  (`info@nikolacalio.com`, `info@goldenelephants.de`, `kontakt@allgroups.chat`,
  all `eventoren.de` accounts, `covux-design.de`) receive directly at mailcow
  and must have **no** sync job.
- Linevast senders authenticate per-address; never use a domain-wide relay for
  `contentoren.de` (`ensure-linevast-relay.sh` binds sender-specific relayhosts
  only after verifying an active copy-mode sync job, except `mailcow`-inbound).
- Gmail/Workspace path mirrors the Linevast pattern via App Passwords
  (`import-gmail.sh`); only `betaconsulting.de` uses it today.

## 5. Proposed safe live-test plan for full API coverage

### 5.1 Test-domain proposal

**Recommended: a dedicated subdomain of the owned, fully mailcow-managed domain,
e.g. `mc-client-test.contentoren.com`** (or with a run-unique label, §5.3).

Why not `mailcow-client-test.example` / `.test`:

- Whether mailcow's `POST /add/domain` accepts RFC 2606 reserved TLDs
  (`.example`, `.test`) is **unverified, and verifying it requires a mutation**,
  which is out of bounds for this read-only phase. mailcow performs no public-
  suffix validation client-side in the repo scripts, but server-side acceptance,
  SOGo provisioning (`restart_sogo: 1` on domain add), and TLS/ACME paths for
  unknown TLDs are all untested.
- A subdomain of `contentoren.com` inherits the correct topology for free:
  mailcow-managed parent, **no Linevast MX anywhere near it**, no sync jobs, no
  relayhosts, no Gmail mirrors. Nothing in `dns.sh` / `dns-linevast.sh` will
  ever claim it, and the longest-parent resolver keeps it isolated from real
  inventory as long as test rows are **never committed** to `accounts/`.
- No DNS changes are needed: API-level tests (domain/mailbox/alias/DKIM CRUD)
  do not require MX/A records. The absence of DNS is itself a safety property —
  the test domain can never receive real inbound mail.

Constraints for the test domain regardless of name: never point MX/A at it,
never add it to `accounts/*.yml`, never bind a relayhost or sync job to it,
delete it at the end (teardown in reverse).

### 5.2 Lifecycle (each step: mutate → GET-verify → record shape)

1. Snapshot: `GET /get/domain/all`, `/get/mailbox/all`, `/get/alias/all` counts.
2. `POST /add/domain` (quotas small, e.g. `mailboxes: 5`, `quota` minimal).
   Verify: `GET /get/domain/<test>`.
3. `POST /add/mailbox` (1–2 boxes, strong random passwords, `force_pw_update: 0`).
   Verify: `GET /get/mailbox/<addr>`; negative: `GET` a non-existent address
   returns `{}`-ish — assert client handles it.
4. `POST /add/alias` → test address forwarding to the test mailbox.
   Verify: `GET /get/alias/all` filtered client-side.
5. `POST /edit/mailbox` (rename `name`, toggle `active`, re-set password).
   Verify each via GET. `POST /edit/domain` (bump `max_num_mboxes_for_domain`).
6. DKIM: `GET /get/dkim/<test-domain>` — read-only; extract only
   `dkim_selector`/`dkim_txt` as `dns.sh:124` does. If the response carries
   private key material, the client must redact (`del(.dkim_privkey)`-equivalent)
   before logging; treat the test key as disposable anyway.
7. Protocol-level (outside REST, mark as such): SMTP submission on
   `email.contentoren.de:587` (STARTTLS) + IMAP on `:993` (TLS) as the test
   mailbox, sending **only to itself**; assert receipt via IMAP. No real
   addresses, no external inboxes except disposable `mail.tm` (pattern already
   in `verify-mail-delivery.py`) if cross-internet delivery must be proven.
8. Teardown in strict reverse: delete alias → delete mailbox(es) →
   `POST /delete/domain` (mailcow API supports domain deletion; confirm path
   against the live API docs before use) → re-snapshot and diff counts against
   step 1 (must be identical).

### 5.3 Naming / isolation rules

- Unique per run: `<run-id>.mc-client-test.contentoren.com` for the domain,
  `t<run-id>@...` local parts; run-id = date + short random (e.g.
  `20261024-a3f9`). Never reuse names across runs (tolerates partial-teardown
  leftovers and makes strays greppable).
- Pre-flight: `GET /get/domain/<test>` must be absent; abort if present.
- Post-flight: counts diff must be zero; any leftover is a FAIL with the exact
  stray item printed for manual cleanup.
- Run tests serially against production; no parallel runs sharing one domain.

### 5.4 MUST-NEVER-TEST against production

- **fail2ban bans/unbans.** mailcow netfilter attaches to host INPUT: a ban
  drops **all** traffic from the IP — SSH, Caddy (`codex.*`, `email.*`), SMTP —
  not just mail (`docs/mailcow.md:83`, script header
  `ensure-f2b-whitelist.sh:1-10`). Only the already-shipped whitelist path
  (`GET /get/fail2ban` + `POST /edit/fail2ban` action `whitelist`) is acceptable
  and is already covered; never issue `ban`/`unban` actions, never lower
  `max_attempts`/`retry_window` to trigger a ban. Before any live run, run
  `scripts/instance/ensure-f2b-whitelist.sh` and assert both ops IPs present
  (probed: whitelist has 7 entries, both defaults present, blacklist empty).
- **Queue operations.** `GET /get/mailq/all` is fine (probed: empty). Never
  flush/delete the queue; never inject test mail into the real queue from
  another domain.
- **Admin / superadmin changes** (`admins.yml` identities, `DBROOT` MySQL —
  cf. `delete-authorized-mailboxes.sh:80` guards). No admin add/edit/delete.
- **Any mutation scoped to a real domain, mailbox, alias, relayhost, or sync
  job.** The client under test must take an allow-list containing only the test
  domain; refuse everything else client-side (defense in depth, mirroring the
  refuse-to-overwrite guards in `ensure-master-alias.sh:42-74`).
- **DKIM regeneration on real domains** (would invalidate published DNS).
- **`POST /delete/mailbox` / `/delete/domain` outside the test domain.**
- **SOGo restart storms**: domain add sends `restart_sogo: 1`; batch test
  domains accordingly (one test domain per run, not N).
- **Sending mail to real addresses** from test mailboxes (reputation/SPF risk
  for `contentoren.com`).

### 5.5 Dry-run / skip treatment

| Area | Treatment | Reason |
|---|---|---|
| `POST /edit/fail2ban` ban/unban/flush | **Skip entirely** | §5.4, host lockout risk |
| `POST` mail-queue ops | **Skip entirely** | collateral delivery impact |
| Sync jobs (`/add\|/edit/syncjob`) pointing at Linevast/Gmail | **Dry-run only** (construct payload, assert shape, do not send; or bind to a disposable `mail.tm` IMAP box, never a real backend) | wrong `delete1`/`delete2` flags destroy real mail |
| Relayhosts (`/add\|/edit/relayhost`) with real credentials | **Skip** (payload-shape only) | credential exposure + outbound rerouting |
| Admin, BCC, quarantine, RSettings, spam-policy, TLS-policy endpoints | **Skip** (GET-shape only where it exists) | global delivery/security impact |
| Domain add with `restart_sogo` | Send as-is once per run; do not loop over it | service flaps |
| SMTP/IMAP send/receive | Protocol-level, self-to-self only | outside REST scope |

## 6. Fail2ban note (test-design input)

- `scripts/instance/ensure-f2b-whitelist.sh` (also run from `deploy.sh`) keeps
  the API-managed whitelist populated; defaults: ops host + l1 itself
  (override via `F2B_WHITELIST`). Current live state: 7 whitelist entries,
  both defaults present, `blacklist` empty.
- Design consequence: every live-test run must (a) execute from a whitelisted
  egress IP, (b) re-assert the whitelist pre-flight, and (c) use `--max-time`
  + single-flight requests — a burst of 401/403s from a wrong key is exactly
  the pattern fail2ban counts. Store the API key once per process; never retry
  auth failures in a loop.

## 7. Existing test style to follow

- `tests/test-accounts-helper.sh`: pure-bash assertions on `lib/accounts.sh`
  resolver (exact-domain-first, longest-parent, no public-suffix inference),
  with a `mktemp -d` fixture inventory. Note: its hard-coded domain set is
  stale (missing newer YML files) — update the expected set if touched.
- `tests/test-postfix-reconcile.sh`: bash + fixture `data/conf/postfix`
  for `linux_timers/mailcow_reconcile.sh` (also exercises
  `get/fail2ban`, `get/mailbox/all`, `get/syncjobs/all`, `get/relayhost/all`,
  `add/relayhost`, `edit/mailbox` — see `linux_timers/mailcow_reconcile.sh:341-513`).
- `tests/test-update-notification.sh`: thin wrapper over
  `bun test linux_timers/src/mailcowUpdate.test.ts`.
- `scripts/verification/test_verify_mail_delivery.py`: `unittest` + mocks for
  the `mail.tm` E2E helper — the pattern for testing mail flows without
  touching production.
