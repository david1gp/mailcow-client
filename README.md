# @adaptive-ds/mailcow-client

TypeScript client and CLI for the mailcow API. Full API coverage, Result-typed, Valibot-validated.

## Features

- **201 typed ops** covering **214 routed URL patterns** (`add` 31, `delete` 32,
  `edit` 56, `get` 93, `search` 2 — recounted against the router in
  [`docs/coverage.md`](./docs/coverage.md)): domains, mailboxes, aliases
  (+ time-limited), alias domains, resources, domain admins (+ SSO), admins,
  sieve filters (+ global filters, presets), sync jobs, app passwords, OAuth2
  clients, spam policy / rspamd / rsettings, TLS policy maps / MTA-STS, routing
  (relayhost, transport, recipient maps, BCC, forwarding hosts), mail queue
  (+ raw `postcat`), quarantine, DKIM, ratelimits, fail2ban, logs, status,
  settings / branding, FIDO2 + WebAuthn ceremonies
- **Result-typed** — fallible functions return `Result<T>` via
  [`@adaptive-ds/result`](https://github.com/david1gp/result); no throws
- **Envelope mapping** — `mailcowEnvelope` turns mutation responses
  (`[{ "type": "success|danger|error|warning", "msg": […] }]`) into `Result`;
  only `danger`/`error` entries fail — `warning` entries are non-fatal
  upstream (e.g. the maildir garbage-collector warning on deletes) and pass
- **Valibot-validated** — config and options checked at the edge; no silent `any`
- **Library + CLI** — import functions or run `mailcow-client` from the shell

## Install

```bash
bun add @adaptive-ds/mailcow-client
```

## Library

```ts
import { domainList, mailboxGet, mailcowClientFromEnv } from "@adaptive-ds/mailcow-client"

// From env (MAILCOW_BASE_URL, MAILCOW_API_KEY, …)
const fromEnv = mailcowClientFromEnv()
if (!fromEnv.success) throw new Error(fromEnv.errorMessage)
const config = fromEnv.data

const domains = await domainList({ config })
if (!domains.success) throw new Error(domains.errorMessage)
console.log(domains.data.map((d) => d.domain_name))

const mailbox = await mailboxGet({ config, mailbox: "user@example.com" })
if (!mailbox.success) throw new Error(mailbox.errorMessage)
if (Array.isArray(mailbox.data)) throw new Error("expected a single mailbox")
console.log(mailbox.data.username)
```

## Environment

- `MAILCOW_BASE_URL` (required) — mailcow instance root (e.g. `https://email.contentoren.de`)
- `MAILCOW_API_KEY` (optional in the schema, required by mailcow in practice) — sent as `X-API-Key`
- `MAILCOW_TIMEOUT_MS` (optional) — request timeout
- `MAILCOW_RETRIES` (optional) — retry count

Bun loads `.env` automatically when you run via `bun`. Never commit `.env`.

## CLI

```bash
export MAILCOW_BASE_URL=https://email.contentoren.de
export MAILCOW_API_KEY=your-key

# or: bunx mailcow-client … / bun run src/cli.ts …
mailcow-client --help
mailcow-client status version
```

Override env per call with `--baseUrl`, `--apiKey`.

Stdout is pretty JSON on success. Errors are Result JSON on stderr with exit code 1.

One read example per context (`<ctx> --help` shows the mutating commands):

| Context | Example |
|---|---|
| `domains` | `mailcow-client domains list` |
| `mailboxes` | `mailcow-client mailboxes list` |
| `aliases` | `mailcow-client aliases list` |
| `alias-domains` | `mailcow-client alias-domains list` |
| `resources` | `mailcow-client resources list` |
| `domain-admins` | `mailcow-client domain-admins list` |
| `admins` | `mailcow-client admins list` |
| `filters` | `mailcow-client filters list` |
| `sync-jobs` | `mailcow-client sync-jobs list` |
| `app-passwords` | `mailcow-client app-passwords list` |
| `oauth2-clients` | `mailcow-client oauth2-clients list` |
| `policy` | `mailcow-client policy domain-wl-list --domain example.com` |
| `tls` | `mailcow-client tls list` |
| `routing` | `mailcow-client routing relayhost-list` |
| `queue` | `mailcow-client queue list` |
| `quarantine` | `mailcow-client quarantine list` |
| `dkim` | `mailcow-client dkim get --domain example.com` |
| `ratelimits` | `mailcow-client ratelimits domain-list` |
| `fail2ban` | `mailcow-client fail2ban get` |
| `logs` | `mailcow-client logs list --service postfix` |
| `status` | `mailcow-client status version` |
| `settings` | `mailcow-client settings password-policy-get` |
| `fido2` | `mailcow-client fido2 registration-args` |

## Scope

This package covers the mailcow **admin REST API** under `/api/v1`
(`GET /get/…`, `POST /add|edit|delete|search/…`). Reading and sending mail is
IMAP/SMTP (mailbox access via SOGo), not this API, and is out of scope.

Session-only ops (no API-key use — the client has no cookie support, so these
fail without a session): completing the FIDO2/WebAuthn ceremonies
(`fido2RegistrationAdd`, `webauthnTfaRegistrationAdd`), `fido2FnEdit` (answers
success but is a no-op for API callers), and the self-edits (`userSelfEdit`,
`domainAdminSelfEdit`). The ceremony *args* GETs are issued to API-key callers.
See [`docs/coverage.md`](./docs/coverage.md) for the full list.

Known-broken upstream (source-verified, not worked around): `GET
/get/app-passwd/{id}` indexes a string offset — use `appPasswordList`;
`GET /get/bcc/{id}`, `/get/recipient_map/{id}`, `/get/tls-policy-map/{id}`
append undefined details; there is no `GET /get/mta-sts/…` route (read MTA-STS
back via mailbox details); `POST /delete/rlhash` echoes raw text. Details in
[`docs/coverage.md`](./docs/coverage.md).

Project research docs live in [`docs/`](./docs/): `api-inventory.md` (endpoint
inventory from upstream source), `api-notes.md`, `live-instance.md`,
`sibling-pattern.md`, and `coverage.md` (this client’s op↔route mapping).

## Tests

```bash
bun test        # unit tests (mocked fetch, no network)
bun run build   # dist build (tsc)
```

Live end-to-end (112 tests against production, run-scoped test domain with
strict-reverse teardown and count-diff assertion):

```bash
bun run test:e2e   # needs .env with MAILCOW_BASE_URL + MAILCOW_API_KEY
```

Never-test rules for live runs (see `docs/live-instance.md` §5.4): no
fail2ban ban/unban (host lockout risk), no queue flush/delete, no admin
add/edit/delete, no mutation scoped to a real domain/mailbox/alias/relayhost,
no DKIM regeneration on real domains, no mail to real addresses. Run serially
from a whitelisted egress IP.

## License

MIT © David Siewert
