/** Build `?k=v` query string; skips null/undefined values. */
export function mailcowRequestQueryString(
  query?: Record<string, string | number | boolean | readonly string[] | undefined | null>,
): string {
  if (!query) return ""
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, String(item))
      continue
    }
    params.append(key, String(value))
  }
  const s = params.toString()
  return s ? `?${s}` : ""
}
