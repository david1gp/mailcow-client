import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RsettingEditOptions } from "./rsettingEditOptionsSchema.js"
import { rsettingEditOptionsSchema } from "./rsettingEditOptionsSchema.js"

/**
 * `POST /edit/rsetting` (`rsettings('edit', ['id' => $items] + $attr)`).
 * Raw JSON body is `{attr, items}`.
 */
export async function rsettingEdit(options: RsettingEditOptions): PromiseResult<string[]> {
  const op = "rsettingEdit"
  const parsed = a.safeParse(rsettingEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/rsetting"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
