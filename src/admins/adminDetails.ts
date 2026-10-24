/**
 * Admin details row (`admin('details')`, `functions.admin.inc.php:242+`).
 * API-key management is UI-only (`admin_api()`, `functions.inc.php:2057-2130`)
 * with no REST endpoint, so no key-mgmt op exists here.
 */
export type AdminDetails = {
  username: string
  tfa_active?: number
  tfa_active_int?: number
  active?: number
  active_int?: number
  created?: string
  attributes?: Record<string, string>
}
