/**
 * App password details row (`app_passwd('details')`, i.e. an `app_passwd`
 * row, `functions.app_passwd.inc.php:198-212`).
 */
export type AppPasswordDetails = {
  id?: number
  name?: string
  mailbox?: string
  domain?: string
  /** Sensitive: BLF-CRYPT password hash — redact before logging. */
  password?: string
  active?: number
  imap_access?: number
  smtp_access?: number
  eas_access?: number
  dav_access?: number
  pop3_access?: number
  sieve_access?: number
  created?: string
  modified?: string
}
