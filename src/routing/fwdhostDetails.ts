/**
 * Forwarding host row (`functions.fwdhost.inc.php:140-190`). Live get-all and
 * details rows carry exactly `host`, `source`, `keep_spam` — `hostname` is a
 * write-side attr key (`fwdhost('add')`), never a read key.
 */
export type FwdhostDetails = {
  host?: string
  source?: string
  keep_spam?: string | number
}
