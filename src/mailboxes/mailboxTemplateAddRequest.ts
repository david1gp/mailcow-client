/** Attr fields for `POST /add/mailbox/template` (`functions.mailbox.inc.php:1718-`). */
export type MailboxTemplateAddRequest = {
  template: string
  name?: string
  quota?: string | number
  active?: string | number
  sogo_access?: string | number
  imap_access?: string | number
  pop3_access?: string | number
  smtp_access?: string | number
  sieve_access?: string | number
  eas_access?: string | number
  dav_access?: string | number
  relayhost?: string | number
  quarantine_notification?: string
  quarantine_category?: string
  tags?: string[]
  protocol_access?: string | number
  rl_value?: string | number
  rl_frame?: string
  authsource?: string
}
