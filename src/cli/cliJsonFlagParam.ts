/** Build an explicit Stricli flag descriptor for an optional or required JSON string input. */
export function cliJsonFlagParam(brief: string, optional = true) {
  if (optional) {
    return {
      kind: "parsed" as const,
      parse: String,
      optional: true as const,
      brief,
    }
  }

  return {
    kind: "parsed" as const,
    parse: String,
    brief,
  }
}
