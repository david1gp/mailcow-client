import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { TlsPolicyMapDeleteOptions } from "./tlsPolicyMapDeleteOptionsSchema.js"
import { tlsPolicyMapDeleteOptionsSchema } from "./tlsPolicyMapDeleteOptionsSchema.js"

/**
 * `POST /delete/tls-policy-map`. Raw JSON body is the items array itself.
 */
export async function tlsPolicyMapDelete(options: TlsPolicyMapDeleteOptions): PromiseResult<string[]> {
  const op = "tlsPolicyMapDelete"
  const parsed = a.safeParse(tlsPolicyMapDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/tls-policy-map"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
