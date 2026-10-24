import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RelayhostDetails } from "./relayhostDetails.js"
import type { RelayhostListOptions } from "./relayhostListOptionsSchema.js"
import { relayhostListOptionsSchema } from "./relayhostListOptionsSchema.js"

/** `GET /get/relayhost/all`. Empty echoes are normalized to `[]`. */
export async function relayhostList(options: RelayhostListOptions): PromiseResult<RelayhostDetails[]> {
  const op = "relayhostList"
  const parsed = a.safeParse(relayhostListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/relayhost/all"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<RelayhostDetails>(requested.data))
}
