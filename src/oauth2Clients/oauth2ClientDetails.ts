/**
 * OAuth2 client row (`oauth2('details', 'client', ...)`, i.e. an
 * `oauth_clients` row, `functions.oauth2.inc.php:230-238`).
 */
export type OAuth2ClientDetails = {
  id?: number
  client_id?: string
  client_secret?: string
  redirect_uri?: string
  scope?: string
}
