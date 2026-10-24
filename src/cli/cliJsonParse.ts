import { createResult, createResultError, type Result } from "#result"

/** Parse JSON supplied by a CLI flag; schema validation remains the library operation's responsibility. */
export function cliJsonParse(value: string | undefined, op: string, flagName = "json"): Result<unknown | undefined> {
  if (value === undefined) return createResult(undefined)

  try {
    return createResult(JSON.parse(value) as unknown)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    return createResultError(op, `Invalid JSON for --${flagName}`, detail)
  }
}
