import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RatelimitDetails } from "./ratelimitDetails.js"
import type { RatelimitDomainGetOptions } from "./ratelimitDomainGetOptionsSchema.js"
import { ratelimitDomainGetOptionsSchema } from "./ratelimitDomainGetOptionsSchema.js"

/** `GET /get/rl-domain/{domain}`. */
export async function ratelimitDomainGet(options: RatelimitDomainGetOptions): PromiseResult<RatelimitDetails> {
  const op = "ratelimitDomainGet"
  const parsed = a.safeParse(ratelimitDomainGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, domain } = parsed.output
  return mailcowRequest<RatelimitDetails>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/rl-domain/${encodeURIComponent(domain)}`),
  })
}
