/** Attr fields for `POST /add/alias` (`functions.mailbox.inc.php:700-920`). */
export type AliasAddRequest = {
  address: string
  goto: string
  active?: string | number
  goto_spam?: string | number
  goto_ham?: string | number
  goto_null?: string | number
  sogo_visible?: string | number
  private_comment?: string
  public_comment?: string
}
