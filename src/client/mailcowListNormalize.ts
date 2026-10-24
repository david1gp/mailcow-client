/**
 * Normalize a mailcow list response: most list branches echo `{}` when empty
 * (`process_get_return`, `json_api.php:348-356`), some echo `[]`. Pass arrays
 * through, map every other shape (including `{}`) to `[]`.
 */
export function mailcowListNormalize<T>(input: unknown): T[] {
  if (Array.isArray(input)) return input as T[]
  return []
}
