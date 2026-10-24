/** Attr fields for `POST /add/bcc` (`functions.address_rewriting.inc.php:2-`). */
export type BccAddRequest = {
  type: "sender" | "rcpt"
  local_dest: string
  bcc_dest: string
  active?: string | number
}
