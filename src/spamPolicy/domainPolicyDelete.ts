import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainPolicyDeleteOptions } from "./domainPolicyDeleteOptionsSchema.js"
import { domainPolicyDeleteOptionsSchema } from "./domainPolicyDeleteOptionsSchema.js"

/**
 * `POST /delete/domain-policy` (`policy('delete', 'domain', ['prefid' => $items])`).
 * Items are filterconf prefids. Raw JSON body is the items array itself.
 */
export async function domainPolicyDelete(options: DomainPolicyDeleteOptions): PromiseResult<string[]> {
  const op = "domainPolicyDelete"
  const parsed = a.safeParse(domainPolicyDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/domain-policy"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
