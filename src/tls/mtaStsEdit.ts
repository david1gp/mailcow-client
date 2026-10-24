import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MtaStsEditOptions } from "./mtaStsEditOptionsSchema.js"
import { mtaStsEditOptionsSchema } from "./mtaStsEditOptionsSchema.js"

/**
 * `POST /edit/mta-sts` (`mailbox('edit', 'mta_sts', ['domains' => $items] + $attr)`).
 * Items are domain names. Raw JSON body is `{attr, items}`.
 */
export async function mtaStsEdit(options: MtaStsEditOptions): PromiseResult<string[]> {
  const op = "mtaStsEdit"
  const parsed = a.safeParse(mtaStsEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/mta-sts"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
