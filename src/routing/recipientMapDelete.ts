import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RecipientMapDeleteOptions } from "./recipientMapDeleteOptionsSchema.js"
import { recipientMapDeleteOptionsSchema } from "./recipientMapDeleteOptionsSchema.js"

/**
 * `POST /delete/recipient_map`. Raw JSON body is the items array itself.
 */
export async function recipientMapDelete(options: RecipientMapDeleteOptions): PromiseResult<string[]> {
  const op = "recipientMapDelete"
  const parsed = a.safeParse(recipientMapDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/recipient_map"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
