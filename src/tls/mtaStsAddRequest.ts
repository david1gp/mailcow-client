/** Attr fields for `POST /add/mta-sts` (`functions.mailbox.inc.php:1459-`). */
export type MtaStsAddRequest = {
  domain: string
  version: "stsv1"
  mode?: string
  max_age?: string | number
  mx?: string
  active?: string | number
}
