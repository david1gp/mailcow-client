import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RsettingDetails } from "./rsettingDetails.js"
import type { RsettingListOptions } from "./rsettingListOptionsSchema.js"
import { rsettingListOptionsSchema } from "./rsettingListOptionsSchema.js"

/** `GET /get/rsetting/all`. Empty echoes are normalized to `[]`. */
export async function rsettingList(options: RsettingListOptions): PromiseResult<RsettingDetails[]> {
  const op = "rsettingList"
  const parsed = a.safeParse(rsettingListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/rsetting/all"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<RsettingDetails>(requested.data))
}
