/**
 * Attr fields for `POST /add/dkim_import` (`functions.dkim.inc.php:143-`).
 * `private_key_file` is the PEM private key content itself (never logged);
 * the CLI reads it from a local file and passes the string through.
 */
export type DkimImportAddRequest = {
  domain: string
  private_key_file: string
  dkim_selector?: string
  overwrite_existing?: string | number
}
