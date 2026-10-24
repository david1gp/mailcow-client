import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RspamdMapEditOptions } from "./rspamdMapEditOptionsSchema.js"
import { rspamdMapEditOptionsSchema } from "./rspamdMapEditOptionsSchema.js"

/**
 * `POST /edit/rspamd-map` (`rspamd_maps('edit', ['map' => $items] + $attr)`).
 * Items are rspamd map names, attr carries `rspamd_map_data` content.
 * Raw JSON body is `{attr, items}`.
 */
export async function rspamdMapEdit(options: RspamdMapEditOptions): PromiseResult<string[]> {
  const op = "rspamdMapEdit"
  const parsed = a.safeParse(rspamdMapEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/rspamd-map"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
