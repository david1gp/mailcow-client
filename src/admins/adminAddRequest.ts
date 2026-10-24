/** Attr fields for `POST /add/admin` (`functions.admin.inc.php:16-`). */
export type AdminAddRequest = {
  username: string
  password: string
  password2: string
  active?: string | number
}
