/** Attr fields for `POST /add/domain-admin` (`functions.domain_admin.inc.php:15-`). */
export type DomainAdminAddRequest = {
  username: string
  password: string
  password2: string
  domains: string[]
  active?: string | number
}
