import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { IpCheckEditOptions } from "./ipCheckEditOptionsSchema.js"
import { ipCheckEditOptionsSchema } from "./ipCheckEditOptionsSchema.js"

/**
 * `POST /edit/ip_check` (admin). Raw JSON body is `{attr}`
 * (`customize('edit', 'ip_check', $attr)`).
 */
export async function ipCheckEdit(options: IpCheckEditOptions): PromiseResult<string[]> {
  const op = "ipCheckEdit"
  const parsed = a.safeParse(ipCheckEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/ip_check"),
    body: { attr: bodyOmitUndefined(attr) },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
