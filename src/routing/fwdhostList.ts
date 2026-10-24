import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { FwdhostDetails } from "./fwdhostDetails.js"
import type { FwdhostListOptions } from "./fwdhostListOptionsSchema.js"
import { fwdhostListOptionsSchema } from "./fwdhostListOptionsSchema.js"

/** `GET /get/fwdhost/all`. Empty echoes are normalized to `[]`. */
export async function fwdhostList(options: FwdhostListOptions): PromiseResult<FwdhostDetails[]> {
  const op = "fwdhostList"
  const parsed = a.safeParse(fwdhostListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/fwdhost/all"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<FwdhostDetails>(requested.data))
}
