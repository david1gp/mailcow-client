/**
 * Attr fields for `POST /add/oauth2-client` (`functions.oauth2.inc.php:17-`).
 * `scope` is hardcoded to `profile` and the grant is fixed to
 * `authorization_code` server-side, so only `redirect_uri` is accepted.
 */
export type OAuth2ClientAddRequest = {
  redirect_uri: string
}
