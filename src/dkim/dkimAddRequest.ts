/** Attr fields for `POST /add/dkim` (`functions.dkim.inc.php:2-`). */
export type DkimAddRequest = {
  domains: string
  dkim_selector?: string
  key_size?: string | number
}
