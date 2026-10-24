/** Attr fields for `POST /add/domain` (`functions.mailbox.inc.php:502-671`). */
export type DomainAddRequest = {
  domain: string
  description?: string
  aliases?: string | number
  mailboxes?: string | number
  defquota?: string | number
  maxquota?: string | number
  quota?: string | number
  backupmx?: string | number
  gal?: string | number
  relay_all_recipients?: string | number
  relay_unknown_only?: string | number
  active?: string | number
  tags?: string[]
  rl_value?: string | number
  rl_frame?: string
  dkim_selector?: string
  key_size?: string | number
  restart_sogo?: string | number
}
