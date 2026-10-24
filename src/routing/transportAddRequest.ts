/**
 * Attr fields for `POST /add/transport` (`functions.transports.inc.php:193-`).
 * Credentials are typed normally and never logged by this client.
 */
export type TransportAddRequest = {
  destination: string
  nexthop: string
  username?: string
  password?: string
  is_mx_based?: string | number
  active?: string | number
}
