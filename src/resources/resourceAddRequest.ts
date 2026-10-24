/**
 * Attr fields for `POST /add/resource` (`functions.mailbox.inc.php:1533-1648`).
 * Upstream never reads `name`: the address is derived server-side as
 * `sanitized(description)@domain` (`preg_replace('/[^\da-z]/i', '', ...)`).
 * `description` is required upstream (`description_invalid` when empty).
 */
export type ResourceAddRequest = {
  domain: string
  kind: string
  description: string
  active?: string | number
  multiple_bookings?: string | number
}
