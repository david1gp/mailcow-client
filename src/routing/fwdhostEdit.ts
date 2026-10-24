import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { FwdhostEditOptions } from "./fwdhostEditOptionsSchema.js"
import { fwdhostEditOptionsSchema } from "./fwdhostEditOptionsSchema.js"

/**
 * `POST /edit/fwdhost` (`fwdhost('edit', ['fwdhost' => $items] + $attr)`).
 * Items are forwarding hostnames. Raw JSON body is `{attr, items}`.
 */
export async function fwdhostEdit(options: FwdhostEditOptions): PromiseResult<string[]> {
  const op = "fwdhostEdit"
  const parsed = a.safeParse(fwdhostEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/fwdhost"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
