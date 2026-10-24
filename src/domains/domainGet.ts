import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainDetails } from "./domainDetails.js"
import type { DomainGetOptions } from "./domainGetOptionsSchema.js"
import { domainGetOptionsSchema } from "./domainGetOptionsSchema.js"

/** `GET /get/domain/{domain}`. Empty echoes `{}` (returned as-is). */
export async function domainGet(options: DomainGetOptions): PromiseResult<DomainDetails> {
  const op = "domainGet"
  const parsed = a.safeParse(domainGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, domain } = parsed.output
  return mailcowRequest<DomainDetails>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/domain/${encodeURIComponent(domain)}`),
  })
}
