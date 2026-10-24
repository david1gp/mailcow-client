import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { BccDeleteOptions } from "./bccDeleteOptionsSchema.js"
import { bccDeleteOptionsSchema } from "./bccDeleteOptionsSchema.js"

/**
 * `POST /delete/bcc`. Raw JSON body is the items array itself.
 */
export async function bccDelete(options: BccDeleteOptions): PromiseResult<string[]> {
  const op = "bccDelete"
  const parsed = a.safeParse(bccDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/bcc"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
