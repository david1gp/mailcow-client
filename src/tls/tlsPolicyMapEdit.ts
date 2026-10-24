import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { TlsPolicyMapEditOptions } from "./tlsPolicyMapEditOptionsSchema.js"
import { tlsPolicyMapEditOptionsSchema } from "./tlsPolicyMapEditOptionsSchema.js"

/**
 * `POST /edit/tls-policy-map` (`tls_policy_maps('edit', ['id' => $items] + $attr)`).
 * Raw JSON body is `{attr, items}`.
 */
export async function tlsPolicyMapEdit(options: TlsPolicyMapEditOptions): PromiseResult<string[]> {
  const op = "tlsPolicyMapEdit"
  const parsed = a.safeParse(tlsPolicyMapEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/tls-policy-map"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
