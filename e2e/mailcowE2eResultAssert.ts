import type { Result } from "@adaptive-ds/result"

export function mailcowE2eResultAssert<T>(operation: string, result: Result<T>): T {
  if (!result.success) {
    const status = result.statusCode === undefined ? "" : ` (HTTP ${result.statusCode})`
    throw new Error(`Live E2E ${operation} failed${status}: ${result.errorMessage}`)
  }
  return result.data
}
