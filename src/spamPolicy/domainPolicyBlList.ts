import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainPolicyBlListOptions } from "./domainPolicyBlListOptionsSchema.js"
import { domainPolicyBlListOptionsSchema } from "./domainPolicyBlListOptionsSchema.js"
import type { PolicyListEntryDetails } from "./policyListEntryDetails.js"

/** `GET /get/policy_bl_domain/{domain}`. Empty echoes are normalized to `[]`. */
export async function domainPolicyBlList(options: DomainPolicyBlListOptions): PromiseResult<PolicyListEntryDetails[]> {
  const op = "domainPolicyBlList"
  const parsed = a.safeParse(domainPolicyBlListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, domain } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/policy_bl_domain/${encodeURIComponent(domain)}`),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<PolicyListEntryDetails>(requested.data))
}
