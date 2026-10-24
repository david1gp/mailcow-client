/**
 * Public DKIM material for a domain (`dkim('details', $domain)`,
 * `functions.dkim.inc.php:233-258`). The private key (`privkey`) is
 * deliberately not part of this type — it is never returned by this client.
 */
export type DkimDetails = {
  pubkey?: string
  length?: string
  dkim_txt?: string
  dkim_selector?: string
}
