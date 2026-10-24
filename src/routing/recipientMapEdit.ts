import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RecipientMapEditOptions } from "./recipientMapEditOptionsSchema.js"
import { recipientMapEditOptionsSchema } from "./recipientMapEditOptionsSchema.js"

/**
 * `POST /edit/recipient_map` (`recipient_map('edit', ['id' => $items] + $attr)`).
 * Raw JSON body is `{attr, items}`.
 */
export async function recipientMapEdit(options: RecipientMapEditOptions): PromiseResult<string[]> {
  const op = "recipientMapEdit"
  const parsed = a.safeParse(recipientMapEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/recipient_map"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
