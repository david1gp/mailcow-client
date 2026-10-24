/** Attr fields for `POST /add/time_limited_alias` (`functions.mailbox.inc.php:19-90`). */
export type TimeLimitedAliasAddRequest = {
  username: string
  domain: string
  validity?: string | number
  permanent?: string | number | boolean
  description?: string
}
