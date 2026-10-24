import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RatelimitDetails } from "./ratelimitDetails.js"
import type { RatelimitMailboxListOptions } from "./ratelimitMailboxListOptionsSchema.js"
import { ratelimitMailboxListOptionsSchema } from "./ratelimitMailboxListOptionsSchema.js"

/**
 * `GET /get/rl-mbox/all`. Empty echoes `'{}'`
 * (`json_api.php:643-674`), normalized to `[]`.
 */
export async function ratelimitMailboxList(options: RatelimitMailboxListOptions): PromiseResult<RatelimitDetails[]> {
  const op = "ratelimitMailboxList"
  const parsed = a.safeParse(ratelimitMailboxListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "GET",
    path: mailcowPathApi("/get/rl-mbox/all"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<RatelimitDetails>(requested.data))
}
