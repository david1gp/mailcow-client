import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { AliasDomainDetails } from "./aliasDomainDetails.js"
import type { AliasDomainGetOptions } from "./aliasDomainGetOptionsSchema.js"
import { aliasDomainGetOptionsSchema } from "./aliasDomainGetOptionsSchema.js"

/** `GET /get/alias-domain/{domain}`. Empty echoes `{}` (returned as-is). */
export async function aliasDomainGet(options: AliasDomainGetOptions): PromiseResult<AliasDomainDetails> {
  const op = "aliasDomainGet"
  const parsed = a.safeParse(aliasDomainGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, domain } = parsed.output
  return mailcowRequest<AliasDomainDetails>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/alias-domain/${encodeURIComponent(domain)}`),
  })
}
