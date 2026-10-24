/** Shared output flag for operations whose library result is Uint8Array. */
export const cliBinaryOutputFlagParams = {
  output: {
    kind: "parsed" as const,
    parse: String,
    optional: true as const,
    brief: "Write binary bytes to this file; otherwise emit base64 JSON",
  },
}
