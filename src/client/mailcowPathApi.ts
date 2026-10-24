/** `/api/v1{rest}` — `rest` should start with `/`. */
export function mailcowPathApi(rest: string): string {
  return `/api/v1${rest}`
}
