import { writeFile } from "node:fs/promises"
import { createResult, createResultError, type PromiseResult } from "#result"

/** Write binary CLI output to a file, or return a JSON-safe base64 payload (waha `cliBinaryOutput` mirror). */
export async function cliBinaryOutput(
  bytes: Uint8Array,
  output?: string,
): PromiseResult<{ encoding: "base64"; data: string } | undefined> {
  const op = "cliBinaryOutput"
  if (output !== undefined) {
    try {
      await writeFile(output, bytes)
      return createResult(undefined)
    } catch (error) {
      return createResultError(
        op,
        "Writing binary output failed",
        error instanceof Error ? error.message : String(error),
      )
    }
  }

  return createResult({
    encoding: "base64" as const,
    data: Buffer.from(bytes).toString("base64"),
  })
}
