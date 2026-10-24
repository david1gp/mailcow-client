import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainPolicyWlListOptions } from "./domainPolicyWlListOptionsSchema.js"
import { domainPolicyWlListOptionsSchema } from "./domainPolicyWlListOptionsSchema.js"
import type { PolicyListEntryDetails } from "./policyListEntryDetails.js"

/** `GET /get/policy_wl_domain/{domain}`. Empty echoes are normalized to `[]`. */
export async function domainPolicyWlList(options: DomainPolicyWlListOptions): PromiseResult<PolicyListEntryDetails[]> {
  const op = "domainPolicyWlList"
  const parsed = a.safeParse(domainPolicyWlListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, domain } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/policy_wl_domain/${encodeURIComponent(domain)}`),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<PolicyListEntryDetails>(requested.data))
}
