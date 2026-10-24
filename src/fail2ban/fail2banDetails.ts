/**
 * Fail2ban/netfilter state (`fail2ban('get')`, `functions.fail2ban.inc.php:6-85`).
 * Banned networks drop ALL traffic from the IP at the netfilter INPUT chain.
 */
export type Fail2banDetails = {
  regex?: unknown
  ban_time?: number
  ban_time_increment?: boolean
  max_ban_time?: number
  netban_ipv4?: number
  netban_ipv6?: number
  max_attempts?: number
  retry_window?: number
  whitelist?: string
  blacklist?: string
  active_bans?: { queued_for_unban?: number; network?: string; ip?: string; banned_until?: string }[]
  perm_bans?: { network?: string; ip?: string }[]
}
