/** `GET /get/bcc-destination-options` (`json_api.php:1022-1048`). */
export type BccDestinationOptions = {
  domains?: string[]
  mailboxes?: Record<string, string[]>
  alias_domains?: string[]
}
