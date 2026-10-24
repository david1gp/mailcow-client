/**
 * Preset record from `presets('get', ...)` (`functions.presets.inc.php:2-`):
 * parsed preset yml plus its file `name`. Shared by the sieve and rspamd
 * preset lists, which both live in this context per inventory §8.
 */
export type PresetDetails = {
  name: string
  [key: string]: unknown
}
