import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { TransportDetails } from "./transportDetails.js"
import type { TransportListOptions } from "./transportListOptionsSchema.js"
import { transportListOptionsSchema } from "./transportListOptionsSchema.js"

/** `GET /get/transport/all`. Empty echoes are normalized to `[]`. */
export async function transportList(options: TransportListOptions): PromiseResult<TransportDetails[]> {
  const op = "transportList"
  const parsed = a.safeParse(transportListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/transport/all"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<TransportDetails>(requested.data))
}
