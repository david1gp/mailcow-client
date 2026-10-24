import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { BccEditOptions } from "./bccEditOptionsSchema.js"
import { bccEditOptionsSchema } from "./bccEditOptionsSchema.js"

/**
 * `POST /edit/bcc` (`bcc('edit', ['id' => $items] + $attr)`).
 * Raw JSON body is `{attr, items}`.
 */
export async function bccEdit(options: BccEditOptions): PromiseResult<string[]> {
  const op = "bccEdit"
  const parsed = a.safeParse(bccEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/bcc"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
