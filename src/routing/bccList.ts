import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { BccDetails } from "./bccDetails.js"
import type { BccListOptions } from "./bccListOptionsSchema.js"
import { bccListOptionsSchema } from "./bccListOptionsSchema.js"

/** `GET /get/bcc/all`. Empty echoes are normalized to `[]`. */
export async function bccList(options: BccListOptions): PromiseResult<BccDetails[]> {
  const op = "bccList"
  const parsed = a.safeParse(bccListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/bcc/all"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<BccDetails>(requested.data))
}
