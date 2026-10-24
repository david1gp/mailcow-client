import * as a from "valibot"
import { createResult, createResultError, type Result } from "#result"
import { mailcowEnvelopeSchema } from "./mailcowEnvelopeSchema.js"

function mailcowEnvelopeMessageRender(msg: unknown): string {
  if (typeof msg === "string") return msg
  if (Array.isArray(msg)) return msg.map((part) => String(part)).join(" ")
  return JSON.stringify(msg) ?? String(msg)
}

/**
 * Map a mailcow mutation envelope to a `Result`: entries with
 * `type: "danger"` or `type: "error"` resolve err with the joined msgs;
 * `warning` entries are non-fatal upstream (handlers push them and keep going,
 * e.g. the maildir garbage-collector warning on delete,
 * `functions.mailbox.inc.php:5757-5762,6018-6023`) and resolve ok alongside
 * the rendered `success` msgs. Accepts `unknown` so `mailcowRequest` output
 * can be passed directly; a non-envelope value is a `ResultErr`.
 */
export function mailcowEnvelope(input: unknown): Result<string[]> {
  const op = "mailcowEnvelope"
  const parsed = a.safeParse(mailcowEnvelopeSchema, input)
  if (!parsed.success) {
    return createResultError(op, `Invalid mailcow envelope: ${a.summarize(parsed.issues)}`)
  }
  const failed = parsed.output.filter((entry) => entry.type === "danger" || entry.type === "error")
  if (failed.length > 0) {
    const joined = failed.map((entry) => `[${entry.type}] ${mailcowEnvelopeMessageRender(entry.msg)}`).join("; ")
    return createResultError(op, joined)
  }
  const succeeded = parsed.output.filter((entry) => entry.type === "success")
  return createResult(succeeded.map((entry) => mailcowEnvelopeMessageRender(entry.msg)))
}
