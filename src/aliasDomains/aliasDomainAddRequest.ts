/** Attr fields for `POST /add/alias-domain` (`functions.mailbox.inc.php:921-1048`). */
export type AliasDomainAddRequest = {
  alias_domain: string
  target_domain: string
  active?: string | number
  rl_value?: string | number
  rl_frame?: string
  key_size?: string | number
  dkim_selector?: string
}
