/** Ratelimit rule details (`ratelimit('get', ...)`, `functions.ratelimit.inc.php`). */
export type RatelimitDetails = {
  rl_value?: number
  rl_frame?: string
  domain?: string
  mailbox?: string
}
