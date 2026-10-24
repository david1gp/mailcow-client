/** Attr fields for `POST /add/mailbox` (`functions.mailbox.inc.php:1049-1450`). */
export type MailboxAddRequest = {
  local_part: string
  domain: string
  password: string
  password2: string
  name?: string
  quota?: string | number
  active?: string | number
  force_pw_update?: string | number
  force_tfa?: string | number
  tls_enforce_in?: string | number
  tls_enforce_out?: string | number
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
  attribute_hash?: string
  rl_value?: string | number
  rl_frame?: string
  authsource?: string
  template?: string
}
