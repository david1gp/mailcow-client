/**
 * Wide domain details row (`mailbox get domain_details`,
 * `functions.mailbox.inc.php:5033-5164`). Live key is `domain_name`
 * (`$domaindata['domain_name'] = $row['domain']`), not `domain` — this holds
 * for get, list, and search rows (search maps SSP rows through
 * `domain_details`, `json_api.php` search/domain branch).
 */
export type DomainDetails = {
  domain_name: string
  description?: string
  aliases?: number
  mailboxes?: number
  defquota?: string
  maxquota?: string
  quota?: string
  backupmx?: number
  gal?: number
  relay_all_recipients?: number
  relay_unknown_only?: number
  active?: number
  tags?: string[]
  relayhost?: string
  quota_used?: number
  bytes_total?: number
  msgs_total?: number
}
