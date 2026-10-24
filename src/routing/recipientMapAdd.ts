import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RecipientMapAddOptions } from "./recipientMapAddOptionsSchema.js"
import { recipientMapAddOptionsSchema } from "./recipientMapAddOptionsSchema.js"

/**
 * `POST /add/recipient_map`. Raw JSON body is the attr object top-level.
 */
export async function recipientMapAdd(options: RecipientMapAddOptions): PromiseResult<string[]> {
  const op = "recipientMapAdd"
  const parsed = a.safeParse(recipientMapAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/recipient_map"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
