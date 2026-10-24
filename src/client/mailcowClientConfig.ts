import * as a from "valibot"
import { createResult, createResultError, type Result } from "#result"
import type { MailcowClientConfig, MailcowClientConfigInput } from "./mailcowClientConfigSchema.js"
import { mailcowClientConfigSchema } from "./mailcowClientConfigSchema.js"

export function mailcowClientConfig(input: MailcowClientConfigInput): Result<MailcowClientConfig> {
  const op = "mailcowClientConfig"
  const parsed = a.safeParse(mailcowClientConfigSchema, input)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues))
  }
  return createResult(parsed.output)
}
