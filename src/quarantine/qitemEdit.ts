import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { QitemEditOptions } from "./qitemEditOptionsSchema.js"
import { qitemEditOptionsSchema } from "./qitemEditOptionsSchema.js"

/**
 * `POST /edit/qitem` (`quarantine('edit', ['id' => $items] + $attr)`).
 * Items are quarantine ids. Raw JSON body is `{attr, items}`.
 */
export async function qitemEdit(options: QitemEditOptions): PromiseResult<string[]> {
  const op = "qitemEdit"
  const parsed = a.safeParse(qitemEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/qitem"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
