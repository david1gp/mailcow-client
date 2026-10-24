/** vmail disk usage (`GET /get/status/vmail`, `json_api.php:1484-1495`). */
export type StatusVmailDetails = {
  type?: string
  disk?: string
  used?: string
  total?: string
  used_percent?: string
}
