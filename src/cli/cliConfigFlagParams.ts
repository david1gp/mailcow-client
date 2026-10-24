/** Shared optional flags that override env. */
export const cliConfigFlagParams = {
  baseUrl: {
    kind: "parsed" as const,
    parse: String,
    optional: true as const,
    brief: "Override MAILCOW_BASE_URL",
  },
  apiKey: {
    kind: "parsed" as const,
    parse: String,
    optional: true as const,
    brief: "Override MAILCOW_API_KEY",
  },
}
