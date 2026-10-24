import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { TlsPolicyMapDetails } from "./tlsPolicyMapDetails.js"
import type { TlsPolicyMapListOptions } from "./tlsPolicyMapListOptionsSchema.js"
import { tlsPolicyMapListOptionsSchema } from "./tlsPolicyMapListOptionsSchema.js"

/** `GET /get/tls-policy-map/all`. Empty echoes are normalized to `[]`. */
export async function tlsPolicyMapList(options: TlsPolicyMapListOptions): PromiseResult<TlsPolicyMapDetails[]> {
  const op = "tlsPolicyMapList"
  const parsed = a.safeParse(tlsPolicyMapListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/tls-policy-map/all"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<TlsPolicyMapDetails>(requested.data))
}
