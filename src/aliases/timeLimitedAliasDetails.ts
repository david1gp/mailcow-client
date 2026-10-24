/** Time-limited alias row (`mailbox get time_limited_aliases`, `functions.mailbox.inc.php:4736-`). */
export type TimeLimitedAliasDetails = {
  address: string
  description?: string
  goto?: string
  validity?: number
  permanent?: number
}
