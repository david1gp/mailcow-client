/** Password policy rules (`password_complexity('get')`, `functions.inc.php:161`). */
export type PasswordPolicyDetails = {
  length?: number
  chars?: number
  lowerupper?: number
  special_chars?: number
  numbers?: number
}
