/**
 * Attr fields for `POST /add/relayhost` (`functions.transports.inc.php:2-`).
 * Credentials are typed normally and never logged by this client.
 */
export type RelayhostAddRequest = {
  hostname: string
  username?: string
  password?: string
}
