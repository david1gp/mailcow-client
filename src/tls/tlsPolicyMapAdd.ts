import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { TlsPolicyMapAddOptions } from "./tlsPolicyMapAddOptionsSchema.js"
import { tlsPolicyMapAddOptionsSchema } from "./tlsPolicyMapAddOptionsSchema.js"

/**
 * `POST /add/tls-policy-map`. Raw JSON body is the attr object top-level.
 */
export async function tlsPolicyMapAdd(options: TlsPolicyMapAddOptions): PromiseResult<string[]> {
  const op = "tlsPolicyMapAdd"
  const parsed = a.safeParse(tlsPolicyMapAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/tls-policy-map"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
