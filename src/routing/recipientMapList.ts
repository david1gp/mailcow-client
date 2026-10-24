import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RecipientMapDetails } from "./recipientMapDetails.js"
import type { RecipientMapListOptions } from "./recipientMapListOptionsSchema.js"
import { recipientMapListOptionsSchema } from "./recipientMapListOptionsSchema.js"

/** `GET /get/recipient_map/all`. Empty echoes are normalized to `[]`. */
export async function recipientMapList(options: RecipientMapListOptions): PromiseResult<RecipientMapDetails[]> {
  const op = "recipientMapList"
  const parsed = a.safeParse(recipientMapListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/recipient_map/all"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<RecipientMapDetails>(requested.data))
}
