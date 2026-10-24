import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RatelimitDetails } from "./ratelimitDetails.js"
import type { RatelimitDomainListOptions } from "./ratelimitDomainListOptionsSchema.js"
import { ratelimitDomainListOptionsSchema } from "./ratelimitDomainListOptionsSchema.js"

/**
 * `GET /get/rl-domain/all`. Empty echoes `'{}'`
 * (`json_api.php:615-641`), normalized to `[]`.
 */
export async function ratelimitDomainList(options: RatelimitDomainListOptions): PromiseResult<RatelimitDetails[]> {
  const op = "ratelimitDomainList"
  const parsed = a.safeParse(ratelimitDomainListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "GET",
    path: mailcowPathApi("/get/rl-domain/all"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<RatelimitDetails>(requested.data))
}
