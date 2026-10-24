import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { QuarantineItemDetails } from "./quarantineItemDetails.js"
import type { QuarantineListOptions } from "./quarantineListOptionsSchema.js"
import { quarantineListOptionsSchema } from "./quarantineListOptionsSchema.js"

/** `GET /get/quarantine/all`. The router passes `false` for empty (`'[]'`). */
export async function quarantineList(options: QuarantineListOptions): PromiseResult<QuarantineItemDetails[]> {
  const op = "quarantineList"
  const parsed = a.safeParse(quarantineListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/quarantine/all"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<QuarantineItemDetails>(requested.data))
}
