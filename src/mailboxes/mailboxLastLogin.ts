/** `GET /get/last-login/{user}[/{days}]` (`last_login get`, `functions.inc.php:323-`). */
export type MailboxLastLogin = {
  sasl?: {
    real_rip?: string
    datetime?: string
    service?: string
    app_password?: string
    app_password_name?: string
    location?: string
  }[]
  ui_logins?: Record<string, unknown>[]
}
