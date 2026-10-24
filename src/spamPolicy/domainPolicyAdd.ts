import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainPolicyAddOptions } from "./domainPolicyAddOptionsSchema.js"
import { domainPolicyAddOptionsSchema } from "./domainPolicyAddOptionsSchema.js"

/**
 * `POST /add/domain-policy` (`policy('add', 'domain', $attr)`).
 * Raw JSON body is the attr object top-level.
 */
export async function domainPolicyAdd(options: DomainPolicyAddOptions): PromiseResult<string[]> {
  const op = "domainPolicyAdd"
  const parsed = a.safeParse(domainPolicyAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/domain-policy"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
