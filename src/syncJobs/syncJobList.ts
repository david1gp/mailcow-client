import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { SyncJobDetails } from "./syncJobDetails.js"
import type { SyncJobListOptions } from "./syncJobListOptionsSchema.js"
import { syncJobListOptionsSchema } from "./syncJobListOptionsSchema.js"

/** `GET /get/syncjobs/all`. Empty results echo `{}` — normalized to `[]`. */
export async function syncJobList(options: SyncJobListOptions): PromiseResult<SyncJobDetails[]> {
  const op = "syncJobList"
  const parsed = a.safeParse(syncJobListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/syncjobs/all"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<SyncJobDetails>(requested.data))
}
