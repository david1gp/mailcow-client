/**
 * Domain admin details row (`domain_admin('details')`,
 * `functions.domain_admin.inc.php:364+`).
 */
export type DomainAdminDetails = {
  username: string
  tfa_active?: number
  tfa_active_int?: number
  active?: number
  active_int?: number
  created?: string
  attributes?: Record<string, string>
  selected_domains?: string[]
  unselected_domains?: string[] | string
}
