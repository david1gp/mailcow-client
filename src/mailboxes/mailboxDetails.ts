/** Wide mailbox details row (`mailbox get mailbox_details`, `functions.mailbox.inc.php:5201-5370`). */
export type MailboxDetails = {
  username: string
  domain?: string
  local_part?: string
  name?: string
  quota?: string
  active?: number
  created?: string
  modified?: string
  authsource?: string
  attributes?: Record<string, unknown>
  custom_attributes?: Record<string, unknown>
  tags?: string[]
  quota_used?: number
  quota_percent?: number
  messages?: number
  last_mail_login?: string
  last_imap_login?: string
  last_smtp_login?: string
  last_pop3_login?: string
  last_sso_login?: string
  max_new_quota?: number
  spam_aliases?: number
  pushover_active?: number
  sender_acl?: string[]
  is_relayed?: number
}
