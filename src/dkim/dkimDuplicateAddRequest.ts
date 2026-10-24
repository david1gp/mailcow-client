/** Attr fields for `POST /add/dkim_duplicate` (`functions.dkim.inc.php:101-`). */
export type DkimDuplicateAddRequest = {
  from_domain: string
  to_domain: string | string[]
}
