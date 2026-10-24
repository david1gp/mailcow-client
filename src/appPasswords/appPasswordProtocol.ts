import * as a from "valibot"

/**
 * Protocol access names for `POST /add|/edit/app-passwd`. The handler checks
 * `in_array('<name>_access', $protocols)` (`functions.app_passwd.inc.php`),
 * so the `*_access` literals are sent verbatim — matching the yaml example —
 * not the bare short names.
 */
export const appPasswordProtocolSchema = a.picklist([
  "imap_access",
  "smtp_access",
  "pop3_access",
  "eas_access",
  "dav_access",
  "sieve_access",
])

export type AppPasswordProtocol = a.InferInput<typeof appPasswordProtocolSchema>
